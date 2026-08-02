import React, { useEffect, useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { ColumnDef } from "@tanstack/react-table";

import withAdminAuth from "@/_components/withAdminAuth";
import AdminLayout from "@/_components/AdminLayout";
import PageLoader from "@/_UI/PageLoader";
import Badge from "@/_UI/Badge";
import { ChartCard } from "@/_components/charts/chart-card";
import { TrendAreaChart } from "@/_components/charts/trend-area-chart";
import { BreakdownDonut } from "@/_components/charts/breakdown-donut";
import { ChartTooltip } from "@/_components/charts/chart-tooltip";
import { CATEGORICAL, TREND, statusColor } from "@/_components/charts/chart-colors";
import { DataTable } from "@/_components/DataTable";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useAppDispatch } from "@/_redux/store";
import { analyticsAction } from "@/_redux/actions/analytics.action";
import { formatCurrency, formatCurrencyFull, formatNumber, toDayBucket } from "@/_utils/format";

// New page for task 8. Surfaces every analytics.dashboard dataset that
// dashboard.tsx doesn't: revenueByCategory, customerGrowth, orderVolumeTrend,
// ratingDistribution, orderHourlyDistribution, revenueByDayOfWeek, stockLevels,
// itemsPerOrderDistribution, stockMovementTrend, topSellingItems, lowStockItems
// — plus paymentStatusDistribution, which the old single-page dashboard.tsx
// also showed but which task-8-brief's split lists on neither page; dropping
// it would violate "keep every metric", so it landed here as a Sales chart.
//
// None of these shapes (categorical multi-series bars, a date x type pivot)
// fit ChartCard's two ported chart components (TrendAreaChart wants a single
// daily series, BreakdownDonut wants a flat label/count list), so CategoryBarChart
// below is a small local wrapper around recharts' BarChart, styled with the
// same tokens/tooltip TrendAreaChart uses, for the rest.

const RATING_COLORS = ["#dc2626", "#f97316", "#d97706", "#65a30d", "#0e9f6e"];

function shortDateLabel(iso: string): string {
	const [y, m, d] = iso.split("-").map(Number);
	if (!y || !m || !d) return iso;
	return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(new Date(y, m - 1, d));
}

function shortMonthLabel(bucket: string): string {
	const [y, m] = bucket.split("-").map(Number);
	if (!y || !m) return bucket;
	return new Intl.DateTimeFormat("en-US", { month: "short" }).format(new Date(y, m - 1, 1));
}

interface CategoryBarChartProps {
	data: Record<string, any>[];
	xKey: string;
	bars: { key: string; name: string; color: string }[];
	xTickFormatter?: (v: any) => string;
	valueFormatter?: (v: number) => string;
	height?: number;
	layout?: "horizontal" | "vertical";
	angledLabels?: boolean;
	/** Per-bar colour override for a single-series chart (e.g. rating stars). */
	cellColors?: string[];
}

/** Categorical/grouped bar chart for the shapes TrendAreaChart and BreakdownDonut don't cover. */
function CategoryBarChart({
	data,
	xKey,
	bars,
	xTickFormatter,
	valueFormatter = (v) => v.toLocaleString(),
	height = 240,
	layout = "horizontal",
	angledLabels = false,
	cellColors,
}: CategoryBarChartProps) {
	const isVertical = layout === "vertical";
	return (
		<ResponsiveContainer width="100%" height={height}>
			<BarChart data={data} layout={isVertical ? "vertical" : undefined} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
				<CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={!isVertical} vertical={isVertical} />
				{isVertical ? (
					<>
						<XAxis type="number" tickFormatter={valueFormatter} tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} axisLine={false} tickLine={false} />
						<YAxis type="category" dataKey={xKey} tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} axisLine={false} tickLine={false} width={90} />
					</>
				) : (
					<>
						<XAxis
							dataKey={xKey}
							tickFormatter={xTickFormatter}
							tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
							axisLine={false}
							tickLine={false}
							angle={angledLabels ? -30 : 0}
							textAnchor={angledLabels ? "end" : "middle"}
							height={angledLabels ? 56 : 24}
							interval={0}
						/>
						<YAxis tickFormatter={valueFormatter} tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} axisLine={false} tickLine={false} width={44} allowDecimals={false} />
					</>
				)}
				<Tooltip content={<ChartTooltip formatValue={valueFormatter} />} cursor={{ fill: "var(--muted)" }} />
				{bars.map((b, bi) => (
					<Bar key={b.key} dataKey={b.key} name={b.name} fill={b.color} radius={isVertical ? [0, 4, 4, 0] : [4, 4, 0, 0]} barSize={bars.length > 1 ? 16 : 28}>
						{cellColors && bi === 0
							? data.map((_, i) => <Cell key={i} fill={cellColors[i % cellColors.length]} />)
							: null}
					</Bar>
				))}
			</BarChart>
		</ResponsiveContainer>
	);
}

