"use client";

// Ported from ogaryde-admin-ui's components/shared/top-bar.tsx. Framework
// adaptation: useLocation().pathname -> useRouter().asPath (query stripped).
// Title now comes from findOwningModule (@/_navigations/modules) instead of
// walking NAV_GROUPS by hand, so detail routes resolve to their parent's title
// exactly like the tab bar does. The bell and its unread badge are wired to
// the existing useNotifications hook + NotificationDrawer; the theme toggle to
// the existing useTheme hook (green-pasture has no standalone ThemeToggle
// component, so it's inlined here as ogaryde's <ThemeToggle /> would render).

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { Bell, ChevronRight, Home, Moon, Search, Sun } from "lucide-react";
import { JumpTo } from "@/_components/JumpTo";

import { findOwningModule } from "@/_navigations/modules";
import { useNotifications } from "@/_hooks/useNotifications";
import { useTheme } from "@/_hooks/useTheme";
import NotificationDrawer from "@/_UI/NotificationDrawer";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";

function usePageTitle(): string {
	const router = useRouter();
	const pathname = router.asPath.split("?")[0];
	return findOwningModule(pathname)?.title ?? "Green Pasture Organics Admin";
}

export function TopBar() {
	const title = usePageTitle();
	const { isDark, toggleTheme } = useTheme();
	const [notifOpen, setNotifOpen] = useState(false);
	const [jumpOpen, setJumpOpen] = useState(false);
	useEffect(() => {
		const onKey = (e: KeyboardEvent) => {
			if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
				e.preventDefault();
				setJumpOpen((o) => !o);
			}
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, []);
	const { notifications, unreadCount, loading, markAsRead, markAllAsRead } = useNotifications();

	return (
		<>
			<header className="bg-background/80 border-border/50 sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between gap-2 border-b px-3 shadow-[0_1px_3px_rgba(0,0,0,0.02)] backdrop-blur-xl sm:px-4 md:px-6">
				<div className="flex min-w-0 items-center gap-2">
					<SidebarTrigger data-testid="sidebar-trigger" className="-ml-1" />
					<Separator orientation="vertical" className="mr-1 data-[orientation=vertical]:h-5" />
					<nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-1.5 text-xs">
						<Link href="/admin/dashboard" className="text-muted-foreground hover:text-foreground flex items-center gap-1.5 font-medium" aria-label="Console home">
							<Home className="size-3.5" />
							<span className="hidden sm:inline">Console</span>
						</Link>
						<ChevronRight className="text-muted-foreground/50 mx-0.5 size-3.5 shrink-0" />
						<h1 className="text-foreground truncate font-bold sm:max-w-[300px]" data-testid="page-title">
							{title}
						</h1>
					</nav>
				</div>

				<div className="flex items-center gap-1.5 sm:gap-2.5">
					<button
						type="button"
						onClick={() => setJumpOpen(true)}
						aria-label="Jump to a page"
						className="border-border/60 bg-secondary/40 text-muted-foreground hover:border-brand/50 hover:bg-secondary/70 hidden h-8 items-center gap-2 rounded-lg border px-2.5 text-xs shadow-xs transition-colors sm:flex sm:w-40 md:w-56"
					>
						<Search className="size-3.5" />
						<span className="flex-1 text-left">Jump to…</span>
						<kbd className="border-border/80 bg-background/80 h-4.5 rounded border px-1.5 font-mono text-[10px] leading-4">⌘K</kbd>
					</button>
					<Button variant="ghost" size="icon" aria-label="Jump to a page" className="sm:hidden" onClick={() => setJumpOpen(true)}>
						<Search className="size-4" />
					</Button>
					<Button variant="ghost" size="icon" aria-label="Toggle theme" onClick={toggleTheme}>
						<span className="relative size-4">
							<Sun className={`text-brand-ink absolute inset-0 size-4 transition-all duration-300 ${isDark ? "scale-0 -rotate-90" : "scale-100 rotate-0"}`} />
							<Moon className={`text-brand-ink absolute inset-0 size-4 transition-all duration-300 ${isDark ? "scale-100 rotate-0" : "scale-0 rotate-90"}`} />
						</span>
					</Button>
					<Button variant="outline" size="icon" aria-label="Notifications" className="border-border/60 bg-background/60 relative backdrop-blur-sm" onClick={() => setNotifOpen(true)}>
						<Bell className="text-muted-foreground size-4" />
						{unreadCount > 0 && (
							<span className="absolute -top-0.5 -right-0.5 flex size-2.5">
								<span className="bg-brand absolute inline-flex size-full animate-ping rounded-full opacity-75" />
								<span className="bg-brand relative inline-flex size-2.5 rounded-full" />
							</span>
						)}
					</Button>
				</div>
			</header>

			<JumpTo open={jumpOpen} onClose={() => setJumpOpen(false)} />

			<NotificationDrawer
				isOpen={notifOpen}
				onClose={() => setNotifOpen(false)}
				notifications={notifications}
				unreadCount={unreadCount}
				onMarkAsRead={markAsRead}
				onMarkAllAsRead={markAllAsRead}
				loading={loading}
			/>
		</>
	);
}
