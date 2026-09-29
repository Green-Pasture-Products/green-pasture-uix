import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/router";
import withAdminAuth from "@/_components/withAdminAuth";
import { parseAsString } from "nuqs";
import toast from "react-hot-toast";

import AdminLayout from "@/_components/AdminLayout";
import { useAppDispatch, useAppSelector } from "@/_redux/store";
import { adminAction } from "@/_redux/actions/admin.action";
import { DataTable, FilterDef } from "@/_components/DataTable";
import type { ColumnDef } from "@tanstack/react-table";
import ActionMenu from "@/_UI/ActionMenu";
import Badge from "@/_UI/Badge";
import Modal from "@/_UI/Modal";
import Button from "@/_UI/Button";
import { BackendOrder } from "@/types";
import { formatCurrency } from "@/_UI/FormatValue";
import { useListParams } from "@/_hooks/useListParams";

const VIEW_ICON = (
	<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
);

const DELETE_ICON = (
	<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
);

const ORDER_STATUS_FILTERS: FilterDef[] = [
	{
		key: "status",
		label: "Status",
		options: [
			{ value: "PENDING", label: "Pending" },
			{ value: "PROCESSING", label: "Processing" },
			{ value: "IN_TRANSIT", label: "In Transit" },
			{ value: "DELIVERED", label: "Delivered" },
			{ value: "CANCELLED", label: "Cancelled" },
		],
	},
];

const getStatusBadgeVariant = (status: string): "success" | "warning" | "error" | "info" | "neutral" => {
	switch (status?.toUpperCase()) {
		case "PENDING":
			return "warning";
		case "PROCESSING":
			return "info";
		case "IN_TRANSIT":
			return "info";
		case "DELIVERED":
			return "success";
		case "CANCELLED":
			return "error";
		default:
			return "neutral";
	}
};

