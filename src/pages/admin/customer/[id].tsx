import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { LayoutGrid, MapPin, Power, ShieldCheck, ShoppingBag, UserRound } from "lucide-react";
import toast from "react-hot-toast";
import * as changeCase from "change-case";

import RecordActivity from "@/_components/RecordActivity";
import withAdminAuth from "@/_components/withAdminAuth";
import AdminLayout from "@/_components/AdminLayout";
import { BackButton, DetailHeader, DetailSection, EditableSection, FactGrid } from "@/_UI/DetailField";
import Badge from "@/_UI/Badge";
import AnimatedTabs, { type TabDef } from "@/_UI/AnimatedTabs";
import Modal from "@/_UI/Modal";
import { FormInput } from "@/_UI/FormField";
import { formatCurrency, formatPhoneDisplay } from "@/_UI/FormatValue";
import PageLoader from "@/_UI/PageLoader";
import { Button } from "@/components/ui/button";
import axiosInstance from "@/_utils/axiosInstance";
import { useHasPrivilege } from "@/_hooks/usePrivilege";
import type { BackendCustomer } from "@/types";

const date = (iso?: string | null) => (iso ? new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }) : "—");

const schema = z.object({
	firstName: z.string().trim().min(1, "First name is required"),
	lastName: z.string().trim().min(1, "Last name is required"),
	phoneNumber: z.string().trim().optional(),
});
type FormValues = z.infer<typeof schema>;

function EditCard({ customer, onCancel, onSaved }: { customer: BackendCustomer; onCancel: () => void; onSaved: () => void }) {
	const p = customer.profile;
	const {
		register,
		handleSubmit,
		formState: { errors, isDirty, isSubmitting },
	} = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { firstName: p?.firstName ?? "", lastName: p?.lastName ?? "", phoneNumber: p?.phoneNumber ?? "" } });

	const save = handleSubmit(async (v) => {
		try {
			await axiosInstance.patch(`customers/${customer.id}`, { firstName: v.firstName.trim(), lastName: v.lastName.trim(), phoneNumber: (v.phoneNumber ?? "").trim() });
			toast.success("Customer saved");
			onSaved();
		} catch (e: any) {
			toast.error(e?.response?.data?.message || "Failed to update customer");
		}
	});

	return (
		<form onSubmit={save} aria-label="Edit customer" className="border-border bg-card overflow-hidden rounded-xl border">
			<div className="grid gap-4 p-5 sm:grid-cols-2">
				<FormInput label="First name" required error={errors.firstName?.message} {...register("firstName")} />
				<FormInput label="Last name" required error={errors.lastName?.message} {...register("lastName")} />
				<FormInput label="Email" type="email" value={p?.email ?? ""} disabled readOnly />
				<FormInput label="Phone number" {...register("phoneNumber")} />
			</div>
			<div className="border-border bg-secondary/15 flex justify-end gap-2 border-t px-5 py-3">
				<Button type="button" variant="outline" size="sm" onClick={onCancel}>
					Cancel
				</Button>
				<Button type="submit" size="sm" disabled={!isDirty || isSubmitting}>
					{isSubmitting ? "Saving…" : "Save changes"}
				</Button>
			</div>
		</form>
	);
}

interface OrderRow {
	id: string;
	orderReference: string;
	orderStatus: string;
	paymentStatus?: string;
	totalAmount: number;
	createdAt: string;
}
const ORDER_VARIANT: Record<string, "success" | "warning" | "error" | "info" | "neutral"> = { DELIVERED: "success", CANCELLED: "error", PENDING: "warning", PROCESSING: "info", IN_TRANSIT: "info" };