interface TopSellingItem {
	id: string;
	name: string;
	product: string | null;
	soldQuantity: number;
	availableQuantity: number;
	price: number;
}

interface LowStockItem {
	id: string;
	name: string;
	product: string | null;
	availableQuantity: number;
}

const topSellingColumns: ColumnDef<TopSellingItem, any>[] = [
	{ accessorKey: "name", header: "ITEM" },
	{ accessorKey: "product", header: "PRODUCT", cell: ({ getValue }) => <span className="text-muted-foreground">{String(getValue() ?? "N/A")}</span> },
	{ accessorKey: "soldQuantity", header: "SOLD", cell: ({ getValue }) => <span className="font-semibold tabular-nums">{formatNumber(Number(getValue()))}</span> },
	{ accessorKey: "availableQuantity", header: "IN STOCK", cell: ({ getValue }) => <span className="tabular-nums">{formatNumber(Number(getValue()))}</span> },
	{ accessorKey: "price", header: "PRICE", cell: ({ getValue }) => <span className="tabular-nums">{formatCurrencyFull(Number(getValue()))}</span> },
];

const lowStockColumns: ColumnDef<LowStockItem, any>[] = [
	{ accessorKey: "name", header: "ITEM" },
	{ accessorKey: "product", header: "PRODUCT", cell: ({ getValue }) => <span className="text-muted-foreground">{String(getValue() ?? "N/A")}</span> },
	{
		accessorKey: "availableQuantity",
		header: "STOCK",
		cell: ({ getValue }) => {
			const qty = Number(getValue());
			return (
				<Badge variant={qty === 0 ? "error" : "warning"} size="sm">
					{qty} left
				</Badge>
			);
		},
	},
];

