"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/router";
import { CornerDownLeft, Search } from "lucide-react";
import { MODULES } from "@/_navigations/modules";
import { useHasPrivilege } from "@/_hooks/usePrivilege";
import { cn } from "@/lib/utils";

/** ⌘K / Ctrl+K palette: type to filter the admin pages you may open, Enter to go. */
export function JumpTo({ open, onClose }: { open: boolean; onClose: () => void }) {
	const router = useRouter();
	const hasPrivilege = useHasPrivilege();
	const [q, setQ] = useState("");
	const [active, setActive] = useState(0);
	const inputRef = useRef<HTMLInputElement>(null);

	const results = useMemo(() => {
		const term = q.trim().toLowerCase();
		return MODULES.filter((m) => hasPrivilege(m.privilege) && (!term || m.title.toLowerCase().includes(term) || m.group.toLowerCase().includes(term)));
	}, [q, hasPrivilege]);

	useEffect(() => {
		if (open) {
			setQ("");
			setActive(0);
		}
	}, [open]);
	useEffect(() => setActive(0), [q]);

	if (!open) return null;

	const go = (path: string) => {
		onClose();
		router.push(path);
	};

	return (
		<div className="fixed inset-0 z-[100] flex items-start justify-center bg-black/40 p-4 pt-[15vh]" onMouseDown={(e) => e.target === e.currentTarget && onClose()} role="dialog" aria-modal="true" aria-label="Jump to">
			<div className="bg-popover animate-in fade-in-50 zoom-in-95 w-full max-w-md overflow-hidden rounded-2xl border shadow-2xl duration-150">
				<div className="flex items-center gap-2 border-b px-3">
					<Search className="text-muted-foreground size-4 shrink-0" />
					<input
						ref={inputRef}
						autoFocus
						value={q}
						onChange={(e) => setQ(e.target.value)}
						onKeyDown={(e) => {
							if (e.key === "Escape") onClose();
							else if (e.key === "ArrowDown") (e.preventDefault(), setActive((a) => Math.min(a + 1, results.length - 1)));
							else if (e.key === "ArrowUp") (e.preventDefault(), setActive((a) => Math.max(a - 1, 0)));
							else if (e.key === "Enter" && results[active]) go(results[active].path);
						}}
						placeholder="Jump to a page…"
						aria-label="Jump to a page"
						className="h-11 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
					/>
				</div>
				<ul className="max-h-72 overflow-y-auto p-1.5" role="listbox">
					{results.length === 0 && <li className="text-muted-foreground px-3 py-6 text-center text-xs">No matching pages</li>}
					{results.map((m, i) => (
						<li key={m.path} role="option" aria-selected={i === active}>
							<button
								type="button"
								onMouseEnter={() => setActive(i)}
								onClick={() => go(m.path)}
								className={cn("flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm", i === active ? "bg-brand/15 font-semibold" : "hover:bg-muted/60")}
							>
								<m.icon className="text-brand-ink size-4 shrink-0" />
								<span className="flex-1">{m.title}</span>
								<span className="text-muted-foreground text-[10px] uppercase tracking-wider">{m.group}</span>
								{i === active && <CornerDownLeft className="text-muted-foreground size-3.5" />}
							</button>
						</li>
					))}
				</ul>
			</div>
		</div>
	);
}
