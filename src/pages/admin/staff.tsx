import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/router";
import withAdminAuth from "@/_components/withAdminAuth";
import { Plus } from "lucide-react";
import toast from "react-hot-toast";

import { BackendStaff } from "@/types";
import { useAppDispatch, useAppSelector } from "@/_redux/store";
import { adminAction } from "@/_redux/actions/admin.action";
import AdminLayout from "@/_components/AdminLayout";
import { DataTable, Column } from "@/_UI/DataTable";
import ActionMenu from "@/_UI/ActionMenu";
import Badge from "@/_UI/Badge";
import Button from "@/_UI/Button";
import Modal from "@/_UI/Modal";
import { FormInput } from "@/_UI/FormField";
import FormSelectDropdown from "@/_UI/FormSelect";
import axiosInstance from "@/_utils/axiosInstance";
import * as changeCase from "change-case";
import { useListParams } from "@/_hooks/useListParams";

const VIEW_ICON = (
	<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
);

const STATUS_ICON = (
	<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18.36 6.64a9 9 0 1 1-12.73 0"/><line x1="12" y1="2" x2="12" y2="12"/></svg>
);

const DELETE_ICON = (
	<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
);

interface RoleOption {
	id: number;
	name: string;
}

const Staff: React.FC = () => {
	const router = useRouter();
	const dispatch = useAppDispatch();
	const { staffList, staffLoading, staffPagination } = useAppSelector((state) => state.admin);
	const { page: currentPage, pageSize, search: searchTerm, setPage, setSearch, setPageSize } = useListParams();

	// Status / delete modal state
	const [statusTarget, setStatusTarget] = useState<any>(null);
	const [deleteTarget, setDeleteTarget] = useState<any>(null);
	const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);

	// Onboard modal state
	const [showOnboard, setShowOnboard] = useState(false);
	const [onboarding, setOnboarding] = useState(false);
	const [roles, setRoles] = useState<RoleOption[]>([]);
	const [onboardForm, setOnboardForm] = useState({
		firstName: "",
		lastName: "",
		email: "",
		phoneNumber: "",
		roleId: "",
	});
	const [onboardErrors, setOnboardErrors] = useState<Record<string, string>>({});

	useEffect(() => {
		dispatch(adminAction.fetchStaffAsync({ page: currentPage, limit: pageSize, search: searchTerm || undefined }));
	}, [currentPage, searchTerm, pageSize]);

	// Fetch roles on mount
	useEffect(() => {
		axiosInstance
			.get("role/all")
			.then((res) => {
				const data = res.data?.data;
				if (Array.isArray(data)) {
					setRoles(data.map((r: any) => ({ id: r.id, name: changeCase.capitalCase(r.name) })));
				}
			})
			.catch(() => {});
	}, []);

	const validateOnboardForm = () => {
		const errors: Record<string, string> = {};
		if (!onboardForm.firstName.trim()) errors.firstName = "First name is required";
		if (!onboardForm.lastName.trim()) errors.lastName = "Last name is required";
		if (!onboardForm.email.trim()) errors.email = "Email is required";
		else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(onboardForm.email)) errors.email = "Invalid email address";
		if (!onboardForm.phoneNumber.trim()) errors.phoneNumber = "Phone number is required";
		if (!onboardForm.roleId) errors.roleId = "Role is required";
		setOnboardErrors(errors);
		return Object.keys(errors).length === 0;
	};

	const handleOnboard = async () => {
		if (!validateOnboardForm()) return;
		setOnboarding(true);
		try {
			await axiosInstance.post("staff/onboard", {
				firstName: onboardForm.firstName.trim(),
				lastName: onboardForm.lastName.trim(),
				email: onboardForm.email.trim(),
				phoneNumber: onboardForm.phoneNumber.trim(),
				roleId: Number(onboardForm.roleId),
			});
			toast.success("Staff onboarded successfully");
			setShowOnboard(false);
			setOnboardForm({ firstName: "", lastName: "", email: "", phoneNumber: "", roleId: "" });
			setOnboardErrors({});
			dispatch(adminAction.fetchStaffAsync({ page: currentPage, limit: pageSize, search: searchTerm || undefined }));
		} catch (err: any) {
			toast.error(err?.response?.data?.message || "Failed to onboard staff");
		} finally {
			setOnboarding(false);
		}
	};

	const handleStatusUpdate = async () => {
		if (!statusTarget) return;
		const isActive = statusTarget.status === "ACTIVE";
		setIsUpdatingStatus(true);
		try {
			await dispatch(adminAction.updateStaffStatusAsync({
				id: statusTarget.id,
				activate: !isActive,
			})).unwrap();
			toast.success(`Staff ${isActive ? "deactivated" : "activated"} successfully`);
			setStatusTarget(null);
		} catch (error: any) {
			toast.error(error || "Failed to update staff status");
		} finally {
			setIsUpdatingStatus(false);
		}
	};

	const handleDelete = async () => {
		if (!deleteTarget) return;
		setIsDeleting(true);
		try {
			await dispatch(adminAction.deleteStaffAsync(deleteTarget.id)).unwrap();
			toast.success("Staff deleted successfully");
			setDeleteTarget(null);
		} catch (error: any) {
			toast.error(error || "Failed to delete staff");
		} finally {
			setIsDeleting(false);
		}
	};

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
					{changeCase.capitalCase(row.profile?.role?.name ?? "Staff")}
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
					{new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
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
					{
						label: row.status === "ACTIVE" ? "Deactivate" : "Activate",
						icon: STATUS_ICON,
						onClick: () => setStatusTarget(row),
					},
					{ label: "Delete", icon: DELETE_ICON, onClick: () => setDeleteTarget(row), variant: "danger" as const },
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
					onSearch={setSearch}
					initialSearch={searchTerm}
					searchPlaceholder="Search staff..."
					pagination={staffPagination ?? undefined}
					onPageChange={setPage}
					onPageSizeChange={setPageSize}
					onRowClick={(row) => router.push(`/admin/staff/${row.id}`)}
					actions={
						<Button variant="filled" leftIcon={Plus} onClick={() => setShowOnboard(true)}>
							Add Staff
						</Button>
					}
					emptyMessage="No staff members found"
				/>

				{/* Onboard Staff Modal */}
				<Modal
					isOpen={showOnboard}
					onClose={() => { setShowOnboard(false); setOnboardErrors({}); }}
					title="Onboard New Staff"
					subtitle="Add a new staff member to the team"
					size="md"
				>
					<div className="space-y-4 pb-56">
						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
							<FormInput
								label="First Name"
								placeholder="Enter first name"
								required
								value={onboardForm.firstName}
								onChange={(e: any) => setOnboardForm((f) => ({ ...f, firstName: e.target.value }))}
								error={onboardErrors.firstName}
							/>
							<FormInput
								label="Last Name"
								placeholder="Enter last name"
								required
								value={onboardForm.lastName}
								onChange={(e: any) => setOnboardForm((f) => ({ ...f, lastName: e.target.value }))}
								error={onboardErrors.lastName}
							/>
						</div>
						<FormInput
							label="Email"
							type="email"
							placeholder="staff@example.com"
							required
							value={onboardForm.email}
							onChange={(e: any) => setOnboardForm((f) => ({ ...f, email: e.target.value }))}
							error={onboardErrors.email}
						/>
						<FormInput
							label="Phone Number"
							placeholder="Enter phone number"
							required
							value={onboardForm.phoneNumber}
							onChange={(e: any) => setOnboardForm((f) => ({ ...f, phoneNumber: e.target.value }))}
							error={onboardErrors.phoneNumber}
						/>
						<FormSelectDropdown
							label="Role"
							required
							placeholder="Select a role"
							value={onboardForm.roleId}
							onChange={(val) => setOnboardForm((f) => ({ ...f, roleId: val }))}
							options={roles.map((r) => ({ value: String(r.id), label: r.name }))}
							error={onboardErrors.roleId}
						/>
						<div className="flex justify-end gap-3 pt-4" style={{ borderTop: "1px solid var(--border-light)" }}>
							<Button
								variant="outlined"
								color="secondary"
								size="sm"
								onClick={() => { setShowOnboard(false); setOnboardErrors({}); }}
							>
								Cancel
							</Button>
							<Button
								variant="filled"
								size="sm"
								loading={onboarding}
								disabled={onboarding}
								onClick={handleOnboard}
							>
								Onboard Staff
							</Button>
						</div>
					</div>
				</Modal>

				{/* Status Confirmation Modal */}
				<Modal
					isOpen={!!statusTarget}
					onClose={() => setStatusTarget(null)}
					title={`${statusTarget?.status === "ACTIVE" ? "Deactivate" : "Activate"} Staff`}
					size="sm"
				>
					<div className="space-y-4">
						<p className="text-sm text-gray-600 dark:text-gray-300">
							Are you sure you want to {statusTarget?.status === "ACTIVE" ? "deactivate" : "activate"}{" "}
							<span className="font-semibold text-on-surface dark:text-white">
								{statusTarget?.profile?.firstName} {statusTarget?.profile?.lastName}
							</span>?
						</p>
						<div className="flex justify-end gap-3">
							<Button variant="outlined" color="secondary" size="sm" onClick={() => setStatusTarget(null)}>
								Cancel
							</Button>
							<Button
								variant="filled"
								color={statusTarget?.status === "ACTIVE" ? "error" : "primary"}
								size="sm"
								loading={isUpdatingStatus}
								onClick={handleStatusUpdate}
							>
								{statusTarget?.status === "ACTIVE" ? "Deactivate" : "Activate"}
							</Button>
						</div>
					</div>
				</Modal>

				{/* Delete Confirmation Modal */}
				<Modal
					isOpen={!!deleteTarget}
					onClose={() => setDeleteTarget(null)}
					title="Delete Staff"
					size="sm"
				>
					<div className="space-y-4">
						<p className="text-sm text-gray-600 dark:text-gray-300">
							Are you sure you want to delete{" "}
							<span className="font-semibold text-on-surface dark:text-white">
								{deleteTarget?.profile?.firstName} {deleteTarget?.profile?.lastName}
							</span>?
							This action cannot be undone.
						</p>
						<div className="flex justify-end gap-3">
							<Button variant="outlined" color="secondary" size="sm" onClick={() => setDeleteTarget(null)}>
								Cancel
							</Button>
							<Button variant="filled" color="error" size="sm" loading={isDeleting} onClick={handleDelete}>
								Delete
							</Button>
						</div>
					</div>
				</Modal>
			</div>
		</AdminLayout>
	);
};

export default withAdminAuth(Staff);
