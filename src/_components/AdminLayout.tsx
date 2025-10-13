// LIBRARY COMPONENTS
import Head from "next/head";
import React from "react";

// CUSTOM COMPONENTS
import { LayoutProps } from "@/types/client/layout";
import Sidebar from "../_navigations/Sidebar";
import Header from "../_navigations/Header";
import { usePathname } from "next/navigation";
import { useAppSelector } from "@/_redux/store";
import { useMultiTabLogoutSync } from "@/_utils/hooks";

const AdminLayout = ({ children }: LayoutProps) => {
	const pathnaame = usePathname();
	// Enable multi-tab logout sync
	useMultiTabLogoutSync();

	const { isAuthenticated } = useAppSelector((state) => state.auth);
	const lastSegment = pathnaame.split("/").filter(Boolean).pop() || "";

	// Capitalize first letter
	const page_name = lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1);

	if (!isAuthenticated) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				Please log in
			</div>
		);
	}

	return (
		<>
			{/* <ProtectedRoute allowedRoles={["admin", "superadmin"]}> */}
			<Head>
				<title className="capitalize">
					{`${page_name} Page` || "Home"} | Green Patures Organics | Living
					Healthy
				</title>
				{/* <meta charset="UTF-8" /> */}
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

				{/* <!-- Favicon and icons --> */}
				<link rel="icon" href="./icons/favicon.ico" type="image/x-icon" />
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

			<div className="pl-64 min-h-screen  bg-green-50 flex relative">
				<Sidebar />
				<div className="flex-1 w-full">
					<Header />
					<main className="p-6">{children}</main>
				</div>
			</div>
			{/* </ProtectedRoute> */}
		</>
	);
};

export default AdminLayout;
