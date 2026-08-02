import React, { useEffect, useMemo, useState } from "react";
import withAdminAuth from "@/_components/withAdminAuth";
import {
	Package,
	ShoppingCart,
	Users,
	DollarSign,
	AlertTriangle,
	TrendingUp,
	Star,
	ArrowUpRight,
	Clock,
	Eye,
	Boxes,
} from "lucide-react";
import {
	AreaChart,
	Area,
	BarChart,
	Bar,
	LineChart,
	Line,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
	PieChart,
	Pie,
	Cell,
	Legend,
	RadarChart,
	PolarGrid,
	PolarAngleAxis,
	PolarRadiusAxis,
	Radar,
} from "recharts";
import Link from "next/link";

import AdminLayout from "@/_components/AdminLayout";
import PageLoader from "@/_UI/PageLoader";
import { useAppDispatch } from "@/_redux/store";
import { analyticsAction } from "@/_redux/actions/analytics.action";
import { DataTable } from "@/_components/DataTable";
import type { ColumnDef } from "@tanstack/react-table";
import Badge from "@/_UI/Badge";

// ── Style Constants (EGFM pattern) ──
const CARD =
	"rounded-xl bg-[#ffffff] dark:bg-white/[0.04] border border-[rgba(22,163,74,0.06)] dark:border-white/8 shadow-sm dark:shadow-none transition-all duration-300";
const PANEL =
	"rounded-xl border border-[rgba(22,163,74,0.06)] dark:border-white/8 shadow-sm dark:shadow-none bg-white dark:bg-white/[0.04] chart-panel transition-all duration-300";
const VIEW_ALL =
	"rounded-lg px-2.5 py-1 border border-[#E4E5E7] dark:border-white/10 text-[#848A95] dark:text-white/50 text-xs font-medium hover:bg-gray-50 dark:hover:bg-white/5 transition-colors press-effect";

const STATUS_COLORS: Record<string, string> = {
	PENDING: "#f59e0b",
	PROCESSING: "#3b82f6",
	COMPLETED: "#10b981",
	DELIVERED: "#22c55e",
	CANCELLED: "#ef4444",
	FAILED: "#dc2626",
	REFUNDED: "#8b5cf6",
	ON_HOLD: "#6b7280",
};

