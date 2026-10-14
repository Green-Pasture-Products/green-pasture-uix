"use client";

import React from "react";
import { Check, X } from "lucide-react";

export interface TimelineStep {
	label: string;
	/** ISO timestamp. */
	at: string;
	/** primary = progress, success = completed well, error = stopped. */
	tone?: "primary" | "success" | "error";
	note?: string;
}

const TONE: Record<NonNullable<TimelineStep["tone"]>, { dot: string; chip: string }> = {
	primary: { dot: "bg-primary", chip: "text-primary border-primary" },
	success: { dot: "bg-green-600", chip: "text-green-600 border-green-600" },
	error: { dot: "bg-red-600", chip: "text-red-600 border-red-600" },
};

const exact = (iso: string) => new Date(iso).toLocaleString(undefined, { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" });

/** "3 min later", "2 h later", "1 day later": how long this step took after the one before it. */
function gap(from: string, to: string): string | null {
	const ms = new Date(to).getTime() - new Date(from).getTime();
	if (!Number.isFinite(ms) || ms < 60_000) return null;
	const min = Math.round(ms / 60_000);
	if (min < 60) return `${min} min later`;
	const h = Math.round(min / 60);
	if (h < 48) return `${h} h later`;
	return `${Math.round(h / 24)} days later`;
}

/**
 * A vertical stepper: steps enter one after another, the connector draws down between them, and the latest step ripples
 * once. The tone colours the dot border and icon; motion is switched off for prefers-reduced-motion (see globals.css).
 */
export function StatusTimeline({ steps }: { steps: TimelineStep[] }) {
	return (
		<ol className="py-3">
			{steps.map((step, i) => {
				const tone = TONE[step.tone ?? "primary"];
				const last = i === steps.length - 1;
				const after = i > 0 ? gap(steps[i - 1].at, step.at) : null;
				return (
					<li key={`${step.label}-${step.at}`} className="tl-step relative flex gap-3 pb-5 last:pb-0" style={{ ["--i" as string]: i }}>
						{!last && <span aria-hidden className="tl-line absolute top-6 bottom-0 left-[11px] w-0.5 rounded-full" style={{ background: "var(--border-light)", ["--i" as string]: i }} />}
						<span className="relative mt-0.5 flex size-6 shrink-0 items-center justify-center">
							{last && <span aria-hidden className={`tl-ripple absolute inset-0 rounded-full ${tone.dot}`} />}
							<span className={`relative flex size-6 items-center justify-center rounded-full border ${tone.chip}`} style={{ background: "var(--surface-paper)" }}>
								{step.tone === "success" ? <Check size={14} strokeWidth={3} /> : step.tone === "error" ? <X size={14} strokeWidth={3} /> : <span className={`size-1.5 rounded-full ${tone.dot}`} />}
							</span>
						</span>
						<div className="min-w-0 flex-1">
							<p className="text-sm leading-6 truncate" style={{ color: "var(--text-primary)" }} title={step.label}>
								{step.label}
							</p>
							<p className="text-xs" style={{ color: "var(--text-hint)" }}>
								<time dateTime={step.at}>{exact(step.at)}</time>
								{after && <span> · {after}</span>}
							</p>
							{step.note && <p className="mt-1.5 rounded px-2.5 py-1.5 text-xs" style={{ background: "var(--surface-medium)", color: "var(--text-secondary)" }}>{step.note}</p>}
						</div>
					</li>
				);
			})}
		</ol>
	);
}