const CustomerDetail: React.FC = () => {
	const router = useRouter();
	const id = router.query.id as string | undefined;
	const hasPrivilege = useHasPrivilege();
	const canWrite = hasPrivilege("MANAGE_CUSTOMERS") || hasPrivilege("UPDATE_CUSTOMER");

	const [customer, setCustomer] = useState<BackendCustomer | null>(null);
	const [loading, setLoading] = useState(true);
	const [orders, setOrders] = useState<OrderRow[]>([]);
	const [orderTotal, setOrderTotal] = useState<number | null>(null);
	const [confirm, setConfirm] = useState(false);
	const [busy, setBusy] = useState(false);

	// The open tab lives in the URL (?tab=orders), so a link or a refresh lands on the same one.
	const queryTab = router.query.tab as string | undefined;
	const tab = ["overview", "orders", "account"].includes(queryTab ?? "") ? (queryTab as string) : "overview";
	const setTab = (next: string) => {
		const { tab: _drop, ...rest } = router.query;
		router.replace({ pathname: router.pathname, query: next === "overview" ? rest : { ...rest, tab: next } }, undefined, { shallow: true, scroll: false });
	};

	const load = useCallback(async () => {
		if (!id) return;
		try {
			const res = await axiosInstance.get(`customers/${id}`);
			setCustomer(res.data?.data ?? res.data ?? null);
		} catch {
			setCustomer(null);
			toast.error("Failed to load customer");
		} finally {
			setLoading(false);
		}
	}, [id]);

	useEffect(() => {
		load();
	}, [load]);

	// The orders list searches by customer email, so it doubles as "this customer's orders".
	const email = customer?.profile?.email;
	useEffect(() => {
		if (!email) return;
		axiosInstance
			.get("order", { params: { page: 1, limit: 20, search: email } })
			.then((res) => {
				const d = res.data?.data ?? res.data;
				setOrders(d?.items ?? []);
				setOrderTotal(d?.meta?.totalItems ?? d?.meta?.total ?? (d?.items ?? []).length);
			})
			.catch(() => setOrders([]));
	}, [email]);

	const toggle = async () => {
		if (!customer) return;
		const active = customer.status === "A";
		setBusy(true);
		try {
			await axiosInstance.patch(active ? "customers/deactivate" : "customers/activate", { ids: [customer.id] });
			toast.success(active ? "Customer deactivated" : "Customer activated");
			setConfirm(false);
			await load();
		} catch (e: any) {
			toast.error(e?.response?.data?.message || "Failed to update customer status");
		} finally {
			setBusy(false);
		}
	};

	const profile = customer?.profile;
	const name = `${profile?.firstName ?? ""} ${profile?.lastName ?? ""}`.trim();

	if (loading)
		return (
			<AdminLayout pageTitle="Customer">
				<PageLoader fullScreen={false} message="Loading customer details..." />
			</AdminLayout>
		);

	if (!customer)
		return (
			<AdminLayout pageTitle="Customer">
				<div className="border-border bg-card mx-auto max-w-3xl space-y-3 rounded-xl border p-8 text-center">
					<p className="text-sm font-semibold">Customer not found.</p>
					<Button variant="outline" size="sm" onClick={() => router.push("/admin/customers")}>
						Back to Customers
					</Button>
				</div>
			</AdminLayout>
		);

	const active = customer.status === "A";
	const address = profile?.address;
	const tabs: TabDef[] = [
		{ id: "overview", label: "Overview", icon: LayoutGrid },
		{ id: "orders", label: "Orders", icon: ShoppingBag, count: orderTotal },
		{ id: "account", label: "Account", icon: ShieldCheck },
	];

	const orderList = (rows: OrderRow[]) => (
		<ul className="divide-border divide-y">
			{rows.map((o) => (
				<li key={o.id}>
					<button type="button" onClick={() => router.push(`/admin/order/${o.orderReference}`)} className="hover:bg-muted/50 flex w-full items-center justify-between gap-3 px-5 py-3 text-left transition-colors">
						<div className="min-w-0">
							<p className="truncate text-sm font-semibold">#{o.orderReference}</p>
							<p className="text-muted-foreground text-xs">{date(o.createdAt)}</p>
						</div>
						<div className="flex shrink-0 items-center gap-3">
							<Badge variant={ORDER_VARIANT[o.orderStatus] ?? "neutral"} dot>
								{changeCase.capitalCase(o.orderStatus)}
							</Badge>
							<span className="text-sm font-semibold tabular-nums">{formatCurrency(o.totalAmount)}</span>
						</div>
					</button>
				</li>
			))}
		</ul>
	);
	const none = <p className="text-muted-foreground px-5 py-6 text-center text-sm">No orders yet.</p>;
	const ghost = "text-muted-foreground hover:text-foreground h-7 px-2";

	return (
		<AdminLayout pageTitle={name || "Customer"}>
			<div className="@container mx-auto w-full max-w-5xl space-y-6">
				<BackButton onClick={() => router.push("/admin/customers")} label="Back to Customers" />

				<DetailHeader
					title={name || "Customer"}
					subtitle={profile?.email}
					status={<Badge variant={active ? "success" : "neutral"} dot>{active ? "Active" : "Inactive"}</Badge>}
					metrics={[
						{ label: "Orders", value: orderTotal ?? "—" },
						{ label: "Last order", value: orders[0] ? date(orders[0].createdAt) : "—" },
						{ label: "Joined", value: date(customer.createdAt) },
						{ label: "Referral code", value: customer.referrerCode || "—" },
					]}
					actions={
						canWrite && (
							<Button variant={active ? "destructive-outline" : "outline"} size="sm" className="gap-1.5" onClick={() => setConfirm(true)}>
								<Power className="size-3.5" />
								{active ? "Deactivate" : "Activate"}
							</Button>
						)
					}
				/>

				<AnimatedTabs tabs={tabs} value={tab} onChange={setTab} label="Customer sections">
					{tab === "overview" && (
						<div className="tab-stagger space-y-6">
							<EditableSection
								key={customer.updatedAt}
								title="Profile"
								icon={UserRound}
								canEdit={canWrite}
								columns={2}
								defaultEditing={router.query.edit === "1"}
								facts={[
									{ label: "First name", value: profile?.firstName },
									{ label: "Last name", value: profile?.lastName },
									{ label: "Email", value: profile?.email },
									{ label: "Phone", value: profile?.phoneNumber ? formatPhoneDisplay(profile.phoneNumber) : "" },
									{ label: "Gender", value: profile?.gender ? changeCase.capitalCase(profile.gender) : "" },
								]}
							>
								{(close) => <EditCard customer={customer} onCancel={close} onSaved={load} />}
							</EditableSection>

							<div className="grid gap-6 @3xl:grid-cols-2">
								{address && (
									<DetailSection title="Address" icon={MapPin}>
										<FactGrid
											columns={1}
											facts={[
												{ label: "Street", value: address.street },
												{ label: "City", value: address.city },
												{ label: "State", value: address.state },
												{ label: "Country", value: address.country },
												{ label: "Postal code", value: address.postalCode },
											]}
										/>
									</DetailSection>
								)}
								<DetailSection
									title="Latest orders"
									icon={ShoppingBag}
									flush
									action={orders.length > 0 && <Button variant="ghost" size="sm" className={ghost} onClick={() => setTab("orders")}>See all</Button>}
								>
									{orders.length === 0 ? none : orderList(orders.slice(0, 3))}
								</DetailSection>
							</div>
						</div>
					)}

					{tab === "orders" && (
						<div className="tab-stagger">
							<DetailSection
								title="Orders"
								icon={ShoppingBag}
								flush
								action={orders.length > 0 && <Button variant="ghost" size="sm" className={ghost} onClick={() => router.push(`/admin/orders?search=${encodeURIComponent(email ?? "")}`)}>View all</Button>}
							>
								{orders.length === 0 ? none : orderList(orders)}
								{orderTotal != null && orderTotal > orders.length && (
									<p className="text-muted-foreground border-border border-t px-5 py-3 text-xs">
										Showing the latest {orders.length} of {orderTotal}. Use View all for the rest.
									</p>
								)}
							</DetailSection>
						</div>
					)}

					{tab === "account" && (
						<div className="tab-stagger space-y-6">
							<DetailSection title="Account" icon={ShieldCheck} description={active ? "Can sign in and place orders." : "Cannot sign in or place orders."}>
								<FactGrid
									columns={2}
									facts={[
										{ label: "Status", value: active ? "Active" : "Inactive" },
										{ label: "Joined", value: date(customer.createdAt) },
										{ label: "Referral code", value: customer.referrerCode || "" },
										{ label: "Wallet balance", value: customer.wallet?.balance != null ? formatCurrency(customer.wallet.balance) : "" },
									]}
								/>
							</DetailSection>
							<DetailSection title="Record" description="Who created and last changed this customer.">
								<FactGrid
									columns={2}
									facts={[
										{ label: "Created by", value: customer.createdBy },
										{ label: "Created", value: date(customer.createdAt) },
										{ label: "Last modified by", value: customer.updatedBy },
										{ label: "Last modified", value: date(customer.updatedAt) },
									]}
								/>
							</DetailSection>
						</div>
					)}
				</AnimatedTabs>
			</div>

			<RecordActivity type="Customer" id={customer.id} created={{ at: customer.createdAt, by: customer.createdBy }} />

			<Modal isOpen={confirm} onClose={() => setConfirm(false)} title={`${active ? "Deactivate" : "Activate"} customer`} size="sm">
				<div className="space-y-4">
					<p className="text-sm" style={{ color: "var(--text-secondary)" }}>
						{active ? "They can no longer sign in or place orders." : "They can sign in and place orders again."} Continue with <span className="font-semibold">{name}</span>?
					</p>
					<div className="flex justify-end gap-2">
						<Button variant="outline" size="sm" onClick={() => setConfirm(false)}>
							Cancel
						</Button>
						<Button variant={active ? "destructive" : "default"} size="sm" onClick={toggle} disabled={busy}>
							{active ? "Deactivate" : "Activate"}
						</Button>
					</div>
				</div>
			</Modal>
		</AdminLayout>
	);
};

export default withAdminAuth(CustomerDetail);
