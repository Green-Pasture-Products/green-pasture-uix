import Image from "next/image";
import Link from "next/link";
import React from "react";

import { usePathname } from "next/navigation";
import { sidebarNavigation } from "./routes";

const Sidebar = () => {
	const pathname = usePathname();

	return (
		<aside className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg">
			<div className="flex h-18 items-center px-6 border-b border-gray-200">
				<div className="relative w-[2.2rem] aspect-square bg-transparent">
					<Image
						src="/images/GP Organic Logo (Primary).png"
						alt="Green Pastures Logo"
						height={100}
						width={100}
						priority
						sizes="(max-width: 768px) 2rem, (max-width: 1200px) 2.2rem, 3rem"
						className="object-contain"
					/>
				</div>
				<span className="ml-2 text-xl font-bold text-gray-900">
					Admin Panel
				</span>
			</div>

			<nav className="mt-6 px-3">
				<div className="space-y-1">
					{sidebarNavigation?.map((item) => (
						<Link
							key={item.name}
							href={item.href}
							className={`group flex items-center px-3 py-2 my-4 text-sm font-medium rounded-md transition-colors ${
								pathname === item.href
									? "bg-green-100 text-green-700"
									: "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
							}`}
						>
							<item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
							{item.name}
							{/* {item.badge && item.badge > 0 && (
									<span className="ml-auto bg-red-100 text-red-800 text-xs font-medium px-2 py-0.5 rounded-full">
										{item.badge}
									</span>
								)} */}
						</Link>
					))}
				</div>
			</nav>
		</aside>
	);
};

export default Sidebar;
