import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
	DollarSign,
	ShoppingCart,
	Users,
	TrendingUp,
	Package,
	Clock,
	Star,
	MessageCircle,
} from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";

import withAdminAuth from "@/_components/withAdminAuth";
import AdminLayout from "@/_components/AdminLayout";
import PageLoader from "@/_UI/PageLoader";
import Badge from "@/_UI/Badge";
import { MetricCard, type MetricColor } from "@/_components/MetricCard";
import { ChartCard } from "@/_components/charts/chart-card";
import { TrendAreaChart } from "@/_components/charts/trend-area-chart";
import { BreakdownDonut } from "@/_components/charts/breakdown-donut";
import { TREND, statusColor } from "@/_components/charts/chart-colors";
import { DataTable } from "@/_components/DataTable";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useAppDispatch } from "@/_redux/store";
import { analyticsAction } from "@/_redux/actions/analytics.action";
import { formatCurrency, formatCurrencyFull, toDayBucket } from "@/_utils/format";

// Re-skin of the previous 657-line dashboard.tsx onto the ogaryde-ported chart
// system (ChartCard/TrendAreaChart/BreakdownDonut/MetricCard/DataTable). Every
// metric the old page showed is still here — see task-8-report.md for the
// before/after inventory. Datasets the old page also showed that aren't a
// "top of dashboard" concern (topSellingItems, lowStockItems, paymentStatusDistribution,
// customerGrowth, revenueByCategory, ratingDistribution, revenueByDayOfWeek,
// orderVolumeTrend, orderHourlyDistribution, stockLevels, itemsPerOrderDistribution,
// stockMovementTrend) moved to the new /admin/analytics page.

const TRENDING_DAYS = 30;

function statusBadgeVariant(status: string): "success" | "warning" | "error" | "info" | "neutral" {
	switch (status?.toUpperCase()) {
		case "PENDING":
			return "warning";
		case "PROCESSING":
		case "SHIPPED":
			return "info";
		case "DELIVERED":
		case "COMPLETED":
			return "success";
		case "CANCELLED":
		case "FAILED":
			return "error";
		default:
			return "neutral";
	}
}

interface RecentOrder {
	id: string;
	orderReference: string;
	orderStatus: string;
	totalAmount: number;
	customerName: string;
	itemCount: number;
	createdAt: string;
}

interface RecentCustomer {
	id: string;
	firstName?: string;
	lastName?: string;
	email?: string;
	createdAt: string;
}

const orderColumns: ColumnDef<RecentOrder, any>[] = [
	{
		accessorKey: "orderReference",
		header: "ORDER REF",
		cell: ({ getValue }) => <span className="font-medium">#{String(getValue())}</span>,
	},
	{ accessorKey: "customerName", header: "CUSTOMER" },
	{
		accessorKey: "totalAmount",
		header: "AMOUNT",
		cell: ({ getValue }) => <span className="font-semibold tabular-nums">{formatCurrencyFull(Number(getValue()))}</span>,
	},
	{
		accessorKey: "orderStatus",
		header: "STATUS",
		cell: ({ getValue }) => (
			<Badge variant={statusBadgeVariant(String(getValue()))} dot>
				{String(getValue())}
			</Badge>
		),
	},
	{
		accessorKey: "createdAt",
		header: "DATE",
		cell: ({ getValue }) => <span className="text-muted-foreground">{new Date(String(getValue())).toLocaleDateString()}</span>,
	},
];

const customerColumns: ColumnDef<RecentCustomer, any>[] = [
	{
		id: "customer",
		accessorKey: "firstName",
		header: "CUSTOMER",
		enableSorting: false,
		cell: ({ row }) => (
			<div>
				<div className="font-medium">
					{row.original.firstName} {row.original.lastName}
				</div>
				<div className="text-muted-foreground text-xs">{row.original.email}</div>
			</div>
		),
	},
	{
		accessorKey: "createdAt",
		header: "JOINED",
		cell: ({ getValue }) => <span className="text-muted-foreground">{new Date(String(getValue())).toLocaleDateString()}</span>,
	},
];

