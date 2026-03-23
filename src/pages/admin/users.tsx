import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/router";
import withAdminAuth from "@/_components/withAdminAuth";

import { useAppDispatch, useAppSelector } from "@/_redux/store";
import { adminAction } from "@/_redux/actions/admin.action";
import AdminLayout from "@/_components/AdminLayout";
import { DataTable, Column } from "@/_UI/DataTable";
import ActionMenu from "@/_UI/ActionMenu";
import Badge from "@/_UI/Badge";

const VIEW_ICON = (
	<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
);

interface UserRecord {
	id: number;
	profile: {
		firstName: string;
		lastName: string;
		email: string;
		phoneNumber?: string;
		profileType?: string;
	};
	status: string;
	createdAt: string;
}

const Users: React.FC = () => {
	const router = useRouter();
	const dispatch = useAppDispatch();
	const { customers, customersLoading, customersPagination } = useAppSelector((state) => state.admin);
	const [currentPage, setCurrentPage] = useState(1);
	const [searchTerm, setSearchTerm] = useState("");

	useEffect(() => {
		dispatch(adminAction.fetchCustomersAsync({ page: currentPage, limit: 10, search: searchTerm || undefined }));
	}, [currentPage, searchTerm]);

	const handleSearch = useCallback((query: string) => {
		setSearchTerm(query);
		setCurrentPage(1);
	}, []);

	const handlePageChange = useCallback((page: number) => {
		setCurrentPage(page);
	}, []);

	const columns: Column<UserRecord>[] = [
		{
			key: "profile",
			header: "Name",
			render: (_value: any, row: UserRecord) => (
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
			render: (_value: any, row: UserRecord) => (
				<span className="text-sm text-gray-600 dark:text-gray-300">{row.profile?.email}</span>
			),
		},
		{
			key: "profile",
			header: "Phone",
			render: (_value: any, row: UserRecord) => (
				<span className="text-sm text-gray-600 dark:text-gray-300">{row.profile?.phoneNumber ?? "N/A"}</span>
			),
		},
		{
			key: "profile",
			header: "Role",
			render: (_value: any, row: UserRecord) => (
				<Badge variant="info">
					{row.profile?.profileType ?? "User"}
				</Badge>
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
				{/* Users Table */}
				<DataTable
					columns={columns}
					data={customers as unknown as UserRecord[]}
					isLoading={customersLoading}
					onSearch={handleSearch}
					searchPlaceholder="Search users..."
					pagination={customersPagination ?? undefined}
					onPageChange={handlePageChange}
					emptyMessage="No users found"
				/>
			</div>
		</AdminLayout>
	);
};

export default withAdminAuth(Users);
