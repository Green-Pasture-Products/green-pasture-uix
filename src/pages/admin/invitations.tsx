import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Plus } from "lucide-react";
import * as changeCase from "change-case";
import toast from "react-hot-toast";
import type { ColumnDef } from "@tanstack/react-table";

import withAdminAuth from "@/_components/withAdminAuth";
import AdminLayout from "@/_components/AdminLayout";
import { DataTable } from "@/_components/DataTable";
import ActionMenu from "@/_UI/ActionMenu";
import Badge from "@/_UI/Badge";
import Button from "@/_UI/Button";
import Modal from "@/_UI/Modal";
import axiosInstance from "@/_utils/axiosInstance";
import { useListParams } from "@/_hooks/useListParams";

const RESEND_ICON = (
	<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2v6h-6"/><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M3 22v-6h6"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/></svg>
);

const REVOKE_ICON = (
	<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="4.9" y1="4.9" x2="19.1" y2="19.1"/></svg>
);

interface RoleOption {
	id: string;
	name: string;
}

interface Invitation {
	id: string;
	email: string;
	firstName: string;
	lastName: string;
	phoneNumber: string;
	roles: RoleOption[];
	status: "PENDING" | "ACCEPTED" | "REVOKED" | "EXPIRED";
	sentAt: string;
	expiresAt: string;
	acceptedAt: string | null;
}

const STATUS_VARIANT: Record<Invitation["status"], "success" | "warning" | "error" | "neutral"> = {
	PENDING: "warning",
	ACCEPTED: "success",
	REVOKED: "neutral",
	EXPIRED: "error",
};

