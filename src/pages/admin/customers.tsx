import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/router";
import withAdminAuth from "@/_components/withAdminAuth";

import { BackendCustomer } from "@/types";
import { useAppDispatch, useAppSelector } from "@/_redux/store";
import { adminAction } from "@/_redux/actions/admin.action";
import AdminLayout from "@/_components/AdminLayout";
import { DataTable, Column, FilterDef } from "@/_UI/DataTable";
import ActionMenu from "@/_UI/ActionMenu";
import Badge from "@/_UI/Badge";

const VIEW_ICON = (
	<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
);

const CUSTOMER_STATUS_FILTERS: FilterDef[] = [
	{
		key: "filter",
		label: "Status",
		options: [
			{ value: "A", label: "Active" },
			{ value: "I", label: "Inactive" },
		],
	},
];

const AdminCustomers: React.FC = () => {
	const router = useRouter();
	const dispatch = useAppDispatch();
	const { customers, customersLoading, customersPagination } = useAppSelector((state) => state.admin);
	const [currentPage, setCurrentPage] = useState(1);
	const [searchTerm, setSearchTerm] = useState("");
	const [filterValues, setFilterValues] = useState<Record<string, string>>({});

	useEffect(() => {
		dispatch(adminAction.fetchCustomersAsync({ page: currentPage, limit: 10, search: searchTerm || undefined }));
	}, [currentPage, searchTerm]);

	const handleSearch = useCallback((query: string) => {
		setSearchTerm(query);
		setCurrentPage(1);
	}, []);

	const handleFilterChange = useCallback((key: string, value: string) => {
		setFilterValues((prev) => ({ ...prev, [key]: value }));
	}, []);

	const handlePageChange = useCallback((page: number) => {
		setCurrentPage(page);
	}, []);

	const filteredCustomers = customers?.filter((customer: any) => {
		const statusFilter = filterValues.filter;
		if (!statusFilter) return true;
		if (statusFilter === "A") return customer.status === "ACTIVE";
		if (statusFilter === "I") return customer.status !== "ACTIVE";
		return true;
	});

	const columns: Column<BackendCustomer>[] = [
		{
			key: "profile",
			header: "Name",
			render: (_value: any, row: BackendCustomer) => (
				<div>
					<div className="text-sm font-medium text-on-surface dark:text-white">
						{row.profile?.firstName} {row.profile?.lastName}
					</div>
				</div>
			),
		},
		{
			key: "profile",
			header: "Email",
			render: (_value: any, row: BackendCustomer) => (
				<span className="text-sm text-gray-600 dark:text-gray-300">{row.profile?.email}</span>
			),
		},
		{
			key: "profile",
			header: "Phone",
			render: (_value: any, row: BackendCustomer) => (
				<span className="text-sm text-gray-600 dark:text-gray-300">{row.profile?.phoneNumber ?? "N/A"}</span>
			),
		},
		{
			key: "status",
			header: "Status",
			render: (value: any) => (
				<Badge variant={String(value) === "ACTIVE" ? "success" : "neutral"} dot>
					{String(value)}
				</Badge>
			),
		},
		{
			key: "createdAt",
			header: "Joined",
			render: (value: any) => (
				<span className="text-sm text-gray-500 dark:text-gray-400">
					{new Date(value).toLocaleDateString()}
				</span>
			),
		},
		{
			key: "id",
			header: "",
			width: "50px",
			align: "center" as const,
			render: (_: any, row: any) => (
				<ActionMenu items={[
					{ label: "View", icon: VIEW_ICON, onClick: () => router.push(`/admin/customer/${row.id}`) },
				]} />
			),
		},
	];

	return (
		<AdminLayout>
			<div className="animate-page-enter space-y-6">
				{/* Customers Table */}
				<DataTable
					columns={columns}
					data={filteredCustomers ?? []}
					isLoading={customersLoading}
					onSearch={handleSearch}
					searchPlaceholder="Search customers..."
					filters={CUSTOMER_STATUS_FILTERS}
					filterValues={filterValues}
					onFilterChange={handleFilterChange}
					pagination={customersPagination ?? undefined}
					onPageChange={handlePageChange}
					onRowClick={(row) => router.push(`/admin/customer/${row.id}`)}
					emptyMessage="No customers found"
				/>
			</div>
		</AdminLayout>
	);
};

export default withAdminAuth(AdminCustomers);
