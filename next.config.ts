import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	/* config options here */
	reactStrictMode: true,
		// 🚫 Disable ESLint during production build
	eslint: {
		ignoreDuringBuilds: true,
	},
	typescript: {
		ignoreBuildErrors: true, // 🚫 ignore TS errors during build
	},
	images: {
		domains: ["images.unsplash.com", "unsplash.com"],
	},
	webpack(config, { dev }) {
		if (!dev && config.optimization?.minimizer) {
			config.optimization.minimizer.forEach((plugin: any) => {
				if (plugin.constructor.name === "TerserPlugin") {
					if (plugin.options?.terserOptions?.compress) {
						plugin.options.terserOptions.compress.drop_console = true;
						plugin.options.terserOptions.compress.pure_funcs = [
							"console.log",
							"console.info",
							"console.debug",
							"console.warn",
							"console.error",
						];
					}
				}
			});
		}
		return config;
	},
};

export default nextConfig;
