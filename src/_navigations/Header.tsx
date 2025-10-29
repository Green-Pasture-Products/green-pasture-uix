"use client";

import { Search, User, LogOut } from "lucide-react";
import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";

import { useAppDispatch, useAppSelector } from "@/_redux/store";
import LogoutButton from "@/_components/ui/LogoutButton";
import { getBio } from "@/_redux/actions/user.action";
import { getPageNames } from "./routes";

const Header: React.FC = () => {
	const pathname = usePathname();
	const dispatch = useAppDispatch();
	const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
	const { user, isAuthenticated } = useAppSelector((state) => state.auth);

	useEffect(() => {
		dispatch(getBio());
	}, []);

	return (
		<header className="bg-white shadow-sm border-b border-green-100 sticky top-0 right-0 z-[901]">
			<div className="px-6">
				<div className="flex items-center justify-between h-16 md:h-18">
					<h3 className="capitalize font-medium">
						{getPageNames(pathname)}
					</h3>
					<div className={`flex items-center space-x-4 ms-auto`}>
						<Search className="h-6 w-6" />
						{isAuthenticated && user ? (
							<div className="relative">
								<button
									onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
									className="flex items-center space-x-2 text-gray-700 hover:text-green-600 transition-colors cursor-pointer"
								>
									<User className="h-6 w-6" />
									<span className="hidden sm:block text-sm font-medium">
										{user.firstName} {user.lastName} |{" "}
										{user.profileType}
									</span>
								</button>

								{isUserMenuOpen && (
									<div className="absolute right-0 mt-7 w-48 bg-white rounded-md shadow-lg py-1 z-50">
										<div className="px-4 py-2 border-b border-gray-100">
											<p className="text-sm font-medium text-gray-900">
												{user.firstName} {user.lastName}
											</p>
											<p className="text-sm text-gray-500 break-all">
												{user.email}
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
											onClick={() => setIsUserMenuOpen(false)}
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
