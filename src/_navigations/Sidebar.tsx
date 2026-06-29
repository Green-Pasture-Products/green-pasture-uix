"use client";

import Image from "next/image";
import Link from "next/link";
import React from "react";
import { ChevronLeft } from "lucide-react";

import { usePathname } from "next/navigation";
import { sidebarNavigation } from "./routes";
import { useAppSelector } from "@/_redux/store";

interface SidebarProps {
	isCollapsed: boolean;
	onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggle }) => {
	const pathname = usePathname();
	const { user } = useAppSelector((state) => state.auth);

	return (
		<aside className="bg-[#14532d] dark:bg-[#0e0e1a] h-full flex flex-col animate-sidebar-enter overflow-hidden">
			{/* Header */}
			{isCollapsed ? (
				<div className="flex flex-col items-center py-3 gap-1 border-b border-white/10 flex-shrink-0">
					<Link href="/admin/dashboard" className="p-1">
						<div className="relative w-8 h-8">
							<Image
								src="/images/GP Organic Logo (Primary).png"
								alt="Green Pastures Logo"
								height={100}
								width={100}
								priority
								sizes="36px"
								className="object-contain"
							/>
						</div>
					</Link>
					<button
						onClick={onToggle}
						className="p-1.5 rounded-radius-md text-white/50 hover:bg-white/5 hover:text-white transition-colors duration-200 press-effect"
						aria-label="Expand sidebar"
					>
						<ChevronLeft className="h-5 w-5 rotate-180 transition-transform duration-300" />
					</button>
				</div>
			) : (
				<div className="flex items-center h-16 md:h-[72px] px-4 border-b border-white/10 flex-shrink-0">
					<Link
						href="/admin/dashboard"
						className="flex items-center gap-2.5 flex-1 min-w-0"
					>
						<div className="relative w-8 h-8 flex-shrink-0">
							<Image
								src="/images/GP Organic Logo (Primary).png"
								alt="Green Pastures Logo"
								height={100}
								width={100}
								priority
								sizes="36px"
								className="object-contain"
							/>
						</div>
						<span className="text-base font-bold text-white truncate">
							Admin Panel
						</span>
					</Link>
					<button
						onClick={onToggle}
						className="ml-auto p-2 rounded-radius-md text-white/50 hover:bg-white/5 hover:text-white transition-colors duration-200 press-effect flex-shrink-0"
						aria-label="Collapse sidebar"
					>
						<ChevronLeft className="h-5 w-5 transition-transform duration-300" />
					</button>
				</div>
			)}

			{/* Navigation */}
			<nav className="flex-1 overflow-y-auto py-4">
				<div className="space-y-1">
					{sidebarNavigation?.map((item) => {
						const active =
							pathname === item.href ||
							pathname?.startsWith(item.href + "/");
						return (
							<Link
								key={item.name}
								href={item.href}
								title={isCollapsed ? item.name : undefined}
								className={`flex items-center gap-3 px-3 py-2.5 mx-2 rounded-radius-md transition-colors duration-200 relative ${
									active
										? "bg-white/10 text-white font-medium border-l-[3px] border-primary-400"
										: "text-white/50 hover:bg-white/5 hover:text-white/90 border-l-[3px] border-transparent"
								} ${isCollapsed ? "justify-center mx-1 px-2" : ""}`}
							>
								<item.icon
									className={`h-5 w-5 flex-shrink-0 ${
										active
											? "text-primary-400"
											: "text-white/50"
									}`}
								/>
								{!isCollapsed && (
									<span className="text-sm truncate">
										{item.name}
									</span>
								)}
							</Link>
						);
					})}
				</div>
			</nav>

			{/* Bottom Section */}
			<div className="mt-auto border-t border-white/10 p-4 flex-shrink-0">
				{isCollapsed ? (
					<div className="flex flex-col items-center">
						<div className="w-8 h-8 rounded-full bg-primary-600 text-white text-sm font-semibold flex items-center justify-center">
							{user?.firstName?.charAt(0)?.toUpperCase() || "A"}
						</div>
					</div>
				) : (
					<div className="flex items-center gap-3">
						<div className="w-9 h-9 rounded-full bg-primary-600 text-white text-sm font-semibold flex items-center justify-center flex-shrink-0">
							{user?.firstName?.charAt(0)?.toUpperCase() || "A"}
						</div>
						<div className="min-w-0">
							<p className="text-sm font-medium text-white truncate">
								{user?.firstName} {user?.lastName}
							</p>
							<p className="text-xs text-white/50 capitalize truncate">
								{user?.profileType || "Admin"}
							</p>
						</div>
					</div>
				)}
			</div>
		</aside>
	);
};

export default Sidebar;
