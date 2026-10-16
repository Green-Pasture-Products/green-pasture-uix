import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Leaf, Truck, ShieldCheck } from "lucide-react";

import { ProductCarousel, type ProductItem } from "@/components/ui/connected-carousel";

// Names/notes are from the pack artwork; swap for real catalogue copy if you have it.
const PRODUCTS: ProductItem[] = [
	{ id: "smoothie", name: "Exotic Green Smoothie", note: "Dietary supplement · Immune booster", image: "/images/smoothie-removebg.png", width: 433, height: 577 },
	{ id: "gorun-tula", name: "Gorun Tula", note: "Fruit & powder · 100% natural", image: "/images/gorontula-removebg.png", width: 577, height: 433 },
	{ id: "purple", name: "Purple Super Food", note: "Gut health · Antioxidant · No sugar added", image: "/images/purple-super-food-preview.png", width: 466, height: 536 },
	{ id: "dates", name: "Date Powder", note: "Natural sweetener · No preservatives", image: "/images/dates-powder-preview.png", width: 477, height: 523 },
	{ id: "tigernut", name: "Tiger Nut Powder", note: "Rich in fibre & healthy fats", image: "/images/tigernuts-powder-preview.png", width: 473, height: 528 },
];

/** Green brand panel (wave edge, product carousel, pitch) shared by the login and signup pages. */
export default function AuthShowcase() {
	return (
		<aside
			className="relative hidden lg:flex flex-col justify-between overflow-hidden p-12 text-white"
			style={{ background: "radial-gradient(120% 90% at 20% 0%, #2a7e69 0%, #1f6554 35%, #103630 100%)" }}
		>
			<div
				aria-hidden
				className="absolute inset-0 opacity-[0.07]"
				style={{ backgroundImage: "radial-gradient(#fff 1px, transparent 1px)", backgroundSize: "22px 22px" }}
			/>
			<div
				aria-hidden
				className="absolute -bottom-40 -right-40 h-[32rem] w-[32rem] rounded-full blur-3xl"
				style={{ background: "var(--color-accent)", opacity: 0.22 }}
			/>

			{/* Organic wave edge: layered ribbons that melt the green panel into the form side */}
			<svg
				aria-hidden
				viewBox="0 0 100 100"
				preserveAspectRatio="none"
				className="absolute inset-y-0 -right-px h-full w-28 xl:w-36"
			>
				<motion.path
					d="M100 0H46C78 14 14 30 46 48S14 82 46 100H100Z"
					fill="var(--color-accent)"
					fillOpacity={0.35}
					animate={{ x: [0, -6, 0] }}
					transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
				/>
				<motion.path
					d="M100 0H62C34 16 90 32 58 50S92 84 62 100H100Z"
					fill="var(--color-primary-light)"
					fillOpacity={0.4}
					animate={{ x: [0, 5, 0] }}
					transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
				/>
				<path d="M100 0H78C58 18 98 34 76 52S96 84 78 100H100Z" fill="var(--background)" />
			</svg>

			<Link href="/" className="relative flex items-center gap-3 w-fit" aria-label="Green Pasture Organics home">
				<span className="rounded-2xl bg-white/95 p-2">
					<Image src="/images/GP Organic Logo (Primary).png" alt="" width={44} height={44} priority className="object-contain" />
				</span>
				<span className="text-lg font-semibold tracking-tight">Green Pasture Organics</span>
			</Link>

			<ProductCarousel className="max-w-[640px] pr-10" items={PRODUCTS} />

			<div className="relative max-w-md">
				<h1 className="text-4xl font-semibold leading-[1.1] tracking-tight">
					Nature, <span style={{ color: "var(--color-accent)" }}>delivered</span> to your door.
				</h1>
				<p className="mt-4 text-sm text-white/70">Your cart, wishlist and order history are waiting right where you left them.</p>
				<div className="mt-6 flex flex-wrap gap-2 text-xs">
					{[
						[Leaf, "100% organic"],
						[Truck, "Nationwide delivery"],
						[ShieldCheck, "Secure checkout"],
					].map(([Icon, label]: any) => (
						<span key={label} className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 backdrop-blur">
							<Icon className="h-3.5 w-3.5" style={{ color: "var(--color-accent)" }} />
							{label}
						</span>
					))}
				</div>
			</div>
		</aside>
	);
}
