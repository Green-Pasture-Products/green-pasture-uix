"use client";

import React, { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ArrowLeftRight, CircleDollarSign, Hourglass, PackageCheck, PackageOpen, PackageX, Truck, Undo2, type LucideIcon } from "lucide-react";

export type ProgressStepKey = "PENDING" | "PROCESSING" | "IN_TRANSIT" | "DELIVERED";

interface StepDef {
	key: ProgressStepKey;
	label: string;
	icon: LucideIcon;
	description: string;
}

/** The journey of an order, one icon per stage so each step says what is happening at a glance. */
const STEPS: StepDef[] = [
	{ key: "PENDING", label: "Pending", icon: Hourglass, description: "Placed, waiting to be confirmed." },
	{ key: "PROCESSING", label: "Processing", icon: PackageOpen, description: "Confirmed and being packed." },
	{ key: "IN_TRANSIT", label: "In transit", icon: Truck, description: "Handed over for delivery and on its way." },
	{ key: "DELIVERED", label: "Delivered", icon: PackageCheck, description: "Reached the customer." },
];

/** Where an order can end up besides "delivered". */
const ENDED: Record<string, { label: string; icon: LucideIcon; description: string; afterDelivery: boolean }> = {
	CANCELLED: { label: "Cancelled", icon: PackageX, description: "This order was cancelled and will not be fulfilled.", afterDelivery: false },
	REFUNDED: { label: "Refunded", icon: CircleDollarSign, description: "The customer was refunded.", afterDelivery: true },
	RETURNED: { label: "Returned", icon: Undo2, description: "The order came back from the customer.", afterDelivery: true },
	EXCHANGED: { label: "Exchanged", icon: ArrowLeftRight, description: "The order was exchanged.", afterDelivery: true },
};

export interface OrderProgressProps {
	status: string;
	/** Rename a stage (the customer sees "Order placed" where the admin sees "Pending"). */
	labels?: Partial<Record<ProgressStepKey, string>>;
	/** A date or note shown under a stage once it has been reached. */
	details?: Partial<Record<ProgressStepKey, string | undefined>>;
}

const GREEN = "var(--color-primary, #16a34a)";
const RED = "#ef4444";

/**
 * The order's journey as a row of icon markers on a track. On load the markers pop in, the track fills up to the current stage,
 * and the current stage loops a small motion that fits it (hourglass turns, box bobs, truck rolls). All of it is GSAP, and it is
 * skipped entirely for visitors who ask their system for reduced motion: they get the finished picture.
 */
