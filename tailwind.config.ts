import type { Config } from "tailwindcss";

// /** @type {import('tailwindcss').Config} */
// module.exports = {
const config: Config = {
	content: [
		"./pages/**/*.{js,ts,jsx,tsx,mdx}",
		"./components/**/*.{js,ts,jsx,tsx,mdx}",
		"./app/**/*.{js,ts,jsx,tsx,mdx}",
	],
	theme: {
		extend: {
			colors: {
				green: {
					50: "#f0fdf4",
					100: "#dcfce7",
					200: "#bbf7d0",
					300: "#86efac",
					400: "#4ade80",
					500: "#22c55e",
					600: "#16a34a",
					700: "#15803d",
					800: "#166534",
					900: "#14532d",
				},
			},
		},
		container: {
			center: true,
			padding: "1rem",
			screens: {
				DEFAULT: "50%", // Mobile & tablets
				md: "40%", // From 768px and up → 80%
			},
		},
	},
	plugins: [],
};

export default config;
