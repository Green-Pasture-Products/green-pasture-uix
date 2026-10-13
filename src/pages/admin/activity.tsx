import React, { useCallback, useEffect, useState } from "react";
import { Activity as ActivityIcon, ChevronDown, Plus, Pencil, Trash2, ShieldAlert, Search } from "lucide-react";
import toast from "react-hot-toast";

import withAdminAuth from "@/_components/withAdminAuth";
import AdminLayout from "@/_components/AdminLayout";
import Button from "@/_UI/Button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/egfm/select";
import EmptyState from "@/_UI/EmptyState";
import axiosInstance from "@/_utils/axiosInstance";
import { useLiveEvent } from "@/_hooks/useLiveEvent";
import type { ActivityEventRow, PageMeta } from "@/types/live";

const ENTITY_TYPES = ["Order", "Payment", "Item", "Product", "Customer", "Staff", "Profile", "Role", "Coupon", "Review", "Tag", "Country", "Store", "StaffInvitation", "Announcement"];
const ACTIONS = ["CREATE", "UPDATE", "DELETE"];
const PAGE_SIZE = 25;

const ACTION_STYLE: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
	CREATE: { icon: Plus, color: "#16a34a", bg: "rgba(22,163,74,0.12)" },
	UPDATE: { icon: Pencil, color: "#2563eb", bg: "rgba(37,99,235,0.12)" },
	DELETE: { icon: Trash2, color: "#dc2626", bg: "rgba(220,38,38,0.12)" },
	SECURITY: { icon: ShieldAlert, color: "#d97706", bg: "rgba(217,119,6,0.12)" },
};

const show = (v: unknown) => (v === null || v === undefined || v === "" ? "—" : typeof v === "object" ? JSON.stringify(v) : String(v));

const timeLabel = (iso: string) => {
	const d = new Date(iso);
	const s = (Date.now() - d.getTime()) / 1000;
	if (s < 60) return "just now";
	if (s < 3600) return `${Math.floor(s / 60)}m ago`;
	if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
	return d.toLocaleString();
};

