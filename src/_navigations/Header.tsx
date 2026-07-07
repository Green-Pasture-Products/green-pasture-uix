"use client";

import { useNotifications } from "@/_hooks/useNotifications";
import { useTheme } from "@/_hooks/useTheme";
import { getBio } from "@/_redux/actions/user.action";
import { logoutAsync } from "@/_redux/actions/auth.action";
import { logout } from "@/_redux/reducers/auth.reducer";
import { clearCart } from "@/_redux/reducers/cart.reducer";
import { useAppDispatch, useAppSelector } from "@/_redux/store";
import NotificationDrawer from "@/_UI/NotificationDrawer";
import {
	Bell,
	ChevronRight,
	Home,
	LogOut,
	Menu,
	Moon,
	Settings,
	Sun,
	User
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next/router";
import React, { useEffect, useRef, useState } from "react";
import { getPageNames } from "./routes";

interface HeaderProps {
	onMenuClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
	const router = useRouter();
	const pathname = usePathname();
	const dispatch = useAppDispatch();
	const { toggleTheme, isDark } = useTheme();

	const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
	const [notifOpen, setNotifOpen] = useState(false);
	const userMenuRef = useRef<HTMLDivElement>(null);

	const { notifications, unreadCount, loading: notifLoading, markAsRead, markAllAsRead } = useNotifications();

	const { user, isAuthenticated } = useAppSelector((state) => state.auth);
	const { bio } = useAppSelector((state) => state.user);

	useEffect(() => {
		dispatch(getBio());
	}, []);

	// Close user menu on outside click
	useEffect(() => {
		const handleClickOutside = (e: MouseEvent) => {
			if (
				userMenuRef.current &&
				!userMenuRef.current.contains(e.target as Node)
			) {
				setIsUserMenuOpen(false);
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () =>
			document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	const handleLogout = () => {
		dispatch(logoutAsync())
			.unwrap()
			.catch(() => {})
			.finally(() => {
				dispatch(logout());
				dispatch(clearCart());
				router.push("/login");
			});
	};

	// Build breadcrumb segments from pathname
	const SEGMENT_OVERRIDES: Record<string, { label: string; href: string }> = {
		"/admin/role":     { label: "Roles",     href: "/admin/roles" },
		"/admin/product":  { label: "Products",  href: "/admin/products" },
		"/admin/customer": { label: "Customers", href: "/admin/customers" },
		"/admin/order":    { label: "Orders",    href: "/admin/orders" },
		"/admin/category": { label: "Categories", href: "/admin/category" },
	};

	const buildBreadcrumbs = () => {
		const segments = pathname?.split("/").filter(Boolean) || [];
		const crumbs: { label: string; href: string }[] = [];
		let path = "";
		for (const segment of segments) {
			path += `/${segment}`;
			const override = SEGMENT_OVERRIDES[path];
			crumbs.push(
				override ?? {
					label: segment.charAt(0).toUpperCase() + segment.slice(1),
					href: path,
				}
			);
		}
		return crumbs;
	};

	const breadcrumbs = buildBreadcrumbs();
	const pageName = getPageNames(pathname);

	return (
	<>
		<header className="sticky top-0 z-30 bg-white/95 dark:bg-[#0e0e1a]/95 backdrop-blur-md border-b border-outline-variant dark:border-white/8 animate-header-enter">
			<div className="px-4 md:px-6 lg:px-8 h-16 flex items-center justify-between">
				{/* Left: Menu + Breadcrumb */}
				<div className="flex items-center gap-3 min-w-0">
					{onMenuClick && (
						<button
							onClick={onMenuClick}
							className="lg:hidden p-2 -ml-2 rounded-radius-md text-on-surface/60 dark:text-gray-400 hover:bg-surface-variant/50 dark:hover:bg-white/5 transition-colors duration-200 press-effect"
							aria-label="Toggle sidebar"
						>
							<Menu className="h-5 w-5" />
						</button>
					)}

					{/* Breadcrumb */}
					<nav className="hidden sm:flex items-center gap-1.5 text-sm min-w-0">
						<Link
							href="/admin/dashboard"
							className="text-on-surface/40 dark:text-gray-500 hover:text-on-surface dark:hover:text-gray-300 transition-colors"
						>
							<Home className="h-4 w-4" />
						</Link>
						{breadcrumbs.map((crumb, index) => (
							<React.Fragment key={crumb.href}>
								<ChevronRight className="h-3.5 w-3.5 text-on-surface/30 dark:text-gray-600 flex-shrink-0" />
								{index === breadcrumbs.length - 1 ? (
									<span className="text-on-surface dark:text-white font-medium truncate">
										{crumb.label}
									</span>
								) : (
									<Link
										href={crumb.href}
										className="text-on-surface/50 dark:text-gray-400 hover:text-on-surface dark:hover:text-gray-200 transition-colors truncate"
									>
										{crumb.label}
									</Link>
								)}
							</React.Fragment>
						))}
					</nav>

					{/* Mobile: Page title only */}
					<h3 className="sm:hidden text-sm font-medium text-on-surface dark:text-white capitalize truncate">
						{pageName}
					</h3>
				</div>

				{/* Right: Actions */}
				<div className="flex items-center gap-1 sm:gap-2">
					{/* Theme Toggle */}
					<button
						onClick={toggleTheme}
						className="p-2 rounded-radius-md text-on-surface/60 dark:text-gray-400 hover:bg-surface-variant/50 dark:hover:bg-white/5 hover:text-on-surface dark:hover:text-white transition-colors duration-200 press-effect cursor-pointer"
						aria-label="Toggle theme"
					>
						{isDark ? (
							<Sun className="h-5 w-5" />
						) : (
							<Moon className="h-5 w-5" />
						)}
					</button>

					{/* Notifications */}
					<button
						onClick={() => setNotifOpen(true)}
						className="relative p-2 rounded-radius-md text-on-surface/60 dark:text-gray-400 hover:bg-surface-variant/50 dark:hover:bg-white/5 hover:text-on-surface dark:hover:text-white transition-colors duration-200 press-effect cursor-pointer"
						aria-label="Notifications"
					>
						<Bell className="h-5 w-5" />
						{unreadCount > 0 && (
							<span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center text-[0.6rem] font-bold rounded-full text-white" style={{ background: "#ef4444" }}>
								{unreadCount > 99 ? "99+" : unreadCount}
							</span>
						)}
					</button>

					{/* User Dropdown */}
					{isAuthenticated && user ? (
						<div className="relative" ref={userMenuRef}>
							<button
								onClick={() =>
									setIsUserMenuOpen(!isUserMenuOpen)
								}
								className="flex items-center gap-2 p-1.5 rounded-radius-md hover:bg-surface-variant/50 dark:hover:bg-white/5 transition-colors duration-200 press-effect cursor-pointer"
							>
								<div className="w-8 h-8 rounded-full bg-primary-600 dark:bg-primary-500 text-white text-sm font-semibold flex items-center justify-center">
									{user.firstName
										?.charAt(0)
										?.toUpperCase() || "U"}
								</div>
								<div className="hidden md:block text-left min-w-0">
									<p className="text-sm font-medium text-on-surface dark:text-white truncate leading-tight">
										{user.firstName} {user.lastName}
									</p>
									<p className="text-xs text-on-surface/50 dark:text-gray-400 capitalize leading-tight">
										{user.profileType}
									</p>
								</div>
							</button>

							{isUserMenuOpen && (
								<div className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#1a1a2e] rounded-radius-lg shadow-elevation-3 border border-outline-variant dark:border-white/8 py-1 z-50 animate-dropdown-enter">
									<div className="px-4 py-3 border-b border-outline-variant dark:border-white/8">
										<p className="text-sm font-semibold text-on-surface dark:text-white">
											{user.firstName} {user.lastName}
										</p>
										<p className="text-xs text-on-surface/50 dark:text-gray-400 break-all mt-0.5">
											{user.email}
										</p>
									</div>
									<Link
										href="/"
										className="flex items-center gap-2 px-4 py-2.5 text-sm text-on-surface/80 dark:text-gray-300 hover:bg-surface-variant/50 dark:hover:bg-white/5 transition-colors duration-150"
										onClick={() =>
											setIsUserMenuOpen(false)
										}
									>
										<Home className="h-4 w-4" />
										Home
									</Link>
									<Link
										href="/admin/settings"
										className="flex items-center gap-2 px-4 py-2.5 text-sm text-on-surface/80 dark:text-gray-300 hover:bg-surface-variant/50 dark:hover:bg-white/5 transition-colors duration-150"
										onClick={() =>
											setIsUserMenuOpen(false)
										}
									>
										<Settings className="h-4 w-4" />
										Settings
									</Link>
									<div className="border-t border-outline-variant dark:border-white/8 my-1" />
									<button
										onClick={() => {
											handleLogout();
											setIsUserMenuOpen(false);
										}}
										className="flex items-center gap-2 w-full text-left px-4 py-2.5 text-sm text-error hover:bg-error/5 dark:hover:bg-error/10 transition-colors duration-150"
									>
										<LogOut className="h-4 w-4" />
										Sign out
									</button>
								</div>
							)}
						</div>
					) : (
						<Link
							href="/login"
							className="p-2 rounded-radius-md text-on-surface/60 dark:text-gray-400 hover:bg-surface-variant/50 dark:hover:bg-white/5 hover:text-on-surface dark:hover:text-white transition-colors duration-200 press-effect"
						>
							<User className="h-5 w-5" />
						</Link>
					)}
				</div>
			</div>
			</header>
		<NotificationDrawer
			isOpen={notifOpen}
			onClose={() => setNotifOpen(false)}
			notifications={notifications}
			unreadCount={unreadCount}
			onMarkAsRead={markAsRead}
			onMarkAllAsRead={markAllAsRead}
			loading={notifLoading}
		/>
	</>
	);
};

export default Header;
