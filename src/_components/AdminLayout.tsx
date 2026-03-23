"use client";

// LIBRARY COMPONENTS
import Head from "next/head";
import React, { useState, useEffect, useCallback } from "react";

// CUSTOM COMPONENTS
import { LayoutProps } from "@/types/client/layout";
import Sidebar from "../_navigations/Sidebar";
import Header from "../_navigations/Header";
import { usePathname } from "next/navigation";

const AdminLayout = ({ children, pageTitle }: LayoutProps) => {
	const pathname = usePathname();
	const lastSegment = pathname.split("/").filter(Boolean).pop() || "";
	const page_name =
		lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1);

	const [isCollapsed, setIsCollapsed] = useState(false);
	const [isMobile, setIsMobile] = useState(false);

	// Auto-collapse on mobile
	useEffect(() => {
		const checkMobile = () => {
			const mobile = window.innerWidth < 1024;
			setIsMobile(mobile);
			if (mobile) {
				setIsCollapsed(true);
			}
		};
		checkMobile();
		window.addEventListener("resize", checkMobile);
		return () => window.removeEventListener("resize", checkMobile);
	}, []);

	const toggleCollapse = useCallback(() => {
		setIsCollapsed((prev) => !prev);
	}, []);

	const collapse = useCallback(() => {
		setIsCollapsed(true);
	}, []);

	return (
		<>
			<Head>
				<title className="capitalize">
					{`${page_name} Page` || "Home"} | Green Pastures Organics |
					Living Healthy
				</title>
				<meta
					name="viewport"
					content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
				/>
				<meta
					name="description"
					content="Green Pastures - Living healthy with fresh, organic products and insightful blogs."
				/>
				<meta
					name="keywords"
					content="organic, health, wellness, immunity, fertility, blog, supplements"
				/>
				<meta name="author" content="Green Pastures Organics" />
				<meta property="og:type" content="website" />
				<meta
					property="og:title"
					content="Green Pastures | Living Healthy"
				/>
				<meta
					property="og:description"
					content="Discover fresh organic products to support immunity, fertility, and wellness."
				/>
				<meta
					property="og:image"
					content="images/GP Organic Logo (Primary).png"
				/>
				<meta
					property="og:url"
					content="https://greenpastures.vercel.app"
				/>
				<meta property="og:site_name" content="Green Pastures" />
				<link
					rel="icon"
					href="./icons/favicon.ico"
					type="image/x-icon"
				/>
				<link
					rel="icon"
					href="./icons/favicon-16x16.png"
					type="image/png"
					sizes="32x32"
				/>
				<link
					rel="icon"
					href="./icons/favicon-32x32.png"
					type="image/png"
					sizes="64x64"
				/>
				<link
					rel="apple-touch-icon"
					href="./icons/apple-touch-icon.png"
					sizes="180x180"
				/>
				<link
					rel="icon"
					href="./icons/android-chrome-192x192.png"
					type="image/png"
					sizes="192x192"
				/>
				<link
					rel="icon"
					href="./icons/android-chrome-512x512.png"
					type="image/png"
					sizes="512x512"
				/>
			</Head>

			<div className="flex h-screen overflow-hidden bg-[#fafafa] dark:bg-[#0e0e1a] transition-colors duration-300">
				{/* Mobile backdrop overlay */}
				{!isCollapsed && isMobile && (
					<div
						className="fixed inset-0 bg-black/40 z-40 transition-opacity duration-300"
						onClick={collapse}
					/>
				)}

				{/* Sidebar */}
				<aside
					className={`fixed lg:static z-50 h-full transition-all duration-300 ease-in-out ${
						isCollapsed
							? "w-0 lg:w-20 overflow-hidden"
							: "w-64"
					}`}
				>
					<Sidebar
						isCollapsed={isCollapsed && !isMobile}
						onToggle={toggleCollapse}
					/>
				</aside>

				{/* Main content area */}
				<div className="flex-1 flex flex-col overflow-hidden transition-all duration-300">
					<Header onMenuClick={toggleCollapse} />
					<main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 animate-page-enter">
						{children}
					</main>
				</div>
			</div>
		</>
	);
};

export default AdminLayout;