const AdminOrders: React.FC = () => {
	const router = useRouter();
	const dispatch = useAppDispatch();
	const { orders, ordersLoading, ordersPagination } = useAppSelector((state) => state.admin);
	const {
		page: currentPage,
		pageSize,
		search: searchTerm,
		filterValues,
		setPage,
		setSearch,
		setPageSize,
		setFilter,
	} = useListParams({ extraFilters: { status: parseAsString.withDefault("") } });
	const [cancelTarget, setCancelTarget] = useState<BackendOrder | null>(null);
	const [isCancelling, setIsCancelling] = useState(false);

	// Extracted so the toolbar's refresh icon re-runs exactly the fetch the page loads with.
	const refresh = useCallback(() => {
		dispatch(adminAction.fetchOrdersAsync({
			page: currentPage,
			limit: pageSize,
			search: searchTerm || undefined,
			filter: filterValues.status || undefined,
		}));
	}, [currentPage, searchTerm, pageSize, filterValues.status]);

	useEffect(() => {
		refresh();
	}, [refresh]);

	const handleFilterChange = (key: string, value: string) => setFilter(key, value);

	const handleCancelOrder = async () => {
		if (!cancelTarget) return;
		setIsCancelling(true);
		try {
			await dispatch(adminAction.cancelOrderAsync(cancelTarget.id)).unwrap();
			toast.success("Order cancelled successfully");
			setCancelTarget(null);
		} catch (error: any) {
			toast.error(error || "Failed to cancel order");
		} finally {
			setIsCancelling(false);
		}
	};

	const columns: ColumnDef<BackendOrder, any>[] = [
		{
			accessorKey: "orderReference",
			header: "Order Ref",
			meta: { width: "200px" },
			cell: ({ getValue }) => (
				<span className="text-sm font-medium whitespace-nowrap" style={{ color: "var(--text-primary)" }}>#{String(getValue())}</span>
			),
		},
		{
			id: "customer",
			accessorKey: "customer",
			header: "Customer",
			enableSorting: false,
			meta: { maxWidth: "220px", truncate: true },
			cell: ({ row }) => (
				<div>
					<div className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
						{row.original.customer?.profile?.firstName} {row.original.customer?.profile?.lastName}
					</div>
					<div className="text-xs truncate" style={{ color: "var(--text-hint)" }}>
						{row.original.customer?.profile?.email}
					</div>
				</div>
			),
		},
		{
			id: "items",
			accessorKey: "items",
			header: "Items",
			enableSorting: false,
			cell: ({ row }) => (
				<span className="text-sm text-gray-600 dark:text-gray-300">
					{row.original.items?.length ?? 0}
				</span>
			),
		},
		{
			accessorKey: "totalAmount",
			header: "Total",
			cell: ({ getValue }) => (
				<span className="text-sm font-semibold text-on-surface dark:text-gray-200">
					{formatCurrency(getValue() as number)}
				</span>
			),
		},
		{
			accessorKey: "orderStatus",
			header: "Status",
			cell: ({ getValue }) => (
				<Badge variant={getStatusBadgeVariant(String(getValue()))} dot>
					{String(getValue()).replace(/_/g, " ")}
				</Badge>
			),
		},
		{
			accessorKey: "createdAt",
			header: "Date",
			cell: ({ getValue }) => (
				<span className="text-sm text-gray-500 dark:text-gray-400">
					{new Date(getValue() as string).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
				</span>
			),
		},
		{
			id: "actions",
			header: "Action",
			enableSorting: false,
			enableHiding: false,
			meta: { width: "50px", align: "center" },
			cell: ({ row }) => (
				<ActionMenu items={[
					{ label: "View", icon: VIEW_ICON, onClick: () => router.push(`/admin/order/${row.original.orderReference}`) },
					{ label: "Cancel", icon: DELETE_ICON, onClick: () => setCancelTarget(row.original), variant: "danger" as const, hidden: ["CANCELLED", "DELIVERED"].includes(row.original.orderStatus) },
				]} />
			),
		},
	];

	return (
		<AdminLayout>
			<div className="animate-page-enter space-y-6">
				{/* Orders Table */}
				<DataTable
					columns={columns}
					data={orders ?? []}
					isLoading={ordersLoading}
					onRefresh={refresh}
					refreshing={ordersLoading}
					manualFiltering
					globalFilter={searchTerm}
					onGlobalFilterChange={setSearch}
					searchPlaceholder="Search by order ref, customer name or email..."
					filters={ORDER_STATUS_FILTERS}
					filterValues={filterValues}
					onFilterChange={handleFilterChange}
					pageIndex={currentPage - 1}
					pageSize={pageSize}
					pageCount={ordersPagination?.totalPages ?? 1}
					totalItems={ordersPagination?.totalItems}
					onPageChange={(idx) => setPage(idx + 1)}
					onPageSizeChange={setPageSize}
					onRowClick={(row) => router.push(`/admin/order/${row.orderReference}`)}
					emptyMessage="No orders found"
				/>

				{/* Cancel Confirmation Modal */}
				<Modal
					isOpen={!!cancelTarget}
					onClose={() => setCancelTarget(null)}
					title="Cancel Order"
					size="sm"
				>
					<div className="space-y-4">
						<p className="text-sm text-gray-600 dark:text-gray-300">
							Are you sure you want to cancel order{" "}
							<span className="font-semibold text-on-surface dark:text-white">
								#{cancelTarget?.orderReference}
							</span>?
							This action cannot be undone.
						</p>
						<div className="flex justify-end gap-3">
							<Button
								variant="outlined"
								color="secondary"
								size="sm"
								onClick={() => setCancelTarget(null)}
							>
								Keep Order
							</Button>
							<Button
								variant="filled"
								color="error"
								size="sm"
								loading={isCancelling}
								onClick={handleCancelOrder}
							>
								Cancel Order
							</Button>
						</div>
					</div>
				</Modal>
			</div>
		</AdminLayout>
	);
};

export default withAdminAuth(AdminOrders);
