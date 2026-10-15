"use client";

import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface TabDef {
	id: string;
	label: string;
	icon?: LucideIcon;
	/** A small count after the label (e.g. orders). Hidden when null or undefined. */
	count?: number | null;
}

interface AnimatedTabsProps {
	tabs: TabDef[];
	value: string;
	onChange: (id: string) => void;
	/** Accessible name of the tab list. */
	label: string;
	/** The active tab's content. It slides in from the side the tab sits on, and its cards rise in one after another. */
	children: React.ReactNode;
	className?: string;
}

/**
 * Tabs with a sliding indicator and a direction-aware panel transition (all CSS, so it costs no animation library and is switched
 * off by prefers-reduced-motion). Arrow keys, Home and End move between tabs. The list scrolls sideways on a narrow screen instead
 * of wrapping, and the active tab is kept in view. The caller owns `value`, so it can live in the URL.
 */
const AnimatedTabs: React.FC<AnimatedTabsProps> = ({ tabs, value, onChange, label, children, className }) => {
	const listRef = useRef<HTMLDivElement>(null);
	const buttons = useRef<Record<string, HTMLButtonElement | null>>({});
	const [bar, setBar] = useState<{ left: number; width: number } | null>(null);
	const [ready, setReady] = useState(false); // no slide on the first paint, only on later changes
	const index = Math.max(0, tabs.findIndex((t) => t.id === value));
	const previous = useRef(index);
	const direction = index >= previous.current ? "right" : "left";
	useEffect(() => {
		previous.current = index;
	}, [index]);

	const measure = useCallback(() => {
		const el = buttons.current[tabs[index]?.id];
		if (el) setBar({ left: el.offsetLeft, width: el.offsetWidth });
	}, [tabs, index]);

	useLayoutEffect(() => {
		measure();
	}, [measure]);
	useEffect(() => {
		const id = requestAnimationFrame(() => setReady(true));
		return () => cancelAnimationFrame(id);
	}, []);
	useEffect(() => {
		const list = listRef.current;
		if (!list || typeof ResizeObserver === "undefined") return;
		const ro = new ResizeObserver(measure);
		ro.observe(list);
		return () => ro.disconnect();
	}, [measure]);
	useEffect(() => {
		buttons.current[tabs[index]?.id]?.scrollIntoView?.({ block: "nearest", inline: "nearest", behavior: "smooth" });
	}, [index, tabs]);

	const onKeyDown = (e: React.KeyboardEvent) => {
		const keys: Record<string, number> = { ArrowRight: index + 1, ArrowLeft: index - 1, Home: 0, End: tabs.length - 1 };
		if (!(e.key in keys)) return;
		e.preventDefault();
		const next = tabs[(keys[e.key] + tabs.length) % tabs.length];
		onChange(next.id);
		buttons.current[next.id]?.focus();
	};

	return (
		<div className={className}>
			<div className="border-border relative -mx-1 overflow-x-auto border-b px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
				<div ref={listRef} role="tablist" aria-label={label} onKeyDown={onKeyDown} className="relative flex w-max min-w-full gap-1">
					{tabs.map((t) => {
						const active = t.id === value;
						const Icon = t.icon;
						return (
							<button
								key={t.id}
								ref={(el) => {
									buttons.current[t.id] = el;
								}}
								type="button"
								role="tab"
								id={`tab-${t.id}`}
								aria-selected={active}
								aria-controls={`panel-${t.id}`}
								tabIndex={active ? 0 : -1}
								onClick={() => onChange(t.id)}
								className={cn(
									"group relative flex cursor-pointer items-center gap-1.5 rounded-t-lg px-3 py-3 text-sm sm:gap-2 sm:px-4 font-semibold whitespace-nowrap transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:outline-none",
									active ? "text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
								)}
							>
								{Icon && <Icon className={cn("size-4 transition-transform duration-300", active ? "scale-110 text-[var(--color-primary)]" : "group-hover:scale-110")} />}
								{t.label}
								{t.count != null && (
									<span className={cn("rounded-full px-1.5 py-0.5 text-[11px] leading-none font-semibold tabular-nums transition-colors duration-200", active ? "bg-brand/15 text-brand-ink" : "bg-muted text-muted-foreground")}>{t.count}</span>
								)}
							</button>
						);
					})}
					<span
						aria-hidden
						className={cn("bg-brand pointer-events-none absolute bottom-0 h-0.5 rounded-full", ready && "transition-[transform,width] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]")}
						style={{ left: 0, width: bar?.width ?? 0, transform: `translateX(${bar?.left ?? 0}px)`, opacity: bar ? 1 : 0 }}
					/>
				</div>
			</div>
			{/* Keyed by tab, so a change remounts the panel and replays the entrance. */}
			<div key={value} role="tabpanel" id={`panel-${value}`} aria-labelledby={`tab-${value}`} tabIndex={0} className={cn("tab-panel pt-5 focus-visible:outline-none", direction === "right" ? "tab-from-right" : "tab-from-left")}>
				{children}
			</div>
		</div>
	);
};

export default AnimatedTabs;
