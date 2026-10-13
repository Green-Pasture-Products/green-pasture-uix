import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { Activity, CheckCheck, Check, Inbox as InboxIcon, Megaphone, Package, Undo2, Wallet, AlertTriangle, Bell } from "lucide-react";
import toast from "react-hot-toast";

import withAdminAuth from "@/_components/withAdminAuth";
import AdminLayout from "@/_components/AdminLayout";
import { Button } from "@/components/ui/button";
import axiosInstance from "@/_utils/axiosInstance";
import { useLiveEvent } from "@/_hooks/useLiveEvent";
import { notifyInboxChanged } from "@/_hooks/useInboxUnread";
import { cn } from "@/lib/utils";
import type { InboxNotification, PageMeta } from "@/types/live";

type View = "primary" | "other" | "cleared";
interface Summary {
	primaryUnread: number;
	otherUnread: number;
	cleared: number;
}

const TABS: { id: View; label: string; icon: React.ElementType; hint: string; empty: string; emptyHint: string }[] = [
	{ id: "primary", label: "Primary", icon: InboxIcon, hint: "Orders and payments that need you.", empty: "You're all caught up", emptyHint: "New orders and payments land here." },
	{ id: "other", label: "Other", icon: Activity, hint: "Stock alerts, reviews and announcements.", empty: "Nothing else to see", emptyHint: "Stock alerts, reviews and announcements land here." },
	{ id: "cleared", label: "Cleared", icon: CheckCheck, hint: "Items you've cleared. Restore any you still need.", empty: "Nothing cleared yet", emptyHint: "Anything you clear shows up here." },
];

const iconFor = (n: InboxNotification) => {
	if (n.metadata?.kind === "announcement") return Megaphone;
	if (n.type.startsWith("ORDER")) return Package;
	if (n.type.startsWith("PAYMENT")) return Wallet;
	if (n.type === "LOW_STOCK") return AlertTriangle;
	return Bell;
};

const targetFor = (n: InboxNotification): string | null => (n.metadata?.orderReference ? `/admin/order/${n.metadata.orderReference}` : null);

const groupLabel = (iso: string) => {
	const d = new Date(iso);
	const days = Math.floor((new Date().setHours(0, 0, 0, 0) - new Date(d).setHours(0, 0, 0, 0)) / 86400000);
	if (days <= 0) return "Today";
	if (days === 1) return "Yesterday";
	if (days < 7) return "Last 7 days";
	return d.toLocaleDateString(undefined, { month: "long", year: "numeric" });
};

const timeLabel = (iso: string) => {
	const d = new Date(iso);
	const s = (Date.now() - d.getTime()) / 1000;
	if (s < 60) return "now";
	if (s < 3600) return `${Math.floor(s / 60)}m`;
	if (s < 86400) return d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
	return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
};

const PAGE_SIZE = 30;

