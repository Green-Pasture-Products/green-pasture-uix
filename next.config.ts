import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	/* config options here */
	// Playwright runs its own dev server with NEXT_DIST_DIR set, so it never trashes the .next of the dev server you are running.
	distDir: process.env.NEXT_DIST_DIR || ".next",
	reactStrictMode: true,
	eslint: {
		ignoreDuringBuilds: true,
	},
	typescript: {
		ignoreBuildErrors: false,
	},
	images: {
		unoptimized: true, // Required with output: "export" (static HTML)
		remotePatterns: [
			{ protocol: "https", hostname: "**.cloudinary.com" },
			{ protocol: "https", hostname: "images.unsplash.com" },
			{ protocol: "https", hostname: "unsplash.com" },
		],
	},
};

export default nextConfig;
