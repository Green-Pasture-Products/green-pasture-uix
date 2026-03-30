import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";

import Layout from "@/_components/Layout";
import toast from "react-hot-toast";
import { useAppDispatch, useAppSelector } from "@/_redux/store";
import { orderAction } from "@/_redux/actions/order.action";
import { addToCart } from "@/_redux/reducers/cart.reducer";
import { DataTable, Column } from "@/_UI/DataTable";
import ActionMenu from "@/_UI/ActionMenu";
import Badge from "@/_UI/Badge";
import PageLoader from "@/_UI/PageLoader";
import EmptyState from "@/_UI/EmptyState";
import AuthPrompt from "@/_UI/AuthPrompt";
import { formatCurrency } from "@/_UI/FormatValue";
import { BackendOrder } from "@/types";
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

const MyOrders: React.FC = () => {
	const router = useRouter();
	const dispatch = useAppDispatch();
	const { isAuthenticated, user } = useAppSelector((state) => state.auth);
	const isAdmin = appConstants.ADMIN_ROLES.includes(user?.profileType?.toUpperCase() as any || "");

	const [orders, setOrders] = useState<BackendOrder[]>([]);
	const [loading, setLoading] = useState(true);
	const [page, setPage] = useState(1);
	const [meta, setMeta] = useState<any>(null);
	const [search, setSearch] = useState("");
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

	const fetchOrders = useCallback(
		(currentPage: number) => {
			setLoading(true);
			setOrders([]);
			dispatch(orderAction.fetchMyOrdersAsync({ page: currentPage, limit: 10 }))
				.unwrap()
				.then((res: any) => {
					const data = res?.data ?? res;
					setOrders(data?.items ?? []);
					setMeta(data?.meta ?? null);
				})
				.catch(() => {
					setOrders([]);
					setMeta(null);
				})
				.finally(() => {
					setLoading(false);
				});
		},
		[dispatch]
	);

	useEffect(() => {
		if (isAuthenticated && !isAdmin) {
			fetchOrders(page);
		}
	}, [page, isAuthenticated, isAdmin, fetchOrders]);

	const filteredOrders = search
		? orders.filter((o) => o.orderReference?.toLowerCase().includes(search.toLowerCase()))
		: orders;

	const columns: Column<BackendOrder>[] = [
		{
			key: "orderReference",
			header: "Order Ref",
			width: "180px",
			render: (value: any) => (
				<span className="text-sm font-medium whitespace-nowrap" style={{ color: "var(--text-primary)" }}>
					#{value}
				</span>
			),
		},
		{
			key: "createdAt",
			header: "Date",
			render: (value: any) => (
				<span className="text-sm" style={{ color: "var(--text-secondary)" }}>
					{new Date(value).toLocaleDateString("en-US", {
						month: "short",
						day: "numeric",
						year: "numeric",
					})}
				</span>
			),
		},
		{
			key: "items",
			header: "Items",
			align: "center",
			render: (value: any) => (
				<span className="text-sm" style={{ color: "var(--text-primary)" }}>
					{value?.length ?? 0}
				</span>
			),
		},
		{
			key: "totalAmount",
			header: "Total",
			render: (value: any) => (
				<span className="text-sm font-semibold tabular-nums" style={{ color: "var(--text-primary)" }}>
					{formatCurrency(value)}
				</span>
			),
		},
		{
			key: "orderStatus",
			header: "Status",
			render: (value: any) => (
				<Badge variant={getStatusVariant(value)} dot size="sm">
					{value}
				</Badge>
			),
		},
		{
			key: "actions",
			header: "",
			align: "right",
			render: (_value: any, row: BackendOrder) => (
				<ActionMenu
					items={[
						{
							label: "View Details",
							onClick: () => router.push(`/my-orders/${row.id}`),
						},
						{
							label: "Buy Again",
							onClick: () => {
								// Add all items from this order back to cart
								const items = row.items ?? [];
								if (items.length > 0) {
									items.forEach((orderItem: any) => {
										const item = orderItem.item || orderItem;
										if (item) {
											dispatch(addToCart({
												id: String(item.id),
												name: item.name || "",
												price: Number(orderItem.unitPrice || item.price || 0),
												image: item.photos?.[0]?.url || "",
												category: "",
												description: item.description || "",
												quantity: 1,
												inStock: true,
												rating: 0,
												reviews: 0,
											} as any));
										}
									});
									toast.success("Items added to cart!");
									router.push("/cart");
								}
							},
						},
					]}
				/>
			),
		},
	];

	if (!isAuthenticated || isAdmin) {
		return (
			<Layout>
				<AuthPrompt
					isOpen={showAuthPrompt}
					onClose={() => router.push("/products")}
					redirectTo="/my-orders"
					title="Sign in to view orders"
					message="Log in to view your order history and track deliveries."
				/>
				{!showAuthPrompt && <PageLoader message="Redirecting..." />}
			</Layout>
		);
	}

	if (loading && orders.length === 0) {
		return (
			<Layout>
				<PageLoader fullScreen={false} message="Loading your orders..." />
			</Layout>
		);
	}

	return (
		<Layout>
			<div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-page-enter">
				<div className="mb-6">
					<h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
						My Orders
					</h1>
					<p className="text-sm mt-1" style={{ color: "var(--text-hint)" }}>
						Track and manage your order history
					</p>
				</div>

				{orders.length === 0 && !loading ? (
					<EmptyState
						icon={ShoppingBag}
						title="No orders yet"
						description="Start shopping to see your orders here!"
						actionLabel="Browse Products"
						actionHref="/products"
					/>
				) : (
					<DataTable
						columns={columns}
						data={filteredOrders}
						isLoading={loading}
						onSearch={setSearch}
						searchPlaceholder="Search by order reference..."
						pagination={
							meta
								? {
										currentPage: meta.currentPage ?? page,
										totalItems: meta.totalItems ?? 0,
										itemsPerPage: meta.itemsPerPage ?? 10,
										totalPages: meta.totalPages ?? 1,
									}
								: undefined
						}
						onPageChange={(newPage) => setPage(newPage)}
						emptyMessage="No orders found"
						emptyDescription="Try adjusting your search"
					/>
				)}
			</div>
		</Layout>
	);
};

export default MyOrders;
