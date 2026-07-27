"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import gsap from "gsap";
import { ArrowRight, Sprout } from "lucide-react";

/**
 * Hero for an organic supplement brand.
 *
 * The idea is literal: the page *grows*. A botanical sprig draws itself
 * stroke-by-stroke on load (GSAP, strokeDashoffset), leaves unfurl after their
 * stem arrives, and seed motes drift on a slow loop. Everything is vector and
 * CSS — no video, no stock photography beyond the single product image.
 */

/* Stems and leaves are paired so a leaf can never appear before the stem that
   carries it. Order matters more than exact geometry here. */
const STEMS = [
	"M300 620 C300 520, 296 430, 300 330",
	"M300 470 C258 452, 226 424, 196 384",
	"M300 396 C344 380, 374 350, 398 310",
	"M300 330 C270 300, 254 262, 250 214",
	"M300 300 C334 274, 352 240, 360 196",
];

const LEAVES = [
	"M196 384 C168 356, 166 316, 192 292 C220 314, 224 356, 196 384 Z",
	"M398 310 C428 286, 430 244, 404 222 C376 244, 372 286, 398 310 Z",
	"M250 214 C226 186, 230 148, 258 130 C282 154, 278 192, 250 214 Z",
	"M360 196 C388 174, 392 136, 368 114 C342 136, 336 174, 360 196 Z",
	"M300 330 C282 300, 290 262, 318 246 C338 274, 328 312, 300 330 Z",
];

const MOTES = [
	{ left: "12%", size: 5, delay: 0, duration: 17, drift: 26 },
	{ left: "27%", size: 3, delay: 2.4, duration: 21, drift: -18 },
	{ left: "44%", size: 6, delay: 5.1, duration: 15, drift: 32 },
	{ left: "61%", size: 4, delay: 1.2, duration: 23, drift: -24 },
	{ left: "78%", size: 3, delay: 6.8, duration: 19, drift: 20 },
	{ left: "89%", size: 5, delay: 3.6, duration: 25, drift: -30 },
];