const AdminDashboard: React.FC = () => {
	const dispatch = useAppDispatch();
	const [analytics, setAnalytics] = useState<any>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		dispatch(analyticsAction.fetchDashboardAnalytics())
			.unwrap()
			.then((res: any) => {
				setAnalytics(res?.data);
				setLoading(false);
			})
			.catch(() => setLoading(false));
	}, [dispatch]);

	const overview = analytics?.overview;

	// Every field the old dashboard's primary + secondary stat rows displayed,
	// carried over 1:1 (see the module comment above for what moved to analytics.tsx).
	const metrics = useMemo(
		() => [
			{ id: "revenue", label: "Total Revenue", icon: DollarSign, color: "brand" as MetricColor, value: overview ? formatCurrency(overview.totalRevenue) : undefined },
			{ id: "orders", label: "Total Orders", icon: ShoppingCart, color: "info" as MetricColor, value: overview?.totalOrders },
			{ id: "customers", label: "Total Customers", icon: Users, color: "success" as MetricColor, value: overview?.totalCustomers },
			{ id: "aov", label: "Avg Order Value", icon: TrendingUp, color: "brand" as MetricColor, value: overview ? formatCurrency(overview.averageOrderValue) : undefined },
			{ id: "products", label: "Total Products", icon: Package, color: "info" as MetricColor, value: overview?.totalItems },
			{ id: "orders-today", label: "Orders Today", icon: Clock, color: "warning" as MetricColor, value: overview?.ordersToday },
			{ id: "rating", label: "Avg Rating", icon: Star, color: "warning" as MetricColor, value: overview ? `${Number(overview.averageRating).toFixed(1)}/5` : undefined },
			{ id: "reviews", label: "Total Reviews", icon: MessageCircle, color: "info" as MetricColor, value: overview?.totalReviews },
		],
		[overview],
	);

	const revenueTrendData = useMemo(
		() => (analytics?.revenueTrend ?? []).map((r: any) => ({ bucket: toDayBucket(r.date), value: r.revenue })),
		[analytics],
	);

	const orderStatusData = useMemo(
		() => (analytics?.orderStatusDistribution ?? []).map((s: any) => ({ label: s.status, count: s.count })),
		[analytics],
	);

	if (loading) {
		return (
			<AdminLayout>
				<PageLoader fullScreen={false} message="Loading dashboard..." />
			</AdminLayout>
		);
	}

	return (
		<AdminLayout>
			<div className="space-y-6">
				<div>
					<h2 className="text-xl font-semibold tracking-tight">Dashboard</h2>
					<p className="text-muted-foreground mt-1 text-sm">Store performance at a glance.</p>
				</div>

				<div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
					{metrics.map((m) => (
						<MetricCard key={m.id} label={m.label} icon={m.icon} color={m.color} value={m.value} testId={`kpi-${m.id}`} />
					))}
				</div>

				<div className="grid gap-4 lg:grid-cols-3">
					<ChartCard
						title="Revenue Trend"
						subtitle="Daily revenue, last 30 days"
						className="lg:col-span-2"
						isEmpty={(analytics?.revenueTrend?.length ?? 0) === 0}
						emptyMessage="No revenue in the last 30 days."
					>
						<TrendAreaChart data={revenueTrendData} color={TREND.revenue} name="Revenue" days={TRENDING_DAYS} formatValue={formatCurrency} />
					</ChartCard>
					<ChartCard title="Order Status" subtitle="Distribution breakdown" isEmpty={orderStatusData.length === 0} emptyMessage="No orders yet.">
						<BreakdownDonut data={orderStatusData} colorFor={statusColor} />
					</ChartCard>
				</div>

				<Card>
					<CardHeader className="flex-row items-center justify-between space-y-0">
						<CardTitle>Recent Orders</CardTitle>
						<Link href="/admin/orders" className="text-muted-foreground hover:text-foreground text-xs font-medium">
							View All
						</Link>
					</CardHeader>
					<CardContent>
						<DataTable
							columns={orderColumns}
							data={analytics?.recentOrders ?? []}
							manualPagination={false}
							showSN={false}
							emptyMessage="No orders yet"
							testId="recent-orders-table"
						/>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex-row items-center justify-between space-y-0">
						<CardTitle>Recent Customers</CardTitle>
						<Link href="/admin/customers" className="text-muted-foreground hover:text-foreground text-xs font-medium">
							View All
						</Link>
					</CardHeader>
					<CardContent>
						<DataTable
							columns={customerColumns}
							data={analytics?.recentCustomers ?? []}
							manualPagination={false}
							showSN={false}
							emptyMessage="No customers yet"
							testId="recent-customers-table"
						/>
					</CardContent>
				</Card>
			</div>
		</AdminLayout>
	);
};

export default withAdminAuth(AdminDashboard);
