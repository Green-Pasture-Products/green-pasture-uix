import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	/* config options here */
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
