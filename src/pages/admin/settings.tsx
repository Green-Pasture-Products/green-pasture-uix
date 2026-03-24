import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import withAdminAuth from "@/_components/withAdminAuth";
import { Store, User, Shield } from "lucide-react";

import { useAppSelector } from "@/_redux/store";
import AdminLayout from "@/_components/AdminLayout";
import axiosInstance from "@/_utils/axiosInstance";
import { FormInput, FormActions } from "@/_UI/FormField";
import PageLoader from "@/_UI/PageLoader";

// ── Schemas ──

const storeSchema = z.object({
	name: z.string().min(1, "Store name is required"),
	houseAddress: z.string().optional(),
	city: z.string().optional(),
	state: z.string().optional(),
	country: z.string().optional(),
	postalCode: z.string().optional(),
});

const profileSchema = z.object({
	firstName: z.string().min(1, "First name is required"),
	lastName: z.string().min(1, "Last name is required"),
	phoneNumber: z.string().optional(),
});

const passwordSchema = z
	.object({
		currentPassword: z.string().min(1, "Current password is required"),
		newPassword: z.string().min(8, "Minimum 8 characters"),
		confirmPassword: z.string().min(1, "Please confirm"),
	})
	.refine((d) => d.newPassword === d.confirmPassword, {
		message: "Passwords don't match",
		path: ["confirmPassword"],
	});

type StoreFormData = z.infer<typeof storeSchema>;
type ProfileFormData = z.infer<typeof profileSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

const CARD =
	"rounded-xl bg-white dark:bg-white/[0.04] border border-[rgba(22,163,74,0.06)] dark:border-white/8 shadow-sm dark:shadow-none transition-all duration-300";

