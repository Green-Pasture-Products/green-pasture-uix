"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronsUpDown, LogOut, Monitor, Moon, ShieldCheck, Settings, Sun } from "lucide-react";
import { useTheme } from "@/_hooks/useTheme";
import { cn } from "@/lib/utils";

interface Props {
	name: string;
	email?: string;
	roleLabel: string;
	initials: string;
	onSignOut: () => void;
}

const THEMES = [
	{ value: "light", label: "Light", icon: Sun },
	{ value: "dark", label: "Dark", icon: Moon },
	{ value: "system", label: "Auto", icon: Monitor },
] as const;

/** Sidebar footer: who you are, and a panel with account links, a theme switch and sign out. */
export function AdminUserMenu({ name, email, roleLabel, initials, onSignOut }: Props) {
	const [open, setOpen] = useState(false);
	const ref = useRef<HTMLDivElement>(null);
	const { preference, setPreference } = useTheme();

	useEffect(() => {
		if (!open) return;
		const onDown = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
		const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
		document.addEventListener("mousedown", onDown);
		document.addEventListener("keydown", onKey);
		return () => {
			document.removeEventListener("mousedown", onDown);
			document.removeEventListener("keydown", onKey);
		};
	}, [open]);

	const item = "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors hover:bg-secondary/70";

	return (
		<div ref={ref} className="relative">
			{open && (
				<div role="menu" aria-label="Account menu" className="bg-card animate-in fade-in-50 zoom-in-95 absolute bottom-full left-0 z-50 mb-2 w-72 rounded-2xl border py-2.5 shadow-2xl duration-150">
					<div className="flex items-center gap-3 px-4 py-2">
						<span className="bg-brand text-brand-foreground flex size-11 shrink-0 items-center justify-center rounded-xl text-sm font-extrabold shadow-xs">{initials}</span>
						<div className="min-w-0">
							<p className="truncate text-sm font-extrabold">{name}</p>
							{email && <p className="text-muted-foreground mt-0.5 truncate text-xs">{email}</p>}
						</div>
					</div>

					<div className="bg-border mx-3 my-2 h-px" />
					<div className="space-y-0.5 px-2">
						<Link href="/admin/settings?tab=profile" role="menuitem" className={item} onClick={() => setOpen(false)}>
							<Settings className="text-muted-foreground size-4" /> Account Settings
						</Link>
						<Link href="/admin/settings?tab=security" role="menuitem" className={item} onClick={() => setOpen(false)}>
							<ShieldCheck className="text-muted-foreground size-4" /> Password &amp; Security
						</Link>
					</div>

					<div className="bg-border mx-3 my-2 h-px" />
					<div className="px-4 py-2">
						<p className="text-muted-foreground mb-2 text-[10px] font-bold uppercase tracking-wider">Theme</p>
						<div className="bg-secondary/50 grid grid-cols-3 gap-1 rounded-xl border p-1" role="radiogroup" aria-label="Theme">
							{THEMES.map(({ value, label, icon: Icon }) => {
								const active = preference === value;
								return (
									<button
										key={value}
										type="button"
										role="radio"
										aria-checked={active}
										onClick={() => setPreference(value)}
										className={cn(
											"flex items-center justify-center gap-1.5 rounded-lg border py-1.5 text-xs font-semibold transition-colors",
											active ? "bg-brand/20 border-brand/40 font-bold shadow-2xs" : "text-muted-foreground hover:bg-background/60 border-transparent",
										)}
									>
										<Icon className="size-3.5" /> {label}
									</button>
								);
							})}
						</div>
					</div>

					<div className="bg-border mx-3 my-2 h-px" />
					<div className="px-2">
						<button type="button" role="menuitem" onClick={onSignOut} data-testid="sign-out" className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-rose-600 transition-colors hover:bg-rose-500/10 dark:text-rose-400">
							<LogOut className="size-4" /> Log out
						</button>
					</div>
				</div>
			)}

			<button
				type="button"
				aria-haspopup="menu"
				aria-expanded={open}
				onClick={() => setOpen(!open)}
				className="hover:bg-sidebar-accent flex w-full items-center gap-2.5 rounded-xl p-2 text-left transition-colors group-data-[collapsible=icon]:justify-center"
			>
				<span className="bg-brand text-brand-foreground flex size-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold shadow-2xs">{initials}</span>
				<span className="grid min-w-0 flex-1 leading-tight group-data-[collapsible=icon]:hidden">
					<span className="truncate text-xs font-bold">{name}</span>
					<span className="text-muted-foreground truncate text-[10px] capitalize">{roleLabel}</span>
				</span>
				<ChevronsUpDown className="text-muted-foreground/60 size-4 shrink-0 group-data-[collapsible=icon]:hidden" />
			</button>
		</div>
	);
}
