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
import { getReceiptDeliveryUrl, isPdfReceipt } from "@/_utils/receiptUrl";
import PageLoader from "@/_UI/PageLoader";
import { BackendOrder, BackendOrderItem } from "@/types";
import { Download, Eye, RefreshCw, X } from "lucide-react";

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
	const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
	const [selectedStatus, setSelectedStatus] = useState<string>("");
	const [statusNote, setStatusNote] = useState<string>("");
	const [receiptToView, setReceiptToView] = useState<{ url: string; fileName: string } | null>(null);

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
		if (order?.orderStatus) {
			setSelectedStatus(order.orderStatus);
		}
	}, [loadOrder, order?.orderStatus]);

	const handleStatusUpdate = async () => {
		if (!order || !selectedStatus || selectedStatus === order.orderStatus) return;

		setIsUpdatingStatus(true);
		try {
			const result = await dispatch(
				adminAction.updateOrderStatusAsync({
					orderId: order.id,
					status: selectedStatus,
					note: statusNote || undefined,
				})
			).unwrap();
			setOrder(result?.data ?? result);
			setStatusNote("");
			alert("Order status updated successfully");
		} catch (error: any) {
			alert(`Failed to update status: ${error}`);
		} finally {
			setIsUpdatingStatus(false);
		}
	};

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

				<DetailSection title="Order Status">
					<div className="px-5 py-4 space-y-4">
						<div>
							<label className="text-xs font-medium" style={{ color: "var(--text-hint)" }}>
								Current Status
							</label>
							<div className="mt-2">
								<Badge variant={getStatusVariant(order.orderStatus)} dot>
									{order.orderStatus.replace(/_/g, " ")}
								</Badge>
							</div>
						</div>

						<div>
							<label className="text-xs font-medium" style={{ color: "var(--text-hint)" }}>
								Update Status
							</label>
							<select
								value={selectedStatus}
								onChange={(e) => setSelectedStatus(e.target.value)}
								disabled={isUpdatingStatus}
								className="w-full mt-2 px-3 py-2 rounded-lg text-sm border"
								style={{
									borderColor: "var(--border-light)",
									backgroundColor: "var(--surface-low)",
									color: "var(--text-primary)",
								}}
							>
								<option value="">Select new status...</option>
								<option value="PENDING">Pending</option>
								<option value="PROCESSING">Processing</option>
								<option value="IN_TRANSIT">In Transit</option>
								<option value="DELIVERED">Delivered</option>
								<option value="CANCELLED">Cancelled</option>
							</select>
						</div>

						<div>
							<label className="text-xs font-medium" style={{ color: "var(--text-hint)" }}>
								Add Note (Optional)
							</label>
							<textarea
								value={statusNote}
								onChange={(e) => setStatusNote(e.target.value)}
								disabled={isUpdatingStatus}
								placeholder="Add a note for this status change..."
								className="w-full mt-2 px-3 py-2 rounded-lg text-sm border resize-none"
								rows={3}
								style={{
									borderColor: "var(--border-light)",
									backgroundColor: "var(--surface-low)",
									color: "var(--text-primary)",
								}}
							/>
						</div>

						<button
							onClick={handleStatusUpdate}
							disabled={isUpdatingStatus || !selectedStatus || selectedStatus === order.orderStatus}
							className="w-full px-4 py-2 rounded-lg font-medium text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
							style={{
								backgroundColor: "var(--color-primary)",
								color: "white",
							}}
						>
							{isUpdatingStatus ? "Updating..." : "Update Status"}
						</button>
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

				<DetailSection
					title="Payment Information"
					action={
						<button
							type="button"
							onClick={() => loadOrder(true)}
							disabled={refreshing}
							className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium disabled:opacity-50"
							style={{ borderColor: "var(--border-light)", color: "var(--text-secondary)" }}
						>
							<RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
							Refresh
						</button>
					}
				>
					{order.payments && order.payments.length > 0 ? (
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
													{new Intl.NumberFormat("en-NG", { style: "currency", currency: payment.currency || "NGN", maximumFractionDigits: 0 }).format(Number(payment.amount) / 100)}
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

										{payment.receiptUrl ? (
										<div>
											<span className="text-xs font-medium" style={{ color: "var(--text-hint)" }}>
												Payment Receipt/Proof
											</span>
											<div className="mt-2 flex flex-wrap items-center gap-2">
												<button
													type="button"
													onClick={() => setReceiptToView({ url: payment.receiptUrl!, fileName: payment.receiptFileName || "Payment receipt" })}
													className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-white"
													style={{ backgroundColor: "var(--color-primary)" }}
												>
													<Eye size={16} /> View receipt
												</button>
												<a
													href={getReceiptDeliveryUrl(payment.receiptUrl, payment.receiptFileName)}
													target="_blank"
													rel="noopener noreferrer"
													download={payment.receiptFileName || true}
													className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium"
													style={{ borderColor: "var(--border-light)", color: "var(--text-primary)" }}
												>
													<Download size={16} /> Download
												</a>
											</div>
											<p className="mt-1 text-xs" style={{ color: "var(--text-secondary)" }}>
												{payment.receiptFileName || "Uploaded receipt"}
											</p>
										</div>
									) : payment.paymentMethod === "MANUAL_TRANSFER" ? (
										<p className="text-sm" style={{ color: "var(--text-hint)" }}>
											No receipt URL is attached to this manual payment.
										</p>
									) : null}

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
					) : (
						<div className="px-5 py-5">
							<p className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
								No payment record was returned for this order.
							</p>
							<p className="mt-1 text-xs" style={{ color: "var(--text-hint)" }}>
								Refresh after restarting the API if this order has a payment. If a payment appears here without a receipt link, no receipt URL is attached to that payment.
							</p>
						</div>
					)}
				</DetailSection>
			</div>

			{receiptToView && (
				<div
					className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4"
					role="dialog"
					aria-modal="true"
					aria-label={receiptToView.fileName}
					onClick={(event) => {
						if (event.target === event.currentTarget) setReceiptToView(null);
					}}
				>
					<div className="relative flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl">
						<div className="flex items-center justify-between gap-4 border-b px-4 py-3">
							<p className="truncate text-sm font-semibold text-gray-900">{receiptToView.fileName}</p>
							<div className="flex shrink-0 items-center gap-2">
								<a href={getReceiptDeliveryUrl(receiptToView.url, receiptToView.fileName)} target="_blank" rel="noopener noreferrer" download={receiptToView.fileName} className="inline-flex items-center gap-1 rounded-lg border px-3 py-2 text-sm text-gray-700">
									<Download size={16} /> Download
								</a>
								<button type="button" onClick={() => setReceiptToView(null)} aria-label="Close receipt viewer" className="rounded-lg p-2 text-gray-600 hover:bg-gray-100">
									<X size={20} />
								</button>
							</div>
						</div>
						<div className="flex min-h-0 flex-1 items-center justify-center overflow-auto bg-gray-100 p-3">
							{isPdfReceipt(receiptToView.url, receiptToView.fileName) ? (
								<a
									href={getReceiptDeliveryUrl(receiptToView.url, receiptToView.fileName)}
									target="_blank"
									rel="noopener noreferrer"
									className="rounded-lg px-5 py-3 text-sm font-medium text-white"
									style={{ backgroundColor: "var(--color-primary)" }}
								>
									Download / Open PDF Receipt
								</a>
							) : (
								// eslint-disable-next-line @next/next/no-img-element
								<img src={receiptToView.url} alt={receiptToView.fileName} className="max-h-[78vh] max-w-full object-contain" />
							)}
						</div>
					</div>
				</div>
			)}
		</AdminLayout>
	);
};

export default withAdminAuth(AdminOrderDetail);
