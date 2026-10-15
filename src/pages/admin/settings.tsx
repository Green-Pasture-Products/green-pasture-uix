import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import Link from "next/link";
import withAdminAuth from "@/_components/withAdminAuth";
import { Store, Plus, Trash2, MapPin, Check, Circle, Sun, Moon, Monitor } from "lucide-react";
import { useTheme } from "@/_hooks/useTheme";
import { SettingsFrame, useSettingsTabs } from "@/_components/SettingsFrame";
import { cn } from "@/lib/utils";

import { useAppSelector } from "@/_redux/store";
import { useHasPrivilege } from "@/_hooks/usePrivilege";
import AdminLayout from "@/_components/AdminLayout";
import axiosInstance from "@/_utils/axiosInstance";
import { FormInput } from "@/_UI/FormField";
import Button from "@/_UI/Button";
import Badge from "@/_UI/Badge";
import { DetailSection } from "@/_UI/DetailField";
import { Switch } from "@/components/egfm/switch";
import { PanelHeading, SettingsSaveBar } from "@/_components/SettingsParts";
import PageLoader from "@/_UI/PageLoader";
import CurrencyInput from "@/_UI/CurrencyInput";
import { rateToPercent, percentToRate } from "@/_utils/rate";
import NumberInput from "@/_UI/NumberInput";
import ChipAutocomplete from "@/_UI/ChipAutocomplete";
import { NIGERIAN_STATES } from "@/_utils/nigerianStates";
import PhoneInput from "@/_UI/PhoneInput";

// ── Schemas ──

const storeSchema = z.object({
	name: z.string().min(1, "Store name is required"),
	houseAddress: z.string().optional(),
	city: z.string().optional(),
	state: z.string().optional(),
	country: z.string().optional(),
	postalCode: z.string().optional(),
});

const orderShippingSchema = z.object({
	// Entered as a percentage (7.5), persisted as a fraction (0.075). The bound
	// matters: this field used to show the raw fraction next to a "%" suffix, so
	// "0.075 %" invited an admin to "correct" it to 7.5 — which saved a rate of
	// 7.5 and charged 750% tax.
	taxRate: z
		.string()
		.min(1, "Tax rate is required")
		.refine((v) => !Number.isNaN(Number(v)), "Enter a number")
		.refine((v) => Number(v) >= 0 && Number(v) <= 100, "Must be between 0 and 100"),
	freeShippingThreshold: z.string().min(1, "Required"),
});

type OrderShippingFormData = z.infer<typeof orderShippingSchema>;

interface ShippingMethod {
	// Stable React key / update-remove handle — never changes after creation,
	// unlike `id` which is re-derived from the name while the method is new.
	key: string;
	id: string;
	name: string;
	baseCost: string;
	estimatedDays: string;
	enabled: boolean;
	// True only for methods added in this session, so `id` keeps mirroring the
	// name as the admin types. Methods loaded from the store keep whatever id
	// they were saved with — renaming an already-saved method must not change
	// its id out from under checkout.
	autoId: boolean;
}

// "Next Day Delivery" -> "next-day-delivery". Falls back to the caller's
// existing id when the name has no sluggable characters (e.g. empty, or
// symbols only) so an id is never blanked out.
const slugify = (value: string): string =>
	value
		.trim()
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "");

const profileSchema = z.object({
	firstName: z.string().min(1, "First name is required"),
	lastName: z.string().min(1, "Last name is required"),
	phoneNumber: z.string().optional(),
});

