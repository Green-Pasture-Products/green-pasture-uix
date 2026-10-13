import React from "react";
import Link from "next/link";
import { Landmark, Settings as SettingsIcon, Shield, Store, Truck, User } from "lucide-react";
import { useHasPrivilege } from "@/_hooks/usePrivilege";
import { cn } from "@/lib/utils";

export interface SettingsTab {
	id: string;
	name: string;
	icon: React.ElementType;
	/** Panels that live on their own route link there; the rest switch in place. */
	href?: string;
}

/** The panels this user may open. Store-scoped ones need MANAGE_STORES; My Profile and Security are everyone's. */
export function useSettingsTabs(): SettingsTab[] {
	const hasPrivilege = useHasPrivilege();
	const canManageStores = hasPrivilege("MANAGE_STORES");
	return [
		{ id: "store", name: "Store Settings", icon: Store },
		{ id: "order", name: "Order & Shipping", icon: Truck },
		{ id: "profile", name: "My Profile", icon: User },
		{ id: "security", name: "Security", icon: Shield },
		{ id: "manual", name: "Manual Payment Settings", icon: Landmark, href: "/admin/settings/manual-payments" },
	].filter((t) => canManageStores || (t.id !== "store" && t.id !== "order"));
}

/** Header, then a panel nav (vertical on desktop, pills on phones) beside the panel. */
export const SettingsFrame: React.FC<{ active: string; onSelect?: (id: string) => void; children: React.ReactNode }> = ({ active, onSelect, children }) => {
	const tabs = useSettingsTabs();
	const item = (selected: boolean) =>
		cn(
			"flex shrink-0 cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-left text-xs transition-colors",
			selected ? "bg-brand/10 font-semibold text-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground",
		);
	return (
		<div className="animate-page-enter mx-auto w-full max-w-6xl space-y-6 pb-12">
			<div className="flex items-start gap-3">
				<SettingsIcon className="mt-1 size-6 shrink-0" style={{ color: "var(--color-primary)" }} />
				<div>
					<h1 className="text-2xl font-bold leading-tight" style={{ color: "var(--text-primary)" }}>
						Settings
					</h1>
					<p className="text-sm" style={{ color: "var(--text-hint)" }}>
						Your account, store, and how the system runs.
					</p>
				</div>
			</div>
			<div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:items-start">
				<nav aria-label="Settings" className="no-scrollbar flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
					{tabs.map((tab) => {
						const Icon = tab.icon;
						const selected = tab.id === active;
						const body = (
							<>
								<Icon className="size-4 shrink-0" />
								<span className="whitespace-nowrap">{tab.name}</span>
							</>
						);
						// Switching in place only works on the Settings page itself; from anywhere else, go there.
						return tab.href ? (
							<Link key={tab.id} href={tab.href} aria-current={selected ? "page" : undefined} className={item(selected)}>
								{body}
							</Link>
						) : onSelect ? (
							<button key={tab.id} type="button" onClick={() => onSelect(tab.id)} aria-current={selected ? "page" : undefined} className={item(selected)}>
								{body}
							</button>
						) : (
							<Link key={tab.id} href={`/admin/settings?tab=${tab.id}`} className={item(selected)}>
								{body}
							</Link>
						);
					})}
				</nav>
				<section className="min-w-0 space-y-6">{children}</section>
			</div>
		</div>
	);
};