const AdminAnalytics: React.FC = () => {
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

	const orderVolumeData = useMemo(
		() => (analytics?.orderVolumeTrend ?? []).map((r: any) => ({ bucket: toDayBucket(r.date), value: r.count })),
		[analytics],
	);

	const paymentStatusData = useMemo(
		() => (analytics?.paymentStatusDistribution ?? []).map((p: any) => ({ label: p.status, count: p.count })),
		[analytics],
	);

	const itemsPerOrderData = useMemo(
		() => (analytics?.itemsPerOrderDistribution ?? []).map((r: any) => ({ label: `${r.items} items`, count: r.orders })),
		[analytics],
	);

	const stockMovementData = useMemo(() => {
		const rows: { date: string; type: string; quantity: number }[] = analytics?.stockMovementTrend ?? [];
		const byDate = new Map<string, { date: string; RESTOCK: number; SALE: number; ADJUSTMENT: number }>();
		for (const r of rows) {
			const bucket = toDayBucket(r.date);
			const row = byDate.get(bucket) ?? { date: bucket, RESTOCK: 0, SALE: 0, ADJUSTMENT: 0 };
			(row as any)[r.type] = r.quantity;
			byDate.set(bucket, row);
		}
		return Array.from(byDate.values()).sort((a, b) => a.date.localeCompare(b.date));
	}, [analytics]);

	const ratingHasData = (analytics?.ratingDistribution ?? []).some((r: any) => r.count > 0);

	if (loading) {
		return (
			<AdminLayout>
				<PageLoader fullScreen={false} message="Loading analytics..." />
			</AdminLayout>
		);
	}

	return (
		<AdminLayout>
			<div className="space-y-6">
				<div>
					<h2 className="text-xl font-semibold tracking-tight">Analytics</h2>
					<p className="text-muted-foreground mt-1 text-sm">Deeper trends across sales, customers and inventory.</p>
				</div>

				{/* Sales */}
				<div className="grid gap-4 lg:grid-cols-3">
					<ChartCard title="Order Volume" subtitle="Daily order count, last 30 days" isEmpty={(analytics?.orderVolumeTrend?.length ?? 0) === 0}>
						<TrendAreaChart data={orderVolumeData} color={TREND.orders} name="Orders" days={30} formatValue={formatNumber} />
					</ChartCard>
					<ChartCard title="Revenue by Category" subtitle="Product category performance" isEmpty={(analytics?.revenueByCategory?.length ?? 0) === 0}>
						<CategoryBarChart
							data={analytics?.revenueByCategory ?? []}
							xKey="category"
							layout="vertical"
							bars={[{ key: "revenue", name: "Revenue", color: CATEGORICAL[0] }]}
							valueFormatter={formatCurrency}
						/>
					</ChartCard>
					<ChartCard title="Payment Status" subtitle="Transaction breakdown" isEmpty={paymentStatusData.length === 0}>
						<BreakdownDonut data={paymentStatusData} colorFor={statusColor} />
					</ChartCard>
				</div>

				{/* Customers & reviews */}
				<div className="grid gap-4 lg:grid-cols-3">
					<ChartCard title="Customer Growth" subtitle="New customers, last 6 months" isEmpty={(analytics?.customerGrowth?.length ?? 0) === 0}>
						<CategoryBarChart
							data={analytics?.customerGrowth ?? []}
							xKey="month"
							xTickFormatter={shortMonthLabel}
							bars={[{ key: "count", name: "Customers", color: TREND.customers }]}
							valueFormatter={formatNumber}
						/>
					</ChartCard>
					<ChartCard title="Rating Distribution" subtitle="Customer review ratings" isEmpty={!ratingHasData} emptyMessage="No reviews yet.">
						<CategoryBarChart
							data={analytics?.ratingDistribution ?? []}
							xKey="stars"
							xTickFormatter={(v) => `${v}★`}
							bars={[{ key: "count", name: "Reviews", color: CATEGORICAL[0] }]}
							valueFormatter={formatNumber}
							cellColors={RATING_COLORS}
						/>
					</ChartCard>
					<ChartCard title="Cart Size" subtitle="Items per order" isEmpty={itemsPerOrderData.length === 0}>
						<BreakdownDonut data={itemsPerOrderData} colorFor={(_l, i) => CATEGORICAL[i % CATEGORICAL.length]} />
					</ChartCard>
				</div>

				{/* Operations */}
				<div className="grid gap-4 lg:grid-cols-3">
					<ChartCard title="Peak Order Hours" subtitle="When customers order most" isEmpty={(analytics?.orderHourlyDistribution?.length ?? 0) === 0}>
						<CategoryBarChart
							data={analytics?.orderHourlyDistribution ?? []}
							xKey="hour"
							xTickFormatter={(v) => `${v}:00`}
							bars={[{ key: "count", name: "Orders", color: CATEGORICAL[1] }]}
							valueFormatter={formatNumber}
						/>
					</ChartCard>
					<ChartCard title="Sales by Day" subtitle="Revenue by day of week" isEmpty={(analytics?.revenueByDayOfWeek?.length ?? 0) === 0}>
						<CategoryBarChart
							data={analytics?.revenueByDayOfWeek ?? []}
							xKey="day"
							bars={[{ key: "revenue", name: "Revenue", color: TREND.revenue }]}
							valueFormatter={formatCurrency}
						/>
					</ChartCard>
					<ChartCard title="Stock Movement" subtitle="Restocks, sales & adjustments, last 30 days" isEmpty={stockMovementData.length === 0}>
						<CategoryBarChart
							data={stockMovementData}
							xKey="date"
							xTickFormatter={shortDateLabel}
							bars={[
								{ key: "RESTOCK", name: "Restock", color: CATEGORICAL[0] },
								{ key: "SALE", name: "Sale", color: CATEGORICAL[1] },
								{ key: "ADJUSTMENT", name: "Adjustment", color: CATEGORICAL[2] },
							]}
							valueFormatter={formatNumber}
						/>
					</ChartCard>
				</div>

				{/* Inventory */}
				<ChartCard title="Inventory Levels" subtitle="Available vs sold, by product" isEmpty={(analytics?.stockLevels?.length ?? 0) === 0}>
					<CategoryBarChart
						data={analytics?.stockLevels ?? []}
						xKey="name"
						angledLabels
						bars={[
							{ key: "available", name: "Available", color: CATEGORICAL[0] },
							{ key: "sold", name: "Sold", color: CATEGORICAL[1] },
						]}
						valueFormatter={formatNumber}
						height={280}
					/>
				</ChartCard>

				<Card>
					<CardHeader>
						<CardTitle>Top Selling Items</CardTitle>
					</CardHeader>
					<CardContent>
						<DataTable
							columns={topSellingColumns}
							data={analytics?.topSellingItems ?? []}
							manualPagination={false}
							showSN
							emptyMessage="No sales yet"
							testId="top-selling-table"
						/>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Low Stock Items</CardTitle>
					</CardHeader>
					<CardContent>
						<DataTable
							columns={lowStockColumns}
							data={analytics?.lowStockItems ?? []}
							manualPagination={false}
							showSN
							emptyMessage="All stocked up"
							testId="low-stock-table"
						/>
					</CardContent>
				</Card>
			</div>
		</AdminLayout>
	);
};

export default withAdminAuth(AdminAnalytics);
