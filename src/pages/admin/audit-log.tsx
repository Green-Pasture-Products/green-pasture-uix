import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { parseAsString } from "nuqs";
import toast from "react-hot-toast";
import type { ColumnDef } from "@tanstack/react-table";

import withAdminAuth from "@/_components/withAdminAuth";
import AdminLayout from "@/_components/AdminLayout";
import { DataTable, type FilterDef } from "@/_components/DataTable";
import ActionMenu from "@/_UI/ActionMenu";
import Badge from "@/_UI/Badge";
import axiosInstance from "@/_utils/axiosInstance";
import { useListParams } from "@/_hooks/useListParams";
import { actorLabel, auditFailed, auditKind } from "@/_utils/auditLog";
import type { ActivityEventRow, PageMeta } from "@/types/live";

const VIEW_ICON = (
	<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
);

const FILTERS: FilterDef[] = [
	{
		key: "action",
		label: "Kind",
		options: [
			{ value: "REQUEST", label: "Requests" },
			{ value: "SECURITY", label: "Sign-ins & security" },
			{ value: "CREATE", label: "Created" },
			{ value: "UPDATE", label: "Updated" },
			{ value: "DELETE", label: "Deleted" },
			{ value: "COMMENT", label: "Comments" },
		],
	},
	{
		key: "actorType",
		label: "Who",
		options: [
			{ value: "CLIENT", label: "Customers" },
			{ value: "STAFF", label: "Staff" },
			{ value: "ANONYMOUS", label: "Anonymous" },
			{ value: "SYSTEM", label: "System" },
		],
	},
	{
		key: "outcome",
		label: "Outcome",
		options: [
			{ value: "succeeded", label: "Succeeded" },
			{ value: "failed", label: "Failed" },
		],
	},
];

/** Everything customers and staff do: changes, requests, sign-ins. Read-only; entries open on their own page. */
const AuditLog: React.FC = () => {
	const router = useRouter();
	const { page, pageSize, search, filterValues, setPage, setSearch, setPageSize, setFilter } = useListParams({
		defaultPageSize: 50,
		extraFilters: { action: parseAsString.withDefault(""), actorType: parseAsString.withDefault(""), outcome: parseAsString.withDefault("") },
	});
	const [rows, setRows] = useState<ActivityEventRow[]>([]);
	const [meta, setMeta] = useState<PageMeta | null>(null);
	const [loading, setLoading] = useState(true);

	const load = useCallback(async () => {
		setLoading(true);
		try {
			const res = await axiosInstance.get("activity", {
				params: { page, limit: pageSize, q: search || undefined, action: filterValues.action || undefined, actorType: filterValues.actorType || undefined, outcome: filterValues.outcome || undefined },
			});
			setRows(res.data?.data?.items ?? []);
			setMeta(res.data?.data?.meta ?? null);
		} catch {
			toast.error("Could not load the audit log");
		} finally {
			setLoading(false);
		}
	}, [page, pageSize, search, filterValues.action, filterValues.actorType, filterValues.outcome]);

	useEffect(() => {
		load();
	}, [load]);

	const columns: ColumnDef<ActivityEventRow, any>[] = [
		{
			id: "when",
			header: "When",
			meta: { width: "190px" },
			cell: ({ row }) => <span className="text-sm whitespace-nowrap">{new Date(row.original.occurredAt).toLocaleString()}</span>,
		},
		{
			id: "who",
			header: "Who",
			meta: { width: "200px" },
			cell: ({ row }) => (
				<div className="min-w-0">
					<p className="truncate text-sm font-medium">{row.original.actorName}</p>
					<p className="text-xs" style={{ color: "var(--text-hint)" }}>
						{actorLabel(row.original.actorType)}
					</p>
				</div>
			),
		},
		{
			id: "summary",
			header: "What happened",
			meta: { maxWidth: "460px", truncate: true },
			cell: ({ row }) => <span className="text-sm">{row.original.summary}</span>,
		},
		{
			id: "record",
			header: "Record",
			meta: { width: "130px" },
			cell: ({ row }) => (row.original.entityType === "Request" ? <span style={{ color: "var(--text-hint)" }}>—</span> : <Badge variant="neutral">{row.original.entityType}</Badge>),
		},
		{
			id: "kind",
			header: "Kind",
			meta: { width: "120px" },
			cell: ({ row }) => {
				const k = auditKind(row.original);
				return <Badge variant={k.variant}>{k.label}</Badge>;
			},
		},
		{
			id: "outcome",
			header: "Outcome",
			meta: { width: "120px" },
			cell: ({ row }) => (auditFailed(row.original) ? <Badge variant="error" dot>Failed</Badge> : <Badge variant="success" dot>Succeeded</Badge>),
		},
		{
			id: "actions",
			header: "Action",
			enableSorting: false,
			enableHiding: false,
			meta: { width: "50px", align: "center" },
			cell: ({ row }) => (
				<div onClick={(e) => e.stopPropagation()}>
					<ActionMenu items={[{ label: "View", icon: VIEW_ICON, onClick: () => router.push(`/admin/audit-log/${row.original.id}`) }]} />
				</div>
			),
		},
	];

	return (
		<AdminLayout pageTitle="Audit Log">
			<div className="animate-page-enter space-y-6">
				<DataTable
					columns={columns}
					data={rows}
					isLoading={loading}
					onRefresh={load}
					refreshing={loading}
					manualFiltering
					onRowClick={(row) => router.push(`/admin/audit-log/${row.id}`)}
					showAuditColumns={false}
					globalFilter={search}
					onGlobalFilterChange={setSearch}
					searchPlaceholder="Search by person or what happened…"
					filters={FILTERS}
					filterValues={filterValues}
					onFilterChange={(key, value) => setFilter(key, value)}
					pageIndex={page - 1}
					pageSize={pageSize}
					pageCount={meta?.totalPages ?? 1}
					totalItems={meta?.total}
					onPageChange={(idx) => setPage(idx + 1)}
					onPageSizeChange={setPageSize}
					emptyMessage="Nothing recorded yet"
				/>
			</div>
		</AdminLayout>
	);
};

export default withAdminAuth(AuditLog);
