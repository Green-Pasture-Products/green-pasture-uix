import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Check, CheckCheck, Megaphone, Package, Trash2, Wallet, AlertTriangle, Bell } from "lucide-react";
import toast from "react-hot-toast";

import withAdminAuth from "@/_components/withAdminAuth";
import AdminLayout from "@/_components/AdminLayout";
import Button from "@/_UI/Button";
import EmptyState from "@/_UI/EmptyState";
import axiosInstance from "@/_utils/axiosInstance";
import { useLiveEvent } from "@/_hooks/useLiveEvent";
import { notifyInboxChanged } from "@/_hooks/useInboxUnread";
import type { InboxNotification, PageMeta } from "@/types/live";

const iconFor = (n: InboxNotification) => {
	if (n.metadata?.kind === "announcement") return Megaphone;
	if (n.type.startsWith("ORDER")) return Package;
	if (n.type.startsWith("PAYMENT")) return Wallet;
	if (n.type === "LOW_STOCK") return AlertTriangle;
	return Bell;
};

const targetFor = (n: InboxNotification): string | null => {
	const m = n.metadata ?? {};
	if (m.orderReference) return `/admin/order/${m.orderReference}`;
	return null;
};

const timeAgo = (iso: string) => {
	const s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
	if (s < 60) return "just now";
	if (s < 3600) return `${Math.floor(s / 60)}m ago`;
	if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
	return new Date(iso).toLocaleDateString();
};

const PAGE_SIZE = 20;

