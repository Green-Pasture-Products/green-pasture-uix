import RecordActivity from "@/_components/RecordActivity";
import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/router";
import withAdminAuth from "@/_components/withAdminAuth";
import AdminLayout from "@/_components/AdminLayout";
import { useAppDispatch, useAppSelector } from "@/_redux/store";
import { adminAction } from "@/_redux/actions/admin.action";
import { BackButton, DetailHeader, DetailSection, DetailRow } from "@/_UI/DetailField";
import Button from "@/_UI/Button";
import Link from "next/link";
import toast from "react-hot-toast";
import Badge from "@/_UI/Badge";
import { formatCurrency } from "@/_UI/FormatValue";
import { formatWeight } from "@/_utils/formatWeight";
import { ReceiptList } from "@/_components/ReceiptList";
import PageLoader from "@/_UI/PageLoader";
import OrderProgress from "@/_UI/OrderProgress";
import { BackendOrder } from "@/types";
import Can from "@/_components/Can";
import { Check, ExternalLink, RefreshCw, X } from "lucide-react";

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

const STATUS_LABEL: Record<string, string> = {
	PENDING: "Pending",
	PROCESSING: "Processing",
	IN_TRANSIT: "In transit",
	DELIVERED: "Delivered",
	CANCELLED: "Cancelled",
	REFUNDED: "Refunded",
	RETURNED: "Returned",
	EXCHANGED: "Exchanged",
};

/** What an order can move to next: the same rules the API enforces, so the admin is only offered moves that will succeed. */
const NEXT_STATUSES: Record<string, string[]> = {
	PENDING: ["PROCESSING", "CANCELLED"],
	PROCESSING: ["IN_TRANSIT", "CANCELLED", "REFUNDED"],
	IN_TRANSIT: ["DELIVERED", "REFUNDED", "RETURNED", "EXCHANGED"],
	DELIVERED: ["REFUNDED", "RETURNED", "EXCHANGED"],
};

const paymentVariant = (status: string): "success" | "warning" | "error" | "info" | "neutral" => {
	const s = status?.toUpperCase();
	if (s === "VERIFIED" || s === "PAID") return "success";
	if (s === "DECLINED" || s === "FAILED") return "error";
	if (s === "AWAITING_VERIFICATION" || s === "AWAITING_PAYMENT" || s === "INCOMPLETE_PAYMENT" || s === "PENDING") return "warning";
	return "neutral";
};

const money = (amount: number | undefined | null, currency = "NGN") =>
	new Intl.NumberFormat("en-NG", { style: "currency", currency, maximumFractionDigits: 0 }).format(Number(amount ?? 0));

