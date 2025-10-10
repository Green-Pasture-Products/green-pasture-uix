import React from "react";

import {
	TrendingUp,
	DollarSign,
	ShoppingCart,
	Users,
	Package,
} from "lucide-react";
import { useAppSelector } from "@/_redux/store";
import AdminLayout from "@/_components/AdminLayout";

const AdminAnalytics: React.FC = () => {
	const { stats, salesData, orders } = useAppSelector((state) => state.admin);
	const { products } = useAppSelector((state) => state.product);

	// Calculate additional analytics
	const averageOrderValue =
		orders.length > 0
			? orders.reduce((sum, order) => sum + order.total, 0) / orders.length
			: 0;
	const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
	const monthlyGrowth = 12.5; // Mock data

	const topSellingCategories = products.reduce((acc: any, product) => {
		acc[product.category] = (acc[product.category] || 0) + 1;
		return acc;
	}, {});

	const categoryData = Object.entries(topSellingCategories).map(
		([category, count]) => ({
			category,
			count: count as number,
		})
	);

	return (
		<AdminLayout>
			<div className="space-y-6">
				{/* Key Metrics */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
					<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-gray-600">
									Total Revenue
								</p>
								<p className="text-3xl font-bold text-gray-900">
									${totalRevenue.toFixed(2)}
								</p>
								<div className="flex items-center mt-2">
									<TrendingUp className="h-4 w-4 text-green-500 mr-1" />
									<span className="text-sm text-green-600 font-medium">
										+{monthlyGrowth}%
									</span>
								</div>
							</div>
							<div className="p-3 bg-blue-100 rounded-full">
								<DollarSign className="h-6 w-6 text-blue-600" />
							</div>
						</div>
					</div>

					<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-gray-600">
									Average Order Value
								</p>
								<p className="text-3xl font-bold text-gray-900">
									${averageOrderValue.toFixed(2)}
								</p>
								<div className="flex items-center mt-2">
									<TrendingUp className="h-4 w-4 text-green-500 mr-1" />
									<span className="text-sm text-green-600 font-medium">
										+8.2%
									</span>
								</div>
							</div>
							<div className="p-3 bg-green-100 rounded-full">
								<ShoppingCart className="h-6 w-6 text-green-600" />
							</div>
						</div>
					</div>

					<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-gray-600">
									Total Customers
								</p>
								<p className="text-3xl font-bold text-gray-900">
									{stats.totalCustomers}
								</p>
								<div className="flex items-center mt-2">
									<TrendingUp className="h-4 w-4 text-green-500 mr-1" />
									<span className="text-sm text-green-600 font-medium">
										+15.7%
									</span>
								</div>
							</div>
							<div className="p-3 bg-purple-100 rounded-full">
								<Users className="h-6 w-6 text-purple-600" />
							</div>
						</div>
					</div>

					<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-gray-600">
									Total Products
								</p>
								<p className="text-3xl font-bold text-gray-900">
									{stats.totalProducts}
								</p>
								<div className="flex items-center mt-2">
									<TrendingUp className="h-4 w-4 text-green-500 mr-1" />
									<span className="text-sm text-green-600 font-medium">
										+2.1%
									</span>
								</div>
							</div>
							<div className="p-3 bg-orange-100 rounded-full">
								<Package className="h-6 w-6 text-orange-600" />
							</div>
						</div>
					</div>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
					{/* Sales Chart */}
					<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
						<h3 className="text-lg font-semibold text-gray-900 mb-4">
							Sales Trend
						</h3>
						<div className="h-64 flex items-end justify-between space-x-2">
							{salesData.map((data, index) => (
								<div
									key={index}
									className="flex flex-col items-center flex-1"
								>
									<div className="text-xs text-gray-600 mb-1">
										${data.sales}
									</div>
									<div
										className="w-full bg-gradient-to-t from-green-500 to-green-400 rounded-t-sm transition-all duration-300 hover:from-green-600 hover:to-green-500"
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

					{/* Category Distribution */}
					<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
						<h3 className="text-lg font-semibold text-gray-900 mb-4">
							Products by Category
						</h3>
						<div className="space-y-4">
							{categoryData.map((item, index) => (
								<div key={item.category}>
									<div className="flex justify-between items-center mb-2">
										<span className="text-sm font-medium text-gray-700">
											{item.category}
										</span>
										<span className="text-sm text-gray-500">
											{item.count} products
										</span>
									</div>
									<div className="w-full bg-gray-200 rounded-full h-2">
										<div
											className="bg-green-600 h-2 rounded-full transition-all duration-300"
											style={{
												width: `${
													(item.count / products.length) * 100
												}%`,
											}}
										></div>
									</div>
								</div>
							))}
						</div>
					</div>
				</div>

				{/* Recent Activity */}
				<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
					<h3 className="text-lg font-semibold text-gray-900 mb-4">
						Recent Activity
					</h3>
					<div className="space-y-4">
						{orders.slice(0, 5).map((order) => (
							<div
								key={order.id}
								className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
							>
								<div className="flex items-center space-x-3">
									<div className="p-2 bg-green-100 rounded-full">
										<ShoppingCart className="h-4 w-4 text-green-600" />
									</div>
									<div>
										<p className="text-sm font-medium text-gray-900">
											New order #{order.id}
										</p>
										<p className="text-xs text-gray-500">
											{order.customer.firstName}{" "}
											{order.customer.lastName} •{" "}
											{new Date(
												order.createdAt
											).toLocaleDateString()}
										</p>
									</div>
								</div>
								<span className="text-sm font-medium text-gray-900">
									${order.total.toFixed(2)}
								</span>
							</div>
						))}
					</div>
				</div>
			</div>
		</AdminLayout>
	);
};

export default AdminAnalytics;
