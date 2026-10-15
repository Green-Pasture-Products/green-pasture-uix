import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import withAdminAuth from "@/_components/withAdminAuth";
import AdminLayout from "@/_components/AdminLayout";
import RecordActivity from "@/_components/RecordActivity";
import { BackButton, DetailHeader, DetailSection } from "@/_UI/DetailField";
import Badge from "@/_UI/Badge";
import Can from "@/_components/Can";
import { useHasPrivilege, useGrantableRoles } from "@/_hooks/usePrivilege";
import Button from "@/_UI/Button";
import Modal from "@/_UI/Modal";
import { FormInput } from "@/_UI/FormField";
import PhoneInput, { splitDialCode } from "@/_UI/PhoneInput";
import PageLoader from "@/_UI/PageLoader";
import toast from "react-hot-toast";
import axiosInstance from "@/_utils/axiosInstance";
import { BackendStaff } from "@/types";
import { Pencil, Power } from "lucide-react";
import * as changeCase from "change-case";
import { resolveRoleIdsForPatch } from "@/_utils/staffForm";

interface RoleOption {
	id: string;
	name: string;
}

const StaffDetail: React.FC = () => {
	const router = useRouter();
	const hasPrivilege = useHasPrivilege();
	const grantable = useGrantableRoles();
	const { id } = router.query;
	const [staff, setStaff] = useState<BackendStaff | null>(null);
	const [loading, setLoading] = useState(true);
	const [editingRoles, setEditingRoles] = useState(false);
	useEffect(() => {
		if (router.isReady && router.query.edit === "1" && hasPrivilege("MANAGE_STAFF")) setEditingRoles(true);
	}, [router.isReady, router.query.edit]);
	const [saving, setSaving] = useState(false);
	const [toggling, setToggling] = useState(false);
	const [statusModalOpen, setStatusModalOpen] = useState(false);
	const [roles, setRoles] = useState<RoleOption[]>([]);

	// Edit form state. phoneNumber holds LOCAL digits only — PhoneInput owns the
	// dial code, and the two are rejoined into E.164 on save.
	const [editForm, setEditForm] = useState({
		firstName: "",
		lastName: "",
		phoneNumber: "",
		roleIds: [] as string[],
	});
	const [phoneCountry, setPhoneCountry] = useState("NG");
	const phoneDialRef = useRef("+234");
	// The roles loaded from the server, so handleSave can tell "admin left the
	// same set checked" apart from "admin never touched the field" and only
	// send roleIds when the set actually changed (see resolveRoleIdsForPatch).
	const [initialRoleIds, setInitialRoleIds] = useState<string[]>([]);

	// `silent` refreshes in place after a save instead of swapping the page for the loader.
	const fetchStaff = (silent = false) => {
		if (!id) return;
		if (!silent) setLoading(true);
		axiosInstance
			.get(`staff/${id}`)
			.then((res) => {
				const data = res.data?.data ?? res.data;
				setStaff(data);
				if (data?.profile) {
					const roleIds = (data.profile.roles ?? []).map((r: RoleOption) => String(r.id));
					// PhoneInput works in local digits + a dial code, so split the stored E.164 value.
					const phone = splitDialCode(data.profile.phoneNumber);
					setPhoneCountry(phone.countryCode);
					setEditForm({
						firstName: data.profile.firstName || "",
						lastName: data.profile.lastName || "",
						phoneNumber: phone.local,
						roleIds,
					});
					setInitialRoleIds(roleIds);
				}
			})
			.catch(() => {
				setStaff(null);
				toast.error("Failed to load staff details");
			})
			.finally(() => {
				setLoading(false);
			});
	};

	useEffect(() => {
		if (!router.isReady || !id) return;
		fetchStaff();
	}, [id, router.isReady]);

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

	const handleSave = async () => {
		if (!id) return;
		if (editForm.roleIds.length === 0) {
			toast.error("Select at least one role");
			return;
		}
		setSaving(true);
		try {
			await axiosInstance.patch(`staff/${id}`, {
				firstName: editForm.firstName.trim(),
				lastName: editForm.lastName.trim(),
				phoneNumber: `${phoneDialRef.current}${editForm.phoneNumber}`,
				roleIds: resolveRoleIdsForPatch(editForm.roleIds, initialRoleIds),
			});
			toast.success("Staff updated successfully");
			setEditingRoles(false);
			fetchStaff(true);
		} catch (err: any) {
			toast.error(err?.response?.data?.message || "Failed to update staff");
		} finally {
			setSaving(false);
		}
	};

	const handleCancelRoles = () => {
		setEditingRoles(false);
		// initialRoleIds already reflects the server's value from the last fetch, which is what cancel reverts to.
		setEditForm((f) => ({ ...f, roleIds: initialRoleIds }));
	};

	const toggleRole = (roleId: string) => {
		setEditForm((f) => ({
			...f,
			roleIds: f.roleIds.includes(roleId) ? f.roleIds.filter((id) => id !== roleId) : [...f.roleIds, roleId],
		}));
	};

	const handleToggleStatus = async () => {
		if (!staff) return;
		setToggling(true);
		const endpoint = staff.status === "A" ? "staff/deactivate" : "staff/activate";
		try {
			await axiosInstance.patch(endpoint, { ids: [staff.id] });
			toast.success(staff.status === "A" ? "Staff deactivated" : "Staff activated");
			setStatusModalOpen(false);
			fetchStaff();
		} catch (err: any) {
			toast.error(err?.response?.data?.message || "Failed to update status");
		} finally {
			setToggling(false);
		}
	};

	const inputStyle = {
		border: "1px solid var(--border-light)",
		color: "var(--text-primary)",
		background: "var(--surface-paper)",
	};

	const staffTitle = staff
		? `${staff.profile?.firstName ?? ''} ${staff.profile?.lastName ?? ''}`.trim() || 'Staff Details'
		: 'Staff Details';

	if (loading) {
		return (
			<AdminLayout pageTitle={staffTitle}>
				<PageLoader fullScreen={false} message="Loading staff details..." />
			</AdminLayout>
		);
	}

	if (!staff) {
		return (
			<AdminLayout pageTitle={staffTitle}>
				<div className="max-w-4xl mx-auto space-y-5 animate-page-enter">
					<BackButton />
					<div
						className="rounded-xl px-6 py-16 text-center"
						style={{ background: "var(--surface-paper)", border: "1px solid var(--border-light)" }}
					>
						<p className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
							Staff member not found
						</p>
					</div>
				</div>
			</AdminLayout>
		);
	}

	const profile = staff.profile;
	const active = staff.status === "A";
	const heldRoles = profile?.roles ?? [];
	// Privileges are the union of every assigned role's permissions.
	const privileges = [...new Set(heldRoles.flatMap((r) => (r.permissions ?? []).map((p) => p.name)))].sort();
	const day = (iso?: string) => (iso ? new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "\u2014");
	const canManage = hasPrivilege("MANAGE_STAFF");
	const profileUnchanged =
		editForm.firstName === (profile?.firstName ?? "") &&
		editForm.lastName === (profile?.lastName ?? "") &&
		`${phoneDialRef.current}${editForm.phoneNumber}` === (profile?.phoneNumber ?? "");

	return (
		<AdminLayout pageTitle={staffTitle}>
			<div className="max-w-6xl mx-auto space-y-5 animate-page-enter">
				<BackButton />

				<DetailHeader
					title={staffTitle}
					subtitle={profile?.email}
					status={
						<Badge variant={active ? "success" : "neutral"} dot>
							{active ? "Active" : "Inactive"}
						</Badge>
					}
					actions={
						<Can privilege="MANAGE_STAFF">
							<Button variant="outlined" size="sm" onClick={() => (editingRoles ? handleCancelRoles() : setEditingRoles(true))}>
								<Pencil className="w-4 h-4 mr-1.5" />
								{editingRoles ? "Cancel" : "Edit roles"}
							</Button>
							<Button
								variant="outlined"
								size="sm"
								color={active ? "error" : "primary"}
								onClick={() => setStatusModalOpen(true)}
								loading={toggling}
								disabled={toggling}
							>
								<Power className="w-4 h-4 mr-1.5" />
								{active ? "Deactivate" : "Activate"}
							</Button>
						</Can>
					}
					metrics={[
						{ label: "Roles", value: heldRoles.length },
						{ label: "Privileges", value: privileges.length },
						{ label: "Added", value: day(staff.createdAt) },
						{ label: "Last updated", value: day(staff.updatedAt) },
					]}
				/>

				<div className="grid grid-cols-1 gap-5 lg:grid-cols-2 lg:items-start">
					<DetailSection title="Profile" description="The email address is the sign-in identity and cannot be changed.">
						<div className="grid grid-cols-1 gap-4 py-3">
							<FormInput
								label="First name"
								required
								value={editForm.firstName}
								disabled={!canManage}
								onChange={(e) => setEditForm((f) => ({ ...f, firstName: e.target.value }))}
							/>
							<FormInput
								label="Last name"
								required
								value={editForm.lastName}
								disabled={!canManage}
								onChange={(e) => setEditForm((f) => ({ ...f, lastName: e.target.value }))}
							/>
							<FormInput label="Email" type="email" value={profile?.email ?? ""} disabled />
							<fieldset disabled={!canManage} className="contents">
								<PhoneInput
									label="Phone number"
									defaultCountry={phoneCountry}
									value={editForm.phoneNumber}
									onChange={(local) => setEditForm((f) => ({ ...f, phoneNumber: local }))}
									onCountryChange={(dial) => (phoneDialRef.current = dial)}
								/>
							</fieldset>
							<Can privilege="MANAGE_STAFF">
								<div className="flex justify-end">
									<Button
										variant="filled"
										size="md"
										onClick={handleSave}
										loading={saving}
										disabled={saving || profileUnchanged || !editForm.firstName.trim() || !editForm.lastName.trim()}
									>
										Save changes
									</Button>
								</div>
							</Can>
						</div>
					</DetailSection>

					<DetailSection title="Roles & privileges" description="Privileges come from the assigned roles.">
						<div className="space-y-4 py-3">
							<div>
								<p className="text-muted-foreground mb-2 text-xs font-medium">Roles</p>
								{editingRoles ? (
									<div className="space-y-3">
										<div className="flex flex-wrap gap-x-6 gap-y-2">
											{grantable(roles, initialRoleIds).map((r) => {
												const roleId = String(r.id);
												return (
													<label key={roleId} className="flex cursor-pointer select-none items-center gap-2 text-sm" style={{ color: "var(--text-primary)" }}>
														<input
															type="checkbox"
															checked={editForm.roleIds.includes(roleId)}
															onChange={() => toggleRole(roleId)}
															className="h-4 w-4 cursor-pointer rounded"
														/>
														{r.name}
													</label>
												);
											})}
										</div>
										{editForm.roleIds.length === 0 && <p className="text-xs text-red-500">At least one role is required.</p>}
										<div className="flex justify-end gap-2">
											<Button variant="outlined" color="secondary" size="sm" onClick={handleCancelRoles}>
												Cancel
											</Button>
											<Button variant="filled" size="sm" onClick={handleSave} loading={saving} disabled={saving || editForm.roleIds.length === 0}>
												Save roles
											</Button>
										</div>
									</div>
								) : (
									<div className="flex flex-wrap gap-2">
										{heldRoles.length ? (
											heldRoles.map((r) => (
												<Badge key={r.id} variant="neutral">
													<span className="font-mono text-xs uppercase">{r.name}</span>
												</Badge>
											))
										) : (
											<span className="text-muted-foreground text-sm">No roles assigned</span>
										)}
									</div>
								)}
							</div>

							<div>
								<p className="text-muted-foreground mb-2 text-xs font-medium">Effective privileges ({privileges.length})</p>
								{privileges.length ? (
									<div className="flex max-h-[28rem] flex-wrap gap-2 overflow-y-auto">
										{privileges.map((p) => (
											<span key={p} className="bg-secondary text-secondary-foreground rounded-full px-2.5 py-1 font-mono text-[11px] font-semibold">
												{p}
											</span>
										))}
									</div>
								) : (
									<span className="text-muted-foreground text-sm">None</span>
								)}
							</div>
						</div>
					</DetailSection>
				</div>
			</div>

			{/* Status Confirmation Modal */}
			<Modal
				isOpen={statusModalOpen}
				onClose={() => setStatusModalOpen(false)}
				title={`${staff?.status === "A" ? "Deactivate" : "Activate"} Staff`}
				size="sm"
			>
				<div className="space-y-4">
					<p className="text-sm text-gray-600 dark:text-gray-300">
						Are you sure you want to {staff?.status === "A" ? "deactivate" : "activate"}{" "}
						<span className="font-semibold text-on-surface dark:text-white">
							{profile?.firstName} {profile?.lastName}
						</span>?
					</p>
					<div className="flex justify-end gap-3">
						<Button variant="outlined" color="secondary" size="sm" onClick={() => setStatusModalOpen(false)}>
							Cancel
						</Button>
						<Button
							variant="filled"
							color={staff?.status === "A" ? "error" : "primary"}
							size="sm"
							loading={toggling}
							onClick={handleToggleStatus}
						>
							{staff?.status === "A" ? "Deactivate" : "Activate"}
						</Button>
					</div>
				</div>
			</Modal>
			<RecordActivity type="Staff" id={staff?.id} />
		</AdminLayout>
	);
};

export default withAdminAuth(StaffDetail);
