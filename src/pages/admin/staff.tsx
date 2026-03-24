import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/router";
import withAdminAuth from "@/_components/withAdminAuth";
import { Plus } from "lucide-react";

import { BackendStaff } from "@/types";
import { useAppDispatch, useAppSelector } from "@/_redux/store";
import { adminAction } from "@/_redux/actions/admin.action";
import AdminLayout from "@/_components/AdminLayout";
import { DataTable, Column } from "@/_UI/DataTable";
import ActionMenu from "@/_UI/ActionMenu";
import Badge from "@/_UI/Badge";
import Button from "@/_UI/Button";

const VIEW_ICON = (
	<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
);

const Staff: React.FC = () => {
	const router = useRouter();
	const dispatch = useAppDispatch();
	const { staffList, staffLoading, staffPagination } = useAppSelector((state) => state.admin);
	const [currentPage, setCurrentPage] = useState(1);
	const [searchTerm, setSearchTerm] = useState("");

	useEffect(() => {
		dispatch(adminAction.fetchStaffAsync({ page: currentPage, limit: 10, search: searchTerm || undefined }));
	}, [currentPage, searchTerm]);

	const handleSearch = useCallback((query: string) => {
		setSearchTerm(query);
		setCurrentPage(1);
	}, []);

	const handlePageChange = useCallback((page: number) => {
		setCurrentPage(page);
	}, []);

	const columns: Column<BackendStaff>[] = [
		{
			key: "profile",
			header: "Name",
			render: (_value: any, row: BackendStaff) => (
				<span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
					{row.profile?.firstName} {row.profile?.lastName}
				</span>
			),
		},
		{
			key: "profile",
			header: "Email",
			maxWidth: "240px",
			truncate: true,
			render: (_value: any, row: BackendStaff) => (
				<span className="text-sm" style={{ color: "var(--text-secondary)" }}>{row.profile?.email}</span>
			),
		},
		{
			key: "profile",
			header: "Phone",
			render: (_value: any, row: BackendStaff) => (
				<span className="text-sm" style={{ color: "var(--text-secondary)" }}>{row.profile?.phoneNumber ?? "N/A"}</span>
			),
		},
		{
			key: "profile",
			header: "Role",
			render: (_value: any, row: BackendStaff) => (
				<Badge variant="info">
					{row.profile?.profileType ?? "Staff"}
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
					{ label: "View", icon: VIEW_ICON, onClick: () => router.push(`/admin/staff/${row.id}`) },
				]} />
			),
		},
	];

	return (
		<AdminLayout>
			<div className="animate-page-enter space-y-6">
				{/* Staff Table */}
				<DataTable
					columns={columns}
					data={staffList}
					isLoading={staffLoading}
					onSearch={handleSearch}
					searchPlaceholder="Search staff..."
					pagination={staffPagination ?? undefined}
					onPageChange={handlePageChange}
					onRowClick={(row) => router.push(`/admin/staff/${row.id}`)}
					actions={
						<Button variant="filled" leftIcon={Plus}>
							Add Staff
						</Button>
					}
					emptyMessage="No staff members found"
				/>
			</div>
		</AdminLayout>
	);
};

export default withAdminAuth(Staff);
