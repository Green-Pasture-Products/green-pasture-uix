"use client";

import React from "react";
import { ChevronLeft, Pencil, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

/*
 * Record-page building blocks, in the egfm admin's language: a back link, the
 * record's name with its status and actions, an "Overview" fieldset of key
 * facts, and sections drawn as fieldsets with their title on the border.
 */

// ── Facts ──

export interface Fact {
	label: string;
	value: React.ReactNode;
	/** Long text: full width under its label. */
	wide?: boolean;
}

const isEmpty = (v: React.ReactNode) => v === "" || v === null || v === undefined;

interface DetailRowProps {
	label: string;
	value?: React.ReactNode;
	className?: string;
	wide?: boolean;
}

/** One fact of a record: label left, value right; empty values read "Empty". */
export const DetailRow: React.FC<DetailRowProps> = ({ label, value, className = "", wide }) => (
	// Label beside the value only when the section is wide enough (container query, not viewport): in a narrow column the
	// label sits above, so the value gets the full width and never has to break. Values stay on one line (ellipsis + tooltip).
	<div className={cn("border-border/60 grid min-w-0 gap-1 border-b py-2.5 last:border-b-0 @sm:grid-cols-[9rem_minmax(0,1fr)] @sm:gap-4", wide && "@sm:grid-cols-1 @sm:gap-1", className)}>
		<dt className="text-muted-foreground whitespace-nowrap text-sm">{label}</dt>
		{/* A "wide" row holds prose (a description): it gets the full width and wraps between words. Everything else is one line. */}
		<dd className={cn("text-foreground min-w-0 text-sm font-semibold", wide ? "whitespace-normal" : "truncate")} title={!wide && typeof value === "string" ? value : undefined}>
			{isEmpty(value) ? <span className="text-muted-foreground/60 font-normal">Empty</span> : value}
		</dd>
	</div>
);

/** Facts as a property list; two columns side by side on wide screens for long records. */
export function FactGrid({ facts, columns = 1 }: { facts: Fact[]; columns?: 1 | 2 }) {
	return (
		<dl className={cn("@container grid", columns > 1 && "xl:grid-cols-2 xl:gap-x-10")}>
			{facts.map((f) => (
				<DetailRow key={f.label} label={f.label} value={f.value} wide={f.wide} className={f.wide ? "xl:col-span-full" : undefined} />
			))}
		</dl>
	);
}

const fmt = (iso?: string | null) => (iso ? new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }) : "—");

/** When a record was added, by whom, and last changed. */
export function recordDates(r: { createdAt?: string | null; createdBy?: string | null; updatedAt?: string | null }): Fact[] {
	return [
		{ label: "Added", value: fmt(r.createdAt) },
		{ label: "Added by", value: r.createdBy || "—" },
		{ label: "Last updated", value: fmt(r.updatedAt) },
	];
}

// ── Section ──

interface DetailSectionProps {
	title: React.ReactNode;
	children: React.ReactNode;
	/** Sits on the border at the right (an Edit button, say). */
	action?: React.ReactNode;
	icon?: LucideIcon;
	description?: React.ReactNode;
	/** Let the body run edge to edge (tables draw their own padding). */
	flush?: boolean;
	className?: string;
}

/** One section of a record page as a fieldset: its title (and icon) the legend on the border. */
export const DetailSection: React.FC<DetailSectionProps> = ({ title, children, action, icon: Icon, description, flush = false, className = "" }) => (
	<fieldset className={cn("border-border bg-card relative min-w-0 rounded-xl border", className)}>
		<legend className="text-foreground ml-4 flex items-center gap-1.5 px-1.5 text-sm font-semibold">
			{Icon && <Icon aria-hidden className="text-brand-ink size-4 shrink-0" />}
			{title}
		</legend>
		{action && <div className="absolute -top-2.5 right-4 flex -translate-y-1/2 flex-wrap items-center gap-2 bg-[linear-gradient(to_bottom,var(--color-background)_50%,var(--color-card)_50%)] px-1.5">{action}</div>}
		{description && <p className="text-muted-foreground px-5 pt-1 text-xs">{description}</p>}
		<div className={cn("@container", flush ? "border-border mt-3 overflow-hidden rounded-b-xl border-t" : "px-5 pt-1 pb-3")}>{children}</div>
	</fieldset>
);

/** A section that reads first, with an Edit button swapping in its form. Key it by updatedAt so a save returns to the view. */
export function EditableSection({
	title,
	icon,
	facts,
	canEdit,
	columns,
	defaultEditing = false,
	children,
}: {
	title: string;
	icon?: LucideIcon;
	facts: Fact[];
	canEdit: boolean;
	columns?: 1 | 2;
	/** Start in the edit form (deep link from a list's Edit action). */
	defaultEditing?: boolean;
	/** The edit form; call `close` to go back to the view. */
	children: (close: () => void) => React.ReactNode;
}) {
	const [editing, setEditing] = React.useState(defaultEditing);
	if (editing) return <>{children(() => setEditing(false))}</>;
	return (
		<DetailSection
			title={title}
			icon={icon}
			action={
				canEdit && (
					<Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground h-7 gap-1.5 px-2" onClick={() => setEditing(true)}>
						<Pencil className="size-3.5" />
						Edit
					</Button>
				)
			}
		>
			<FactGrid facts={facts} columns={columns} />
		</DetailSection>
	);
}

// ── Header ──

interface DetailHeaderProps {
	title: string;
	subtitle?: string;
	/** Status badge, beside the title. */
	status?: React.ReactNode;
	/** Key facts, shown in the Overview fieldset. */
	metrics?: { label: string; value: string | number }[];
	/** Actions, top right. */
	actions?: React.ReactNode;
	children?: React.ReactNode;
}

/** The record's name with its status and actions, then an Overview fieldset of key facts. */
export const DetailHeader: React.FC<DetailHeaderProps> = ({ title, subtitle, status, metrics, actions, children }) => (
	<div className="space-y-4">
		<div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
			<div className="min-w-0 space-y-1.5">
				<div className="flex flex-wrap items-center gap-2.5">
					<h1 className="text-foreground min-w-0 text-lg font-semibold tracking-tight sm:truncate sm:text-xl" title={title}>{title}</h1>
					{status}
				</div>
				{subtitle && <p className="text-muted-foreground text-sm">{subtitle}</p>}
			</div>
			{actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
		</div>

		{metrics && metrics.length > 0 && (
			<fieldset className="border-border bg-card min-w-0 rounded-xl border px-4 pb-3">
				<legend className="text-muted-foreground px-1.5 text-xs font-medium">Overview</legend>
				<dl className="grid grid-cols-2 gap-x-8 gap-y-4 pt-1 sm:grid-cols-3 lg:grid-cols-4">
					{metrics.map((m) => (
						<div key={m.label} className="min-w-0">
							<dt className="text-muted-foreground text-xs">{m.label}</dt>
							<dd className="text-foreground truncate text-sm font-semibold whitespace-nowrap" title={String(m.value)}>
								{m.value}
							</dd>
						</div>
					))}
				</dl>
			</fieldset>
		)}
		{children}
	</div>
);

// ── Back link ──

interface BackButtonProps {
	onClick?: () => void;
	label?: string;
}

export const BackButton: React.FC<BackButtonProps> = ({ onClick, label = "Back" }) => (
	<button type="button" onClick={onClick || (() => window.history.back())} className="text-muted-foreground hover:text-foreground -ml-1 inline-flex cursor-pointer items-center gap-1 rounded-md px-1 py-0.5 text-xs font-medium transition-colors">
		<ChevronLeft className="size-4" />
		{label}
	</button>
);
