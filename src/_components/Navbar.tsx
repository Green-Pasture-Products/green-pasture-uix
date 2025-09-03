"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ShoppingCart, Search, User, Heart } from "lucide-react";
import { useAppSelector } from "@/_redux/store";
import SearchBar from "./SearchBar";

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

const Navbar: React.FC = () => {
	const pathname = usePathname();
	const itemCount = useAppSelector((state) => state.cart.itemCount);
	const wishlistCount = useAppSelector(
		(state) => state.wishlist.wishlistItemCount
	);

	const isActive = (path: string) =>
		pathname === path ? "text-green-600" : "text-gray-700";

	return (
		<header className="bg-white shadow-sm border-b border-green-100">
			<div className="container page-wrapper mx-auto px-4">
				<div className="flex items-center justify-between h-16 md:h-18">
					{/* Logo */}
					<Link href="/" className="flex items-center space-x-2">
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
						<span className="text-md md:text-lg hidden lg:inline-block font-bold text-green-800">
							Green Pastures Organics
						</span>
					</Link>

					{/* Navigation */}
					<nav className="hidden md:flex space-x-8">
						{navLinks.map(({ href, label }) => (
							<Link
								key={href}
								href={href}
								className={`${isActive(
									href
								)} hover:text-green-600 transition-colors font-bold`}
							>
								{label}
							</Link>
						))}
					</nav>

					{/* Actions */}
					<div className="flex items-center space-x-4">
						{/* Search Bar - Hidden on mobile, shown on desktop */}
						{/* <div className="hidden md:block flex-1 max-w-2xl mx-8">
							<SearchBar />
						</div> */}
						<Link
							href="/search"
							className={`${isActive(
								"/search"
							)} text-gray-700 hover:text-green-600 transition-colors`}
						>
							<Search className="h-6 w-6" />
						</Link>
						<Link
							href="/wishlist"
							className={`${isActive(
								"/wishlist"
							)} relative text-gray-700 hover:text-green-600 transition-colors`}
						>
							<Heart className="h-6 w-6" />
							{wishlistCount > 0 && (
								<span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
									{wishlistCount}
								</span>
							)}
						</Link>
						<button
							aria-label="User Account"
							className="text-gray-700 hover:text-green-600 transition-colors"
						>
							<User className="h-6 w-6" />
						</button>
						<Link
							href="/cart"
							className={`${isActive(
								"/cart"
							)} relative text-gray-700 hover:text-green-600 transition-colors`}
						>
							<ShoppingCart className="h-6 w-6" />
							{itemCount > 0 && (
								<span className="absolute -top-2 -right-2 bg-green-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
									{itemCount}
								</span>
							)}
						</Link>
						{/* Mobile Search Bar */}
						{/* <div className="md:hidden pb-4">
							<SearchBar />
						</div> */}
					</div>
				</div>
			</div>
		</header>
	);
};

export default Navbar;