const AdminInbox: React.FC = () => {
	const router = useRouter();
	const [items, setItems] = useState<InboxNotification[]>([]);
	const [meta, setMeta] = useState<PageMeta | null>(null);
	const [unreadCount, setUnreadCount] = useState(0);
	const [unreadOnly, setUnreadOnly] = useState(false);
	const [page, setPage] = useState(1);
	const [loading, setLoading] = useState(true);
	const [fresh, setFresh] = useState<Set<string>>(new Set());

	const load = useCallback(
		async (silent = false) => {
			if (!silent) setLoading(true);
			try {
				const res = await axiosInstance.get("notifications/inbox", { params: { page, limit: PAGE_SIZE, unreadOnly } });
				const data = res.data?.data;
				setItems(data?.items ?? []);
				setMeta(data?.meta ?? null);
				setUnreadCount(data?.unreadCount ?? 0);
			} catch {
				toast.error("Could not load your inbox");
			} finally {
				setLoading(false);
			}
		},
		[page, unreadOnly],
	);

	useEffect(() => {
		load();
	}, [load]);

	// 100% live: a pushed notification lands at the top without a refresh.
	useLiveEvent<InboxNotification>("new-notification", (n) => {
		setUnreadCount((c) => c + 1);
		if (page === 1) {
			setItems((prev) => [n, ...prev.filter((p) => p.id !== n.id)].slice(0, PAGE_SIZE));
			setFresh((f) => new Set(f).add(n.id));
			setTimeout(() => setFresh((f) => (f.delete(n.id), new Set(f))), 4000);
		}
	});
	useLiveEvent("announcement-changed", () => void load(true));

	const markRead = async (n: InboxNotification) => {
		if (n.isRead) return;
		setItems((prev) => prev.map((p) => (p.id === n.id ? { ...p, isRead: true } : p)));
		setUnreadCount((c) => Math.max(0, c - 1));
		try {
			await axiosInstance.patch(`notifications/${n.id}/read`);
			notifyInboxChanged();
		} catch {
			load(true);
		}
	};

	const open = async (n: InboxNotification) => {
		await markRead(n);
		const target = targetFor(n);
		if (target) router.push(target);
	};

	const markAll = async () => {
		await axiosInstance.patch("notifications/read-all");
		notifyInboxChanged();
		setItems((prev) => prev.map((p) => ({ ...p, isRead: true })));
		setUnreadCount(0);
	};

	const clearOne = async (n: InboxNotification) => {
		setItems((prev) => prev.filter((p) => p.id !== n.id));
		if (!n.isRead) setUnreadCount((c) => Math.max(0, c - 1));
		try {
			await axiosInstance.patch(`notifications/${n.id}/clear`);
			notifyInboxChanged();
		} catch {
			load(true);
		}
	};

	const clearAll = async () => {
		await axiosInstance.patch("notifications/clear-all");
		notifyInboxChanged();
		setItems([]);
		setUnreadCount(0);
		setMeta(null);
	};

	return (
		<AdminLayout>
			<div className="animate-page-enter mx-auto max-w-3xl space-y-4">
				<div className="flex flex-wrap items-center justify-between gap-3">
					<div>
						<h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
							Inbox
						</h2>
						<p className="text-xs" style={{ color: "var(--text-hint)" }}>
							{unreadCount > 0 ? `${unreadCount} unread` : "You're all caught up"} · updates live
						</p>
					</div>
					<div className="flex flex-wrap items-center gap-2">
						<div className="inline-flex rounded-lg border p-0.5 text-xs" style={{ borderColor: "var(--border-light)" }}>
							{[
								{ label: "All", value: false },
								{ label: "Unread", value: true },
							].map((o) => (
								<button
									key={o.label}
									type="button"
									onClick={() => {
										setUnreadOnly(o.value);
										setPage(1);
									}}
									className="rounded-md px-3 py-1.5 font-medium"
									style={{
										background: unreadOnly === o.value ? "var(--color-primary)" : "transparent",
										color: unreadOnly === o.value ? "white" : "var(--text-secondary)",
									}}
								>
									{o.label}
								</button>
							))}
						</div>
						<Button variant="outlined" color="secondary" leftIcon={CheckCheck} onClick={markAll} disabled={unreadCount === 0}>
							Mark all read
						</Button>
						<Button variant="outlined" color="secondary" leftIcon={Trash2} onClick={clearAll} disabled={items.length === 0}>
							Clear all
						</Button>
					</div>
				</div>

				{loading ? (
					<div className="space-y-2">
						{[0, 1, 2, 3].map((i) => (
							<div key={i} className="h-16 animate-pulse rounded-xl" style={{ background: "var(--surface-medium)" }} />
						))}
					</div>
				) : items.length === 0 ? (
					<EmptyState icon={Bell} title={unreadOnly ? "No unread notifications" : "Nothing here yet"} description="New orders, payments and alerts show up here the moment they happen." />
				) : (
					<ul className="space-y-2">
						{items.map((n) => {
							const Icon = iconFor(n);
							return (
								<li
									key={n.id}
									className="group flex items-start gap-3 rounded-xl border p-3 transition-colors"
									style={{
										borderColor: fresh.has(n.id) ? "var(--color-primary)" : "var(--border-light)",
										background: n.isRead ? "var(--surface-paper)" : "var(--surface-low)",
									}}
								>
									<span
										className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full"
										style={{ background: "rgba(154,202,60,0.16)", color: "var(--color-primary)" }}
									>
										<Icon size={16} />
									</span>
									<button type="button" onClick={() => open(n)} className="min-w-0 flex-1 text-left">
										<div className="flex items-center gap-2">
											{!n.isRead && <span className="size-2 shrink-0 rounded-full" style={{ background: "var(--color-primary)" }} aria-label="Unread" />}
											<p className="truncate text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
												{n.title}
											</p>
										</div>
										<p className="mt-0.5 line-clamp-2 text-xs" style={{ color: "var(--text-secondary)" }}>
											{n.message}
										</p>
										<p className="mt-1 text-[0.7rem]" style={{ color: "var(--text-hint)" }}>
											{timeAgo(n.createdAt)}
										</p>
									</button>
									<div className="flex shrink-0 items-center gap-1">
										{!n.isRead && (
											<button type="button" aria-label="Mark as read" onClick={() => markRead(n)} className="rounded-md p-1.5 hover:bg-black/5" style={{ color: "var(--text-hint)" }}>
												<Check size={16} />
											</button>
										)}
										<button type="button" aria-label="Clear" onClick={() => clearOne(n)} className="rounded-md p-1.5 hover:bg-black/5" style={{ color: "var(--text-hint)" }}>
											<Trash2 size={16} />
										</button>
									</div>
								</li>
							);
						})}
					</ul>
				)}

				{meta && meta.totalPages > 1 && (
					<div className="flex items-center justify-between text-xs" style={{ color: "var(--text-secondary)" }}>
						<span>
							Page {meta.page} of {meta.totalPages}
						</span>
						<div className="flex gap-2">
							<Button variant="outlined" color="secondary" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
								Prev
							</Button>
							<Button variant="outlined" color="secondary" disabled={page >= meta.totalPages} onClick={() => setPage((p) => p + 1)}>
								Next
							</Button>
						</div>
					</div>
				)}
			</div>
		</AdminLayout>
	);
};

export default withAdminAuth(AdminInbox);
