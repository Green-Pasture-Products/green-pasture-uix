import React, { useEffect, useState } from "react";
import {
	TrendingUp,
	TrendingDown,
	Package,
	ShoppingCart,
	Users,
	DollarSign,
	AlertTriangle,
	Eye,
} from "lucide-react";

import AdminLayout from "@/_components/AdminLayout";
import { useAppDispatch, useAppSelector } from "@/_redux/store";
import { productsAction } from "@/_redux/actions";
import { Customer, Order } from "@/types";
import { Column, CustomTable } from "@/_components/CustomTable";
import { updateOrderStatus } from "@/_redux/reducers/admin.reducer";

const AdminDashboard: React.FC = () => {
	const dispatch = useAppDispatch();
	const { stats, salesData, orders } = useAppSelector((state) => state.admin);
	const products = useAppSelector((state) => state.product.products);
	const [selectedStatus, setSelectedStatus] = useState("all");
	const [currentPage, setCurrentPage] = useState(1);
	const [searchTerm, setSearchTerm] = useState("");
	const recentOrders = orders?.slice(0, 5);

	// Extract unique customers from orders
	const customers = orders?.reduce((acc: any[], order: Order) => {
		const existingCustomer = acc.find(
			(c) => c.email === order.customer.email
		);
		if (!existingCustomer) {
			acc.push({
				...order.customer,
				totalOrders: 1,
				totalSpent: order.total,
				lastOrderDate: order.createdAt,
				address: order.shippingAddress,
			});
		} else {
			existingCustomer.totalOrders += 1;
			existingCustomer.totalSpent += order.total;
			if (
				new Date(order.createdAt) > new Date(existingCustomer.lastOrderDate)
			) {
				existingCustomer.lastOrderDate = order.createdAt;
			}
		}
		return acc;
	}, []);

	const filteredCustomers = customers?.filter((customer) => {
		const searchLower = searchTerm.toLowerCase();
		return (
			customer.firstName.toLowerCase().includes(searchLower) ||
			customer.lastName.toLowerCase().includes(searchLower) ||
			customer.email.toLowerCase().includes(searchLower)
		);
	});

	const { isAuthenticated } = useAppSelector((state) => state.auth);
	
	useEffect(() => {
		if (isAuthenticated) {
			dispatch(productsAction.fetchAllProducts());
		}
	}, [isAuthenticated]);

	const filteredOrders = orders?.filter((order) => {
		const matchesStatus =
			selectedStatus === "all" || order.status === selectedStatus;
		const matchesSearch =
			order.id.includes(searchTerm) ||
			order.customer.firstName
				.toLowerCase()
				.includes(searchTerm.toLowerCase()) ||
			order.customer.lastName
				.toLowerCase()
				.includes(searchTerm.toLowerCase()) ||
			order.customer.email.toLowerCase().includes(searchTerm.toLowerCase());
		return matchesStatus && matchesSearch;
	});

	const topSellingCategories = products?.filter(p => p != null)?.reduce((acc: any, product) => {
  		acc[product.category] = (acc[product.category] || 0) + 1;
  		return acc;
		}, {});

	const categoryData = Object.entries(topSellingCategories).map(
		([category, count]) => ({
			category,
			count: count as number,
		})
	);

	const handleStatusUpdate = (orderId: string, newStatus: any) => {
		dispatch(updateOrderStatus({ id: orderId, status: newStatus }));
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case "pending":
				return "bg-yellow-100 text-yellow-800";
			case "confirmed":
				return "bg-blue-100 text-blue-800";
			case "shipped":
				return "bg-purple-100 text-purple-800";
			case "delivered":
				return "bg-green-100 text-green-800";
			default:
				return "bg-gray-100 text-gray-800";
		}
	};

	const columns: Column<Order>[] = [
		{
			key: "id",
			header: "ID",
			render: (value: string | number, row: Order) => {
				return (
					<div className="text-sm font-medium text-gray-900">
						#{row.id}
					</div>
				);
			},
		},
		{
			key: "items",
			header: "Product",
			render: (value: string | number, row: Order) => {
				return (
					<div className="text-sm font-medium text-gray-900 space-y-2">
						{row.items?.map((item) => (
							<div key={item.id} className="flex items-center">
								<img
									className="h-10 w-10 rounded-md object-cover"
									src={item.image}
									alt={item.name}
								/>
								<div className="ml-4">
									<div className="text-sm font-medium text-gray-900">
										{item.name}
									</div>
									<span className="font-normal">
										₦{item.price.toLocaleString()}
									</span>{" "}
									<span className="font-normal">
										Qty: ({item.quantity})
									</span>
								</div>
							</div>
						))}
					</div>
				);
			},
		},
		{
			key: "customer",
			header: "Customer",
			render: (value: string | number, row: Order) => {
				return (
					<div>
						<div className="text-sm font-medium text-gray-900">
							{row.customer.firstName} {row.customer.lastName}
						</div>
						<div className="text-sm text-gray-500">
							{row.customer.email}
						</div>
					</div>
				);
			},
		},
		{
			key: "createdAt",
			header: "Date Created",
			render: (value: string | number, row: Order) => {
				return (
					<span className="">
						{new Date(row.createdAt).toLocaleDateString()}
					</span>
				);
			},
		},
		{
			key: "total",
			header: "Total",
			render: (value: string | number, row: Order) => {
				return <span>${row.total.toFixed(2)}</span>;
			},
		},
		{
			key: "status",
			header: "Status",
			render: (value: string | number, row: Order) => {
				return (
					<select
						value={row.status}
						onChange={(e) => handleStatusUpdate(row.id, e.target.value)}
						className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border-0 focus:outline-none focus:ring-2 focus:ring-green-500 ${getStatusColor(
							row.status
						)}`}
					>
						<option value="pending">Pending</option>
						<option value="confirmed">Confirmed</option>
						<option value="shipped">Shipped</option>
						<option value="delivered">Delivered</option>
					</select>
				);
			},
		},
		{
			key: "id",
			header: "#",
			render: (value: string | number, row: Order) => {
				return (
					<div className="flex items-center justify-center space-x-2">
						<button
							className="text-green-600 hover:text-green-900 p-1 rounded"
							title="View Details"
						>
							<Eye className="h-4 w-4" />
						</button>
					</div>
				);
			},
		},
	];

	const topBuyerColumns: Column<Customer>[] = [
		{
			key: "firstName",
			header: "Customer Name",
			render: (value: string | number, row: Customer) => {
				return (
					<div>
						<div className="text-sm font-medium text-gray-900">
							{row.firstName} {row.lastName}
						</div>
						<div className="text-sm text-gray-500">{row.email}</div>
					</div>
				);
			},
		},
		{
			key: "email",
			header: "Email Address",
		},
		{
			key: "phone",
			header: "Phone Number",
		},
		{
			key: "totalSpent",
			header: "Total Spent",
			render: (value: string | number, row: Customer) => {
				return <span>${row.totalSpent}</span>;
			},
		},
		{
			key: "address",
			header: "Address",
			render: (value: string | number, row: Customer) => {
				return (
					<span>
						{row.address?.street} {row.address?.city} {row.address?.state}{" "}
						{row.address?.zipCode} {row.address?.country}
					</span>
				);
			},
		},
		{
			key: "lastOrderDate",
			header: "Last Order Date",
			render: (value: string | number, row: Customer) => {
				return <span>{new Date(value).toLocaleDateString()}</span>;
			},
		},
		{
			key: "totalOrders",
			header: "Total Orders",
			render: (value: string | number, row: Customer) => {
				return (
					<span className="font-medium text-gray-900">
						{row.totalOrders}
					</span>
				);
			},
		},
	];

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

					{/* Category Distribution */}
					<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
						<h3 className="text-lg font-semibold text-gray-900 mb-4">
							Products by Category
						</h3>
						<div className="space-y-4">
							{categoryData?.map((item, index) => (
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

				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
					{/* Top Buyers */}
					<div className="space-y-6">
						<h3 className="text-lg font-semibold text-gray-900 mb-4">
							Top Buyers
						</h3>
						<CustomTable
							columns={topBuyerColumns}
							tableRow={filteredCustomers}
							currentPage={currentPage}
							setCurrentPage={setCurrentPage}
						/>
					</div>
					{/* Recent Orders */}
					<div className="space-y-6">
						<h3 className="text-lg font-semibold text-gray-900 mb-4">
							Recent Orders
						</h3>
						<CustomTable
							columns={columns}
							tableRow={filteredOrders}
							currentPage={currentPage}
							setCurrentPage={setCurrentPage}
						/>
					</div>
				</div>
			</div>
		</AdminLayout>
	);
};

export default AdminDashboard;
