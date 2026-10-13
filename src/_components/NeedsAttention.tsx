"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

export interface AttentionItem {
	id: string;
	label: string;
	count: number;
	href: string;
	/** What the count counts, e.g. "to verify". */
	hint?: string;
	tone?: "warning" | "danger" | "brand";
}

const DOT = { warning: "bg-amber-500", danger: "bg-rose-500", brand: "bg-brand" } as const;

/** The few things that need someone today, as tiles that open the right list. */
export function NeedsAttention({ items }: { items: AttentionItem[] }) {
	const open = items.filter((i) => i.count > 0);
	return (
		<section aria-label="Needs attention" data-testid="needs-attention" className="flex h-full min-h-0 flex-col p-4">
			<header className="mb-3 flex items-center justify-between gap-2">
				<div>
					<h3 className="text-sm font-semibold">Needs attention</h3>
					<p className="text-muted-foreground text-xs">What is waiting on you</p>
				</div>
				<span className={cn("rounded-full px-2 py-0.5 text-[11px] font-semibold", open.length ? "bg-amber-500/15 text-amber-700 dark:text-amber-400" : "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400")}>
					{open.length ? `${open.reduce((n, i) => n + i.count, 0)} open` : "All clear"}
				</span>
			</header>
			<div className="grid flex-1 content-start gap-2">
				{items.map((i) => (
					<Link
						key={i.id}
						href={i.href}
						data-testid={`attention-${i.id}`}
						className="border-border bg-secondary/30 hover:border-brand/60 hover:bg-secondary/60 flex items-center gap-3 rounded-xl border px-4 py-2.5 transition-colors"
					>
						<span aria-hidden className={cn("size-1.5 shrink-0 rounded-full", i.count > 0 ? DOT[i.tone ?? "warning"] : "bg-muted-foreground/30")} />
						<span className="min-w-0 flex-1">
							<span className="block truncate text-xs font-medium">{i.label}</span>
							{i.hint && <span className="text-muted-foreground block truncate text-[11px]">{i.hint}</span>}
						</span>
						<span className="text-lg font-bold tabular-nums">{i.count}</span>
					</Link>
				))}
			</div>
		</section>
	);
}
