"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, User } from "lucide-react";
import { useAppSelector } from "@/_redux/store";
import { getPageNames } from "./routes";
import { LogoutButton } from "@/_components/LogoutButton";

const Header: React.FC = () => {
	const pathname = usePathname();
	const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
	// const itemCount = useAppSelector((state) => state.cart.itemCount);
	const { user: bio, isAuthenticated } = useAppSelector((state) => state.auth);
	// const wishlistCount = useAppSelector(
	// 	(state) => state.wishlist.wishlistItemCount
	// );

	// const isActive = (path: string) =>
	// 	pathname === path ? "text-green-600" : "text-gray-700";

	return (
		<header className="bg-white shadow-sm border-b border-green-100 sticky top-0 right-0 z-[901]">
			<div className="px-6">
				<div className="flex items-center justify-between h-16 md:h-18">
					<h3 className="capitalize font-medium">
						{getPageNames(pathname)}
					</h3>
					<div className={`flex items-center space-x-4 ms-auto`}>
						{/* <Link
							href="/search"
							className={`${isActive(
								"/search"
							)} text-gray-700 hover:text-green-600 transition-colors`}
						> */}
						<Search className="h-6 w-6" />
						{/* </Link> */}
						{isAuthenticated && bio ? (
							<div className="relative">
								<button
									onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
									className="flex items-center space-x-2 text-gray-700 hover:text-green-600 transition-colors cursor-pointer"
								>
									<User className="h-6 w-6" />
									<span className="hidden sm:block text-sm font-medium">
										{bio.firstName} {bio.lastName} | {bio.profileType}
									</span>
								</button>

								{isUserMenuOpen && (
									<div className="absolute right-0 mt-7 w-48 bg-white rounded-md shadow-lg py-1 z-50">
										<div className="px-4 py-2 border-b border-gray-100">
											<p className="text-sm font-medium text-gray-900">
												{bio.firstName} {bio.lastName}
											</p>
											<p className="text-sm text-gray-500">
												{bio.email}
											</p>
										</div>
										<Link
											href="/"
											className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
											onClick={() => setIsUserMenuOpen(false)}
										>
											Home
										</Link>
										<Link
											href="/admin/settings"
											className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
											onClick={() => setIsUserMenuOpen(false)}
										>
											Settings
										</Link>
										<LogoutButton
											onClick={() => {
												setIsUserMenuOpen(false);
											}}
											className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
										/>
									</div>
								)}
							</div>
						) : (
							<Link
								href="/login"
								className="text-gray-700 hover:text-green-600 transition-colors"
							>
								<User className="h-6 w-6" />
							</Link>
						)}
					</div>
				</div>
			</div>
		</header>
	);
};

export default Header;
