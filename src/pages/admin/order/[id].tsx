import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import withAdminAuth from "@/_components/withAdminAuth";
import AdminLayout from "@/_components/AdminLayout";
import { BackButton, DetailHeader, DetailSection, DetailRow } from "@/_UI/DetailField";
import Badge from "@/_UI/Badge";
import { DataTable, Column } from "@/_UI/DataTable";
import { formatCurrency } from "@/_UI/FormatValue";
import axiosInstance from "@/_utils/axiosInstance";
import { BackendOrder, BackendOrderItem } from "@/types";

const getStatusBadgeVariant = (status: string): "success" | "warning" | "error" | "info" | "neutral" => {
	switch (status?.toUpperCase()) {
		case "PENDING":
			return "warning";
		case "PROCESSING":
			return "info";
		case "SHIPPED":
			return "info";
		case "DELIVERED":
			return "success";
		case "CANCELLED":
			return "error";
		default:
			return "neutral";
	}
};

const OrderDetail: React.FC = () => {
	const router = useRouter();
	const { id } = router.query;
	const [order, setOrder] = useState<BackendOrder | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (!router.isReady || !id) return;
		setLoading(true);
		axiosInstance
			.post(`order/details/${id}`)
			.then((res) => {
				setOrder(res.data?.data ?? res.data);
			})
			.catch(() => {
				setOrder(null);
			})
			.finally(() => {
				setLoading(false);
			});
	}, [id, router.isReady]);

	const itemColumns: Column<BackendOrderItem>[] = [
		{
			key: "item",
			header: "Item Name",
			render: (_value: any, row: BackendOrderItem) => (
				<span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
					{row.item?.name ?? "—"}
				</span>
			),
		},
		{
			key: "quantity",
			header: "Quantity",
			render: (value: any) => (
				<span className="text-sm" style={{ color: "var(--text-primary)" }}>
					{value}
				</span>
			),
		},
		{
			key: "unitPrice",
			header: "Unit Price",
			render: (value: any) => (
				<span className="text-sm tabular-nums" style={{ color: "var(--text-primary)" }}>
					{formatCurrency(value)}
				</span>
			),
		},
		{
			key: "subtotal",
			header: "Subtotal",
			render: (_value: any, row: BackendOrderItem) => (
				<span className="text-sm font-semibold tabular-nums" style={{ color: "var(--text-primary)" }}>
					{formatCurrency(row.quantity * row.unitPrice)}
				</span>
			),
		},
	];

	if (loading) {
		return (
			<AdminLayout>
				<div className="max-w-4xl mx-auto space-y-5 animate-page-enter">
					<div className="h-8 w-20 rounded animate-pulse" style={{ background: "var(--surface-medium)" }} />
					<div className="h-40 rounded-xl animate-pulse" style={{ background: "var(--surface-medium)" }} />
					<div className="h-48 rounded-xl animate-pulse" style={{ background: "var(--surface-medium)" }} />
					<div className="h-48 rounded-xl animate-pulse" style={{ background: "var(--surface-medium)" }} />
				</div>
			</AdminLayout>
		);
	}

	if (!order) {
		return (
			<AdminLayout>
				<div className="max-w-4xl mx-auto space-y-5 animate-page-enter">
					<BackButton />
					<div
						className="rounded-xl px-6 py-16 text-center"
						style={{ background: "var(--surface-paper)", border: "1px solid var(--border-light)" }}
					>
						<p className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
							Order not found
						</p>
					</div>
				</div>
			</AdminLayout>
		);
	}

	return (
		<AdminLayout>
			<div className="max-w-4xl mx-auto space-y-5 animate-page-enter">
				<BackButton />

				<DetailHeader
					title={`Order #${order.orderReference}`}
					subtitle={new Date(order.createdAt).toLocaleDateString("en-US", {
						year: "numeric",
						month: "long",
						day: "numeric",
					})}
					status={
						<Badge variant={getStatusBadgeVariant(order.orderStatus)} dot>
							{order.orderStatus}
						</Badge>
					}
					metrics={[
						{ label: "Total Amount", value: formatCurrency(order.totalAmount) },
						{ label: "Items Count", value: order.items?.length ?? 0 },
					]}
				/>

				<DetailSection title="Order Information">
					<DetailRow label="Order Reference" value={`#${order.orderReference}`} />
					<DetailRow
						label="Status"
						value={
							<Badge variant={getStatusBadgeVariant(order.orderStatus)} dot>
								{order.orderStatus}
							</Badge>
						}
					/>
					<DetailRow label="Total Amount" value={formatCurrency(order.totalAmount)} />
					<DetailRow
						label="Created Date"
						value={new Date(order.createdAt).toLocaleDateString("en-US", {
							year: "numeric",
							month: "long",
							day: "numeric",
							hour: "2-digit",
							minute: "2-digit",
						})}
					/>
				</DetailSection>

				{order.customer && (
					<DetailSection title="Customer">
						<DetailRow
							label="Name"
							value={`${order.customer.profile?.firstName ?? ""} ${order.customer.profile?.lastName ?? ""}`}
						/>
						<DetailRow label="Email" value={order.customer.profile?.email} />
						<DetailRow label="Phone" value={order.customer.profile?.phoneNumber ?? "—"} />
					</DetailSection>
				)}

				<DetailSection title="Order Items">
					<DataTable columns={itemColumns} data={order.items ?? []} emptyMessage="No items in this order" />
				</DetailSection>
			</div>
		</AdminLayout>
	);
};

export default withAdminAuth(OrderDetail);