const AdminInbox: React.FC = () => {
	const router = useRouter();
	const [view, setView] = useState<View>("primary");
	const [items, setItems] = useState<InboxNotification[]>([]);
	const [meta, setMeta] = useState<PageMeta | null>(null);
	const [summary, setSummary] = useState<Summary>({ primaryUnread: 0, otherUnread: 0, cleared: 0 });
	const [loading, setLoading] = useState(true);
	const [page, setPage] = useState(1);

	// null = the counts could not be loaded. Show a dash then, not a 0 that reads as "nothing unread".
	const [summaryKnown, setSummaryKnown] = useState(true);
	const loadSummary = useCallback(async () => {
		try {
			const res = await axiosInstance.get("notifications/summary");
			const data = res.data?.data;
			if (!data || typeof data.primaryUnread !== "number") throw new Error("bad summary");
			setSummary(data);
			setSummaryKnown(true);
		} catch {
			setSummaryKnown(false);
		}
	}, []);

	const load = useCallback(
		async (silent = false) => {
			if (!silent) setLoading(true);
			try {
				const res = await axiosInstance.get("notifications/inbox", { params: { view, page, limit: PAGE_SIZE } });
				const data = res.data?.data;
				setItems((prev) => (page === 1 ? (data?.items ?? []) : [...prev, ...(data?.items ?? [])]));
				setMeta(data?.meta ?? null);
			} catch {
				toast.error("Could not load your inbox");
			} finally {
				setLoading(false);
			}
		},
		[view, page],
	);

	useEffect(() => {
		load();
	}, [load]);
	useEffect(() => {
		loadSummary();
	}, [loadSummary]);

	const refreshAll = useCallback(() => {
		setPage(1);
		load(true);
		loadSummary();
		notifyInboxChanged();
	}, [load, loadSummary]);

	// Live: anything pushed to you lands without a refresh.
	useLiveEvent("new-notification", () => {
		if (page === 1) load(true);
		loadSummary();
	});
	useLiveEvent("announcement-changed", () => {
		if (page === 1) load(true);
		loadSummary();
	});

	const switchView = (v: View) => {
		if (v === view) return;
		setView(v);
		setPage(1);
		setItems([]);
	};

	const open = async (n: InboxNotification) => {
		if (!n.isRead && view !== "cleared") {
			setItems((prev) => prev.map((p) => (p.id === n.id ? { ...p, isRead: true } : p)));
			axiosInstance.patch(`notifications/${n.id}/read`).then(() => (loadSummary(), notifyInboxChanged()));
		}
		const target = targetFor(n);
		if (target) router.push(target);
	};

	const act = async (n: InboxNotification, action: "clear" | "restore") => {
		setItems((prev) => prev.filter((p) => p.id !== n.id));
		try {
			await axiosInstance.patch(`notifications/${n.id}/${action}`);
			loadSummary();
			notifyInboxChanged();
		} catch {
			refreshAll();
		}
	};

	const markAll = async () => {
		await axiosInstance.patch("notifications/read-all");
		setItems((prev) => prev.map((p) => ({ ...p, isRead: true })));
		loadSummary();
		notifyInboxChanged();
	};

	const clearAll = async () => {
		await axiosInstance.patch("notifications/clear-all", null, { params: { view } });
		refreshAll();
	};

	const groups = useMemo(() => {
		const out: { label: string; rows: InboxNotification[] }[] = [];
		for (const n of items) {
			const label = groupLabel(view === "cleared" ? n.createdAt : n.createdAt);
			const last = out[out.length - 1];
			if (last?.label === label) last.rows.push(n);
			else out.push({ label, rows: [n] });
		}
		return out;
	}, [items, view]);

	const tab = TABS.find((t) => t.id === view)!;
	const unreadFor = (id: View): number | null => (id === "cleared" ? 0 : !summaryKnown ? null : id === "primary" ? summary.primaryUnread : summary.otherUnread);
	const hasMore = !!meta && meta.page < meta.totalPages;

	return (
		<AdminLayout>
			<div className="mx-auto w-full max-w-6xl space-y-5">
				<div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
					<div>
						<h2 className="flex items-center gap-2 text-xl font-semibold tracking-tight">
							<InboxIcon className="text-brand-ink size-6" /> Inbox
						</h2>
						<p className="text-muted-foreground text-sm">Orders, payments and alerts, live as they happen.</p>
					</div>
					<div className="flex flex-wrap items-center gap-2">
						<Button variant="outline" size="sm" className="gap-1.5 text-xs shadow-xs" onClick={markAll} disabled={view === "cleared" || unreadFor(view) === 0}>
							<CheckCheck className="size-4" /> Mark all read
						</Button>
						{view !== "cleared" && items.length > 0 && (
							<Button variant="outline" size="sm" className="gap-1.5 text-xs shadow-xs" onClick={clearAll}>
								Clear all
							</Button>
						)}
					</div>
				</div>

				<div role="tablist" className="border-border grid grid-cols-3 border-b">
					{TABS.map((t) => {
						const selected = t.id === view;
						const unread = unreadFor(t.id);
						return (
							<button
								key={t.id}
								type="button"
								role="tab"
								aria-selected={selected}
								onClick={() => switchView(t.id)}
								className={cn("-mb-px flex items-center gap-3 border-b-2 px-4 py-3 text-left transition-colors", selected ? "border-brand text-foreground" : "text-muted-foreground hover:text-foreground border-transparent")}
							>
								<t.icon className="size-4 shrink-0" />
								<span className="min-w-0">
									<span className="block text-sm font-semibold">{t.label}</span>
									{t.id !== "cleared" && <span className="text-muted-foreground block text-xs">{unread ?? "—"} unread</span>}
								</span>
							</button>
						);
					})}
				</div>

				{loading && items.length === 0 ? (
					<p className="text-muted-foreground py-16 text-center text-sm">Loading…</p>
				) : items.length === 0 ? (
					<div className="flex flex-col items-center gap-2 py-16 text-center">
						<tab.icon className="text-muted-foreground/50 size-8" />
						<p className="text-sm font-semibold">{tab.empty}</p>
						<p className="text-muted-foreground text-sm">{tab.emptyHint}</p>
					</div>
				) : (
					<div className="space-y-6">
						{groups.map((g) => (
							<section key={g.label} className="space-y-2">
								<h3 className="px-3 text-sm font-semibold">{g.label}</h3>
								<ul className="bg-card rounded-xl border p-1">
									{g.rows.map((n) => {
										const Icon = iconFor(n);
										return (
											<li key={n.id} className="group">
												<div className="hover:bg-muted/60 flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors">
													<span className={cn("size-2 shrink-0 rounded-full", !n.isRead && view !== "cleared" ? "bg-brand" : "bg-transparent")} aria-label={!n.isRead ? "Unread" : undefined} />
													<button type="button" onClick={() => open(n)} className="flex min-w-0 flex-1 items-center gap-3 text-left">
														<span className="bg-brand/15 dark:bg-white/10 text-brand-ink flex size-6 shrink-0 items-center justify-center rounded-full">
															<Icon className="size-3.5" />
														</span>
														<span className={cn("w-1/3 min-w-0 shrink-0 truncate text-sm", !n.isRead && view !== "cleared" && "font-semibold")}>{n.title}</span>
														<span className="text-muted-foreground min-w-0 flex-1 truncate text-sm">{n.message}</span>
													</button>
													<span className="relative flex w-20 shrink-0 items-center justify-end">
														<time className="text-muted-foreground text-xs tabular-nums group-hover:invisible group-focus-within:invisible">{timeLabel(n.createdAt)}</time>
														<Button
															variant="outline"
															size="xs"
															className="absolute right-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100 group-focus-within:opacity-100"
															onClick={() => act(n, view === "cleared" ? "restore" : "clear")}
														>
															{view === "cleared" ? (
																<>
																	<Undo2 className="size-3" /> Restore
																</>
															) : (
																<>
																	<Check className="size-3" /> Clear
																</>
															)}
														</Button>
													</span>
												</div>
											</li>
										);
									})}
								</ul>
							</section>
						))}
						{hasMore && (
							<div className="flex justify-center">
								<Button variant="ghost" size="sm" onClick={() => setPage((p) => p + 1)} disabled={loading}>
									Show older
								</Button>
							</div>
						)}
					</div>
				)}
			</div>
		</AdminLayout>
	);
};

export default withAdminAuth(AdminInbox);