const BotanicalHero: React.FC = () => {
	const reduced = !!useReducedMotion();
	const rootRef = useRef<HTMLElement>(null);
	const artRef = useRef<HTMLDivElement>(null);

	const { scrollYProgress } = useScroll({ target: rootRef, offset: ["start start", "end start"] });
	const artY = useTransform(scrollYProgress, [0, 1], [0, reduced ? 0 : 110]);
	const copyY = useTransform(scrollYProgress, [0, 1], [0, reduced ? 0 : -40]);
	const fade = useTransform(scrollYProgress, [0, 0.85], [1, reduced ? 1 : 0]);

	/* Draw the sprig. GSAP earns its place here: one timeline sequences ~10
	   stroke tweens against a shared clock, which is fiddly with variants. */
	useEffect(() => {
		const el = artRef.current;
		if (!el) return;

		if (reduced) {
			gsap.set(el.querySelectorAll<SVGPathElement>(".gp-stem, .gp-leaf"), {
				strokeDashoffset: 0,
				opacity: 1,
			});
			return;
		}

		const ctx = gsap.context(() => {
			const tl = gsap.timeline({ delay: 0.25 });

			tl.to(".gp-stem", {
				strokeDashoffset: 0,
				duration: 1.1,
				stagger: 0.13,
				ease: "power2.inOut",
			})
				.to(
					".gp-leaf",
					{ strokeDashoffset: 0, opacity: 1, duration: 0.75, stagger: 0.11, ease: "power2.out" },
					"-=0.85",
				)
				.to(".gp-leaf-fill", { opacity: 1, duration: 0.9, stagger: 0.1, ease: "power1.out" }, "-=0.5")
				// A slow breathing sway once everything has arrived.
				.to(".gp-sprig", { rotate: 1.1, duration: 5, ease: "sine.inOut", repeat: -1, yoyo: true }, ">-0.2");
		}, el);

		return () => ctx.revert();
	}, [reduced]);

	const rise = (delay: number) => ({
		initial: { opacity: 0, y: reduced ? 0 : 26 },
		animate: { opacity: 1, y: 0 },
		transition: { duration: reduced ? 0 : 0.75, delay: reduced ? 0 : delay, ease: [0.22, 1, 0.36, 1] as const },
	});

	return (
		<section
			ref={rootRef}
			className="relative isolate overflow-hidden"
			style={{ background: "linear-gradient(158deg,#0c2b25 0%,#103630 42%,#164438 78%,#1f6554 100%)" }}
		>
			{/* Layered light — a canopy gap rather than a flat wash */}
			<div
				aria-hidden
				className="pointer-events-none absolute -top-1/3 left-[58%] h-[130vh] w-[130vh] -translate-x-1/2 rounded-full opacity-60"
				style={{ background: "radial-gradient(circle,rgba(154,202,60,0.22) 0%,rgba(154,202,60,0.06) 42%,transparent 68%)" }}
			/>
			<div
				aria-hidden
				className="pointer-events-none absolute bottom-[-30%] left-[-12%] h-[80vh] w-[80vh] rounded-full opacity-50"
				style={{ background: "radial-gradient(circle,rgba(70,154,133,0.30) 0%,transparent 65%)" }}
			/>

			{/* Grain — keeps the flat teal from reading as a plastic gradient */}
			<div
				aria-hidden
				className="pointer-events-none absolute inset-0 opacity-[0.14] mix-blend-overlay"
				style={{
					backgroundImage:
						"url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='0.55'/%3E%3C/svg%3E\")",
				}}
			/>

			{/* Drifting seed motes */}
			{!reduced && (
				<div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
					{MOTES.map((m, i) => (
						<motion.span
							key={i}
							className="absolute rounded-full"
							style={{
								left: m.left,
								width: m.size,
								height: m.size,
								background: "rgba(212,232,160,0.75)",
								boxShadow: "0 0 12px rgba(154,202,60,0.55)",
							}}
							initial={{ top: "108%", opacity: 0 }}
							animate={{ top: "-10%", opacity: [0, 0.9, 0.9, 0], x: [0, m.drift, 0] }}
							transition={{
								duration: m.duration,
								delay: m.delay,
								repeat: Infinity,
								ease: "linear",
								times: [0, 0.12, 0.82, 1],
							}}
						/>
					))}
				</div>
			)}

			<motion.div style={{ opacity: fade }} className="page-wrapper relative z-10 py-20 md:py-28 lg:py-36">
				<div className="grid grid-cols-1 items-center gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8">
					{/* ---------- Copy ---------- */}
					<motion.div style={{ y: copyY }} className="max-w-xl">
						<motion.div
							{...rise(0.05)}
							className="mb-7 inline-flex items-center gap-2 rounded-full py-1.5 pl-2 pr-4 backdrop-blur-sm"
							style={{ background: "rgba(154,202,60,0.12)", border: "1px solid rgba(154,202,60,0.28)" }}
						>
							<span
								className="flex h-6 w-6 items-center justify-center rounded-full"
								style={{ background: "rgba(154,202,60,0.22)" }}
							>
								<Sprout className="h-3.5 w-3.5" style={{ color: "#cbe58a" }} />
							</span>
							<span className="text-[0.7rem] font-medium uppercase tracking-[0.18em]" style={{ color: "#cbe58a" }}>
								Grown, never manufactured
							</span>
						</motion.div>

						<h1 className="font-display text-[2.9rem] leading-[0.94] tracking-[-0.02em] text-[#f4f8e8] sm:text-6xl lg:text-[4.6rem]">
							<motion.span {...rise(0.14)} className="block" style={{ fontWeight: 300 }}>
								Wellness that
							</motion.span>
							<motion.span
								{...rise(0.24)}
								className="block italic"
								style={{ fontWeight: 500, color: "#b9dd72" }}
							>
								remembers
							</motion.span>
							<motion.span {...rise(0.34)} className="block" style={{ fontWeight: 300 }}>
								where it grew.
							</motion.span>
						</h1>

						<motion.p
							{...rise(0.46)}
							className="mt-7 max-w-md text-base leading-relaxed sm:text-lg"
							style={{ color: "rgba(226,238,206,0.72)" }}
						>
							Immunity and fertility supplements pressed from organically farmed roots,
							leaves and seeds — traced from Northern Nigerian soil to the jar in your hand.
						</motion.p>

						<motion.div {...rise(0.56)} className="mt-9 flex flex-wrap items-center gap-3">
							<Link
								href="/products"
								className="group inline-flex items-center gap-2.5 rounded-full px-7 py-3.5 text-sm font-semibold transition-all duration-300 hover:shadow-[0_0_34px_rgba(154,202,60,0.45)]"
								style={{ background: "#9aca3c", color: "#0c2b25" }}
							>
								Shop the range
								<ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
							</Link>
							<Link
								href="/about"
								className="rounded-full px-7 py-3.5 text-sm font-medium transition-colors duration-300"
								style={{ border: "1px solid rgba(226,238,206,0.28)", color: "rgba(226,238,206,0.9)" }}
							>
								How we source
							</Link>
						</motion.div>

						{/* Provenance strip — concrete claims, not vague trust badges */}
						<motion.dl
							{...rise(0.68)}
							className="mt-12 grid max-w-md grid-cols-3 gap-6 border-t pt-7"
							style={{ borderColor: "rgba(226,238,206,0.16)" }}
						>
							{[
								{ n: "100%", l: "Certified organic" },
								{ n: "12", l: "Partner farms" },
								{ n: "48h", l: "Farm to dispatch" },
							].map((s) => (
								<div key={s.l}>
									<dt className="font-display text-2xl tabular-nums sm:text-3xl" style={{ color: "#b9dd72", fontWeight: 500 }}>
										{s.n}
									</dt>
									<dd className="mt-1 text-[0.68rem] uppercase tracking-[0.12em]" style={{ color: "rgba(226,238,206,0.55)" }}>
										{s.l}
									</dd>
								</div>
							))}
						</motion.dl>
					</motion.div>

					{/* ---------- Botanical art ---------- */}
					<motion.div ref={artRef} style={{ y: artY }} className="relative mx-auto w-full max-w-[520px]">
						<svg viewBox="0 0 600 680" className="w-full" role="img" aria-label="Illustration of a growing sprig">
							<defs>
								<linearGradient id="gp-leaf-grad" x1="0" y1="0" x2="0" y2="1">
									<stop offset="0%" stopColor="#b9dd72" stopOpacity="0.42" />
									<stop offset="100%" stopColor="#9aca3c" stopOpacity="0.08" />
								</linearGradient>
							</defs>

							<g className="gp-sprig" style={{ transformOrigin: "300px 620px" }}>
								{LEAVES.map((d, i) => (
									<path key={`fill-${i}`} className="gp-leaf-fill" d={d} fill="url(#gp-leaf-grad)" opacity={0} />
								))}
								{STEMS.map((d, i) => (
									<path
										key={`stem-${i}`}
										className="gp-stem"
										d={d}
										fill="none"
										stroke="#7fac2d"
										strokeWidth={i === 0 ? 3 : 2}
										strokeLinecap="round"
										pathLength={1}
										strokeDasharray={1}
										strokeDashoffset={1}
									/>
								))}
								{LEAVES.map((d, i) => (
									<path
										key={`leaf-${i}`}
										className="gp-leaf"
										d={d}
										fill="none"
										stroke="#cbe58a"
										strokeWidth={1.6}
										strokeLinejoin="round"
										pathLength={1}
										strokeDasharray={1}
										strokeDashoffset={1}
										opacity={0}
									/>
								))}
							</g>
						</svg>

						{/* Product, seated in the sprig rather than floating in a box */}
						<motion.div
							initial={{ opacity: 0, scale: 0.9, y: 20 }}
							animate={{ opacity: 1, scale: 1, y: 0 }}
							transition={{ duration: reduced ? 0 : 1, delay: reduced ? 0 : 1.15, ease: [0.22, 1, 0.36, 1] }}
							className="absolute bottom-[6%] left-1/2 w-[58%] -translate-x-1/2"
						>
							<div
								className="overflow-hidden rounded-[26px]"
								style={{
									border: "1px solid rgba(203,229,138,0.22)",
									boxShadow: "0 34px 70px -24px rgba(0,0,0,0.65)",
								}}
							>
								<Image
									src="/images/Green_vegggies_1.jpeg"
									alt="Organically farmed greens"
									width={520}
									height={520}
									priority
									quality={95}
									className="h-full w-full object-cover"
								/>
							</div>
						</motion.div>
					</motion.div>
				</div>
			</motion.div>

			{/* Soft hand-off into the next section */}
			<div
				aria-hidden
				className="pointer-events-none absolute inset-x-0 bottom-0 h-28"
				style={{ background: "linear-gradient(to bottom,transparent,var(--background))" }}
			/>
		</section>
	);
};

export default BotanicalHero;