const AdminOrderDetail: React.FC = () => {
	const router = useRouter();
	const dispatch = useAppDispatch();
	const [order, setOrder] = useState<BackendOrder | null>(null);
	const [loading, setLoading] = useState(true);
	const [refreshing, setRefreshing] = useState(false);
	const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
	const [selectedStatus, setSelectedStatus] = useState<string>("");
	const [statusNote, setStatusNote] = useState<string>("");

	const loadOrder = useCallback(
		(silent = false) => {
			if (!router.isReady || !router.query.reference) return;
			const orderReference = router.query.reference as string;
			silent ? setRefreshing(true) : setLoading(true);
			dispatch(adminAction.fetchOrderDetailAsync(orderReference))
				.unwrap()
				.then((res: any) => setOrder(res?.data ?? res))
				.catch(() => setOrder(null))
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

	const handleStatusUpdate = async () => {
		if (!order || !selectedStatus || selectedStatus === order.orderStatus) return;
		setIsUpdatingStatus(true);
		try {
			const result = await dispatch(adminAction.updateOrderStatusAsync({ orderId: order.id, status: selectedStatus, note: statusNote || undefined })).unwrap();
			setOrder(result?.data ?? result);
			setStatusNote("");
			setSelectedStatus("");
			toast.success(`Order marked ${STATUS_LABEL[selectedStatus] ?? selectedStatus}`);
		} catch (error: any) {
			toast.error(typeof error === "string" ? error : "Failed to update the order status");
		} finally {
			setIsUpdatingStatus(false);
		}
	};

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
				<div className="mx-auto w-full max-w-6xl space-y-5">
					<BackButton />
					<p className="py-12 text-center text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
						Order not found
					</p>
				</div>
			</AdminLayout>
		);
	}

	const profile = order.customer?.profile;
	const customerName = [profile?.firstName, profile?.lastName].filter(Boolean).join(" ");
	const items = order.items ?? [];
	const itemsTotal = items.reduce((sum, i) => sum + Number(i.quantity) * Number(i.unitPrice), 0);
	const subtotal = order.subtotal ?? itemsTotal;
	const payments = order.payments ?? [];
	const nextStatuses = NEXT_STATUSES[order.orderStatus?.toUpperCase()] ?? [];
	const address = order.shippingAddress;
	const addressText =
		typeof address === "string" ? address : address ? [address.street, address.city, address.state, [address.country, address.postalCode].filter(Boolean).join(" ")].filter(Boolean).join(", ") : "";
	const paid = payments.find((p) => ["VERIFIED", "PAID"].includes(String(p.paymentStatus).toUpperCase()));
	const latestPayment = payments[0];
	const placed = new Date(order.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
	const placedLong = new Date(order.createdAt).toLocaleString("en-US", { year: "numeric", month: "long", day: "numeric", hour: "numeric", minute: "2-digit" });

	return (
		<AdminLayout>
			<div className="animate-page-enter mx-auto w-full max-w-6xl space-y-5">
				<BackButton />

				<DetailHeader
					title={`Order #${order.orderReference}`}
					subtitle={`${customerName || "Customer"} · ${placedLong}`}
					status={
						<>
							<Badge variant={getStatusVariant(order.orderStatus)} dot>
								{STATUS_LABEL[order.orderStatus] ?? order.orderStatus.replace(/_/g, " ")}
							</Badge>
							{latestPayment && (
								<Badge variant={paymentVariant(latestPayment.paymentStatus)}>{String(latestPayment.paymentStatus).replace(/_/g, " ")}</Badge>
							)}
						</>
					}
					actions={
						<Button variant="outlined" color="secondary" size="sm" onClick={() => loadOrder(true)} disabled={refreshing}>
							<RefreshCw size={14} className={refreshing ? "mr-1.5 animate-spin" : "mr-1.5"} />
							Refresh
						</Button>
					}
					metrics={[
						{ label: "Total", value: formatCurrency(order.totalAmount) },
						{ label: "Items", value: items.length },
						{ label: "Payment", value: paid ? "Paid" : payments.length ? "Not paid yet" : "No payment" },
						{ label: "Placed", value: placed },
					]}
				/>

				<DetailSection title="Progress" description="Where this order is on its way to the customer.">
					<div className="px-1 py-5">
						<OrderProgress status={order.orderStatus} />
					</div>
				</DetailSection>

				<div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
					<div className="min-w-0 space-y-5">
						<DetailSection title="Order items">
							{items.length > 0 ? (
								<div className="overflow-x-auto py-2">
									<table className="w-full text-sm">
										<thead>
											<tr className="text-left" style={{ color: "var(--text-hint)" }}>
												<th className="py-2 font-medium">Item</th>
												<th className="py-2 text-right font-medium">Qty</th>
												<th className="py-2 text-right font-medium">Unit price</th>
												<th className="py-2 text-right font-medium">Subtotal</th>
											</tr>
										</thead>
										<tbody>
											{items.map((line) => {
												const name = line.itemName ?? line.item?.name ?? "—";
												const size = formatWeight(line.weightValue ?? line.item?.weightValue, line.weightUnit ?? line.item?.weightUnit);
												return (
													<tr key={line.id} className="border-t" style={{ borderColor: "var(--border-light)" }}>
														<td className="py-2.5">
															<span className="font-medium whitespace-nowrap" style={{ color: "var(--text-primary)" }}>
																{name}
															</span>
															{size && (
																<div className="text-xs" style={{ color: "var(--text-hint)" }}>
																	{size}
																</div>
															)}
														</td>
														<td className="py-2.5 text-right tabular-nums">{line.quantity}</td>
														<td className="py-2.5 text-right tabular-nums">{formatCurrency(line.unitPrice)}</td>
														<td className="py-2.5 text-right font-medium tabular-nums">{formatCurrency(line.quantity * line.unitPrice)}</td>
													</tr>
												);
											})}
										</tbody>
										<tfoot>
											{[
												["Subtotal", subtotal, false],
												["Shipping", order.shippingFee, false],
												["Tax", order.taxAmount, false],
												[order.couponCode ? `Discount (${order.couponCode})` : "Discount", order.discountAmount ? -Number(order.discountAmount) : 0, false],
											]
												.filter(([label, value]) => label === "Subtotal" || Number(value) !== 0)
												.map(([label, value]) => (
													<tr key={String(label)} className="border-t first:border-t" style={{ borderColor: "var(--border-light)" }}>
														<td colSpan={3} className="py-2 text-right" style={{ color: "var(--text-hint)" }}>
															{label}
														</td>
														<td className="py-2 text-right tabular-nums">{Number(value) < 0 ? `−${formatCurrency(Math.abs(Number(value)))}` : formatCurrency(Number(value))}</td>
													</tr>
												))}
											<tr className="border-t" style={{ borderColor: "var(--border-medium)" }}>
												<td colSpan={3} className="py-3 text-right font-semibold" style={{ color: "var(--text-primary)" }}>
													Total
												</td>
												<td className="py-3 text-right text-base font-semibold tabular-nums">{formatCurrency(order.totalAmount)}</td>
											</tr>
										</tfoot>
									</table>
								</div>
							) : (
								<p className="py-4 text-sm" style={{ color: "var(--text-hint)" }}>
									No items in this order.
								</p>
							)}
						</DetailSection>

						<DetailSection title="Payments" description="Every payment attempt on this order.">
							{payments.length > 0 ? (
								<div className="divide-y" style={{ borderColor: "var(--border-light)" }}>
									{payments.map((payment) => (
										<div key={payment.id} className="space-y-3 py-4">
											<div className="flex flex-wrap items-center justify-between gap-3">
												<div className="flex min-w-0 items-center gap-2.5">
													<span className="text-sm font-semibold whitespace-nowrap" style={{ color: "var(--text-primary)" }}>
														{payment.paymentMethod === "MANUAL_TRANSFER" ? "Bank transfer" : "Paystack"}
													</span>
													<Badge variant={paymentVariant(payment.paymentStatus)} dot>
														{String(payment.paymentStatus).replace(/_/g, " ")}
													</Badge>
												</div>
												<div className="flex items-center gap-4">
													<span className="text-sm font-semibold tabular-nums">{money(payment.amount, payment.currency || "NGN")}</span>
													<Link href={`/admin/payments/${payment.id}`} className="inline-flex items-center gap-1 text-xs font-medium whitespace-nowrap" style={{ color: "var(--color-primary)" }}>
														Open payment <ExternalLink size={12} />
													</Link>
												</div>
											</div>
											<p className="text-xs" style={{ color: "var(--text-hint)" }}>
												Created {new Date(payment.createdAt).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" })}
											</p>
											{payment.receiptUrl || payment.receipts?.length ? (
												<ReceiptList receipts={payment.receipts} legacyUrl={payment.receiptUrl} legacyFileName={payment.receiptFileName} />
											) : payment.paymentMethod === "MANUAL_TRANSFER" ? (
												<p className="text-xs" style={{ color: "var(--text-hint)" }}>
													No receipt uploaded yet.
												</p>
											) : null}
											{payment.verifiedAt && (
												<p className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium" style={{ backgroundColor: "rgba(34,197,94,0.1)", borderLeft: "3px solid rgb(34,197,94)", color: "var(--text-primary)" }}>
													<Check size={14} className="shrink-0" />
													<span className="min-w-0 truncate" title={`Verified ${new Date(payment.verifiedAt).toLocaleDateString()} ${payment.verifiedBy ? `by ${payment.verifiedBy}` : ""}`}>
														Verified {new Date(payment.verifiedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })} {payment.verifiedBy && `by ${payment.verifiedBy}`}
													</span>
												</p>
											)}
											{payment.declinedAt && (
												<div className="rounded-lg px-3 py-2 text-xs" style={{ backgroundColor: "rgba(239,68,68,0.1)", borderLeft: "3px solid rgb(239,68,68)", color: "var(--text-primary)" }}>
													<p className="flex items-center gap-2 font-medium">
														<X size={14} className="shrink-0" />
														<span className="min-w-0 truncate">
															Declined {new Date(payment.declinedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })} {payment.declinedBy && `by ${payment.declinedBy}`}
														</span>
													</p>
													{payment.adminNote && (
														<p className="mt-1" style={{ color: "var(--text-secondary)" }}>
															Note: {payment.adminNote}
														</p>
													)}
												</div>
											)}
										</div>
									))}
								</div>
							) : (
								<p className="py-4 text-sm" style={{ color: "var(--text-hint)" }}>
									No payment has been recorded for this order yet.
								</p>
							)}
						</DetailSection>
					</div>

					<div className="min-w-0 space-y-5 lg:sticky lg:top-4">
						<Can privilege="MANAGE_ORDERS">
							<DetailSection title="Update status" description={nextStatuses.length ? "Move the order to its next step." : undefined}>
								{nextStatuses.length > 0 ? (
									<div className="space-y-4 py-4">
										<div className="flex flex-wrap gap-2" role="radiogroup" aria-label="New order status">
											{nextStatuses.map((status) => {
												const selected = selectedStatus === status;
												const destructive = ["CANCELLED", "REFUNDED", "RETURNED"].includes(status);
												return (
													<button
														key={status}
														type="button"
														role="radio"
														aria-checked={selected}
														disabled={isUpdatingStatus}
														onClick={() => setSelectedStatus(selected ? "" : status)}
														className="cursor-pointer rounded-full border px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors disabled:opacity-50"
														style={{
															borderColor: selected ? (destructive ? "#ef4444" : "var(--color-primary)") : "var(--border-light)",
															background: selected ? (destructive ? "rgba(239,68,68,0.1)" : "rgba(22,163,74,0.1)") : "transparent",
															color: selected ? (destructive ? "#ef4444" : "var(--color-primary)") : "var(--text-secondary)",
														}}
													>
														{STATUS_LABEL[status]}
													</button>
												);
											})}
										</div>
										<div>
											<label htmlFor="statusNote" className="mb-1.5 block text-xs font-medium" style={{ color: "var(--text-hint)" }}>
												Note (optional)
											</label>
											<textarea
												id="statusNote"
												value={statusNote}
												onChange={(e) => setStatusNote(e.target.value)}
												disabled={isUpdatingStatus}
												placeholder="Add a note for this status change..."
												className="w-full resize-none rounded-lg border px-3 py-2 text-sm"
												rows={3}
												style={{ borderColor: "var(--border-light)", backgroundColor: "var(--surface-low)", color: "var(--text-primary)" }}
											/>
										</div>
										<Button fullWidth size="md" onClick={handleStatusUpdate} disabled={!selectedStatus} loading={isUpdatingStatus} color={["CANCELLED", "REFUNDED", "RETURNED"].includes(selectedStatus) ? "error" : "primary"}>
											{selectedStatus ? `Mark as ${STATUS_LABEL[selectedStatus]}` : "Choose a status"}
										</Button>
									</div>
								) : (
									<p className="py-4 text-sm" style={{ color: "var(--text-hint)" }}>
										This order is {STATUS_LABEL[order.orderStatus]?.toLowerCase() ?? "closed"}, so its status can no longer be changed.
									</p>
								)}
							</DetailSection>
						</Can>

						<DetailSection title="Customer">
							<DetailRow label="Name" value={customerName} />
							<DetailRow label="Email" value={profile?.email} />
							<DetailRow label="Phone" value={profile?.phoneNumber || latestPayment?.customerPhone} />
						</DetailSection>

						<DetailSection title="Delivery">
							<DetailRow label="Method" value={order.shippingMethod ?? undefined} />
							<DetailRow label="Address" value={addressText || undefined} wide />
						</DetailSection>
					</div>
				</div>
			</div>

			<RecordActivity type="Order" id={order?.id} created={{ at: (order as any)?.createdAt, by: (order as any)?.createdBy }} />
		</AdminLayout>
	);
};

export default withAdminAuth(AdminOrderDetail);
