import { LayoutDashboard, ShoppingBasket, Package, ShoppingCart, UserRound, UserCog, Shield, Settings, type LucideIcon } from "lucide-react";

/** One admin module: drives the sidebar nav, tab metadata, and privilege gating. */
export interface ModuleDef {
	path: string;
	title: string;
	icon: LucideIcon;
	group: string;
	/** Permission name required to see this module; omitted = everyone. */
	privilege?: string;
	/** Detail routes owned by this module, e.g. '/admin/product'. */
	owns?: string[];
	/** false = pinned, cannot be closed. */
	closable?: boolean;
}

/** Source of truth for nav, tabs, and privilege gating. Authored in sidebar order. */
export const MODULES: ModuleDef[] = [
	{ path: "/admin/dashboard", title: "Dashboard", icon: LayoutDashboard, group: "Overview", closable: false },
	{ path: "/admin/categories", title: "Category", icon: ShoppingBasket, group: "Catalog", owns: ["/admin/category"] },
	{ path: "/admin/products", title: "Products", icon: Package, group: "Catalog", privilege: "MANAGE_PRODUCTS", owns: ["/admin/product"] },
	{ path: "/admin/orders", title: "Orders", icon: ShoppingCart, group: "Sales", privilege: "MANAGE_ORDERS", owns: ["/admin/order"] },
	{ path: "/admin/customers", title: "Customers", icon: UserRound, group: "Sales", privilege: "MANAGE_CUSTOMERS", owns: ["/admin/customer"] },
	{ path: "/admin/staff", title: "Staff", icon: UserCog, group: "People", privilege: "MANAGE_STAFF" },
	{ path: "/admin/roles", title: "Roles", icon: Shield, group: "People", privilege: "MANAGE_ROLES", owns: ["/admin/role"] },
	// Ungated: settings.tsx has tabs every signed-in staff member needs (My
	// Profile, Security) alongside store-scoped ones. Gating the nav item would
	// deny a STAFF user their own profile/password change. The store-scoped
	// tabs (Store Settings, Order & Shipping) are hidden inside the page
	// itself via useHasPrivilege('MANAGE_STORES').
	{ path: "/admin/settings", title: "Settings", icon: Settings, group: "System" },
];

/** Look up a module by its absolute path (exact match). */
export function findModule(path: string): ModuleDef | undefined {
	return MODULES.find((m) => m.path === path);
}

/**
 * Find the module that "owns" the given pathname: the module whose `path`
 * equals the pathname, is a path-segment prefix of it, or lists it (or a
 * descendant of it) in `owns` — for detail routes that live under a
 * differently-named base path (e.g. '/admin/products' owns '/admin/product').
 */
export function findOwningModule(pathname: string): ModuleDef | undefined {
	return (
		findModule(pathname) ??
		MODULES.find((m) => pathname.startsWith(`${m.path}/`) || m.owns?.some((o) => pathname === o || pathname.startsWith(`${o}/`)))
	);
}

export interface NavGroup {
	label: string;
	items: ModuleDef[];
}

/** Sidebar navigation, grouped — derived from MODULES in first-seen order. */
export const NAV_GROUPS: NavGroup[] = (() => {
	const groups: NavGroup[] = [];
	const byLabel = new Map<string, NavGroup>();
	for (const m of MODULES) {
		let group = byLabel.get(m.group);
		if (!group) {
			group = { label: m.group, items: [] };
			byLabel.set(m.group, group);
			groups.push(group);
		}
		group.items.push(m);
	}
	return groups;
})();
