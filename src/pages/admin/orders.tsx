import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import withAdminAuth from "@/_components/withAdminAuth";
import { parseAsString } from "nuqs";
import toast from "react-hot-toast";

import AdminLayout from "@/_components/AdminLayout";
import { useAppDispatch, useAppSelector } from "@/_redux/store";
import { adminAction } from "@/_redux/actions/admin.action";
import { DataTable, Column, FilterDef } from "@/_UI/DataTable";
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
			{ value: "DELIVERED", label: "Delivered" },
			{ value: "CANCELLED", label: "Cancelled" },
			{ value: "COMPLETED", label: "Completed" },
			{ value: "FAILED", label: "Failed" },
		],
	},
];

const getStatusBadgeVariant = (status: string): "success" | "warning" | "error" | "info" | "neutral" => {
	switch (status?.toUpperCase()) {
		case "PENDING":
			return "warning";
		case "PROCESSING":
			return "info";
		case "SHIPPED":
			return "info";
		case "DELIVERED":
		case "COMPLETED":
			return "success";
		case "CANCELLED":
		case "FAILED":
			return "error";
		case "REFUNDED":
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

	useEffect(() => {
		dispatch(adminAction.fetchOrdersAsync({ page: currentPage, limit: pageSize, search: searchTerm || undefined }));
	}, [currentPage, searchTerm, pageSize]);

	const filteredOrders = orders?.filter((order: any) => {
		const statusFilter = filterValues.status;
		if (!statusFilter) return true;
		return order.orderStatus?.toUpperCase() === statusFilter.toUpperCase();
	});

	// Status narrows the already-fetched page client-side, so don't reset the server page
	const handleFilterChange = (key: string, value: string) =>
		setFilter(key, value, { resetPage: false });

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

	const columns: Column<BackendOrder>[] = [
		{
			key: "orderReference",
			header: "Order Ref",
			width: "200px",
			render: (value: any) => (
				<span className="text-sm font-medium whitespace-nowrap" style={{ color: "var(--text-primary)" }}>#{value}</span>
			),
		},
		{
			key: "customer",
			header: "Customer",
			maxWidth: "220px",
			truncate: true,
			render: (_value: any, row: BackendOrder) => (
				<div>
					<div className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
						{row.customer?.profile?.firstName} {row.customer?.profile?.lastName}
					</div>
					<div className="text-xs truncate" style={{ color: "var(--text-hint)" }}>
						{row.customer?.profile?.email}
					</div>
				</div>
			),
		},
		{
			key: "items",
			header: "Items",
			render: (_value: any, row: BackendOrder) => (
				<span className="text-sm text-gray-600 dark:text-gray-300">
					{row.items?.length ?? 0}
				</span>
			),
		},
		{
			key: "totalAmount",
			header: "Total",
			render: (value: any) => (
				<span className="text-sm font-semibold text-on-surface dark:text-gray-200">
					{formatCurrency(value)}
				</span>
			),
		},
		{
			key: "orderStatus",
			header: "Status",
			render: (value: any) => (
				<Badge variant={getStatusBadgeVariant(String(value))} dot>
					{String(value)}
				</Badge>
			),
		},
		{
			key: "createdAt",
			header: "Date",
			render: (value: any) => (
				<span className="text-sm text-gray-500 dark:text-gray-400">
					{new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
				</span>
			),
		},
		{
			key: "id",
			header: "",
			width: "50px",
			align: "center" as const,
			render: (_: any, row: BackendOrder) => (
				<ActionMenu items={[
					{ label: "View", icon: VIEW_ICON, onClick: () => router.push(`/admin/order/${row.orderReference}`) },
					{ label: "Cancel", icon: DELETE_ICON, onClick: () => setCancelTarget(row), variant: "danger" as const, hidden: row.orderStatus === "CANCELLED" },
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
					data={filteredOrders ?? []}
					isLoading={ordersLoading}
					onSearch={setSearch}
					initialSearch={searchTerm}
					searchPlaceholder="Search orders..."
					filters={ORDER_STATUS_FILTERS}
					filterValues={filterValues}
					onFilterChange={handleFilterChange}
					pagination={ordersPagination ?? undefined}
					onPageChange={setPage}
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
