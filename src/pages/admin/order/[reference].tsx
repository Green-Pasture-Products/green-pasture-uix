import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/router";
import withAdminAuth from "@/_components/withAdminAuth";
import AdminLayout from "@/_components/AdminLayout";
import { useAppDispatch, useAppSelector } from "@/_redux/store";
import { adminAction } from "@/_redux/actions/admin.action";
import { BackButton, DetailHeader, DetailSection } from "@/_UI/DetailField";
import Badge from "@/_UI/Badge";
import { DataTable } from "@/_components/DataTable";
import type { ColumnDef } from "@tanstack/react-table";
import { formatCurrency } from "@/_UI/FormatValue";
import { formatWeight } from "@/_utils/formatWeight";
import PageLoader from "@/_UI/PageLoader";
import { BackendOrder, BackendOrderItem } from "@/types";

const getStatusVariant = (status: string): "success" | "warning" | "error" | "info" | "neutral" => {
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

const AdminOrderDetail: React.FC = () => {
	const router = useRouter();
	const dispatch = useAppDispatch();
	const [order, setOrder] = useState<BackendOrder | null>(null);
	const [loading, setLoading] = useState(true);
	const [refreshing, setRefreshing] = useState(false);

	const loadOrder = useCallback(
		(silent = false) => {
			if (!router.isReady || !router.query.reference) return;

			const orderReference = router.query.reference as string;

			silent ? setRefreshing(true) : setLoading(true);
			dispatch(adminAction.fetchOrderDetailAsync(orderReference))
				.unwrap()
				.then((res: any) => {
					setOrder(res?.data ?? res);
				})
				.catch(() => {
					setOrder(null);
				})
				.finally(() => {
					setLoading(false);
					setRefreshing(false);
				});
		},
		[router.isReady, router.query.reference, dispatch],
	);

	useEffect(() => {
		loadOrder();
	}, [loadOrder]);

	const itemColumns: ColumnDef<BackendOrderItem, any>[] = [
		{
			id: "item",
			accessorKey: "item",
			header: "Item Name",
			enableSorting: false,
			cell: ({ row }) => {
				const name = row.original.itemName ?? row.original.item?.name ?? "—";
				const size = formatWeight(row.original.weightValue ?? row.original.item?.weightValue, row.original.weightUnit ?? row.original.item?.weightUnit);
				return (
					<div>
						<span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
							{name}
						</span>
						{size && (
							<div className="text-xs" style={{ color: "var(--text-secondary)" }}>
								{size}
							</div>
						)}
					</div>
				);
			},
		},
		{
			accessorKey: "quantity",
			header: "Qty",
			meta: { align: "center" },
			cell: ({ getValue }) => (
				<span className="text-sm" style={{ color: "var(--text-primary)" }}>
					{getValue() as number}
				</span>
			),
		},
		{
			accessorKey: "unitPrice",
			header: "Unit Price",
			cell: ({ getValue }) => (
				<span className="text-sm tabular-nums" style={{ color: "var(--text-primary)" }}>
					{formatCurrency(getValue() as number)}
				</span>
			),
		},
		{
			id: "subtotal",
			header: "Subtotal",
			enableSorting: false,
			cell: ({ row }) => (
				<span className="text-sm font-semibold tabular-nums" style={{ color: "var(--text-primary)" }}>
					{formatCurrency(row.original.quantity * row.original.unitPrice)}
				</span>
			),
		},
	];

	if (loading) {
		return (
			<AdminLayout>
				<PageLoader fullScreen={false} message="Loading order details..." />
			</AdminLayout>
		);
	}

	if (!order) {
		return (
			<AdminLayout>
				<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-5 animate-page-enter">
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
			<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-5 animate-page-enter">
				<BackButton />

				<DetailHeader
					title={`Order #${order.orderReference}`}
					subtitle={new Date(order.createdAt).toLocaleDateString("en-US", {
						year: "numeric",
						month: "long",
						day: "numeric",
					})}
					status={
						<Badge variant={getStatusVariant(order.orderStatus)} dot>
							{order.orderStatus.replace(/_/g, " ")}
						</Badge>
					}
					metrics={[
						{ label: "Total Amount", value: formatCurrency(order.totalAmount) },
						{ label: "Items Count", value: order.items?.length ?? 0 },
						{
							label: "Order Date",
							value: new Date(order.createdAt).toLocaleDateString("en-US", {
								month: "short",
								day: "numeric",
								year: "numeric",
							}),
						},
					]}
				/>

				<DetailSection title="Customer Information">
					<div className="px-5 py-4 space-y-3">
						<div className="grid grid-cols-2 gap-4">
							<div>
								<span className="text-xs font-medium" style={{ color: "var(--text-hint)" }}>
									Name
								</span>
								<p className="text-sm mt-0.5" style={{ color: "var(--text-primary)" }}>
									{order.customer?.profile?.firstName} {order.customer?.profile?.lastName}
								</p>
							</div>
							<div>
								<span className="text-xs font-medium" style={{ color: "var(--text-hint)" }}>
									Email
								</span>
								<p className="text-sm mt-0.5" style={{ color: "var(--text-primary)" }}>
									{order.customer?.profile?.email}
								</p>
							</div>
							<div>
								<span className="text-xs font-medium" style={{ color: "var(--text-hint)" }}>
									Phone Number
								</span>
								<p className="text-sm mt-0.5" style={{ color: "var(--text-primary)" }}>
									{order.customer?.profile?.phoneNumber || "—"}
								</p>
							</div>
						</div>
					</div>
				</DetailSection>

				<DetailSection title="Order Items">
					<DataTable
						columns={itemColumns}
						data={order.items ?? []}
						manualPagination={false}
						onRefresh={() => loadOrder(true)}
						refreshing={refreshing}
						emptyMessage="No items in this order"
					/>
				</DetailSection>

				{(order as any).shippingAddress && (
					<DetailSection title="Delivery">
						<div className="px-5 py-4 space-y-2">
							<div>
								<span className="text-xs font-medium" style={{ color: "var(--text-hint)" }}>
									Shipping Address
								</span>
								<p className="text-sm mt-0.5" style={{ color: "var(--text-primary)" }}>
									{typeof (order as any).shippingAddress === 'object'
										? `${(order as any).shippingAddress?.street}, ${(order as any).shippingAddress?.city}, ${(order as any).shippingAddress?.state}, ${(order as any).shippingAddress?.country} ${(order as any).shippingAddress?.postalCode}`
										: (order as any).shippingAddress}
								</p>
							</div>
							{(order as any).shippingMethod && (
								<div>
									<span className="text-xs font-medium" style={{ color: "var(--text-hint)" }}>
										Shipping Method
									</span>
									<p className="text-sm mt-0.5" style={{ color: "var(--text-primary)" }}>
										{(order as any).shippingMethod}
									</p>
								</div>
							)}
						</div>
					</DetailSection>
				)}

				{order.payments && order.payments.length > 0 && (
					<DetailSection title="Payment Information">
						<div className="px-5 py-4 space-y-4">
							{order.payments.map((payment, idx) => (
								<div key={payment.id} className="border-b border-border-light pb-4 last:border-b-0">
									<div className="grid grid-cols-2 gap-4 mb-3">
										<div>
											<span className="text-xs font-medium" style={{ color: "var(--text-hint)" }}>
												Payment Method
											</span>
											<p className="text-sm mt-0.5" style={{ color: "var(--text-primary)" }}>
												{payment.paymentMethod === 'MANUAL_TRANSFER' ? 'Bank Transfer' : 'Paystack'}
											</p>
										</div>
										<div>
											<span className="text-xs font-medium" style={{ color: "var(--text-hint)" }}>
												Amount
											</span>
											<p className="text-sm mt-0.5 font-semibold" style={{ color: "var(--text-primary)" }}>
												₦{Number(payment.amount).toLocaleString()}
											</p>
										</div>
									</div>
									<div className="grid grid-cols-2 gap-4 mb-3">
										<div>
											<span className="text-xs font-medium" style={{ color: "var(--text-hint)" }}>
												Payment Status
											</span>
											<p className="text-sm mt-0.5" style={{ color: "var(--text-primary)" }}>
												{payment.paymentStatus}
											</p>
										</div>
										<div>
											<span className="text-xs font-medium" style={{ color: "var(--text-hint)" }}>
												Created Date
											</span>
											<p className="text-sm mt-0.5" style={{ color: "var(--text-primary)" }}>
												{new Date(payment.createdAt).toLocaleDateString()}
											</p>
										</div>
									</div>

									{payment.receiptUrl && (
										<div>
											<span className="text-xs font-medium" style={{ color: "var(--text-hint)" }}>
												Payment Receipt/Proof
											</span>
											<div className="mt-2">
												<a
													href={payment.receiptUrl}
													target="_blank"
													rel="noopener noreferrer"
													className="text-sm font-medium px-3 py-2 rounded-lg"
													style={{ color: "var(--color-primary)", textDecoration: "none" }}
												>
													📎 {payment.receiptFileName || 'View Receipt'}
												</a>
											</div>
										</div>
									)}

									{payment.verifiedAt && (
										<div className="mt-3 p-3 rounded-lg" style={{ backgroundColor: "rgba(34,197,94,0.1)", borderLeft: "4px solid rgb(34,197,94)" }}>
											<p className="text-xs font-medium" style={{ color: "var(--text-primary)" }}>
												✓ Verified {new Date(payment.verifiedAt).toLocaleDateString()} {payment.verifiedBy && `by ${payment.verifiedBy}`}
											</p>
										</div>
									)}

									{payment.declinedAt && (
										<div className="mt-3 p-3 rounded-lg" style={{ backgroundColor: "rgba(239,68,68,0.1)", borderLeft: "4px solid rgb(239,68,68)" }}>
											<p className="text-xs font-medium" style={{ color: "var(--text-primary)" }}>
												✗ Declined {new Date(payment.declinedAt).toLocaleDateString()} {payment.declinedBy && `by ${payment.declinedBy}`}
											</p>
											{payment.adminNote && (
												<p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
													Note: {payment.adminNote}
												</p>
											)}
										</div>
									)}
								</div>
							))}
						</div>
					</DetailSection>
				)}
			</div>
		</AdminLayout>
	);
};

export default withAdminAuth(AdminOrderDetail);