const PIE_COLORS = ["#16a34a", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#6b7280", "#14b8a6"];

const getStatusBadgeVariant = (status: string): "success" | "warning" | "error" | "info" | "neutral" => {
	switch (status?.toUpperCase()) {
		case "PENDING": return "warning";
		case "PROCESSING": case "SHIPPED": return "info";
		case "DELIVERED": case "COMPLETED": return "success";
		case "CANCELLED": case "FAILED": return "error";
		default: return "neutral";
	}
};

const formatCurrency = (value: number) => {
	if (value >= 1000000) return `₦${(value / 1000000).toFixed(1)}M`;
	if (value >= 1000) return `₦${(value / 1000).toFixed(1)}K`;
	return `₦${value.toLocaleString()}`;
};

// ── Animated Number ──
const AnimatedNumber: React.FC<{ value: number; delay?: number; prefix?: string }> = ({ value, delay = 0, prefix = "" }) => {
	const [display, setDisplay] = useState(0);
	useEffect(() => {
		const timer = setTimeout(() => {
			let start = 0;
			const duration = 800;
			const step = (ts: number) => {
				if (!start) start = ts;
				const progress = Math.min((ts - start) / duration, 1);
				const eased = 1 - Math.pow(1 - progress, 3);
				setDisplay(Math.round(eased * value));
				if (progress < 1) requestAnimationFrame(step);
			};
			requestAnimationFrame(step);
		}, delay);
		return () => clearTimeout(timer);
	}, [value, delay]);
	return <>{prefix}{display.toLocaleString()}</>;
};

// ── Skeleton ──
const Skeleton: React.FC<{ className?: string }> = ({ className = "" }) => (
	<div className={`animate-pulse rounded-lg ${className}`} style={{ background: "var(--surface-medium)" }} />
);

const AdminDashboard: React.FC = () => {
	const dispatch = useAppDispatch();
	const [analytics, setAnalytics] = useState<any>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		dispatch(analyticsAction.fetchDashboardAnalytics())
			.unwrap()
			.then((res) => { setAnalytics(res?.data); setLoading(false); })
			.catch(() => setLoading(false));
	}, [dispatch]);

	const overview = analytics?.overview;

	// ── Primary Stats ──
	const primaryStats = useMemo(() => [
		{ id: 1, icon: <DollarSign className="w-5 h-5" />, label: "total revenue", value: overview?.totalRevenue ?? 0, isCurrency: true },
		{ id: 2, icon: <ShoppingCart className="w-5 h-5" />, label: "total orders", value: overview?.totalOrders ?? 0 },
		{ id: 3, icon: <Package className="w-5 h-5" />, label: "total products", value: overview?.totalItems ?? 0 },
		{ id: 4, icon: <Users className="w-5 h-5" />, label: "total customers", value: overview?.totalCustomers ?? 0 },
	], [overview]);

	// ── Secondary Stats ──
	const secondaryStats = useMemo(() => [
		{ id: 5, label: "avg order value", value: overview?.averageOrderValue ?? 0, color: "#16a34a", isCurrency: true },
		{ id: 6, label: "orders today", value: overview?.ordersToday ?? 0, color: "#3b82f6" },
		{ id: 7, label: "avg rating", value: overview?.averageRating ?? 0, color: "#f59e0b", isDecimal: true },
		{ id: 8, label: "total reviews", value: overview?.totalReviews ?? 0, color: "#8b5cf6" },
	], [overview]);

	// ── Table Columns ──
	const orderColumns: ColumnDef<any, any>[] = [
		{ accessorKey: "orderReference", header: "ORDER REF", cell: ({ getValue }) => <span className="font-medium" style={{ color: "var(--text-primary)" }}>#{String(getValue())}</span> },
		{ accessorKey: "customerName", header: "CUSTOMER" },
		{ accessorKey: "totalAmount", header: "AMOUNT", cell: ({ getValue }) => <span className="font-semibold tabular-nums" style={{ color: "var(--text-primary)" }}>₦{Number(getValue()).toLocaleString()}</span> },
		{ accessorKey: "orderStatus", header: "STATUS", cell: ({ getValue }) => <Badge variant={getStatusBadgeVariant(String(getValue()))} dot>{String(getValue())}</Badge> },
		{ accessorKey: "createdAt", header: "DATE", cell: ({ getValue }) => <span style={{ color: "var(--text-hint)" }}>{new Date(String(getValue())).toLocaleDateString()}</span> },
	];

	const customerColumns: ColumnDef<any, any>[] = [
		{
			id: "customer", accessorKey: "firstName", header: "CUSTOMER", enableSorting: false, cell: ({ row }) => (
				<div>
					<div className="font-medium" style={{ color: "var(--text-primary)" }}>{row.original.firstName} {row.original.lastName}</div>
					<div className="text-[0.7rem]" style={{ color: "var(--text-hint)" }}>{row.original.email}</div>
				</div>
			)
		},
		{ accessorKey: "createdAt", header: "JOINED", cell: ({ getValue }) => <span style={{ color: "var(--text-hint)" }}>{new Date(String(getValue())).toLocaleDateString()}</span> },
	];

	if (loading) {
		return (
			<AdminLayout>
				<PageLoader fullScreen={false} message="Loading dashboard..." />
			</AdminLayout>
		);
	}

	return (
		<AdminLayout>
			<div className="animate-page-enter">
				{/* ── Row 1: Primary Stat Cards ── */}
				<div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4 mb-4">
					{primaryStats.map((stat, index) => (
						<div
							key={stat.id}
							className={`animate-stat-pop hover-lift p-3 md:p-5 ${CARD}`}
							style={{ animationDelay: `${index * 0.08}s` }}
						>
							<div className="flex items-center mb-2 md:mb-4">
								<div className="p-2 rounded-lg" style={{ background: "rgba(22,163,74,0.08)" }}>
									<span style={{ color: "var(--color-primary)" }}>{stat.icon}</span>
								</div>
								<span className="uppercase text-[0.56rem] md:text-xs ml-3" style={{ color: "var(--text-secondary)" }}>
									{stat.label}
								</span>
							</div>
							<h2 className="text-md md:text-2xl font-semibold tabular-nums" style={{ color: "var(--text-primary)" }}>
								{stat.isCurrency ? (
									<AnimatedNumber value={stat.value} delay={index * 80 + 200} prefix="₦" />
								) : (
									<AnimatedNumber value={stat.value} delay={index * 80 + 200} />
								)}
							</h2>
						</div>
					))}
				</div>

				{/* ── Row 2: Secondary Stat Pills ── */}
				<div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4 mb-6">
					{secondaryStats.map((stat, index) => (
						<div
							key={stat.id}
							className={`animate-stat-pop hover-lift p-3 md:p-4 flex items-center justify-between ${CARD}`}
							style={{ animationDelay: `${0.32 + index * 0.06}s` }}
						>
							<span className="uppercase text-[0.56rem] md:text-xs" style={{ color: "var(--text-secondary)" }}>
								{stat.label}
							</span>
							<span className="text-lg md:text-xl font-bold tabular-nums" style={{ color: stat.color }}>
								{stat.isCurrency ? (
									formatCurrency(stat.value)
								) : stat.isDecimal ? (
									`${Number(stat.value).toFixed(1)}/5`
								) : (
									<AnimatedNumber value={Number(stat.value)} delay={320 + index * 60 + 200} />
								)}
							</span>
						</div>
					))}
				</div>

				{/* ── Row 3: Revenue Trend (full width, rich panel) ── */}
				<div className={`animate-chart-delay-1 ${PANEL} mb-4`}>
					{/* Header */}
					<div className="px-6 pt-5 pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
						<div>
							<h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Revenue Trend</h2>
							<p className="text-[0.65rem] mt-0.5" style={{ color: "var(--text-hint)" }}>Daily revenue &amp; order volume</p>
						</div>
						<span className="text-[0.65rem] font-medium px-2.5 py-1 rounded-full self-start" style={{ background: "rgba(22,163,74,0.1)", color: "#16a34a" }}>
							Last 30 days
						</span>
					</div>

					{/* Inline KPI row */}
					<div className="px-6 pt-4 pb-2 grid grid-cols-2 sm:grid-cols-4 gap-3">
						<div className="p-3 rounded-lg" style={{ background: "var(--surface-low)" }}>
							<span className="block text-[0.6rem] uppercase font-semibold tracking-wider mb-1" style={{ color: "var(--text-hint)" }}>Total Revenue</span>
							<span className="text-xl font-bold tabular-nums" style={{ color: "var(--text-primary)" }}>
								<AnimatedNumber value={overview?.totalRevenue ?? 0} delay={300} prefix="₦" />
							</span>
						</div>
						<div className="p-3 rounded-lg" style={{ background: "var(--surface-low)" }}>
							<span className="block text-[0.6rem] uppercase font-semibold tracking-wider mb-1" style={{ color: "var(--text-hint)" }}>Today</span>
							<span className="text-xl font-bold tabular-nums" style={{ color: "#16a34a" }}>
								<AnimatedNumber value={overview?.ordersToday ?? 0} delay={400} /> orders
							</span>
						</div>
						<div className="p-3 rounded-lg" style={{ background: "var(--surface-low)" }}>
							<span className="block text-[0.6rem] uppercase font-semibold tracking-wider mb-1" style={{ color: "var(--text-hint)" }}>Avg Value</span>
							<span className="text-xl font-bold tabular-nums" style={{ color: "#3b82f6" }}>
								{formatCurrency(overview?.averageOrderValue ?? 0)}
							</span>
						</div>
						<div className="p-3 rounded-lg" style={{ background: "var(--surface-low)" }}>
							<span className="block text-[0.6rem] uppercase font-semibold tracking-wider mb-1.5" style={{ color: "var(--text-hint)" }}>By Status</span>
							<div className="flex flex-wrap gap-1.5">
								{(analytics?.orderStatusDistribution ?? []).slice(0, 4).map((s: any) => (
									<span key={s.status} className="text-[0.55rem] font-semibold px-1.5 py-0.5 rounded-full" style={{ background: "var(--surface-medium)", color: "var(--text-secondary)" }}>
										{s.status} {s.count}
									</span>
								))}
							</div>
						</div>
					</div>

					{/* Chart */}
					<div className="px-6 pt-2 pb-5" style={{ height: 280 }}>
						{analytics?.revenueTrend?.length > 0 ? (
							<ResponsiveContainer width="100%" height="100%">
								<AreaChart data={analytics.revenueTrend}>
									<defs>
										<linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
											<stop offset="5%" stopColor="#16a34a" stopOpacity={0.15} />
											<stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
										</linearGradient>
									</defs>
									<CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
									<XAxis dataKey="date" tick={{ fontSize: 10, fill: "var(--text-hint)" }} tickFormatter={(v) => new Date(v).toLocaleDateString("en", { day: "numeric", month: "short" })} axisLine={{ stroke: "var(--border-light)" }} tickLine={false} />
									<YAxis tick={{ fontSize: 10, fill: "var(--text-hint)" }} tickFormatter={formatCurrency} axisLine={false} tickLine={false} width={60} />
									<Tooltip contentStyle={{ background: "var(--surface-paper)", border: "1px solid var(--border-light)", borderRadius: "8px", fontSize: "12px", boxShadow: "var(--shadow-md)" }} formatter={(v: any) => [`₦${Number(v).toLocaleString()}`, "Revenue"]} labelFormatter={(l) => new Date(l).toLocaleDateString("en", { weekday: "short", day: "numeric", month: "long" })} />
									<Area type="monotone" dataKey="revenue" stroke="#16a34a" strokeWidth={2} fill="url(#revenueGrad)" dot={false} activeDot={{ r: 4, stroke: "#16a34a", strokeWidth: 2, fill: "var(--surface-paper)" }} />
								</AreaChart>
							</ResponsiveContainer>
						) : (
							<div className="h-full flex items-center justify-center text-sm" style={{ color: "var(--text-disabled)" }}>No revenue data yet</div>
						)}
					</div>
				</div>

				{/* ── Row 4: Tables + Order Status + Top Products ── */}
				<div className="grid grid-cols-1 lg:grid-cols-10 gap-4 mb-4">
					{/* Recent Orders (7 cols) */}
					<div className="lg:col-span-7">
						<div className={`animate-card-delay-3 ${PANEL}`}>
							<div className="px-5 py-4 flex items-center justify-between">
								<h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Recent Orders</h2>
								<Link href="/admin/orders" className={VIEW_ALL}>View All</Link>
							</div>
							<DataTable columns={orderColumns} data={analytics?.recentOrders ?? []} manualPagination={false} emptyMessage="No orders yet" testId="recent-orders-table" />
						</div>
					</div>

					{/* Order Status Donut (3 cols) */}
					<div className="lg:col-span-3">
						<div className={`animate-chart-delay-3 p-5 ${PANEL}`}>
							<div className="mb-3">
								<h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Order Status</h2>
								<p className="text-[0.65rem] mt-0.5" style={{ color: "var(--text-hint)" }}>Distribution breakdown</p>
							</div>
							{analytics?.orderStatusDistribution?.length > 0 ? (
								<>
									<div style={{ height: 180 }}>
										<ResponsiveContainer width="100%" height="100%">
											<PieChart>
												<Pie data={analytics.orderStatusDistribution} cx="50%" cy="50%" innerRadius={45} outerRadius={72} dataKey="count" nameKey="status" strokeWidth={2} stroke="var(--surface-paper)">
													{analytics.orderStatusDistribution.map((e: any, i: number) => <Cell key={i} fill={STATUS_COLORS[e.status] || PIE_COLORS[i % PIE_COLORS.length]} />)}
												</Pie>
												<Tooltip contentStyle={{ background: "var(--surface-paper)", border: "1px solid var(--border-light)", borderRadius: "8px", fontSize: "11px" }} />
											</PieChart>
										</ResponsiveContainer>
									</div>
									<div className="mt-3 grid grid-cols-2 gap-2">
										{analytics.orderStatusDistribution.map((e: any, i: number) => (
											<div key={e.status} className="p-2 rounded-lg text-center" style={{ background: "var(--surface-low)" }}>
												<span className="block text-[0.6rem] uppercase font-medium mb-0.5" style={{ color: "var(--text-hint)" }}>{e.status?.toLowerCase()}</span>
												<span className="text-sm font-bold tabular-nums" style={{ color: STATUS_COLORS[e.status] || PIE_COLORS[i % PIE_COLORS.length] }}>
													<AnimatedNumber value={e.count} delay={600 + i * 60} />
												</span>
											</div>
										))}
									</div>
								</>
							) : (
								<div className="py-12 text-center text-sm" style={{ color: "var(--text-disabled)" }}>No orders yet</div>
							)}
						</div>
					</div>
				</div>

				{/* ── Row 5: Customer Growth + Top Selling + Alerts ── */}
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
					{/* Customer Growth */}
					<div className={`animate-chart-delay-2 ${PANEL} p-5`}>
						<div className="mb-4">
							<h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Customer Growth</h2>
							<p className="text-[0.65rem] mt-0.5" style={{ color: "var(--text-hint)" }}>6 month trend</p>
						</div>
						<div style={{ height: 200 }}>
							{analytics?.customerGrowth?.length > 0 ? (
								<ResponsiveContainer width="100%" height="100%">
									<BarChart data={analytics.customerGrowth}>
										<CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
										<XAxis dataKey="month" tick={{ fontSize: 10, fill: "var(--text-hint)" }} tickFormatter={(v) => { const [, m] = v.split("-"); return new Date(2024, Number(m) - 1).toLocaleDateString("en", { month: "short" }); }} axisLine={{ stroke: "var(--border-light)" }} tickLine={false} />
										<YAxis tick={{ fontSize: 10, fill: "var(--text-hint)" }} axisLine={false} tickLine={false} allowDecimals={false} />
										<Tooltip contentStyle={{ background: "var(--surface-paper)", border: "1px solid var(--border-light)", borderRadius: "8px", fontSize: "11px" }} formatter={(v: any) => [v, "Customers"]} />
										<Bar dataKey="count" fill="#16a34a" radius={[4, 4, 0, 0]} />
									</BarChart>
								</ResponsiveContainer>
							) : (
								<div className="h-full flex items-center justify-center text-sm" style={{ color: "var(--text-disabled)" }}>No data yet</div>
							)}
						</div>
					</div>

					{/* Top Selling Products */}
					<div className={`animate-chart-delay-3 ${PANEL} p-5`}>
						<div className="flex items-center justify-between mb-4">
							<div>
								<h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Top Products</h2>
								<p className="text-[0.65rem] mt-0.5" style={{ color: "var(--text-hint)" }}>By units sold</p>
							</div>
						</div>
						{analytics?.topSellingItems?.length > 0 ? (
							<div className="space-y-2">
								{analytics.topSellingItems.slice(0, 5).map((item: any, i: number) => (
									<div key={item.id} className="flex items-center gap-3 p-2 rounded-lg transition-colors hover-lift" style={{ animationDelay: `${i * 40}ms` }}>
										<div className="w-7 h-7 rounded-lg flex items-center justify-center text-[0.65rem] font-bold shrink-0" style={{ background: "rgba(22,163,74,0.08)", color: "var(--color-primary)" }}>
											{i + 1}
										</div>
										<div className="flex-1 min-w-0">
											<p className="text-[0.8rem] font-medium truncate" style={{ color: "var(--text-primary)" }}>{item.name}</p>
											<p className="text-[0.65rem]" style={{ color: "var(--text-hint)" }}>{item.product || "N/A"}</p>
										</div>
										<div className="text-right shrink-0">
											<p className="text-[0.8rem] font-bold tabular-nums" style={{ color: "var(--text-primary)" }}>{item.soldQuantity}</p>
											<p className="text-[0.6rem]" style={{ color: "var(--text-hint)" }}>₦{Number(item.price).toLocaleString()}</p>
										</div>
									</div>
								))}
							</div>
						) : (
							<div className="py-12 text-center text-sm" style={{ color: "var(--text-disabled)" }}>No sales data</div>
						)}
					</div>

					{/* Alerts Column */}
					<div className="space-y-4">
						{/* Low Stock */}
						<div className={`animate-card-delay-4 ${PANEL} p-5`}>
							<div className="flex items-center gap-2 mb-3">
								<div className="p-1.5 rounded-lg" style={{ background: "rgba(239,68,68,0.08)" }}>
									<AlertTriangle className="w-4 h-4 text-red-500" />
								</div>
								<h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Low Stock</h2>
								{analytics?.lowStockItems?.length > 0 && (
									<span className="ml-auto text-[0.6rem] font-bold px-1.5 py-0.5 rounded-full bg-red-500/10 text-red-500">
										{analytics.lowStockItems.length}
									</span>
								)}
							</div>
							{analytics?.lowStockItems?.length > 0 ? (
								<div className="space-y-2">
									{analytics.lowStockItems.slice(0, 4).map((item: any) => (
										<div key={item.id} className="flex items-center justify-between text-[0.8rem]">
											<span className="truncate mr-2" style={{ color: "var(--text-secondary)" }}>{item.name}</span>
											<Badge variant={item.availableQuantity === 0 ? "error" : "warning"} size="sm">
												{item.availableQuantity} left
											</Badge>
										</div>
									))}
								</div>
							) : (
								<p className="text-[0.8rem] py-4 text-center" style={{ color: "var(--text-disabled)" }}>All stocked up</p>
							)}
						</div>

						{/* Payment Status */}
						<div className={`animate-card-delay-5 ${PANEL} p-5`}>
							<div className="flex items-center gap-2 mb-3">
								<div className="p-1.5 rounded-lg" style={{ background: "rgba(22,163,74,0.08)" }}>
									<DollarSign className="w-4 h-4" style={{ color: "var(--color-primary)" }} />
								</div>
								<h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Payments</h2>
							</div>
							{analytics?.paymentStatusDistribution?.length > 0 ? (
								<div className="space-y-3">
									{analytics.paymentStatusDistribution.map((p: any) => {
										const total = analytics.paymentStatusDistribution.reduce((s: number, x: any) => s + x.count, 0);
										const pct = total > 0 ? Math.round((p.count / total) * 100) : 0;
										return (
											<div key={p.status}>
												<div className="flex justify-between items-center mb-1">
													<span className="text-[0.8rem]" style={{ color: "var(--text-secondary)" }}>{p.status}</span>
													<span className="text-[0.8rem] font-semibold tabular-nums" style={{ color: "var(--text-primary)" }}>{p.count} ({pct}%)</span>
												</div>
												<div className="w-full rounded-full h-1.5" style={{ background: "var(--surface-medium)" }}>
													<div className={`h-1.5 rounded-full transition-all duration-700 ${p.status === "PAID" ? "bg-green-500" : "bg-gray-400"}`} style={{ width: `${pct}%` }} />
												</div>
											</div>
										);
									})}
								</div>
							) : (
								<p className="text-[0.8rem] py-4 text-center" style={{ color: "var(--text-disabled)" }}>No transactions</p>
							)}
						</div>
					</div>
				</div>

				{/* ── Row 6: Revenue by Category + Rating Histogram + Day of Week ── */}
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
					{/* Revenue by Category */}
					<div className={`animate-chart-delay-2 ${PANEL} p-5`}>
						<div className="mb-4">
							<h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Revenue by Category</h2>
							<p className="text-[0.65rem] mt-0.5" style={{ color: "var(--text-hint)" }}>Product category performance</p>
						</div>
						<div style={{ height: 220 }}>
							{analytics?.revenueByCategory?.length > 0 ? (
								<ResponsiveContainer width="100%" height="100%">
									<BarChart data={analytics.revenueByCategory} layout="vertical">
										<CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" horizontal={false} />
										<XAxis type="number" tick={{ fontSize: 10, fill: "var(--text-hint)" }} tickFormatter={formatCurrency} axisLine={false} tickLine={false} />
										<YAxis type="category" dataKey="category" tick={{ fontSize: 10, fill: "var(--text-hint)" }} axisLine={false} tickLine={false} width={80} />
										<Tooltip contentStyle={{ background: "var(--surface-paper)", border: "1px solid var(--border-light)", borderRadius: "8px", fontSize: "11px" }} formatter={(v: any) => [`₦${Number(v).toLocaleString()}`, "Revenue"]} />
										<Bar dataKey="revenue" fill="#16a34a" radius={[0, 4, 4, 0]} barSize={16} />
									</BarChart>
								</ResponsiveContainer>
							) : (
								<div className="h-full flex items-center justify-center text-sm" style={{ color: "var(--text-disabled)" }}>No data yet</div>
							)}
						</div>
					</div>

					{/* Rating Distribution Histogram */}
					<div className={`animate-chart-delay-3 ${PANEL} p-5`}>
						<div className="mb-4">
							<h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Rating Distribution</h2>
							<p className="text-[0.65rem] mt-0.5" style={{ color: "var(--text-hint)" }}>Customer review ratings</p>
						</div>
						<div style={{ height: 220 }}>
							{analytics?.ratingDistribution?.some((r: any) => r.count > 0) ? (
								<ResponsiveContainer width="100%" height="100%">
									<BarChart data={analytics.ratingDistribution}>
										<CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
										<XAxis dataKey="stars" tick={{ fontSize: 10, fill: "var(--text-hint)" }} tickFormatter={(v) => `${v}★`} axisLine={{ stroke: "var(--border-light)" }} tickLine={false} />
										<YAxis tick={{ fontSize: 10, fill: "var(--text-hint)" }} axisLine={false} tickLine={false} allowDecimals={false} />
										<Tooltip contentStyle={{ background: "var(--surface-paper)", border: "1px solid var(--border-light)", borderRadius: "8px", fontSize: "11px" }} formatter={(v: any) => [v, "Reviews"]} labelFormatter={(l) => `${l} Star${l !== 1 ? "s" : ""}`} />
										<Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={32}>
											{analytics.ratingDistribution.map((_: any, i: number) => (
												<Cell key={i} fill={["#ef4444", "#f97316", "#f59e0b", "#84cc16", "#22c55e"][i]} />
											))}
										</Bar>
									</BarChart>
								</ResponsiveContainer>
							) : (
								<div className="h-full flex items-center justify-center text-sm" style={{ color: "var(--text-disabled)" }}>No reviews yet</div>
							)}
						</div>
					</div>

					{/* Revenue by Day of Week (Radar) */}
					<div className={`animate-chart-delay-4 ${PANEL} p-5`}>
						<div className="mb-4">
							<h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Sales by Day</h2>
							<p className="text-[0.65rem] mt-0.5" style={{ color: "var(--text-hint)" }}>Weekly revenue pattern</p>
						</div>
						<div style={{ height: 220 }}>
							{analytics?.revenueByDayOfWeek?.length > 0 ? (
								<ResponsiveContainer width="100%" height="100%">
									<RadarChart data={analytics.revenueByDayOfWeek}>
										<PolarGrid stroke="var(--border-light)" />
										<PolarAngleAxis dataKey="day" tick={{ fontSize: 9, fill: "var(--text-hint)" }} />
										<PolarRadiusAxis tick={{ fontSize: 8, fill: "var(--text-hint)" }} axisLine={false} />
										<Radar name="Revenue" dataKey="revenue" stroke="#16a34a" fill="#16a34a" fillOpacity={0.2} strokeWidth={2} />
										<Tooltip contentStyle={{ background: "var(--surface-paper)", border: "1px solid var(--border-light)", borderRadius: "8px", fontSize: "11px" }} formatter={(v: any) => [`₦${Number(v).toLocaleString()}`, "Revenue"]} />
									</RadarChart>
								</ResponsiveContainer>
							) : (
								<div className="h-full flex items-center justify-center text-sm" style={{ color: "var(--text-disabled)" }}>No data yet</div>
							)}
						</div>
					</div>
				</div>

				{/* ── Row 7: Order Volume + Stock Levels + Hourly Distribution ── */}
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
					{/* Order Volume Trend */}
					<div className={`animate-chart-delay-3 ${PANEL} p-5`}>
						<div className="mb-4">
							<h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Order Volume</h2>
							<p className="text-[0.65rem] mt-0.5" style={{ color: "var(--text-hint)" }}>Daily order count (30 days)</p>
						</div>
						<div style={{ height: 220 }}>
							{analytics?.orderVolumeTrend?.length > 0 ? (
								<ResponsiveContainer width="100%" height="100%">
									<LineChart data={analytics.orderVolumeTrend}>
										<CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
										<XAxis dataKey="date" tick={{ fontSize: 10, fill: "var(--text-hint)" }} tickFormatter={(v) => new Date(v).toLocaleDateString("en", { day: "numeric", month: "short" })} axisLine={{ stroke: "var(--border-light)" }} tickLine={false} />
										<YAxis tick={{ fontSize: 10, fill: "var(--text-hint)" }} axisLine={false} tickLine={false} allowDecimals={false} />
										<Tooltip contentStyle={{ background: "var(--surface-paper)", border: "1px solid var(--border-light)", borderRadius: "8px", fontSize: "11px" }} formatter={(v: any) => [v, "Orders"]} labelFormatter={(l) => new Date(l).toLocaleDateString("en", { weekday: "short", day: "numeric", month: "long" })} />
										<Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} dot={false} activeDot={{ r: 4, stroke: "#3b82f6", strokeWidth: 2, fill: "var(--surface-paper)" }} />
									</LineChart>
								</ResponsiveContainer>
							) : (
								<div className="h-full flex items-center justify-center text-sm" style={{ color: "var(--text-disabled)" }}>No data yet</div>
							)}
						</div>
					</div>

					{/* Order Hourly Distribution */}
					<div className={`animate-chart-delay-4 ${PANEL} p-5`}>
						<div className="mb-4">
							<h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Peak Order Hours</h2>
							<p className="text-[0.65rem] mt-0.5" style={{ color: "var(--text-hint)" }}>When customers order most</p>
						</div>
						<div style={{ height: 220 }}>
							{analytics?.orderHourlyDistribution?.length > 0 ? (
								<ResponsiveContainer width="100%" height="100%">
									<BarChart data={analytics.orderHourlyDistribution}>
										<CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
										<XAxis dataKey="hour" tick={{ fontSize: 10, fill: "var(--text-hint)" }} tickFormatter={(v) => `${v}:00`} axisLine={{ stroke: "var(--border-light)" }} tickLine={false} />
										<YAxis tick={{ fontSize: 10, fill: "var(--text-hint)" }} axisLine={false} tickLine={false} allowDecimals={false} />
										<Tooltip contentStyle={{ background: "var(--surface-paper)", border: "1px solid var(--border-light)", borderRadius: "8px", fontSize: "11px" }} formatter={(v: any) => [v, "Orders"]} labelFormatter={(l) => `${l}:00 - ${l}:59`} />
										<Bar dataKey="count" radius={[3, 3, 0, 0]} barSize={14}>
											{analytics.orderHourlyDistribution.map((_: any, i: number) => (
												<Cell key={i} fill={`rgba(22, 163, 74, ${0.3 + (analytics.orderHourlyDistribution[i]?.count / Math.max(...analytics.orderHourlyDistribution.map((h: any) => h.count), 1)) * 0.7})`} />
											))}
										</Bar>
									</BarChart>
								</ResponsiveContainer>
							) : (
								<div className="h-full flex items-center justify-center text-sm" style={{ color: "var(--text-disabled)" }}>No data yet</div>
							)}
						</div>
					</div>
				</div>

				{/* ── Row 8: Stock Levels + Items Per Order Distribution ── */}
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
					{/* Stock Levels */}
					<div className={`lg:col-span-2 animate-chart-delay-4 ${PANEL} p-5`}>
						<div className="mb-4">
							<h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Inventory Levels</h2>
							<p className="text-[0.65rem] mt-0.5" style={{ color: "var(--text-hint)" }}>Available vs sold by product</p>
						</div>
						<div style={{ height: 260 }}>
							{analytics?.stockLevels?.length > 0 ? (
								<ResponsiveContainer width="100%" height="100%">
									<BarChart data={analytics.stockLevels}>
										<CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
										<XAxis dataKey="name" tick={{ fontSize: 9, fill: "var(--text-hint)" }} axisLine={{ stroke: "var(--border-light)" }} tickLine={false} angle={-30} textAnchor="end" height={60} />
										<YAxis tick={{ fontSize: 10, fill: "var(--text-hint)" }} axisLine={false} tickLine={false} />
										<Tooltip contentStyle={{ background: "var(--surface-paper)", border: "1px solid var(--border-light)", borderRadius: "8px", fontSize: "11px" }} />
										<Legend wrapperStyle={{ fontSize: "11px" }} />
										<Bar dataKey="available" name="Available" fill="#16a34a" radius={[3, 3, 0, 0]} barSize={12} />
										<Bar dataKey="sold" name="Sold" fill="#3b82f6" radius={[3, 3, 0, 0]} barSize={12} />
									</BarChart>
								</ResponsiveContainer>
							) : (
								<div className="h-full flex items-center justify-center text-sm" style={{ color: "var(--text-disabled)" }}>No inventory data</div>
							)}
						</div>
					</div>

					{/* Items Per Order Distribution */}
					<div className={`animate-chart-delay-5 ${PANEL} p-5`}>
						<div className="mb-4">
							<h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Cart Size</h2>
							<p className="text-[0.65rem] mt-0.5" style={{ color: "var(--text-hint)" }}>Items per order distribution</p>
						</div>
						<div style={{ height: 260 }}>
							{analytics?.itemsPerOrderDistribution?.length > 0 ? (
								<ResponsiveContainer width="100%" height="100%">
									<PieChart>
										<Pie data={analytics.itemsPerOrderDistribution} cx="50%" cy="45%" outerRadius={75} dataKey="orders" nameKey="items" label={({ items, percent }: any) => `${items} items (${(percent * 100).toFixed(0)}%)`} labelLine={false} strokeWidth={2} stroke="var(--surface-paper)">
											{analytics.itemsPerOrderDistribution.map((_: any, i: number) => (
												<Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
											))}
										</Pie>
										<Tooltip contentStyle={{ background: "var(--surface-paper)", border: "1px solid var(--border-light)", borderRadius: "8px", fontSize: "11px" }} formatter={(v: any, name: any) => [v, `${name} item orders`]} />
									</PieChart>
								</ResponsiveContainer>
							) : (
								<div className="h-full flex items-center justify-center text-sm" style={{ color: "var(--text-disabled)" }}>No order data</div>
							)}
						</div>
					</div>
				</div>

				{/* ── Row 9: Recent Customers ── */}
				<div className={`animate-card-delay-5 ${PANEL}`}>
					<div className="px-5 py-4 flex items-center justify-between">
						<h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Recent Customers</h2>
						<Link href="/admin/customers" className={VIEW_ALL}>View All</Link>
					</div>
					<DataTable columns={customerColumns} data={analytics?.recentCustomers ?? []} manualPagination={false} emptyMessage="No customers yet" testId="recent-customers-table" />
				</div>
			</div>
		</AdminLayout>
	);
};

export default withAdminAuth(AdminDashboard);
