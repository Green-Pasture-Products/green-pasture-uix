import React, { useEffect, useState } from "react";
import { Search } from "lucide-react";

import { Customer, Order } from "@/types";
import { useAppDispatch, useAppSelector } from "@/_redux/store";
import AdminLayout from "@/_components/AdminLayout";
import { Column, CustomTable } from "@/_components/CustomTable";
import { getAllStaff } from "@/_redux/actions/user.action";
import { logger } from "@/_utils";

const Staff: React.FC = () => {
	const dispatch = useAppDispatch();
	const { orders } = useAppSelector((state) => state.admin);
	const { staff } = useAppSelector((state) => state.user);
	const [currentPage, setCurrentPage] = useState(1);
	const [searchTerm, setSearchTerm] = useState("");

	useEffect(() => {
		dispatch(getAllStaff());
	}, []);

	logger.log({ staff });

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

	const columns: Column<Customer>[] = [
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

	return (
		<AdminLayout>
			<div className="space-y-6">
				<div className="max-w-3xl">
					<div className="relative">
						<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
						<input
							type="text"
							placeholder="Search customers..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="vw-full pl-10 pr-10 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
						/>
					</div>
				</div>

				<CustomTable
					columns={columns}
					tableRow={filteredCustomers}
					currentPage={currentPage}
					setCurrentPage={setCurrentPage}
				/>
			</div>
		</AdminLayout>
	);
};

export default Staff;
