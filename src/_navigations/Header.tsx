"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ShoppingCart, Search, User, Heart, LogOut } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/_redux/store";
import { useRouter } from "next/router";
import { logout } from "@/_redux/reducers/auth.reducer";
import { getPageNames } from "./routes";

interface NavLink {
	href: string;
	label: string;
}

const navLinks: NavLink[] = [
	{ href: "/", label: "Home" },
	{ href: "/products", label: "Products" },
	{ href: "/about", label: "About" },
	{ href: "/contact", label: "Contact" },
];

const Header: React.FC = () => {
	const router = useRouter();
	const pathname = usePathname();
	const dispatch = useAppDispatch();
	const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
	const itemCount = useAppSelector((state) => state.cart.itemCount);
	const { user, isAuthenticated } = useAppSelector((state) => state.auth);
	const wishlistCount = useAppSelector(
		(state) => state.wishlist.wishlistItemCount
	);

	const handleLogout = () => {
		dispatch(logout());
		router.push("/");
	};

	const isActive = (path: string) =>
		pathname === path ? "text-green-600" : "text-gray-700";

	return (
		<header className="bg-white shadow-sm border-b border-green-100">
			<div className="px-8">
				<div className="flex items-center justify-between h-16 md:h-18">
					<h3 className="capitalize font-medium">
						{getPageNames(pathname)}
					</h3>
					<div className={`flex items-center space-x-4 ms-auto`}>
						<Link
							href="/search"
							className={`${isActive(
								"/search"
							)} text-gray-700 hover:text-green-600 transition-colors`}
						>
							<Search className="h-6 w-6" />
						</Link>
						{isAuthenticated && user ? (
							<div className="relative">
								<button
									onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
									className="flex items-center space-x-2 text-gray-700 hover:text-green-600 transition-colors"
								>
									<User className="h-6 w-6" />
									<span className="hidden sm:block text-sm font-medium">
										{user.firstName}
									</span>
								</button>

								{isUserMenuOpen && (
									<div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
										<div className="px-4 py-2 border-b border-gray-100">
											<p className="text-sm font-medium text-gray-900">
												{user.firstName} {user.lastName}
											</p>
											<p className="text-sm text-gray-500">
												{user.email}
											</p>
										</div>
										<Link
											href="/admin/profile"
											className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
											onClick={() => setIsUserMenuOpen(false)}
										>
											Profile
										</Link>
										<button
											onClick={() => {
												handleLogout();
												setIsUserMenuOpen(false);
											}}
											className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
										>
											<LogOut className="h-4 w-4 inline mr-2" />
											Sign out
										</button>
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