const Invitations: React.FC = () => {
	const router = useRouter();
	const { page: currentPage, pageSize, search: searchTerm, setPage, setSearch, setPageSize } = useListParams();

	const [invitations, setInvitations] = useState<Invitation[]>([]);
	const [totalPages, setTotalPages] = useState(1);
	const [totalItems, setTotalItems] = useState(0);
	const [loading, setLoading] = useState(true);
	const [loadFailed, setLoadFailed] = useState(false);
	// First load shows the skeleton; a manual refresh keeps the rows on screen and
	// only spins the toolbar icon — same split react-query gives ogaryde via
	// isLoading vs isFetching.
	const isFirstLoad = loading && invitations.length === 0;

	// Which row is mid-action, so the confirm modal knows what it is confirming.
	const [revokeTarget, setRevokeTarget] = useState<Invitation | null>(null);
	const [busyId, setBusyId] = useState<string | null>(null);

	const fetchInvitations = useCallback(() => {
		setLoading(true);
		axiosInstance
			.get("staff-invitations", { params: { page: currentPage, limit: pageSize, search: searchTerm || undefined } })
			.then((res) => {
				const data = res.data?.data;
				setInvitations(data?.items ?? []);
				setTotalPages(data?.meta?.totalPages ?? 1);
				setTotalItems(data?.meta?.totalItems ?? 0);
				setLoadFailed(false);
			})
			.catch((err) => {
				setLoadFailed(true);
				toast.error(err?.response?.data?.message || "Failed to load invitations");
			})
			.finally(() => setLoading(false));
	}, [currentPage, pageSize, searchTerm]);

	useEffect(() => {
		fetchInvitations();
	}, [fetchInvitations]);

	const handleResend = async (invitation: Invitation) => {
		if (busyId) return; // the menu has no disabled state, so guard the double-click here
		setBusyId(invitation.id);
		try {
			await axiosInstance.post(`staff-invitations/${invitation.id}/resend`);
			toast.success(`Invitation resent to ${invitation.email}`);
			fetchInvitations();
		} catch (err: any) {
			toast.error(err?.response?.data?.message || "Failed to resend invitation");
		} finally {
			setBusyId(null);
		}
	};

	const handleRevoke = async () => {
		if (!revokeTarget) return;
		setBusyId(revokeTarget.id);
		try {
			await axiosInstance.post(`staff-invitations/${revokeTarget.id}/revoke`);
			toast.success("Invitation revoked");
			setRevokeTarget(null);
			fetchInvitations();
		} catch (err: any) {
			toast.error(err?.response?.data?.message || "Failed to revoke invitation");
		} finally {
			setBusyId(null);
		}
	};

	const columns: ColumnDef<Invitation, any>[] = [
		{
			id: "name",
			header: "Name",
			enableSorting: false,
			cell: ({ row }) => (
				<span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
					{row.original.firstName} {row.original.lastName}
				</span>
			),
		},
		{
			accessorKey: "email",
			header: "Email",
			enableSorting: false,
			meta: { maxWidth: "240px", truncate: true },
			cell: ({ getValue }) => (
				<span className="text-sm" style={{ color: "var(--text-secondary)" }}>{String(getValue())}</span>
			),
		},
		{
			id: "roles",
			header: "Roles",
			enableSorting: false,
			cell: ({ row }) => (
				<Badge variant="info">
					{row.original.roles?.length ? row.original.roles.map((r) => changeCase.capitalCase(r.name)).join(", ") : "—"}
				</Badge>
			),
		},
		{
			accessorKey: "status",
			header: "Status",
			cell: ({ row }) => (
				<Badge variant={STATUS_VARIANT[row.original.status] ?? "neutral"} dot>
					{row.original.status}
				</Badge>
			),
		},
		{
			accessorKey: "sentAt",
			header: "Sent",
			cell: ({ getValue }) => (
				<span className="text-sm text-gray-500 dark:text-gray-400">
					{new Date(getValue() as string).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
				</span>
			),
		},
		{
			accessorKey: "expiresAt",
			header: "Expires",
			cell: ({ row }) => (
				<span className="text-sm text-gray-500 dark:text-gray-400">
					{row.original.status === "PENDING"
						? new Date(row.original.expiresAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })
						: "—"}
				</span>
			),
		},
		{
			id: "actions",
			header: "Action",
			enableSorting: false,
			enableHiding: false,
			meta: { width: "50px", align: "center" },
			cell: ({ row }) => {
				// Resend rescues an expired link; revoke only makes sense while the invite is live.
				const canResend = row.original.status === "PENDING" || row.original.status === "EXPIRED";
				const canRevoke = row.original.status === "PENDING" || row.original.status === "EXPIRED";
				if (!canResend && !canRevoke) return null;
				return (
					<ActionMenu
						items={[
							...(canResend
								? [{ label: "Resend invite", icon: RESEND_ICON, onClick: () => handleResend(row.original) }]
								: []),
							...(canRevoke
								? [{ label: "Revoke", icon: REVOKE_ICON, onClick: () => setRevokeTarget(row.original), variant: "danger" as const }]
								: []),
						]}
					/>
				);
			},
		},
	];

	return (
		<AdminLayout>
			<div className="animate-page-enter space-y-6">
				<DataTable
					columns={columns}
					data={invitations}
					isLoading={isFirstLoad}
					isError={loadFailed}
					onRetry={fetchInvitations}
					onRefresh={fetchInvitations}
					refreshing={loading}
					manualFiltering
					globalFilter={searchTerm}
					onGlobalFilterChange={setSearch}
					searchPlaceholder="Search by name or email..."
					pageIndex={currentPage - 1}
					pageSize={pageSize}
					pageCount={totalPages}
					totalItems={totalItems}
					onPageChange={(idx: number) => setPage(idx + 1)}
					onPageSizeChange={setPageSize}
					toolbar={
						<Button variant="filled" leftIcon={Plus} onClick={() => router.push("/admin/invitations/new")}>
							Invite Staff
						</Button>
					}
					emptyMessage="No invitations yet"
				/>

				<Modal
					isOpen={!!revokeTarget}
					onClose={() => setRevokeTarget(null)}
					title="Revoke invitation"
					subtitle={revokeTarget ? `${revokeTarget.email} will no longer be able to use their link` : undefined}
					size="sm"
				>
					<div className="flex justify-end gap-3 pt-2">
						<Button variant="outlined" color="secondary" size="sm" onClick={() => setRevokeTarget(null)}>
							Cancel
						</Button>
						<Button
							variant="filled"
							color="error"
							size="sm"
							onClick={handleRevoke}
							loading={busyId === revokeTarget?.id}
							disabled={busyId === revokeTarget?.id}
						>
							Revoke
						</Button>
					</div>
				</Modal>
			</div>
		</AdminLayout>
	);
};

export default withAdminAuth(Invitations);
