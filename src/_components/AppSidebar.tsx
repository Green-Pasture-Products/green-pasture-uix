"use client";

// Ported from ogaryde-admin-ui's components/shared/app-sidebar.tsx. Framework
// adaptations: react-router Link/useLocation/useNavigate -> next/link and
// next/router; NavItem -> ModuleDef from @/_navigations/modules; privilege
// filtering via useHasPrivilege() (backed by profileInfo.roles[].permissions[]).

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";

import { NAV_GROUPS, findOwningModule, type ModuleDef } from "@/_navigations/modules";
import { useHasPrivilege } from "@/_hooks/usePrivilege";
import { AdminUserMenu } from "./AdminUserMenu";
import { useInboxUnread } from "@/_hooks/useInboxUnread";
import { useAppDispatch, useAppSelector } from "@/_redux/store";
import { logoutAsync } from "@/_redux/actions/auth.action";
import { logout } from "@/_redux/reducers/auth.reducer";
import { clearCart } from "@/_redux/reducers/cart.reducer";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuBadge,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarRail,
	useSidebar,
} from "@/components/ui/sidebar";

function NavMenuButton({ item }: { item: ModuleDef }) {
	const router = useRouter();
	const unread = useInboxUnread(item.path === "/admin/inbox");
	const { setOpenMobile } = useSidebar();
	const pathname = router.asPath.split("?")[0];
	// findOwningModule (not a plain prefix match) so a detail route like
	// /admin/product/<uuid> highlights the Products entry, matching TabBar.
	const isActive = findOwningModule(pathname)?.path === item.path;
	const testid = `nav-${item.title.toLowerCase().replace(/\s+/g, "-")}`;

	return (
		<>
		<SidebarMenuButton
			asChild
			isActive={isActive}
			tooltip={item.title}
			className="gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium transition-all duration-150 hover:bg-sidebar-accent/60 data-[active=true]:bg-brand/15 data-[active=true]:font-semibold data-[active=true]:text-ink data-[active=true]:shadow-xs dark:data-[active=true]:bg-white/10 dark:data-[active=true]:text-foreground dark:data-[active=true]:[&>svg]:text-brand"
		>
			{/* On mobile the sidebar is an overlay sheet, so picking a tab has to
			    dismiss it — otherwise it sits on top of the page it just opened.
			    setOpenMobile is inert on desktop, where the rail is persistent. */}
			<Link href={item.path} data-testid={testid} onClick={() => setOpenMobile(false)}>
				<item.icon className={`size-4 shrink-0 transition-transform duration-200 ${isActive ? "scale-105" : ""}`} />
				<span>{item.title}</span>
			</Link>
		</SidebarMenuButton>
		{/* Sibling, not child: SidebarMenuButton asChild requires exactly one child. */}
		{unread > 0 && <SidebarMenuBadge data-testid="inbox-unread">{unread > 99 ? "99+" : unread}</SidebarMenuBadge>}
		</>
	);
}

function initialsOf(name: string): string {
	const parts = name.trim().split(/\s+/).filter(Boolean);
	if (parts.length === 0) return "AD";
	if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
	return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function AppSidebar() {
	const router = useRouter();
	const dispatch = useAppDispatch();
	const hasPrivilege = useHasPrivilege();
	const { setOpenMobile } = useSidebar();
	const { user } = useAppSelector((state) => state.auth);

	const displayName =
		[user?.firstName, user?.lastName].filter(Boolean).join(" ") || user?.email || "Admin";
	const initials = initialsOf(displayName);

	function handleSignOut() {
		dispatch(logoutAsync())
			.unwrap()
			.catch(() => {})
			.finally(() => {
				dispatch(logout());
				dispatch(clearCart());
				router.push("/login");
			});
	}

	return (
		<Sidebar collapsible="icon" data-testid="app-sidebar">
			<SidebarHeader className="border-sidebar-border/60 border-b p-3">
				{/* Navigates too, so it dismisses the mobile sheet like any tab does. */}
				<Link href="/admin/dashboard" onClick={() => setOpenMobile(false)} className="flex h-12 items-center gap-2.5 px-2">
					<div className="bg-brand/10 dark:bg-white/10 relative size-8 shrink-0 rounded-lg p-1">
						<Image src="/images/GP Organic Logo (Primary).png" alt="Green Pasture Organics Logo" fill sizes="32px" priority className="object-contain p-1" />
					</div>
					<div className="min-w-0 leading-tight group-data-[collapsible=icon]:hidden">
						<p className="flex items-center gap-1.5 text-sm font-bold tracking-tight">
							Green Pasture
							<span className="bg-brand text-brand-foreground rounded-xs px-1 text-[9px] font-black uppercase">Admin</span>
						</p>
						<p className="text-sidebar-foreground/60 text-[10px] font-medium">Organics Portal</p>
					</div>
				</Link>
			</SidebarHeader>

			<SidebarContent>
				{NAV_GROUPS.map((group) => {
					const items = group.items.filter((item) => hasPrivilege(item.privilege));
					if (items.length === 0) return null;
					return (
						<SidebarGroup key={group.label}>
							<SidebarGroupLabel className="text-sidebar-foreground/50 text-[11px] font-semibold uppercase tracking-wider">{group.label}</SidebarGroupLabel>
							<SidebarGroupContent>
								<SidebarMenu>
									{items.map((item) => (
										<SidebarMenuItem key={item.path}>
											<NavMenuButton item={item} />
										</SidebarMenuItem>
									))}
								</SidebarMenu>
							</SidebarGroupContent>
						</SidebarGroup>
					);
				})}
			</SidebarContent>

			<SidebarFooter className="border-sidebar-border/60 border-t p-2">
				<AdminUserMenu
					name={displayName}
					email={user?.email}
					roleLabel={user?.profileType?.toLowerCase() ?? "Administrator"}
					initials={initials}
					onSignOut={handleSignOut}
				/>
			</SidebarFooter>

			<SidebarRail />
		</Sidebar>
	);
}
