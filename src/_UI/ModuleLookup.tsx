"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Boxes, Check, ChevronDown, Plus, Search } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/egfm/popover";
import { FieldShell } from "./FieldShell";
import axiosInstance from "@/_utils/axiosInstance";
import { cn } from "@/lib/utils";

interface ModuleLookupProps {
	value: string;
	onChange: (module: string) => void;
	label?: string;
	required?: boolean;
	error?: string;
	disabled?: boolean;
}

/** Pick the module a flag belongs to from those already in use (with how many flags each holds), or type a new one. */
const ModuleLookup: React.FC<ModuleLookupProps> = ({ value, onChange, label = "Module", required, error, disabled }) => {
	const [counts, setCounts] = useState<Record<string, number>>({});
	const [open, setOpen] = useState(false);
	const [query, setQuery] = useState("");
	const [active, setActive] = useState(0);

	useEffect(() => {
		axiosInstance
			.get("feature-flags/admin")
			.then((res) => {
				const next: Record<string, number> = {};
				for (const f of res.data?.data ?? []) next[f.module] = (next[f.module] ?? 0) + 1;
				setCounts(next);
			})
			.catch(() => {});
	}, []);

	const q = query.trim().toLowerCase();
	const shown = useMemo(() => Object.keys(counts).sort().filter((m) => m.toLowerCase().includes(q)), [counts, q]);
	const canCreate = q.length > 0 && !Object.keys(counts).some((m) => m.toLowerCase() === q);
	const rows = [...shown, ...(canCreate ? [query.trim()] : [])];

	const pick = (m: string) => {
		onChange(m);
		setOpen(false);
	};

	const onKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "ArrowDown" || e.key === "ArrowUp") {
			e.preventDefault();
			setActive((i) => Math.min(Math.max(i + (e.key === "ArrowDown" ? 1 : -1), 0), rows.length - 1));
		} else if (e.key === "Enter") {
			e.preventDefault();
			if (rows[active]) pick(rows[active]);
		}
	};

	return (
		<FieldShell label={label} required={required} error={error}>
			<Popover
				open={open}
				onOpenChange={(next) => {
					setOpen(next);
					if (next) {
						setQuery("");
						setActive(Math.max(0, Object.keys(counts).sort().indexOf(value)));
					}
				}}
			>
				<PopoverTrigger asChild>
					<button
						type="button"
						role="combobox"
						aria-label={label}
						aria-expanded={open}
						aria-haspopup="listbox"
						aria-invalid={!!error}
						disabled={disabled}
						className="border-input bg-card hover:border-brand/60 focus:ring-ring aria-invalid:border-destructive flex min-h-11 w-full items-center gap-3 rounded-lg border px-3 py-2 text-left transition-colors focus:ring-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
					>
						<span className="bg-brand/15 text-brand-ink flex size-7 shrink-0 items-center justify-center rounded-lg">
							<Boxes className="size-4" />
						</span>
						<span className={cn("min-w-0 flex-1 truncate font-mono text-sm", value ? "font-medium" : "text-muted-foreground font-sans font-normal")} title={value}>
							{value || "Choose or add a module"}
						</span>
						<ChevronDown className={cn("text-muted-foreground size-4 shrink-0 transition-transform duration-200", open && "rotate-180")} />
					</button>
				</PopoverTrigger>
				<PopoverContent align="start" className="w-(--radix-popover-trigger-width) min-w-64 rounded-xl p-2">
					<div className="relative mb-2">
						<Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
						<input
							type="text"
							autoFocus
							placeholder="Search or type a new module"
							aria-label="Search modules"
							autoComplete="off"
							value={query}
							onChange={(e) => {
								setQuery(e.target.value);
								setActive(0);
							}}
							onKeyDown={onKeyDown}
							className="border-input bg-background focus-visible:ring-ring h-10 w-full rounded-lg border pr-3 pl-9 text-sm outline-none focus-visible:ring-2"
						/>
					</div>
					<ul role="listbox" aria-label="Modules" className="max-h-64 space-y-0.5 overflow-y-auto">
						{rows.length === 0 && <li className="text-muted-foreground px-3 py-6 text-center text-sm">Type a name to add a module.</li>}
						{rows.map((m, i) => {
							const isNew = canCreate && i === rows.length - 1;
							return (
								<li
									key={m}
									role="option"
									aria-selected={m === value}
									onClick={() => pick(m)}
									onMouseMove={() => setActive(i)}
									className={cn("flex min-h-11 cursor-pointer items-center gap-3 rounded-lg px-2.5 py-2 select-none", i === active && "bg-accent")}
								>
									{isNew ? <Plus className="text-brand size-4 shrink-0" /> : <Check className={cn("text-brand size-4 shrink-0 stroke-[2.5]", m !== value && "invisible")} />}
									<span className="min-w-0 flex-1 truncate font-mono text-sm" title={m}>
										{isNew ? `Use “${m}”` : m}
									</span>
									{!isNew && <span className="text-muted-foreground shrink-0 text-xs tabular-nums">{counts[m]} {counts[m] === 1 ? "flag" : "flags"}</span>}
								</li>
							);
						})}
					</ul>
				</PopoverContent>
			</Popover>
		</FieldShell>
	);
};

export default ModuleLookup;
