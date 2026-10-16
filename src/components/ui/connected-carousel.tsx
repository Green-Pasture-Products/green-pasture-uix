"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";

import { cn } from "@/lib/utils";

export interface ProductItem {
	id: string | number;
	name: string;
	note: string;
	image: string;
	/** natural image size, so next/image can reserve space */
	width: number;
	height: number;
}

interface ProductCarouselProps extends React.HTMLAttributes<HTMLDivElement> {
	items: ProductItem[];
	autoPlayInterval?: number;
}

const OFFSETS = [-2, -1, 0, 1, 2] as const;
const SPRING = { type: "spring", stiffness: 220, damping: 26, mass: 0.75 } as const;
const CARD = "#f4f7e8"; // solid: the connector notches must match the card exactly
const INK = "#10231f";

const H = 340; // active card height
const GAP = 14;
const S1 = { w: 64, h: 250 };
const S2 = { w: 44, h: 170 };

const NOTCH_PATH = "M0 0C0 0 1.2422 13.5759 10 13.5759C18.7578 13.5759 20 0 20 0V37.3338C20 37.3338 18.7578 23.7578 10 23.7578C1.2422 23.7578 0 37.3338 0 37.3338V0Z";

/** Product showcase: a centred card flanked by connected, narrowing strips. Spring-driven, auto-advancing. */
export function ProductCarousel({ items, autoPlayInterval = 5000, className, ...props }: ProductCarouselProps) {
	const ref = useRef<HTMLDivElement>(null);
	const reduceMotion = useReducedMotion();
	const [page, setPage] = useState(0);
	const [cw, setCw] = useState(480);

	const total = items.length;
	const activeIndex = ((page % total) + total) % total;
	const showOuter = cw >= 560; // second strips only when there's room
	const W = Math.max(150, Math.min(360, cw - 2 * (GAP + S1.w) - (showOuter ? 2 * (GAP + S2.w) : 0)));

	useEffect(() => {
		const el = ref.current;
		if (!el) return;
		const ro = new ResizeObserver(([e]) => setCw(e.contentRect.width));
		ro.observe(el);
		return () => ro.disconnect();
	}, []);

	useEffect(() => {
		if (reduceMotion) return;
		const t = setTimeout(() => setPage((p) => p + 1), autoPlayInterval);
		return () => clearTimeout(t);
	}, [page, autoPlayInterval, reduceMotion]);

	const variant = (offset: number) => {
		const side = offset < 0 ? -1 : 1;
		const abs = Math.abs(offset);
		if (abs === 0) return { x: -W / 2, y: -H / 2, width: W, height: H, opacity: 1, zIndex: 0 };
		if (abs === 1) {
			return { x: side < 0 ? -W / 2 - GAP - S1.w : W / 2 + GAP, y: -S1.h / 2, width: S1.w, height: S1.h, opacity: 1, zIndex: 100 };
		}
		const shown = showOuter;
		const edge = W / 2 + GAP + S1.w + GAP;
		return { x: side < 0 ? -edge - S2.w : edge, y: -S2.h / 2, width: S2.w, height: S2.h, opacity: shown ? 1 : 0, zIndex: shown ? 100 : 0 };
	};

	const go = (delta: number) => setPage((p) => p + delta);

	return (
		<div
			role="region"
			aria-roledescription="carousel"
			aria-label="Our products"
			tabIndex={0}
			onKeyDown={(e) => (e.key === "ArrowLeft" ? go(-1) : e.key === "ArrowRight" ? go(1) : undefined)}
			className={cn("relative w-full select-none outline-none", className)}
			{...props}
		>
			<div ref={ref} aria-live="polite" className="relative w-full" style={{ height: H }}>
				{OFFSETS.map((offset) => {
					const virtual = page + offset;
					const item = items[((virtual % total) + total) % total];
					const isActive = offset === 0;
					const abs = Math.abs(offset);
					const notch = abs === 1 || (abs === 2 && showOuter);

					return (
						<motion.div
							key={virtual}
							onClick={() => !isActive && go(offset)}
							initial={false}
							animate={variant(offset)}
							transition={SPRING}
							style={{ position: "absolute", left: "50%", top: "50%", background: CARD, color: INK, pointerEvents: variant(offset).opacity ? "auto" : "none" }}
							className={cn("rounded-[28px] shadow-[0_18px_40px_rgba(0,0,0,0.28)]", !isActive && "cursor-pointer")}
						>
							{notch && (
								<div
									aria-hidden
									className="pointer-events-none absolute top-0 bottom-0 z-[100] flex items-center"
									style={{
										width: abs === 1 ? 22 : 18,
										height: abs === 1 ? 42 : 30,
										margin: "auto 0",
										color: CARD,
										...(offset < 0 ? { left: "calc(100% - 1px)" } : { right: "calc(100% - 1px)" }),
									}}
								>
									<svg viewBox="0 0 20 37.3338" preserveAspectRatio="none" className="block size-full overflow-visible fill-current">
										<path d={NOTCH_PATH} />
									</svg>
								</div>
							)}

							<div className="relative size-full overflow-hidden" style={{ borderRadius: "inherit" }}>
								{/* strip face */}
								<motion.div animate={{ opacity: isActive ? 0 : 1 }} transition={{ duration: 0.22 }} className="absolute inset-0 p-1.5">
									<div className="relative size-full overflow-hidden rounded-[20px] bg-[#e4ebc9]">
										<Image src={item.image} alt={item.name} fill unoptimized draggable={false} className="object-contain p-1" />
									</div>
								</motion.div>

								{/* full face, pinned to the active size so it doesn't squash while the card morphs */}
								<div className="absolute left-1/2 top-1/2" style={{ width: W, height: H, transform: "translate(-50%, -50%)" }}>
									<motion.div
										animate={{ opacity: isActive ? 1 : 0, x: isActive ? 0 : offset < 0 ? -W : W }}
										transition={SPRING}
										className={cn("flex size-full flex-col p-5", !isActive && "pointer-events-none")}
									>
										<div className="relative flex-1">
											<div
												aria-hidden
												className="absolute left-1/2 top-1/2 h-[78%] aspect-square -translate-x-1/2 -translate-y-1/2 rounded-full"
												style={{ background: "radial-gradient(circle, #dfe9b6 0%, #f4f7e8 70%)" }}
											/>
											<Image
												src={item.image}
												alt={item.name}
												fill
												unoptimized
												draggable={false}
												className="object-contain drop-shadow-[0_16px_18px_rgba(16,35,31,0.3)]"
											/>
										</div>
										<div className="mt-3">
											<h3 className="text-lg font-bold leading-tight tracking-tight">{item.name}</h3>
											<p className="mt-1 text-xs" style={{ color: "#5f736c" }}>
												{item.note}
											</p>
										</div>
									</motion.div>
								</div>
							</div>
						</motion.div>
					);
				})}
			</div>

			<div role="tablist" aria-label="Products" className="mt-5 flex items-center justify-center gap-1.5">
				{items.map((item, idx) => {
					const selected = idx === activeIndex;
					return (
						<button
							key={item.id}
							type="button"
							role="tab"
							aria-selected={selected}
							aria-label={item.name}
							tabIndex={selected ? 0 : -1}
							onClick={() => {
								let d = idx - activeIndex;
								if (d > total / 2) d -= total;
								else if (d < -total / 2) d += total;
								go(d);
							}}
							className={cn(
								"h-2 overflow-hidden rounded-[3px] bg-white/25 p-0 transition-[width] duration-300 outline-none focus-visible:ring-2 focus-visible:ring-white/70",
								selected ? "w-20" : "w-2 hover:bg-white/45"
							)}
						>
							{selected && (
								<motion.div
									key={page}
									initial={{ scaleX: reduceMotion ? 1 : 0 }}
									animate={{ scaleX: 1 }}
									transition={{ duration: autoPlayInterval / 1000, ease: "linear" }}
									className="h-full origin-left rounded-[3px]"
									style={{ background: "var(--color-accent)" }}
								/>
							)}
						</button>
					);
				})}
			</div>
		</div>
	);
}
