import React, { useState } from "react";
import AdminLayout from "@/_components/AdminLayout";
import { Eye, Package, Truck, CheckCircle, Clock, Search } from "lucide-react";

import { useAppDispatch, useAppSelector } from "@/_redux/store";
import { updateOrderStatus } from "@/_redux/reducers/admin.reducer";
import { Column, CustomTable } from "@/_components/CustomTable";
import { Order } from "@/types";

const AdminOrders: React.FC = () => {
	const dispatch = useAppDispatch();
	const { orders } = useAppSelector((state) => state.admin);
	const [selectedStatus, setSelectedStatus] = useState("all");
	const [searchTerm, setSearchTerm] = useState("");
	const [currentPage, setCurrentPage] = useState(1);

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

	const handleStatusUpdate = (orderId: string, newStatus: any) => {
		dispatch(updateOrderStatus({ id: orderId, status: newStatus }));
	};

	const getStatusIcon = (status: string) => {
		switch (status) {
			case "pending":
				return <Clock className="h-4 w-4" />;
			case "confirmed":
				return <CheckCircle className="h-4 w-4" />;
			case "shipped":
				return <Truck className="h-4 w-4" />;
			case "delivered":
				return <Package className="h-4 w-4" />;
			default:
				return <Clock className="h-4 w-4" />;
		}
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
			header: "Order ID",
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
			header: "Amount",
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

	return (
		<AdminLayout>
			<div className="space-y-6">
				<div className="flex justify-between items-center">
					<div className="max-w-3xl">
						<div className="relative">
							<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
							<input
								type="text"
								placeholder="Search orders..."
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
							/>
						</div>
					</div>

					<select
						value={selectedStatus}
						onChange={(e) => setSelectedStatus(e.target.value)}
						className={`inline-flex items-center px-3 py-2 rounded-full text-sm font-medium border-0 focus:outline-none focus:ring-2 focus:ring-green-500 ${getStatusColor(
							selectedStatus
						)}`}
					>
						<option value="all">All Orders</option>
						<option value="pending">Pending</option>
						<option value="confirmed">Confirmed</option>
						<option value="shipped">Shipped</option>
						<option value="delivered">Delivered</option>
					</select>
				</div>

				<CustomTable
					columns={columns}
					tableRow={filteredOrders}
					currentPage={currentPage}
					setCurrentPage={setCurrentPage}
				/>
			</div>
		</AdminLayout>
	);
};

export default AdminOrders;
