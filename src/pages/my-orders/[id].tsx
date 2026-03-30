import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";

import Layout from "@/_components/Layout";
import { useAppDispatch, useAppSelector } from "@/_redux/store";
import { orderAction } from "@/_redux/actions/order.action";
import { BackButton, DetailHeader, DetailSection } from "@/_UI/DetailField";
import Badge from "@/_UI/Badge";
import { DataTable, Column } from "@/_UI/DataTable";
import { formatCurrency } from "@/_UI/FormatValue";
import PageLoader from "@/_UI/PageLoader";
import OrderTimeline from "@/_UI/OrderTimeline";
import AuthPrompt from "@/_UI/AuthPrompt";
import { BackendOrder, BackendOrderItem } from "@/types";
import { appConstants } from "@/_redux/constants";

const getStatusVariant = (status: string): "success" | "warning" | "error" | "info" | "neutral" => {
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
		case "REFUNDED":
			return "error";
		default:
			return "neutral";
	}
};

const MyOrderDetail: React.FC = () => {
	const router = useRouter();
	const dispatch = useAppDispatch();
	const { isAuthenticated, user } = useAppSelector((state) => state.auth);
	const isAdmin = appConstants.ADMIN_ROLES.includes(user?.profileType?.toUpperCase() as any || "");

	const [order, setOrder] = useState<BackendOrder | null>(null);
	const [loading, setLoading] = useState(true);
	const [showAuthPrompt, setShowAuthPrompt] = useState(false);

	useEffect(() => {
		if (!isAuthenticated) {
			setShowAuthPrompt(true);
			return;
		}
		if (isAdmin) {
			router.replace("/");
			return;
		}
	}, [isAuthenticated, isAdmin, router]);

	useEffect(() => {
		if (!router.isReady || !router.query.id) return;
		if (!isAuthenticated || isAdmin) return;

		const orderId = Number(router.query.id);
		if (isNaN(orderId)) return;

		setLoading(true);
		dispatch(orderAction.fetchMyOrderDetailAsync(orderId))
			.unwrap()
			.then((res: any) => {
				setOrder(res?.data ?? res);
			})
			.catch(() => {
				setOrder(null);
			})
			.finally(() => {
				setLoading(false);
			});
	}, [router.isReady, router.query.id, isAuthenticated, isAdmin, dispatch]);

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
			header: "Qty",
			align: "center",
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

	if (!isAuthenticated || isAdmin) {
		return (
			<Layout>
				<AuthPrompt
					isOpen={showAuthPrompt}
					onClose={() => router.push("/products")}
					redirectTo={`/my-orders/${router.query.id}`}
					title="Sign in to view order details"
					message="Log in to see your order details and tracking information."
				/>
				{!showAuthPrompt && <PageLoader message="Redirecting..." />}
			</Layout>
		);
	}

	if (loading) {
		return (
			<Layout>
				<PageLoader fullScreen={false} message="Loading order details..." />
			</Layout>
		);
	}

	if (!order) {
		return (
			<Layout>
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
			</Layout>
		);
	}

	return (
		<Layout>
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
							{order.orderStatus}
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

				<OrderTimeline
					status={order.orderStatus}
					createdAt={order.createdAt}
				/>

				<DetailSection title="Order Items">
					<DataTable
						columns={itemColumns}
						data={order.items ?? []}
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
									{(order as any).shippingAddress}
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
			</div>
		</Layout>
	);
};

export default MyOrderDetail;