const AdminSettings: React.FC = () => {
	const { user } = useAppSelector((state) => state.auth);
	const [activeTab, setActiveTab] = useState("store");
	const [loading, setLoading] = useState(true);
	const [storeId, setStoreId] = useState<number | null>(null);
	const [storeData, setStoreData] = useState<any>(null);
	const [savingStore, setSavingStore] = useState(false);
	const [savingProfile, setSavingProfile] = useState(false);
	const [savingPassword, setSavingPassword] = useState(false);

	const tabs = [
		{ id: "store", name: "Store Settings", icon: Store },
		{ id: "profile", name: "My Profile", icon: User },
		{ id: "security", name: "Security", icon: Shield },
	];

	const storeForm = useForm<StoreFormData>({ resolver: zodResolver(storeSchema) });
	const profileForm = useForm<ProfileFormData>({ resolver: zodResolver(profileSchema) });
	const passwordForm = useForm<PasswordFormData>({ resolver: zodResolver(passwordSchema) });

	// ── Fetch data on mount ──
	useEffect(() => {
		const fetchData = async () => {
			setLoading(true);
			try {
				// Fetch store
				try {
					const storeRes = await axiosInstance.get("store/1");
					const s = storeRes.data?.data;
					if (s) {
						setStoreData(s);
						setStoreId(s.id);
						storeForm.reset({
							name: s.name || "",
							houseAddress: s.address?.houseAddress || "",
							city: s.address?.city || "",
							state: s.address?.state || "",
							country: s.address?.country || "",
							postalCode: s.address?.postalCode || "",
						});
					}
				} catch { /* store may not exist yet */ }

				// Fetch profile
				try {
					const profileRes = await axiosInstance.get("profile");
					const p = profileRes.data?.data;
					if (p) {
						profileForm.reset({
							firstName: p.firstName || "",
							lastName: p.lastName || "",
							phoneNumber: p.phoneNumber || "",
						});
					}
				} catch {
					if (user) {
						profileForm.reset({
							firstName: user.firstName || "",
							lastName: user.lastName || "",
							phoneNumber: user.phoneNumber || "",
						});
					}
				}
			} finally {
				setLoading(false);
			}
		};
		fetchData();
	}, []); // eslint-disable-line react-hooks/exhaustive-deps

	// ── Save handlers ──
	const onSaveStore = async (data: StoreFormData) => {
		setSavingStore(true);
		try {
			const payload = {
				name: data.name,
				address: {
					houseAddress: data.houseAddress || "",
					city: data.city || "",
					state: data.state || "",
					country: data.country || "",
					postalCode: data.postalCode || "",
					latitude: storeData?.address?.latitude || "0",
					longitude: storeData?.address?.longitude || "0",
					region: data.state || "",
				},
			};
			if (storeId) {
				await axiosInstance.patch(`store/update/${storeId}`, payload);
				toast.success("Store settings updated");
			} else {
				const res = await axiosInstance.post("store/create", payload);
				setStoreId(res.data?.data?.id || 1);
				toast.success("Store created successfully");
			}
		} catch (err: any) {
			toast.error(err?.response?.data?.message || "Failed to save");
		} finally {
			setSavingStore(false);
		}
	};

	const onSaveProfile = async (data: ProfileFormData) => {
		setSavingProfile(true);
		try {
			await axiosInstance.patch("profile", data);
			toast.success("Profile updated");
		} catch (err: any) {
			toast.error(err?.response?.data?.message || "Failed to update");
		} finally {
			setSavingProfile(false);
		}
	};

	const onChangePassword = async (data: PasswordFormData) => {
		setSavingPassword(true);
		try {
			await axiosInstance.patch("profile", { password: data.newPassword });
			toast.success("Password updated");
			passwordForm.reset();
		} catch (err: any) {
			toast.error(err?.response?.data?.message || "Failed to change password");
		} finally {
			setSavingPassword(false);
		}
	};

	if (loading) {
		return (
			<AdminLayout>
				<PageLoader fullScreen={false} message="Loading settings..." />
			</AdminLayout>
		);
	}

	return (
		<AdminLayout>
			<div className="animate-page-enter space-y-6">
				<div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
					{/* Sidebar Tabs */}
					<div className="lg:col-span-1">
						<div className={`${CARD} p-2`}>
							<nav className="space-y-1">
								{tabs.map((tab) => {
									const Icon = tab.icon;
									const isActive = activeTab === tab.id;
									return (
										<button
											key={tab.id}
											onClick={() => setActiveTab(tab.id)}
											className="w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 cursor-pointer"
											style={{
												background: isActive ? "rgba(22,163,74,0.08)" : "transparent",
												color: isActive ? "var(--color-primary)" : "var(--text-secondary)",
											}}
											onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = "var(--surface-low)"; }}
											onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
										>
											<Icon className="mr-3 h-4 w-4" />
											{tab.name}
										</button>
									);
								})}
							</nav>
						</div>
					</div>

					{/* Content */}
					<div className="lg:col-span-3">
						{/* ── Store Settings ── */}
						{activeTab === "store" && (
							<div className={CARD}>
								<div className="px-6 py-4" style={{ borderBottom: "1px solid var(--border-light)" }}>
									<h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Store Settings</h3>
									<p className="text-xs mt-0.5" style={{ color: "var(--text-hint)" }}>Manage your store information and address</p>
								</div>
								<form onSubmit={storeForm.handleSubmit(onSaveStore)} className="p-6 space-y-4">
									<FormInput label="Store Name" placeholder="Green Pasture Organics" required {...storeForm.register("name")} error={storeForm.formState.errors.name?.message} />
									<FormInput label="Street Address" placeholder="123 Main Street" {...storeForm.register("houseAddress")} />
									<div className="grid grid-cols-2 gap-4">
										<FormInput label="City" placeholder="Lagos" {...storeForm.register("city")} />
										<FormInput label="State" placeholder="Lagos" {...storeForm.register("state")} />
									</div>
									<div className="grid grid-cols-2 gap-4">
										<FormInput label="Country" placeholder="Nigeria" {...storeForm.register("country")} />
										<FormInput label="Postal Code" placeholder="100001" {...storeForm.register("postalCode")} />
									</div>
									<FormActions onCancel={() => storeForm.reset()} cancelLabel="Reset" submitLabel={storeId ? "Update Store" : "Create Store"} isSubmitting={savingStore} />
								</form>
							</div>
						)}

						{/* ── Profile Settings ── */}
						{activeTab === "profile" && (
							<div className={CARD}>
								<div className="px-6 py-4" style={{ borderBottom: "1px solid var(--border-light)" }}>
									<h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>My Profile</h3>
									<p className="text-xs mt-0.5" style={{ color: "var(--text-hint)" }}>Update your personal information</p>
								</div>
								<form onSubmit={profileForm.handleSubmit(onSaveProfile)} className="p-6 space-y-4">
									<div className="grid grid-cols-2 gap-4">
										<FormInput label="First Name" required {...profileForm.register("firstName")} error={profileForm.formState.errors.firstName?.message} />
										<FormInput label="Last Name" required {...profileForm.register("lastName")} error={profileForm.formState.errors.lastName?.message} />
									</div>
									<FormInput label="Phone Number" type="tel" placeholder="+234..." {...profileForm.register("phoneNumber")} />
									<FormInput label="Email" value={user?.email || ""} disabled />
									<FormInput label="Role" value={user?.profileType || "STAFF"} disabled />
									<FormActions onCancel={() => profileForm.reset()} cancelLabel="Reset" submitLabel="Update Profile" isSubmitting={savingProfile} />
								</form>
							</div>
						)}

						{/* ── Security ── */}
						{activeTab === "security" && (
							<div className={CARD}>
								<div className="px-6 py-4" style={{ borderBottom: "1px solid var(--border-light)" }}>
									<h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Change Password</h3>
									<p className="text-xs mt-0.5" style={{ color: "var(--text-hint)" }}>Update your account password</p>
								</div>
								<form onSubmit={passwordForm.handleSubmit(onChangePassword)} className="p-6 space-y-4 max-w-md">
									<FormInput label="Current Password" type="password" placeholder="Enter current password" required {...passwordForm.register("currentPassword")} error={passwordForm.formState.errors.currentPassword?.message} />
									<FormInput label="New Password" type="password" placeholder="Enter new password" required {...passwordForm.register("newPassword")} error={passwordForm.formState.errors.newPassword?.message} />
									<FormInput label="Confirm New Password" type="password" placeholder="Confirm new password" required {...passwordForm.register("confirmPassword")} error={passwordForm.formState.errors.confirmPassword?.message} />
									<FormActions onCancel={() => passwordForm.reset()} cancelLabel="Cancel" submitLabel="Update Password" isSubmitting={savingPassword} />
								</form>
							</div>
						)}
					</div>
				</div>
			</div>
		</AdminLayout>
	);
};

export default withAdminAuth(AdminSettings);
