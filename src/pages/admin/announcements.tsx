import { useRouter } from "next/router";
import React, { useCallback, useEffect, useState } from "react";
import { Plus } from "lucide-react";
import toast from "react-hot-toast";
import type { ColumnDef } from "@tanstack/react-table";

import withAdminAuth from "@/_components/withAdminAuth";
import AdminLayout from "@/_components/AdminLayout";
import { DataTable } from "@/_components/DataTable";
import ActionMenu from "@/_UI/ActionMenu";
import Badge from "@/_UI/Badge";
import Button from "@/_UI/Button";
import Modal from "@/_UI/Modal";
import { richTextToPlain } from "@/components/egfm/rich-text";
import axiosInstance from "@/_utils/axiosInstance";
import { useListParams } from "@/_hooks/useListParams";
import type { Announcement, AnnouncementAudience, PageMeta } from "@/types/live";

const AUDIENCE: Record<AnnouncementAudience, { label: string; hint: string }> = {
	ALL: { label: "Everyone", hint: "All customers, staff and visitors" },
	CUSTOMERS: { label: "Customers", hint: "Signed-in customers only" },
	STAFF: { label: "Staff", hint: "Admin users only" },
};

const AdminAnnouncements: React.FC = () => {
	const router = useRouter();
	const { page, pageSize, search, setPage, setSearch, setPageSize } = useListParams();
	const [rows, setRows] = useState<Announcement[]>([]);
	const [meta, setMeta] = useState<PageMeta | null>(null);
	const [loading, setLoading] = useState(true);

	const [toggleTarget, setToggleTarget] = useState<Announcement | null>(null);
	const [deleteTarget, setDeleteTarget] = useState<Announcement | null>(null);
	const [busy, setBusy] = useState(false);

	const load = useCallback(async () => {
		setLoading(true);
		try {
			const res = await axiosInstance.get("announcements", { params: { page, limit: pageSize, q: search || undefined } });
			setRows(res.data?.data?.items ?? []);
			setMeta(res.data?.data?.meta ?? null);
		} catch {
			toast.error("Could not load announcements");
		} finally {
			setLoading(false);
		}
	}, [page, pageSize, search]);

	useEffect(() => {
		load();
	}, [load]);

	const toggle = async () => {
		if (!toggleTarget) return;
		setBusy(true);
		try {
			await axiosInstance.put(`announcements/${toggleTarget.id}`, { isActive: !toggleTarget.isActive });
			toast.success(toggleTarget.isActive ? "Announcement deactivated" : "Announcement reactivated and sent");
			setToggleTarget(null);
			load();
		} catch (e: any) {
			toast.error(e?.response?.data?.message || "Could not update the announcement");
		} finally {
			setBusy(false);
		}
	};

	const remove = async () => {
		if (!deleteTarget) return;
		setBusy(true);
		try {
			await axiosInstance.delete(`announcements/${deleteTarget.id}`);
			toast.success("Announcement deleted");
			setDeleteTarget(null);
			load();
		} catch (e: any) {
			toast.error(e?.response?.data?.message || "Could not delete the announcement");
		} finally {
			setBusy(false);
		}
	};

	const columns: ColumnDef<Announcement, any>[] = [
		{
			accessorKey: "title",
			header: "Announcement",
			meta: { maxWidth: "360px" },
			cell: ({ row }) => (
				<div className="min-w-0">
					<p className="truncate text-sm font-medium" style={{ color: "var(--text-primary)" }}>
						{row.original.title}
					</p>
					<p className="line-clamp-1 text-xs" style={{ color: "var(--text-hint)" }}>
						{richTextToPlain(row.original.message)}
					</p>
				</div>
			),
		},
		{
			accessorKey: "audience",
			header: "Audience",
			meta: { width: "120px" },
			cell: ({ row }) => <Badge variant="info">{AUDIENCE[row.original.audience]?.label ?? row.original.audience}</Badge>,
		},
		{
			accessorKey: "isActive",
			header: "Status",
			meta: { width: "130px" },
			cell: ({ row }) => {
				const a = row.original;
				const expired = a.expiresAt && new Date(a.expiresAt) < new Date();
				return expired ? <Badge variant="neutral">Expired</Badge> : a.isActive ? <Badge variant="success" dot>Live</Badge> : <Badge variant="neutral">Inactive</Badge>;
			},
		},
		{
			accessorKey: "createdByName",
			header: "Published by",
			meta: { width: "150px" },
			cell: ({ row }) => <span className="text-sm">{row.original.createdByName ?? "—"}</span>,
		},
		{
			accessorKey: "createdAt",
			header: "Published",
			meta: { width: "140px" },
			cell: ({ row }) => <span className="text-xs">{new Date(row.original.createdAt).toLocaleString()}</span>,
		},
		{
			id: "actions",
			header: "Action",
			enableSorting: false,
			enableHiding: false,
			meta: { width: "50px", align: "center" },
			cell: ({ row }) => (
				<div onClick={(e) => e.stopPropagation()}>
				<ActionMenu
					items={[
						{ label: "View", onClick: () => router.push(`/admin/announcement/${row.original.id}`) },
						{ label: "Edit", onClick: () => router.push(`/admin/announcement/${row.original.id}?edit=1`) },
						{ label: row.original.isActive ? "Deactivate" : "Activate", onClick: () => setToggleTarget(row.original) },
						{ label: "Delete", onClick: () => setDeleteTarget(row.original), variant: "danger" as const },
					]}
				/>
				</div>
			),
		},
	];

	return (
		<AdminLayout>
			<div className="animate-page-enter space-y-6">
				<DataTable
					columns={columns}
					data={rows}
					isLoading={loading}
					onRefresh={load}
					refreshing={loading}
					manualFiltering
					onRowClick={(row) => router.push(`/admin/announcement/${row.id}`)}
					showAuditColumns={false}
					globalFilter={search}
					onGlobalFilterChange={setSearch}
					searchPlaceholder="Search title or message..."
					pageIndex={page - 1}
					pageSize={pageSize}
					pageCount={meta?.totalPages ?? 1}
					totalItems={meta?.total}
					onPageChange={(idx) => setPage(idx + 1)}
					onPageSizeChange={setPageSize}
					emptyMessage="No announcements yet"
					toolbar={
						<Button variant="filled" leftIcon={Plus} onClick={() => router.push("/admin/announcements/new")}>
							New announcement
						</Button>
					}
				/>

				<Modal isOpen={!!toggleTarget} onClose={() => setToggleTarget(null)} title={`${toggleTarget?.isActive ? "Deactivate" : "Activate"} announcement`} size="sm">
					<div className="space-y-4">
						<p className="text-sm" style={{ color: "var(--text-secondary)" }}>
							{toggleTarget?.isActive ? "It stops showing as a banner immediately. Notifications already sent stay in people's inboxes." : "It shows as a banner again and is sent to the audience as a new notification."}
						</p>
						<div className="flex justify-end gap-2">
							<Button variant="outlined" color="secondary" onClick={() => setToggleTarget(null)}>
								Cancel
							</Button>
							<Button variant="filled" color={toggleTarget?.isActive ? "error" : "primary"} onClick={toggle} loading={busy} disabled={busy}>
								{toggleTarget?.isActive ? "Deactivate" : "Activate"}
							</Button>
						</div>
					</div>
				</Modal>

				<Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete announcement" size="sm">
					<div className="space-y-4">
						<p className="text-sm" style={{ color: "var(--text-secondary)" }}>
							Delete <span className="font-semibold">{deleteTarget?.title}</span>? It disappears from every banner.
						</p>
						<div className="flex justify-end gap-2">
							<Button variant="outlined" color="secondary" onClick={() => setDeleteTarget(null)}>
								Cancel
							</Button>
							<Button variant="filled" color="error" onClick={remove} loading={busy} disabled={busy}>
								Delete
							</Button>
						</div>
					</div>
				</Modal>
			</div>
		</AdminLayout>
	);
};

export default withAdminAuth(AdminAnnouncements);
