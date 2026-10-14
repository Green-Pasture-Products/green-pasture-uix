import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { Eye, GitPullRequest, Plus, Power } from "lucide-react";
import toast from "react-hot-toast";
import type { ColumnDef } from "@tanstack/react-table";

import withAdminAuth from "@/_components/withAdminAuth";
import AdminLayout from "@/_components/AdminLayout";
import { DataTable } from "@/_components/DataTable";
import { PanelHeading } from "@/_components/SettingsParts";
import { DisableNowDialog, FlagStateBadge, apiError, dateTime } from "@/_components/FeatureFlagParts";
import ActionMenu from "@/_UI/ActionMenu";
import Badge from "@/_UI/Badge";
import Button from "@/_UI/Button";
import Can from "@/_components/Can";
import { useHasPrivilege } from "@/_hooks/usePrivilege";
import axiosInstance from "@/_utils/axiosInstance";
import type { FeatureFlag } from "@/types/featureFlags";

const TAB = "rounded-md px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-colors";

const FeatureFlagsPage: React.FC = () => {
	const router = useRouter();
	const hasPrivilege = useHasPrivilege();
	const [flags, setFlags] = useState<FeatureFlag[]>([]);
	const [pending, setPending] = useState(0);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(false);
	const [search, setSearch] = useState("");
	const [module, setModule] = useState("");
	const [page, setPage] = useState(0);
	const [pageSize, setPageSize] = useState(20);
	const [disableTarget, setDisableTarget] = useState<FeatureFlag | null>(null);

	const load = useCallback(() => {
		setLoading(true);
		setError(false);
		axiosInstance
			.get("feature-flags/admin")
			.then((res) => setFlags(res.data?.data ?? []))
			.catch((err) => {
				setError(true);
				toast.error(apiError(err, "Failed to load feature flags"));
			})
			.finally(() => setLoading(false));
		axiosInstance
			.get("feature-flags/admin/changes", { params: { status: "PENDING" } })
			.then((res) => setPending((res.data?.data ?? []).length))
			.catch(() => {});
	}, []);
	useEffect(load, [load]);

	const modules = useMemo(() => [...new Set(flags.map((f) => f.module))].sort(), [flags]);
	const rows = useMemo(() => {
		const q = search.trim().toLowerCase();
		return flags.filter((f) => (!module || f.module === module) && (!q || f.name.toLowerCase().includes(q) || f.key.toLowerCase().includes(q)));
	}, [flags, search, module]);
	const pageRows = rows.slice(page * pageSize, page * pageSize + pageSize);

	const columns: ColumnDef<FeatureFlag, any>[] = [
		{
			id: "flag",
			header: "Flag",
			enableSorting: false,
			meta: { width: "280px" },
			cell: ({ row }) => (
				<div className="min-w-0">
					<div className="flex items-center gap-2">
						<span className="min-w-0 truncate text-sm font-medium" style={{ color: "var(--text-primary)" }} title={row.original.name}>{row.original.name}</span>
						{row.original.system && <Badge size="sm" variant="neutral" className="whitespace-nowrap">System</Badge>}
					</div>
					<code className="block truncate text-xs" style={{ color: "var(--text-hint)" }} title={row.original.key}>{row.original.key}</code>
				</div>
			),
		},
		{ id: "module", header: "Module", enableSorting: false, meta: { width: "120px" }, cell: ({ row }) => <span className="block truncate text-sm" title={row.original.module}>{row.original.module}</span> },
		{ id: "state", header: "State", enableSorting: false, meta: { width: "120px" }, cell: ({ row }) => <FlagStateBadge flag={row.original} /> },
		{
			id: "targeting",
			header: "Targeting",
			enableSorting: false,
			meta: { width: "170px" },
			cell: ({ row }) => {
				const { targetRoles: r, targetAccountIds: a } = row.original;
				return <span className="block truncate text-sm" style={{ color: "var(--text-secondary)" }}>{r.length || a.length ? `${r.length} roles · ${a.length} accounts` : "Everyone"}</span>;
			},
		},
		{
			id: "pending",
			header: "Pending",
			enableSorting: false,
			meta: { width: "150px" },
			cell: ({ row }) => (row.original.pendingChange ? <Badge variant="warning" className="whitespace-nowrap">Pending approval</Badge> : <span style={{ color: "var(--text-hint)" }}>—</span>),
		},
		{ id: "updated", header: "Updated", enableSorting: false, meta: { width: "170px" }, cell: ({ row }) => <span className="block truncate text-sm whitespace-nowrap" style={{ color: "var(--text-secondary)" }}>{dateTime(row.original.updatedAt)}</span> },
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
							{ label: "View", icon: <Eye size={14} />, onClick: () => router.push(`/admin/feature-flag/${row.original.id}`) },
							{ label: "Request change", icon: <GitPullRequest size={14} />, hidden: !hasPrivilege("MANAGE_FEATURE_FLAGS"), onClick: () => router.push(`/admin/feature-flag/${row.original.id}?edit=1`) },
							{ label: "Disable now", icon: <Power size={14} />, variant: "danger", hidden: !hasPrivilege("EMERGENCY_DISABLE_FEATURE_FLAGS") || !row.original.enabled, onClick: () => setDisableTarget(row.original) },
						]}
					/>
				</div>
			),
		},
	];

	return (
		<AdminLayout pageTitle="Feature Flags">
			<div className="animate-page-enter space-y-5">
				<div className="flex flex-wrap items-start justify-between gap-3">
					<PanelHeading title="Feature Flags" description="Switch features on or off without a release. Changes need a second person's approval." />
					<Can privilege="MANAGE_FEATURE_FLAGS">
						<Button variant="filled" leftIcon={Plus} onClick={() => router.push("/admin/feature-flags/new")}>New flag</Button>
					</Can>
				</div>

				<div className="bg-muted inline-flex max-w-full gap-1 overflow-x-auto rounded-lg p-1" role="tablist">
					<span role="tab" aria-selected="true" className={`${TAB} bg-card text-foreground shadow-sm`}>Flags</span>
					<Link role="tab" aria-selected="false" href="/admin/feature-flags/approvals" className={`${TAB} text-muted-foreground hover:text-foreground`}>
						Approvals ({pending} pending)
					</Link>
				</div>

				<DataTable
					columns={columns}
					data={pageRows}
					isLoading={loading}
					isError={error}
					onRetry={load}
					onRefresh={load}
					refreshing={loading}
					manualFiltering
					globalFilter={search}
					onGlobalFilterChange={(v) => {
						setSearch(v);
						setPage(0);
					}}
					searchPlaceholder="Search name or key..."
					filters={[{ key: "module", label: "Module", options: modules.map((m) => ({ value: m, label: m })) }]}
					filterValues={{ module }}
					onFilterChange={(_, v) => {
						setModule(v);
						setPage(0);
					}}
					pageIndex={page}
					pageSize={pageSize}
					pageCount={Math.max(1, Math.ceil(rows.length / pageSize))}
					totalItems={rows.length}
					onPageChange={setPage}
					onPageSizeChange={(s) => {
						setPageSize(s);
						setPage(0);
					}}
					emptyMessage="No feature flags"
					onRowClick={(row) => router.push(`/admin/feature-flag/${row.id}`)}
				/>

				<DisableNowDialog flag={disableTarget} onClose={() => setDisableTarget(null)} onDone={load} />
			</div>
		</AdminLayout>
	);
};

export default withAdminAuth(FeatureFlagsPage);
