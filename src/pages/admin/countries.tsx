import React, { useCallback, useEffect, useState } from "react";
import { statusColumn } from "@/_components/statusColumn";
import { useRouter } from "next/router";
import withAdminAuth from "@/_components/withAdminAuth";
import toast from "react-hot-toast";

import { BackendCountry } from "@/types";
import AdminLayout from "@/_components/AdminLayout";
import { DataTable } from "@/_components/DataTable";
import type { ColumnDef } from "@tanstack/react-table";
import ActionMenu from "@/_UI/ActionMenu";
import Badge from "@/_UI/Badge";
import axiosInstance from "@/_utils/axiosInstance";
import { useListParams } from "@/_hooks/useListParams";

const EDIT_ICON = (
	<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4L16.5 3.5z" /></svg>
);

const VIEW_ICON = (
	<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
);

const Countries: React.FC = () => {
	const router = useRouter();
	const [countries, setCountries] = useState<BackendCountry[]>([]);
	const [loading, setLoading] = useState(true);
	const [pagination, setPagination] = useState<any>(null);
	const { page: currentPage, pageSize, search: searchTerm, setPage, setSearch, setPageSize } = useListParams();

	const fetchCountries = useCallback(() => {
		setLoading(true);
		const searchParam = searchTerm ? `&search=${encodeURIComponent(searchTerm)}` : "";
		axiosInstance
			.get(`country?page=${currentPage}&limit=${pageSize}${searchParam}`)
			.then((res) => {
				const data = res.data?.data ?? res.data;
				setCountries(data?.items ?? data ?? []);
				setPagination(data?.meta ?? null);
			})
			.catch(() => {
				toast.error("Failed to load countries");
			})
			.finally(() => {
				setLoading(false);
			});
	}, [currentPage, searchTerm, pageSize]);

	useEffect(() => {
		fetchCountries();
	}, [fetchCountries]);

	const columns: ColumnDef<BackendCountry, any>[] = [
		{
			accessorKey: "name",
			header: "Name",
			cell: ({ getValue }) => (
				<span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{String(getValue())}</span>
			),
		},
		{
			accessorKey: "code",
			header: "Code",
			cell: ({ getValue }) => (
				<span className="text-sm" style={{ color: "var(--text-secondary)" }}>{String(getValue())}</span>
			),
		},
		{
			accessorKey: "currencyCode",
			header: "Currency",
			cell: ({ getValue }) => <Badge variant="info">{String(getValue())}</Badge>,
		},
		{
			accessorKey: "priceFactor",
			header: "Price Factor",
			cell: ({ getValue }) => (
				<span className="text-sm font-mono" style={{ color: "var(--text-primary)" }}>{Number(getValue()).toFixed(6)}</span>
			),
		},
		{
			accessorKey: "shippingEnabled",
			header: "Shipping",
			cell: ({ getValue }) => (
				<Badge variant={getValue() ? "success" : "neutral"} dot>
					{getValue() ? "Ships" : "Blocked"}
				</Badge>
			),
		},
		statusColumn(),
		{
			id: "actions",
			header: "Action",
			enableSorting: false,
			enableHiding: false,
			meta: { width: "50px", align: "center" },
			cell: ({ row }) => (
				<div onClick={(e) => e.stopPropagation()}><ActionMenu items={[
					{ label: "View", icon: VIEW_ICON, onClick: () => router.push(`/admin/country/${row.original.id}`) },
					{ label: "Edit", icon: EDIT_ICON, onClick: () => router.push(`/admin/country/${row.original.id}?edit=1`) },
				]} /></div>
			),
		},
	];

	return (
		<AdminLayout>
			<div className="animate-page-enter space-y-6">
				<DataTable
					columns={columns}
					data={countries}
					isLoading={loading}
					onRefresh={fetchCountries}
					refreshing={loading}
					manualFiltering
					globalFilter={searchTerm}
					onGlobalFilterChange={setSearch}
					searchPlaceholder="Search by name..."
					pageIndex={currentPage - 1}
					pageSize={pageSize}
					pageCount={pagination?.totalPages ?? 1}
					totalItems={pagination?.totalItems}
					onPageChange={(idx) => setPage(idx + 1)}
					onPageSizeChange={setPageSize}
					onRowClick={(row) => router.push(`/admin/country/${row.id}`)}
					emptyMessage="No countries found"
				/>
			</div>
		</AdminLayout>
	);
};

export default withAdminAuth(Countries);