const OrderProgress: React.FC<OrderProgressProps> = ({ status, labels, details }) => {
	const root = useRef<HTMLDivElement>(null);
	const current = String(status ?? "").toUpperCase();
	const ended = ENDED[current];
	const index = STEPS.findIndex((s) => s.key === current);
	const cancelled = current === "CANCELLED";

	// A cancelled order has no journey to show: one clear state instead of four greyed-out stages.
	const steps: (StepDef & { ended?: boolean })[] = [...STEPS, ...(ended?.afterDelivery ? [{ key: current as ProgressStepKey, label: ended.label, icon: ended.icon, description: ended.description, ended: true }] : [])];
	const reached = ended?.afterDelivery ? steps.length : index >= 0 ? index + 1 : 1; // how many stages are done or current
	const currentIdx = ended?.afterDelivery ? steps.length - 1 : index;

	useLayoutEffect(() => {
		const el = root.current;
		if (!el) return;
		const mm = gsap.matchMedia();
		const q = <T extends Element = HTMLElement>(sel: string) => Array.from(el.querySelectorAll<T>(sel));

		mm.add("(prefers-reduced-motion: no-preference)", () => {
			const bubbles = q("[data-bubble]");
			const icons = q("[data-icon]");
			const labelEls = q("[data-label]");
			const fill = el.querySelector<HTMLElement>("[data-fill]");
			const target = steps.length > 1 ? Math.max(0, Math.min(1, (reached - 1) / (steps.length - 1))) : 0;

			const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
			tl.fromTo(bubbles, { scale: 0.3, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.55, ease: "back.out(1.9)", stagger: 0.1 }, 0)
				.fromTo(icons, { rotate: -25, scale: 0.5 }, { rotate: 0, scale: 1, duration: 0.5, ease: "back.out(2)", stagger: 0.1 }, 0.1)
				.fromTo(labelEls, { y: 6, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, stagger: 0.08 }, 0.2);
			if (fill) tl.fromTo(fill, { scaleX: 0 }, { scaleX: target, duration: 0.5 + 0.35 * reached, ease: "power2.inOut" }, 0.15);

			// The current stage keeps a quiet, fitting motion going.
			const here = bubbles[currentIdx];
			const hereIcon = here?.querySelector<HTMLElement>("[data-icon]");
			const ring = here?.querySelector<HTMLElement>("[data-ring]");
			const key = steps[currentIdx]?.key;
			if (here && hereIcon) {
				if (key === "DELIVERED" || steps[currentIdx]?.ended) {
					// The journey is over: one celebratory pop and a single ring, then stillness.
					tl.fromTo(hereIcon, { scale: 1 }, { scale: 1.25, duration: 0.35, ease: "power2.out", yoyo: true, repeat: 1 }, ">-0.1");
					if (ring) tl.fromTo(ring, { scale: 1, opacity: 0.45 }, { scale: 2.1, opacity: 0, duration: 0.9, ease: "power1.out" }, "<");
				} else {
					if (ring) gsap.fromTo(ring, { scale: 1, opacity: 0.4 }, { scale: 1.8, opacity: 0, duration: 1.6, ease: "power1.out", repeat: -1, delay: 0.9 });
					if (key === "PENDING") gsap.to(hereIcon, { rotate: 180, duration: 0.9, ease: "power2.inOut", repeat: -1, repeatDelay: 1.1, delay: 1.2 });
					if (key === "PROCESSING") gsap.to(hereIcon, { y: -3, duration: 0.7, ease: "sine.inOut", yoyo: true, repeat: -1, delay: 1 });
					if (key === "IN_TRANSIT") gsap.to(hereIcon, { x: 3, duration: 0.35, ease: "sine.inOut", yoyo: true, repeat: -1, delay: 1 });
				}
			}

			return () => {
				gsap.killTweensOf([...bubbles, ...icons, ...labelEls, fill, ring, hereIcon].filter(Boolean));
			};
		});

		// Reduced motion: no tweens, just the finished picture.
		mm.add("(prefers-reduced-motion: reduce)", () => {
			const fill = el.querySelector<HTMLElement>("[data-fill]");
			if (fill && steps.length > 1) gsap.set(fill, { scaleX: Math.max(0, Math.min(1, (reached - 1) / (steps.length - 1))) });
		});

		return () => mm.revert();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [current]);

	if (cancelled) {
		return (
			<div ref={root} className="flex items-center gap-4 rounded-xl px-4 py-4" style={{ background: "rgba(239,68,68,0.08)" }} role="status">
				<span data-bubble className="relative flex size-12 shrink-0 items-center justify-center rounded-full text-white" style={{ background: RED }}>
					<span data-ring aria-hidden className="absolute inset-0 rounded-full" style={{ background: RED, opacity: 0 }} />
					<PackageX data-icon size={22} className="relative" />
				</span>
				<div className="min-w-0">
					<p data-label className="text-sm font-semibold" style={{ color: RED }}>
						Order cancelled
					</p>
					<p data-label className="mt-0.5 text-xs" style={{ color: "var(--text-hint)" }}>
						{ENDED.CANCELLED.description}
					</p>
				</div>
			</div>
		);
	}

	const inset = 50 / steps.length; // the track runs from the centre of the first column to the centre of the last
	return (
		<div ref={root} className="relative">
			<div aria-hidden className="absolute top-5 h-1 -translate-y-1/2 overflow-hidden rounded-full" style={{ left: `${inset}%`, right: `${inset}%`, background: "var(--border-light)" }}>
				<div data-fill className="h-full origin-left rounded-full" style={{ background: GREEN, transform: "scaleX(0)" }} />
			</div>
			<ol className="relative grid" style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }} aria-label="Order progress">
				{steps.map((step, i) => {
					const done = i < currentIdx || (i === currentIdx && (step.key === "DELIVERED" || step.ended));
					const isCurrent = i === currentIdx;
					const Icon = step.icon;
					const tone = step.ended ? RED : GREEN;
					const detail = details?.[step.key];
					return (
						<li key={`${step.key}-${i}`} className="flex min-w-0 flex-col items-center text-center" aria-current={isCurrent ? "step" : undefined} title={step.description}>
							<span
								data-bubble
								className="relative flex size-10 items-center justify-center rounded-full border-2"
								style={{
									background: done || isCurrent ? (isCurrent && !done ? "var(--surface-paper)" : tone) : "var(--surface-paper)",
									borderColor: done || isCurrent ? tone : "var(--border-medium)",
									color: done ? "#fff" : isCurrent ? tone : "var(--text-hint)",
								}}
							>
								<span data-ring aria-hidden className="absolute inset-0 rounded-full" style={{ background: tone, opacity: 0 }} />
								<Icon data-icon size={18} className="relative" strokeWidth={2.2} />
							</span>
							<span data-label className="mt-2 max-w-full truncate px-1 text-xs whitespace-nowrap" style={{ color: done || isCurrent ? "var(--text-primary)" : "var(--text-hint)", fontWeight: isCurrent ? 600 : 500 }}>
								{labels?.[step.key] ?? step.label}
							</span>
							{detail && (done || isCurrent) && (
								<span data-label className="mt-0.5 max-w-full truncate px-1 text-[0.65rem] whitespace-nowrap" style={{ color: "var(--text-hint)" }} title={detail}>
									{detail}
								</span>
							)}
						</li>
					);
				})}
			</ol>
		</div>
	);
};

export default OrderProgress;