const passwordSchema = z
	.object({
		currentPassword: z.string().min(1, "Current password is required"),
		newPassword: z
			.string()
			.min(8, "Minimum 8 characters")
			.regex(
				/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
				"Must contain an uppercase letter, a lowercase letter, and a number"
			),
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

const THEME_OPTIONS = [
	{ value: "light", label: "Light", icon: Sun },
	{ value: "dark", label: "Dark", icon: Moon },
	{ value: "system", label: "Auto", icon: Monitor },
] as const;

/** Theme choice, saved on this device (same control as the account menu). */
const AppearanceCard: React.FC = () => {
	const { preference, setPreference } = useTheme();
	return (
		<DetailSection title={<h3>Appearance</h3>} description="Saved on this device">
			<div className="py-3">
				<div className="bg-secondary/50 grid grid-cols-3 gap-1 rounded-xl border p-1" role="radiogroup" aria-label="Theme">
					{THEME_OPTIONS.map(({ value, label, icon: Icon }) => (
						<button
							key={value}
							type="button"
							role="radio"
							aria-checked={preference === value}
							onClick={() => setPreference(value)}
							className={cn(
								"flex items-center justify-center gap-1.5 rounded-lg border py-2 text-xs font-semibold transition-colors",
								preference === value ? "bg-brand/20 dark:bg-accent border-brand/40 font-bold shadow-2xs" : "text-muted-foreground hover:bg-background/60 border-transparent",
							)}
						>
							<Icon className="size-3.5" /> {label}
						</button>
					))}
				</div>
			</div>
		</DetailSection>
	);
};

/** The user's roles and what they let them do, read-only. */
const RoleAccessCard: React.FC<{ user: any }> = ({ user }) => {
	const [showAll, setShowAll] = useState(false);
	const roles: { name: string; permissions?: { name: string }[] }[] = user?.roles ?? [];
	const privileges = [...new Set(roles.flatMap((r) => (r.permissions ?? []).map((p) => p.name)))].sort();
	const fullAccess = privileges.includes("SUPER_ADMIN");
	const shown = showAll ? privileges : privileges.slice(0, 12);
	return (
		<DetailSection title="Role & access" description="What your account can do. An administrator changes this.">
			<div className="space-y-5 py-3">
				<div>
					<p className="mb-2 text-xs font-medium" style={{ color: "var(--text-hint)" }}>
						Roles
					</p>
					<div className="flex flex-wrap items-center gap-2">
						{roles.length ? (
							roles.map((r) => (
								<Badge key={r.name} variant="info">
									<span className="font-mono text-xs uppercase">{r.name}</span>
								</Badge>
							))
						) : (
							<span className="text-sm" style={{ color: "var(--text-hint)" }}>
								No roles assigned
							</span>
						)}
						<Badge variant="neutral">{String(user?.profileType ?? "STAFF").charAt(0) + String(user?.profileType ?? "STAFF").slice(1).toLowerCase()} account</Badge>
					</div>
				</div>
				<div>
					<p className="mb-2 text-xs font-medium" style={{ color: "var(--text-hint)" }}>
						{fullAccess ? "Access" : `Privileges (${privileges.length})`}
					</p>
					{fullAccess ? (
						<p className="text-sm" style={{ color: "var(--text-primary)" }}>
							Full access to everything in the console.
						</p>
					) : privileges.length ? (
						<>
							<div className="flex flex-wrap gap-2">
								{shown.map((p) => (
									<span key={p} className="bg-secondary text-secondary-foreground rounded-full px-2.5 py-1 font-mono text-[11px] font-semibold tracking-wide">
										{p}
									</span>
								))}
							</div>
							{privileges.length > 12 && (
								<button type="button" onClick={() => setShowAll((v) => !v)} className="mt-3 text-xs font-semibold" style={{ color: "var(--color-primary)" }}>
									{showAll ? "Show fewer" : `Show all ${privileges.length}`}
								</button>
							)}
						</>
					) : (
						<span className="text-sm" style={{ color: "var(--text-hint)" }}>
							None
						</span>
					)}
				</div>
			</div>
		</DetailSection>
	);
};

/** One line of the password checklist: ticks off as the new password meets it. */
const PasswordRule: React.FC<{ ok: boolean; label: string }> = ({ ok, label }) => (
	<li className="flex items-center gap-2 text-sm transition-colors" style={{ color: ok ? "var(--text-primary)" : "var(--text-hint)" }}>
		{ok ? <Check className="size-4 shrink-0" style={{ color: "var(--color-primary)" }} /> : <Circle className="size-4 shrink-0 opacity-50" />}
		{label}
	</li>
);

const AdminSettings: React.FC = () => {
	const { user } = useAppSelector((state) => state.auth);
	const hasPrivilege = useHasPrivilege();
	// Store Settings and Order & Shipping are store-scoped; a STAFF user without
	// MANAGE_STORES still needs My Profile and Security, so those two tabs hide
	// instead of the whole nav item (see modules.ts for the ungated nav entry).
	const canManageStores = hasPrivilege("MANAGE_STORES");
	const router = useRouter();
	const [activeTab, setActiveTab] = useState(() => (canManageStores ? "store" : "profile"));
	const [loading, setLoading] = useState(true);
	const [storeId, setStoreId] = useState<string | null>(null);
	const [storeData, setStoreData] = useState<any>(null);
	const [savingStore, setSavingStore] = useState(false);
	const [savingProfile, setSavingProfile] = useState(false);
	const [savingPassword, setSavingPassword] = useState(false);

	const [savingOrderShipping, setSavingOrderShipping] = useState(false);
	const [freeShippingRegions, setFreeShippingRegions] = useState<string[]>([]);
	const [shippingMethods, setShippingMethods] = useState<ShippingMethod[]>([
		{ key: "standard", id: "standard", name: "Standard Shipping", baseCost: "0", estimatedDays: "5-7 business days", enabled: true, autoId: true },
	]);

	const tabs = useSettingsTabs().filter((t) => !t.href);

	// Deep links from the account menu: /admin/settings?tab=profile | security
	const requestedTab = router.isReady ? (router.query.tab as string | undefined) : undefined;
	useEffect(() => {
		if (requestedTab && tabs.some((t) => t.id === requestedTab)) setActiveTab(requestedTab);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [requestedTab]);

	const storeForm = useForm<StoreFormData>({ resolver: zodResolver(storeSchema) });
	const orderShippingForm = useForm<OrderShippingFormData>({ resolver: zodResolver(orderShippingSchema) });
	const profileForm = useForm<ProfileFormData>({ resolver: zodResolver(profileSchema) });
	const passwordForm = useForm<PasswordFormData>({ resolver: zodResolver(passwordSchema) });

	// ── Fetch data on mount ──
	useEffect(() => {
		const fetchData = async () => {
			setLoading(true);
			try {
				// Fetch store
				try {
					const storeRes = await axiosInstance.get("store/settings");
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
						orderShippingForm.reset({
							taxRate: String(rateToPercent(Number(s.orderSettings?.taxRate ?? 0))),
							freeShippingThreshold: String(s.orderSettings?.freeShippingThreshold ?? "0"),
						});
						setFreeShippingRegions(s.orderSettings?.freeShippingRegions ?? []);
						if (s.shippingConfig?.methods?.length > 0) {
							setShippingMethods(
								s.shippingConfig.methods.map((m: any, index: number) => {
									// Backfill once for legacy rows saved without an id — not
									// auto-synced afterward, so editing the name later can't
									// change the id of a method that's already live.
									const id = m.id || slugify(m.name || "") || `method-${index}-${Date.now()}`;
									return {
										key: id,
										id,
										name: m.name || "",
										baseCost: String(m.baseCost ?? "0"),
										estimatedDays: m.estimatedDays || "",
										enabled: m.enabled !== false,
										autoId: false,
									};
								})
							);
						}
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
				const createdStore = res.data?.data;
				setStoreId(createdStore?.id);
				setStoreData(createdStore);
				toast.success("Store created successfully");
			}
		} catch (err: any) {
			toast.error(err?.response?.data?.message || "Failed to save");
		} finally {
			setSavingStore(false);
		}
	};

	const onSaveOrderShipping = async (data: OrderShippingFormData) => {
		if (!storeId) {
			toast.error("Please create a store first in Store Settings.");
			return;
		}
		if (shippingMethods.length === 0) {
			toast.error("Add at least one shipping method.");
			return;
		}
		setSavingOrderShipping(true);
		try {
			await axiosInstance.patch(`store/update/${storeId}`, {
				orderSettings: {
					...storeData?.orderSettings,
					taxRate: percentToRate(Number(data.taxRate)),
					freeShippingThreshold: Number(data.freeShippingThreshold),
					freeShippingRegions,
				},
				shippingConfig: {
					...storeData?.shippingConfig,
					methods: shippingMethods.map((m) => ({
						id: m.id,
						name: m.name,
						baseCost: Number(m.baseCost),
						estimatedDays: m.estimatedDays,
						enabled: m.enabled,
					})),
				},
			});
			toast.success("Order & shipping settings updated");
		} catch (err: any) {
			toast.error(err?.response?.data?.message || "Failed to save");
		} finally {
			setSavingOrderShipping(false);
		}
	};

	const addShippingMethod = () => {
		const key = `method-${Date.now()}`;
		setShippingMethods((prev) => [
			...prev,
			{ key, id: key, name: "", baseCost: "0", estimatedDays: "", enabled: true, autoId: true },
		]);
	};

	const removeShippingMethod = (key: string) => {
		setShippingMethods((prev) => prev.filter((m) => m.key !== key));
	};

	const updateShippingMethod = (key: string, field: keyof ShippingMethod, value: any) => {
		setShippingMethods((prev) =>
			prev.map((m) => {
				if (m.key !== key) return m;
				const updated = { ...m, [field]: value };
				// Keep a still-new method's id mirroring its name as the admin types.
				if (field === "name" && m.autoId) {
					updated.id = slugify(String(value)) || m.id;
				}
				return updated;
			})
		);
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
			await axiosInstance.post("auth/change-password", {
				currentPassword: data.currentPassword,
				newPassword: data.newPassword,
			});
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
			<SettingsFrame active={activeTab} onSelect={setActiveTab}>
						{/* ── Store Settings ── */}
						{activeTab === "store" && (
							<form onSubmit={storeForm.handleSubmit(onSaveStore)} className="space-y-5">
								<PanelHeading title="Store Settings" description="Manage your store information and address" />
								<div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
									<div className="space-y-5">
										<DetailSection title="Store" description="The name customers see on receipts and emails.">
											<div className="py-3">
												<FormInput label="Store Name" placeholder="Green Pasture Organics" required {...storeForm.register("name")} error={storeForm.formState.errors.name?.message} />
											</div>
										</DetailSection>
										<DetailSection title="Address" description="Where the store is based.">
											<div className="space-y-4 py-3">
												<FormInput label="Street Address" placeholder="123 Main Street" {...storeForm.register("houseAddress")} />
												<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
													<FormInput label="City" placeholder="Lagos" {...storeForm.register("city")} />
													<FormInput label="State" placeholder="Lagos" {...storeForm.register("state")} />
												</div>
												<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
													<FormInput label="Country" placeholder="Nigeria" {...storeForm.register("country")} />
													<FormInput label="Postal Code" placeholder="100001" {...storeForm.register("postalCode")} />
												</div>
											</div>
										</DetailSection>
									</div>
									<DetailSection title="Preview" description="How the store reads at a glance.">
										<div className="flex items-start gap-3 py-4">
											<span className="bg-brand/15 text-brand-ink flex size-10 shrink-0 items-center justify-center rounded-xl">
												<Store className="size-5" />
											</span>
											<div className="min-w-0">
												<p className="truncate text-sm font-semibold" style={{ color: "var(--text-primary)" }} title={storeForm.watch("name")}>
													{storeForm.watch("name") || "Store name"}
												</p>
												<p className="mt-1 flex items-start gap-1.5 text-xs" style={{ color: "var(--text-hint)" }}>
													<MapPin className="mt-0.5 size-3.5 shrink-0" />
													<span className="min-w-0">
														{[storeForm.watch("houseAddress"), storeForm.watch("city"), storeForm.watch("state"), storeForm.watch("postalCode"), storeForm.watch("country")].filter(Boolean).join(", ") || "No address yet"}
													</span>
												</p>
											</div>
										</div>
									</DetailSection>
								</div>
								<SettingsSaveBar hint="Changes apply to receipts and emails once saved." onReset={() => storeForm.reset()} submitLabel={storeId ? "Update Store" : "Create Store"} saving={savingStore} />
							</form>
						)}

						{/* ── Order & Shipping Settings ── */}
						{activeTab === "order" && (
							<form onSubmit={orderShippingForm.handleSubmit(onSaveOrderShipping)} className="space-y-5">
								<PanelHeading title="Order & Shipping" description="Configure tax, shipping fees, and free shipping threshold" />
								<div className="grid gap-5 xl:grid-cols-2 xl:items-start">
									<DetailSection title="Tax" description="Added to every order.">
										<div className="py-3">
											<NumberInput
												label="Tax Rate"
												placeholder="7.5"
												required
												suffix="%"
												value={orderShippingForm.watch("taxRate")}
												onChange={(val) => orderShippingForm.setValue("taxRate", val)}
												error={orderShippingForm.formState.errors.taxRate?.message}
												hint="Enter the percentage itself — 7.5 means 7.5% VAT. Applied to the order subtotal."
											/>
										</div>
									</DetailSection>

									<DetailSection title="Free shipping" description="When delivery costs the customer nothing.">
										<div className="space-y-4 py-3">
											<CurrencyInput
												label="Free Shipping Threshold"
												placeholder="50,000"
												required
												value={orderShippingForm.watch("freeShippingThreshold")}
												onChange={(val) => orderShippingForm.setValue("freeShippingThreshold", val)}
												error={orderShippingForm.formState.errors.freeShippingThreshold?.message}
											/>
											<p className="-mt-2 text-xs" style={{ color: "var(--text-hint)" }}>
												Orders at or above this amount qualify for free shipping. Set to 0 to always charge shipping.
											</p>
											<ChipAutocomplete
												label="Free Shipping Regions"
												placeholder="Search states…"
												options={NIGERIAN_STATES}
												value={freeShippingRegions}
												onChange={setFreeShippingRegions}
												hint="States where the threshold actually earns free delivery, matched against the delivery address. Leave empty to apply it everywhere."
												emptyMessage="No matching state"
											/>
										</div>
									</DetailSection>
								</div>

								<DetailSection title="Storefront display" description="Managed in Feature Flags.">
									<p className="py-3 text-sm" style={{ color: "var(--text-hint)" }}>
										Discount badges and foreign-currency prices are now switched from{" "}
										<Link href="/admin/feature-flags" className="font-medium underline" style={{ color: "var(--color-primary)" }}>
											Feature Flags
										</Link>
										.
									</p>
								</DetailSection>

								<DetailSection
									title="Shipping methods"
									description="What customers can choose at checkout."
									action={
										<Button type="button" variant="tonal" size="sm" leftIcon={Plus} onClick={addShippingMethod}>
											Add method
										</Button>
									}
								>
									<div className="space-y-3 py-3">
										{shippingMethods.map((method, index) => (
											<div key={method.key} className="rounded-xl border p-4 transition-opacity" style={{ borderColor: "var(--border-light)", background: method.enabled ? "var(--surface-low)" : "var(--surface-medium)", opacity: method.enabled ? 1 : 0.65 }}>
												<div className="mb-3 flex items-center justify-between gap-3">
													<span className="text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>
														Method {index + 1}
													</span>
													<div className="flex items-center gap-3">
														<span className="text-xs" style={{ color: "var(--text-hint)" }}>
															{method.enabled ? "Available" : "Hidden"}
														</span>
														<Switch checked={method.enabled} onCheckedChange={(next) => updateShippingMethod(method.key, "enabled", next)} aria-label={`${method.enabled ? "Disable" : "Enable"} method ${index + 1}`} />
														{shippingMethods.length > 1 && (
															<button type="button" onClick={() => removeShippingMethod(method.key)} className="cursor-pointer rounded-lg p-1.5 transition-colors hover:bg-red-50 dark:hover:bg-red-900/20" title="Remove method" aria-label={`Remove method ${index + 1}`}>
																<Trash2 className="h-4 w-4 text-red-500" />
															</button>
														)}
													</div>
												</div>
												<div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
													<FormInput label="Name" placeholder="Standard Shipping" value={method.name} onChange={(e: any) => updateShippingMethod(method.key, "name", e.target.value)} />
													<CurrencyInput label="Cost" placeholder="2,500" value={method.baseCost} onChange={(val) => updateShippingMethod(method.key, "baseCost", val)} />
													<FormInput label="Estimated Delivery" placeholder="5-7 business days" value={method.estimatedDays} onChange={(e: any) => updateShippingMethod(method.key, "estimatedDays", e.target.value)} />
												</div>
											</div>
										))}
									</div>
								</DetailSection>

								<SettingsSaveBar hint="Tax and shipping apply to new orders only." onReset={() => orderShippingForm.reset()} submitLabel="Update Settings" saving={savingOrderShipping} />
							</form>
						)}

						{/* ── Profile Settings ── */}
						{activeTab === "profile" && (
							<div className="space-y-5">
								<PanelHeading title="My Profile" description="Your details, what your role allows, and how the console looks to you" />
								<div className="grid gap-5 xl:grid-cols-2 xl:items-start">
									<form onSubmit={profileForm.handleSubmit(onSaveProfile)} className="space-y-5">
										<DetailSection title="Personal information" description="Update your personal information">
											<div className="space-y-4 py-3">
												<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
													<FormInput label="First Name" required {...profileForm.register("firstName")} error={profileForm.formState.errors.firstName?.message} />
													<FormInput label="Last Name" required {...profileForm.register("lastName")} error={profileForm.formState.errors.lastName?.message} />
												</div>
												<PhoneInput label="Phone Number" value={profileForm.watch("phoneNumber") || ""} onChange={(val) => profileForm.setValue("phoneNumber", val)} />
												<FormInput label="Email" value={user?.email || ""} disabled />
											</div>
										</DetailSection>
										<SettingsSaveBar hint="Your email is your sign-in and cannot be changed here." onReset={() => profileForm.reset()} submitLabel="Update Profile" saving={savingProfile} />
									</form>
									<div className="space-y-5">
										<RoleAccessCard user={user} />
										<AppearanceCard />
									</div>
								</div>
							</div>
						)}

						{/* ── Security ── */}
						{activeTab === "security" && (
							<form onSubmit={passwordForm.handleSubmit(onChangePassword)} className="space-y-5">
								<PanelHeading title="Security" description="Keep your account protected" />
								<div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
									<div className="space-y-5">
										<DetailSection title="Change password" description="Update your account password">
											<div className="space-y-4 py-3">
												<FormInput label="Current Password" type="password" placeholder="Enter current password" required showPasswordToggle {...passwordForm.register("currentPassword")} error={passwordForm.formState.errors.currentPassword?.message} />
												<FormInput label="New Password" type="password" placeholder="Enter new password" required showPasswordToggle {...passwordForm.register("newPassword")} error={passwordForm.formState.errors.newPassword?.message} />
												<FormInput label="Confirm New Password" type="password" placeholder="Confirm new password" required showPasswordToggle {...passwordForm.register("confirmPassword")} error={passwordForm.formState.errors.confirmPassword?.message} />
											</div>
										</DetailSection>
										<SettingsSaveBar hint="You stay signed in on this device." resetLabel="Cancel" onReset={() => passwordForm.reset()} submitLabel="Update Password" saving={savingPassword} />
									</div>
									<DetailSection title="Password requirements" description="Ticks off as you type.">
										<ul className="space-y-2.5 py-3">
											{(() => {
												const next = passwordForm.watch("newPassword") ?? "";
												const confirm = passwordForm.watch("confirmPassword") ?? "";
												return [
													{ ok: next.length >= 8, label: "At least 8 characters" },
													{ ok: /[a-z]/.test(next), label: "A lowercase letter" },
													{ ok: /[A-Z]/.test(next), label: "An uppercase letter" },
													{ ok: /\d/.test(next), label: "A number" },
													{ ok: next.length > 0 && next === confirm, label: "Both entries match" },
												].map((r) => <PasswordRule key={r.label} ok={r.ok} label={r.label} />);
											})()}
										</ul>
									</DetailSection>
								</div>
							</form>
						)}
			</SettingsFrame>
		</AdminLayout>
	);
};

export default withAdminAuth(AdminSettings);
