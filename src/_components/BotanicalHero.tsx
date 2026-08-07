"use client";

import React, { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Sprout } from "lucide-react";

/**
 * Hero for an organic supplement brand.
 *
 * The art is the photograph — a family at the table with the product — cropped
 * from the right so the image's own white field becomes the copy column. The
 * arch is baked into the asset, so nothing here masks or clips it.
 *
 * ponytail: hard-coded light palette rather than themed. The photo carries a
 * white background; a dark-mode hero would need a second asset, not CSS.
 */

const HERO_BG = "#ffffff";

const BotanicalHero: React.FC = () => {
	const reduced = !!useReducedMotion();
	const rootRef = useRef<HTMLElement>(null);

	const { scrollYProgress } = useScroll({ target: rootRef, offset: ["start start", "end start"] });
	const copyY = useTransform(scrollYProgress, [0, 1], [0, reduced ? 0 : -40]);
	const fade = useTransform(scrollYProgress, [0, 0.85], [1, reduced ? 1 : 0]);

	const rise = (delay: number) => ({
		initial: { opacity: 0, y: reduced ? 0 : 26 },
		animate: { opacity: 1, y: 0 },
		transition: { duration: reduced ? 0 : 0.75, delay: reduced ? 0 : delay, ease: [0.22, 1, 0.36, 1] as const },
	});

	return (
		<section ref={rootRef} className="relative isolate overflow-hidden" style={{ background: HERO_BG }}>
			{/* Photograph. In flow on small screens, pinned to the right half from lg up. */}
			<motion.div
				initial={{ opacity: 0, scale: reduced ? 1 : 1.04 }}
				animate={{ opacity: 1, scale: 1 }}
				transition={{ duration: reduced ? 0 : 1.2, ease: [0.22, 1, 0.36, 1] }}
				className="relative h-[300px] w-full sm:h-[380px] lg:absolute lg:inset-y-0 lg:right-0 lg:h-full lg:w-[58%]"
			>
				<Image
					src="/images/landing_page_image.png"
					alt="A family sharing an Exotic Green Smoothie supplement at the kitchen table"
					fill
					priority
					quality={95}
					sizes="(max-width: 1024px) 100vw, 58vw"
					className="object-cover object-right"
				/>
				{/* Feathers the crop edge into the copy column instead of a hard seam */}
				<div
					aria-hidden
					className="pointer-events-none absolute inset-y-0 left-0 hidden w-40 lg:block"
					style={{ background: `linear-gradient(to right, ${HERO_BG}, transparent)` }}
				/>
			</motion.div>

			<motion.div style={{ opacity: fade }} className="page-wrapper relative z-10 py-16 md:py-24 lg:py-32">
				<motion.div style={{ y: copyY }} className="max-w-xl lg:max-w-[46%]">
					<motion.div
						{...rise(0.05)}
						className="mb-7 inline-flex items-center gap-2 rounded-full py-1.5 pl-2 pr-4"
						style={{ background: "rgba(122,171,45,0.10)", border: "1px solid rgba(122,171,45,0.35)" }}
					>
						<span
							className="flex h-6 w-6 items-center justify-center rounded-full"
							style={{ background: "rgba(122,171,45,0.18)" }}
						>
							<Sprout className="h-3.5 w-3.5" style={{ color: "#5c8a1e" }} />
						</span>
						<span className="text-[0.7rem] font-medium uppercase tracking-[0.18em]" style={{ color: "#5c8a1e" }}>
							Grown, never manufactured
						</span>
					</motion.div>

					<h1 className="font-display text-[2.9rem] leading-[0.94] tracking-[-0.02em] sm:text-6xl lg:text-[4.4rem]" style={{ color: "#10231f" }}>
						<motion.span {...rise(0.14)} className="block" style={{ fontWeight: 300 }}>
							Wellness that
						</motion.span>
						<motion.span {...rise(0.24)} className="block italic" style={{ fontWeight: 500, color: "#5c8a1e" }}>
							remembers
						</motion.span>
						<motion.span {...rise(0.34)} className="block" style={{ fontWeight: 300 }}>
							where it grew.
						</motion.span>
					</h1>

					<motion.p
						{...rise(0.46)}
						className="mt-7 max-w-md text-base leading-relaxed sm:text-lg"
						style={{ color: "rgba(16,35,31,0.68)" }}
					>
						Immunity and fertility supplements pressed from organically farmed roots, leaves and seeds —
						traced from Northern Nigerian soil to the jar in your hand.
					</motion.p>

					<motion.div {...rise(0.56)} className="mt-9 flex flex-wrap items-center gap-3">
						<Link
							href="/products"
							className="group inline-flex items-center gap-2.5 rounded-full px-7 py-3.5 text-sm font-semibold transition-all duration-300 hover:shadow-[0_10px_30px_-8px_rgba(122,171,45,0.65)]"
							style={{ background: "#9aca3c", color: "#0c2b25" }}
						>
							Shop the range
							<ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
						</Link>
						<Link
							href="/about"
							className="rounded-full px-7 py-3.5 text-sm font-medium transition-colors duration-300 hover:bg-[rgba(16,35,31,0.04)]"
							style={{ border: "1px solid rgba(16,35,31,0.18)", color: "#10231f" }}
						>
							How we source
						</Link>
					</motion.div>

					{/* Provenance strip — concrete claims, not vague trust badges */}
					<motion.dl
						{...rise(0.68)}
						className="mt-12 grid max-w-md grid-cols-3 gap-6 border-t pt-7"
						style={{ borderColor: "rgba(16,35,31,0.12)" }}
					>
						{[
							{ n: "100%", l: "Certified organic" },
							{ n: "12", l: "Partner farms" },
							{ n: "48h", l: "Farm to dispatch" },
						].map((s) => (
							<div key={s.l}>
								<dt className="font-display text-2xl tabular-nums sm:text-3xl" style={{ color: "#5c8a1e", fontWeight: 500 }}>
									{s.n}
								</dt>
								<dd className="mt-1 text-[0.68rem] uppercase tracking-[0.12em]" style={{ color: "rgba(16,35,31,0.55)" }}>
									{s.l}
								</dd>
							</div>
						))}
					</motion.dl>
				</motion.div>
			</motion.div>
		</section>
	);
};

export default BotanicalHero;