const AdminActivity: React.FC = () => {
	const [items, setItems] = useState<ActivityEventRow[]>([]);
	const [meta, setMeta] = useState<PageMeta | null>(null);
	const [loading, setLoading] = useState(true);
	const [page, setPage] = useState(1);
	const [entityType, setEntityType] = useState("");
	const [action, setAction] = useState("");
	const [q, setQ] = useState("");
	const [debouncedQ, setDebouncedQ] = useState("");
	const [expanded, setExpanded] = useState<string | null>(null);
	const [fresh, setFresh] = useState<Set<string>>(new Set());
	const [missed, setMissed] = useState(0);

	useEffect(() => {
		const t = setTimeout(() => setDebouncedQ(q), 300);
		return () => clearTimeout(t);
	}, [q]);

	const load = useCallback(async () => {
		setLoading(true);
		try {
			const res = await axiosInstance.get("activity", {
				params: { page, limit: PAGE_SIZE, entityType: entityType || undefined, action: action || undefined, q: debouncedQ || undefined },
			});
			setItems(res.data?.data?.items ?? []);
			setMeta(res.data?.data?.meta ?? null);
			setMissed(0);
		} catch {
			toast.error("Could not load activity");
		} finally {
			setLoading(false);
		}
	}, [page, entityType, action, debouncedQ]);

	useEffect(() => {
		load();
	}, [load]);

	// Live feed: matching events appear at the top instantly; otherwise we just count what we missed.
	useLiveEvent<ActivityEventRow>("activity-created", (event) => {
		const matches = (!entityType || event.entityType === entityType) && (!action || event.action === action) && !debouncedQ;
		if (page === 1 && matches) {
			setItems((prev) => [event, ...prev.filter((p) => p.id !== event.id)].slice(0, PAGE_SIZE));
			setMeta((m) => (m ? { ...m, total: m.total + 1 } : m));
			setFresh((f) => new Set(f).add(event.id));
			setTimeout(() => setFresh((f) => (f.delete(event.id), new Set(f))), 4000);
		} else {
			setMissed((n) => n + 1);
		}
	});

	const resetTo = (fn: () => void) => {
		fn();
		setPage(1);
	};

	const selectStyle = { borderColor: "var(--border-light)", background: "var(--surface-paper)", color: "var(--text-primary)" } as const;

	return (
		<AdminLayout>
			<div className="animate-page-enter mx-auto max-w-4xl space-y-4">
				<div className="flex flex-wrap items-end justify-between gap-3">
					<div>
						<h2 className="flex items-center gap-2 text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
							Activity
							<span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[0.65rem] font-semibold" style={{ background: "rgba(22,163,74,0.12)", color: "#16a34a" }}>
								<span className="size-1.5 animate-pulse rounded-full bg-current" /> Live
							</span>
						</h2>
						<p className="text-xs" style={{ color: "var(--text-hint)" }}>
							Who changed what, as it happens{meta ? ` · ${meta.total.toLocaleString()} events` : ""}
						</p>
					</div>
					<div className="flex flex-wrap items-center gap-2">
						<div className="relative">
							<Search size={14} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2" style={{ color: "var(--text-hint)" }} />
							<input
								value={q}
								onChange={(e) => resetTo(() => setQ(e.target.value))}
								placeholder="Search…"
								aria-label="Search activity"
								className="h-9 w-44 rounded-lg border pl-8 pr-2 text-sm"
								style={selectStyle}
							/>
						</div>
						<Select value={entityType || "ALL"} onValueChange={(v) => resetTo(() => setEntityType(v === "ALL" ? "" : v))}>
							<SelectTrigger aria-label="Record type" className="h-9 w-40">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="ALL">All records</SelectItem>
								{ENTITY_TYPES.map((t) => (
									<SelectItem key={t} value={t}>
										{t}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						<Select value={action || "ALL"} onValueChange={(v) => resetTo(() => setAction(v === "ALL" ? "" : v))}>
							<SelectTrigger aria-label="Action" className="h-9 w-36">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="ALL">All actions</SelectItem>
								{ACTIONS.map((a) => (
									<SelectItem key={a} value={a}>
										{a.charAt(0) + a.slice(1).toLowerCase()}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				</div>

				{missed > 0 && (
					<button type="button" onClick={() => (page === 1 ? load() : setPage(1))} className="w-full rounded-lg py-2 text-xs font-semibold" style={{ background: "rgba(154,202,60,0.18)", color: "var(--color-primary)" }}>
						{missed} new event{missed === 1 ? "" : "s"} — show
					</button>
				)}

				{loading ? (
					<div className="space-y-2">
						{[0, 1, 2, 3, 4].map((i) => (
							<div key={i} className="h-14 animate-pulse rounded-xl" style={{ background: "var(--surface-medium)" }} />
						))}
					</div>
				) : items.length === 0 ? (
					<EmptyState icon={ActivityIcon} title="No activity yet" description="Changes made in the admin will appear here as they happen." />
				) : (
					<ul className="space-y-2">
						{items.map((e) => {
							const st = ACTION_STYLE[e.action] ?? ACTION_STYLE.UPDATE;
							const Icon = st.icon;
							const changes = e.changes ? Object.entries(e.changes) : [];
							const isOpen = expanded === e.id;
							return (
								<li
									key={e.id}
									className="rounded-xl border transition-colors"
									style={{ borderColor: fresh.has(e.id) ? "var(--color-primary)" : "var(--border-light)", background: "var(--surface-paper)" }}
								>
									<button type="button" disabled={!changes.length} onClick={() => setExpanded(isOpen ? null : e.id)} className="flex w-full items-center gap-3 p-3 text-left">
										<span className="flex size-8 shrink-0 items-center justify-center rounded-full" style={{ background: st.bg, color: st.color }}>
											<Icon size={15} />
										</span>
										<span className="min-w-0 flex-1">
											<span className="block truncate text-sm font-medium" style={{ color: "var(--text-primary)" }}>
												{e.summary}
											</span>
											<span className="block text-[0.7rem]" style={{ color: "var(--text-hint)" }} title={new Date(e.occurredAt).toLocaleString()}>
												{e.entityType} · {timeLabel(e.occurredAt)}
											</span>
										</span>
										{changes.length > 0 && <ChevronDown size={16} className={`shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`} style={{ color: "var(--text-hint)" }} />}
									</button>
									{isOpen && (
										<div className="overflow-x-auto border-t px-3 pb-3 pt-2" style={{ borderColor: "var(--border-light)" }}>
											<table className="w-full text-xs">
												<thead>
													<tr style={{ color: "var(--text-hint)" }}>
														<th className="py-1 pr-3 text-left font-medium">Field</th>
														<th className="py-1 pr-3 text-left font-medium">Before</th>
														<th className="py-1 text-left font-medium">After</th>
													</tr>
												</thead>
												<tbody>
													{changes.map(([field, [before, after]]) => (
														<tr key={field} style={{ color: "var(--text-primary)" }}>
															<td className="py-1 pr-3 font-medium">{field}</td>
															<td className="max-w-[16rem] truncate py-1 pr-3" style={{ color: "#dc2626" }}>
																{show(before)}
															</td>
															<td className="max-w-[16rem] truncate py-1" style={{ color: "#16a34a" }}>
																{show(after)}
															</td>
														</tr>
													))}
												</tbody>
											</table>
										</div>
									)}
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

export default withAdminAuth(AdminActivity);
