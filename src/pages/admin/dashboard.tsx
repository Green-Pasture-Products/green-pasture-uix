import React from "react";
import {
	TrendingUp,
	TrendingDown,
	Package,
	ShoppingCart,
	Users,
	DollarSign,
	AlertTriangle,
} from "lucide-react";

import AdminLayout from "@/_components/AdminLayout";
import { useAppSelector } from "@/_redux/store";

const AdminDashboard: React.FC = () => {
	const { stats, salesData, orders } = useAppSelector((state) => state.admin);
	const recentOrders = orders?.slice(0, 5);

	const statCards = [
		{
			name: "Total Revenue",
			value: `$${stats.totalRevenue.toLocaleString()}`,
			change: "+12.5%",
			changeType: "positive",
			icon: DollarSign,
		},
		{
			name: "Total Orders",
			value: stats.totalOrders.toString(),
			change: "+8.3%",
			changeType: "positive",
			icon: ShoppingCart,
		},
		{
			name: "Total Products",
			value: stats.totalProducts.toString(),
			change: "+2.1%",
			changeType: "positive",
			icon: Package,
		},
		{
			name: "Total Customers",
			value: stats.totalCustomers.toString(),
			change: "+15.7%",
			changeType: "positive",
			icon: Users,
		},
	];

	const alertCards = [
		{
			title: "Pending Orders",
			value: stats.pendingOrders,
			description: "Orders awaiting processing",
			color: "orange",
			icon: ShoppingCart,
		},
		{
			title: "Low Stock Items",
			value: stats.lowStockProducts,
			description: "Products running low",
			color: "red",
			icon: AlertTriangle,
		},
	];

	return (
		<AdminLayout>
			<div className="space-y-6">
				{/* Stats Grid */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
					{statCards?.map((card) => (
						<div
							key={card.name}
							className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
						>
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm font-medium text-gray-600">
										{card.name}
									</p>
									<p className="text-3xl font-bold text-gray-900">
										{card.value}
									</p>
								</div>
								<div className="p-3 bg-green-100 rounded-full">
									<card.icon className="h-6 w-6 text-green-600" />
								</div>
							</div>
							<div className="mt-4 flex items-center">
								{card.changeType === "positive" ? (
									<TrendingUp className="h-4 w-4 text-green-500 mr-1" />
								) : (
									<TrendingDown className="h-4 w-4 text-red-500 mr-1" />
								)}
								<span
									className={`text-sm font-medium ${
										card.changeType === "positive"
											? "text-green-600"
											: "text-red-600"
									}`}
								>
									{card.change}
								</span>
								<span className="text-sm text-gray-500 ml-1">
									from last month
								</span>
							</div>
						</div>
					))}
				</div>

				{/* Alert Cards */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					{alertCards.map((card) => (
						<div
							key={card.title}
							className={`bg-white rounded-lg shadow-sm border-l-4 ${
								card.color === "orange"
									? "border-orange-400"
									: "border-red-400"
							} p-6`}
						>
							<div className="flex items-center">
								<div
									className={`p-2 rounded-full ${
										card.color === "orange"
											? "bg-orange-100"
											: "bg-red-100"
									} mr-3`}
								>
									<card.icon
										className={`h-5 w-5 ${
											card.color === "orange"
												? "text-orange-600"
												: "text-red-600"
										}`}
									/>
								</div>
								<div>
									<h3 className="font-semibold text-gray-900">
										{card.title}
									</h3>
									<p className="text-2xl font-bold text-gray-900">
										{card.value}
									</p>
									<p className="text-sm text-gray-500">
										{card.description}
									</p>
								</div>
							</div>
						</div>
					))}
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
					{/* Sales Chart */}
					<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
						<h3 className="text-lg font-semibold text-gray-900 mb-4">
							Sales Overview
						</h3>
						<div className="h-64 flex items-end justify-between space-x-2">
							{salesData.map((data, index) => (
								<div
									key={index}
									className="flex flex-col items-center flex-1"
								>
									<div
										className="w-full bg-green-500 rounded-t-sm transition-all duration-300 hover:bg-green-600"
										style={{
											height: `${(data.sales / 300) * 100}%`,
											minHeight: "20px",
										}}
									></div>
									<span className="text-xs text-gray-500 mt-2">
										{new Date(data.date).toLocaleDateString("en-US", {
											month: "short",
											day: "numeric",
										})}
									</span>
								</div>
							))}
						</div>
					</div>

					{/* Recent Orders */}
					<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
						<h3 className="text-lg font-semibold text-gray-900 mb-4">
							Recent Orders
						</h3>
						<div className="space-y-4">
							{recentOrders.map((order) => (
								<div
									key={order.id}
									className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
								>
									<div>
										<p className="font-medium text-gray-900">
											#{order.id}
										</p>
										<p className="text-sm text-gray-500">
											{order.customer.firstName}{" "}
											{order.customer.lastName}
										</p>
									</div>
									<div className="text-right">
										<p className="font-medium text-gray-900">
											${order.total.toFixed(2)}
										</p>
										<span
											className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
												order.status === "pending"
													? "bg-yellow-100 text-yellow-800"
													: order.status === "confirmed"
													? "bg-blue-100 text-blue-800"
													: order.status === "shipped"
													? "bg-purple-100 text-purple-800"
													: "bg-green-100 text-green-800"
											}`}
										>
											{order.status}
										</span>
									</div>
								</div>
							))}
						</div>
					</div>
				</div>
			</div>
		</AdminLayout>
	);
};

export default AdminDashboard;
