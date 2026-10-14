"use client";

import React, { useEffect, useState } from "react";
import { CheckSquare, Search, Square, X } from "lucide-react";
import Modal from "./Modal";
import Button from "./Button";
import { FieldShell } from "./FieldShell";
import axiosInstance from "@/_utils/axiosInstance";
import { cn } from "@/lib/utils";

interface AccountLookupProps {
	/** Profile ids. */
	value: string[];
	onChange: (ids: string[]) => void;
	label?: string;
	hint?: string;
	disabled?: boolean;
}

type Row = { id: string; name: string; email: string };
const MAX_CHIPS = 5;
const SOURCES = [
	{ key: "customers", label: "Customers" },
	{ key: "staff", label: "Staff" },
] as const;

/**
 * Pick accounts from a searchable list (customers or staff) instead of pasting ids. A read-only chip field opens a dialog:
 * click rows to toggle them, then Done. Closing the dialog keeps the previous selection. The form holds profile ids.
 */
const AccountLookup: React.FC<AccountLookupProps> = ({ value, onChange, label = "Target accounts", hint, disabled }) => {
	const [open, setOpen] = useState(false);
	const [draft, setDraft] = useState<string[]>([]);
	const [source, setSource] = useState<(typeof SOURCES)[number]["key"]>("customers");
	const [query, setQuery] = useState("");
	const [rows, setRows] = useState<Row[]>([]);
	const [loading, setLoading] = useState(false);
	// Names of every account seen, so a chip keeps its name after the list moves on to another search.
	const [names, setNames] = useState<Record<string, string>>({});

	useEffect(() => {
		if (!open) return;
		let stale = false;
		setLoading(true);
		const t = setTimeout(() => {
			axiosInstance
				.get(source, { params: { page: 1, limit: 20, search: query.trim() || undefined } })
				.then((res) => {
					if (stale) return;
					const next: Row[] = (res.data?.data?.items ?? []).map((r: any) => ({
						id: String(r.profile?.id ?? r.id),
						name: `${r.profile?.firstName ?? ""} ${r.profile?.lastName ?? ""}`.trim() || r.profile?.email || "—",
						email: r.profile?.email ?? "",
					}));
					setRows(next);
					setNames((n) => ({ ...n, ...Object.fromEntries(next.map((r) => [r.id, r.name])) }));
				})
				.catch(() => !stale && setRows([]))
				.finally(() => !stale && setLoading(false));
		}, 300);
		return () => {
			stale = true;
			clearTimeout(t);
		};
	}, [open, source, query]);

	const openDialog = () => {
		setDraft(value);
		setQuery("");
		setOpen(true);
	};
	const toggle = (id: string) => setDraft((d) => (d.includes(id) ? d.filter((x) => x !== id) : [...d, id]));
	const chipText = (id: string) => names[id] ?? `${id.slice(0, 8)}…`;
	const extra = value.length - MAX_CHIPS;

	return (
		<FieldShell label={label} hint={hint}>
			<div className={cn("border-input bg-card relative flex min-h-11 w-full flex-wrap items-center gap-1.5 rounded-lg border py-1.5 pr-9 pl-2", disabled && "opacity-50")}>
				{value.slice(0, MAX_CHIPS).map((id) => (
					<span key={id} className="bg-muted inline-flex max-w-full items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium">
						<span className="min-w-0 truncate" title={names[id] ?? id}>{chipText(id)}</span>
						{!disabled && (
							<button type="button" aria-label={`Remove ${chipText(id)}`} onClick={() => onChange(value.filter((x) => x !== id))} className="text-muted-foreground hover:text-foreground cursor-pointer">
								<X className="size-3" />
							</button>
						)}
					</span>
				))}
				{extra > 0 && <span className="text-muted-foreground text-xs whitespace-nowrap">+ {extra} more</span>}
				<button
					type="button"
					aria-label={label}
					aria-haspopup="dialog"
					disabled={disabled}
					onClick={openDialog}
					className="text-muted-foreground min-w-24 flex-1 cursor-pointer self-stretch text-left text-sm focus:outline-none disabled:cursor-not-allowed"
				>
					{value.length === 0 ? "Click to choose accounts" : ""}
				</button>
				<Search className="text-muted-foreground pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2" />
			</div>

			<Modal isOpen={open} onClose={() => setOpen(false)} title="Select accounts" subtitle="Click rows to select or unselect them, then Done." size="xl">
				<div className="space-y-3">
					<div role="tablist" className="flex gap-1">
						{SOURCES.map((s) => (
							<button
								key={s.key}
								type="button"
								role="tab"
								aria-selected={source === s.key}
								onClick={() => setSource(s.key)}
								className={cn("cursor-pointer rounded-full px-3 py-1.5 text-xs font-semibold", source === s.key ? "bg-brand text-brand-foreground" : "bg-muted text-muted-foreground")}
							>
								{s.label}
							</button>
						))}
					</div>
					<div className="relative">
						<Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
						<input
							type="text"
							autoFocus
							placeholder="Search by name or email"
							aria-label="Search accounts"
							autoComplete="off"
							value={query}
							onChange={(e) => setQuery(e.target.value)}
							className="border-input bg-background focus-visible:ring-ring h-10 w-full rounded-lg border pr-3 pl-9 text-sm outline-none focus-visible:ring-2"
						/>
					</div>
					<ul role="listbox" aria-multiselectable aria-label="Accounts" className="h-72 space-y-0.5 overflow-y-auto">
						{loading && rows.length === 0 && <li className="text-muted-foreground px-3 py-6 text-center text-sm">Loading…</li>}
						{!loading && rows.length === 0 && <li className="text-muted-foreground px-3 py-6 text-center text-sm">No account matches.</li>}
						{rows.map((r) => {
							const on = draft.includes(r.id);
							return (
								<li key={r.id} role="option" aria-selected={on} onClick={() => toggle(r.id)} className="hover:bg-accent flex min-h-12 cursor-pointer items-center gap-3 rounded-lg px-2.5 py-2 select-none">
									{on ? <CheckSquare className="text-brand size-4 shrink-0" /> : <Square className="text-muted-foreground/40 size-4 shrink-0" />}
									<span className="min-w-0 flex-1">
										<span className={cn("block truncate text-sm", on && "font-semibold")}>{r.name}</span>
										<span className="text-muted-foreground block truncate text-xs">{r.email}</span>
									</span>
								</li>
							);
						})}
					</ul>
					<div className="flex items-center justify-between gap-2 border-t pt-3">
						<Button type="button" variant="outlined" size="sm" onClick={() => setDraft([])}>Clear</Button>
						<Button
							type="button"
							size="sm"
							onClick={() => {
								onChange(draft);
								setOpen(false);
							}}
						>
							Done ({draft.length})
						</Button>
					</div>
				</div>
			</Modal>
		</FieldShell>
	);
};

export default AccountLookup;
