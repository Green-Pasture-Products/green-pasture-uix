// LIBRARY COMPONENTS
import { Toaster } from "react-hot-toast";
import Head from "next/head";
import React from "react";

// CUSTOM COMPONENTS
import { LayoutProps } from "@/types/client/layout";
import PromoBanner from "./PromoBanner";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { useIsAuthRoute } from "@/_utils";

const Layout = ({ children, pageTitle }: LayoutProps) => {
	const authPages = useIsAuthRoute();

	return (
		<>
			<Head>
				<title className="capitalize">
					{`${pageTitle} page` || "Home"} | Green Patures Organics | Living
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

			<div className="min-h-screen overflow-x-hidden bg-green-50">
				{!authPages && (
					<>
						<PromoBanner />
						<Navbar />
					</>
				)}
				<main className="flex-1">{children}</main>
				{!authPages && <Footer />}
			</div>
			<Toaster
				position="top-right"
				toastOptions={{
					success: {
						style: {
							background: "#fff",
							color: "#10B981",
							fontWeight: "500",
						},
					},
					error: {
						style: {
							background: "#fff",
							color: "#EF4444",
							fontWeight: "500",
						},
					},
				}}
			/>
		</>
	);
};

export default Layout;
