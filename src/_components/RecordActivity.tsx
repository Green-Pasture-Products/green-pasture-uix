"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Activity, ChevronDown, MessageSquare, Send, PanelRightClose, PanelRightOpen, Pencil, Plus, ShieldAlert, Trash2, X } from "lucide-react";
import { useRecordActivity } from "@/_hooks/useRecordActivity";
import axiosInstance from "@/_utils/axiosInstance";
import type { ActivityEventRow } from "@/types/live";

const STYLE: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
	CREATE: { icon: Plus, color: "#16a34a", bg: "rgba(22,163,74,0.12)" },
	UPDATE: { icon: Pencil, color: "#2563eb", bg: "rgba(37,99,235,0.12)" },
	DELETE: { icon: Trash2, color: "#dc2626", bg: "rgba(220,38,38,0.12)" },
	COMMENT: { icon: MessageSquare, color: "#7c3aed", bg: "rgba(124,58,237,0.12)" },
	SECURITY: { icon: ShieldAlert, color: "#d97706", bg: "rgba(217,119,6,0.12)" },
};

const dayLabel = (iso: string) => {
	const d = new Date(iso);
	const today = new Date();
	const yesterday = new Date(Date.now() - 86400000);
	if (d.toDateString() === today.toDateString()) return "Today";
	if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
	return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
};

const clock = (iso: string) => new Date(iso).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
/** orderStatus -> "Order status" */
const fieldLabel = (f: string) => f.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase());
const show = (v: unknown) => (v === null || v === undefined || v === "" ? "—" : String(v));

/** "Ada Obi updated order X": the actor in bold, the rest quiet. */
function Headline({ event }: { event: ActivityEventRow }) {
	const rest = event.summary.startsWith(event.actorName) ? event.summary.slice(event.actorName.length) : ` ${event.summary}`;
	return (
		<p className="text-xs leading-snug" style={{ color: "var(--text-secondary)" }}>
			<span className="font-semibold" style={{ color: "var(--text-primary)" }}>
				{event.actorName}
			</span>
			{rest}
		</p>
	);
}

function EventRow({ event, entityType }: { event: ActivityEventRow; entityType: string }) {
	const [open, setOpen] = useState(false);
	const st = STYLE[event.action] ?? STYLE.UPDATE;
	const Icon = st.icon;
	const changes = event.changes ? Object.entries(event.changes) : [];
	const shown = open ? changes : changes.slice(0, 3);
	return (
		<li className="flex gap-3">
			<span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full" style={{ background: st.bg, color: st.color }}>
				<Icon size={12} />
			</span>
			<div className="min-w-0 flex-1 space-y-1">
				<div className="flex items-start justify-between gap-2">
					<div className="min-w-0">
						<Headline event={event} />
						{event.entityType !== entityType && (
							<span className="mt-0.5 inline-block rounded px-1.5 py-px text-[0.6rem] font-semibold uppercase tracking-wide" style={{ background: "var(--surface-medium)", color: "var(--text-hint)" }}>
								{event.entityType}
							</span>
						)}
					</div>
					<time dateTime={event.occurredAt} className="shrink-0 text-[0.68rem] tabular-nums" style={{ color: "var(--text-hint)" }} title={new Date(event.occurredAt).toLocaleString()}>
						{clock(event.occurredAt)}
					</time>
				</div>
				{event.metadata?.body && (
					<p className="whitespace-pre-wrap rounded-lg px-2.5 py-1.5 text-xs [overflow-wrap:anywhere]" style={{ background: "var(--surface-medium)", color: "var(--text-primary)" }}>
						{event.metadata.body}
					</p>
				)}
				{shown.length > 0 && (
					<ul className="space-y-0.5 border-l pl-2.5" style={{ borderColor: "var(--border-light)" }}>
						{shown.map(([field, [before, after]]) => (
							<li key={field} className="text-[0.68rem] [overflow-wrap:anywhere]" style={{ color: "var(--text-hint)" }}>
								{fieldLabel(field)}:{" "}
								{before !== null && before !== undefined && <span className="line-through decoration-1 opacity-70">{show(before)}</span>}
								{before !== null && before !== undefined && " → "}
								<span style={{ color: "var(--text-primary)" }}>{show(after)}</span>
							</li>
						))}
						{changes.length > 3 && (
							<li>
								<button type="button" onClick={() => setOpen(!open)} className="text-[0.68rem] font-medium" style={{ color: "var(--color-primary)" }}>
									{open ? "Show less" : `and ${changes.length - 3} more`}
								</button>
							</li>
						)}
					</ul>
				)}
			</div>
		</li>
	);
}

interface Props {
	/** Audited record type, e.g. "Order", "Item", "Customer", "Payment", "Role". */
	type: string;
	/** The record's id (UUID). Renders nothing until it is known. */
	id?: string | null;
}

/**
 * Everything that has happened to the record on screen (including its child
 * records, e.g. an order's payments), live. An edge tab opens a right-hand
 * panel; it is hidden entirely for users who may not view the record's history.
 */
const PANEL_KEY = "gp-record-panel";
const PANEL_W = 400;
const RAIL_W = 48;

/** True at lg+ (where the panel docks beside the content instead of overlaying it). */
function useDocked() {
	const [docked, setDocked] = useState(false);
	useEffect(() => {
		const mq = window.matchMedia("(min-width: 1024px)");
		const update = () => setDocked(mq.matches);
		update();
		mq.addEventListener("change", update);
		return () => mq.removeEventListener("change", update);
	}, []);
	return docked;
}

function CommentBox({ type, id, onAdded }: { type: string; id: string; onAdded: (e: ActivityEventRow) => void }) {
	const [text, setText] = useState("");
	const [busy, setBusy] = useState(false);
	const [err, setErr] = useState("");
	const send = async () => {
		if (!text.trim() || busy) return;
		setBusy(true);
		setErr("");
		try {
			const res = await axiosInstance.post(`activity/record/${type}/${id}/comments`, { body: text.trim() });
			onAdded(res.data?.data);
			setText("");
		} catch {
			setErr("Could not post comment.");
		} finally {
			setBusy(false);
		}
	};
	return (
		<div className="border-t p-3" style={{ borderColor: "var(--border-light)" }}>
			<div className="flex items-end gap-2">
				<textarea
					value={text}
					onChange={(e) => setText(e.target.value)}
					onKeyDown={(e) => (e.metaKey || e.ctrlKey) && e.key === "Enter" && send()}
					rows={2}
					maxLength={2000}
					placeholder="Leave a comment…"
					data-testid="record-comment-input"
					className="min-w-0 flex-1 resize-none rounded-lg border bg-transparent px-2.5 py-2 text-xs outline-none focus:border-[var(--color-primary)]"
					style={{ borderColor: "var(--border-light)", color: "var(--text-primary)" }}
				/>
				<button type="button" onClick={send} disabled={busy || !text.trim()} aria-label="Post comment" data-testid="record-comment-send" className="rounded-lg p-2 text-white disabled:opacity-40" style={{ background: "var(--color-primary)" }}>
					<Send size={14} />
				</button>
			</div>
			{err && <p className="mt-1 text-[0.68rem] text-red-600">{err}</p>}
		</div>
	);
}

const RecordActivity: React.FC<Props> = ({ type, id }) => {
	const docked = useDocked();
	const [open, setOpen] = useState(false);
	const [expanded, setExpanded] = useState(true);
	const { items, total, loading, error, hasMore, loadMore, live, add } = useRecordActivity(type, id);

	// Docked: expanded/collapsed is remembered (expanded by default), and the page content makes room via --record-panel-w.
	useEffect(() => {
		try {
			setExpanded(localStorage.getItem(PANEL_KEY) !== "closed");
		} catch {}
	}, []);
	const toggleExpanded = () => {
		const next = !expanded;
		setExpanded(next);
		try {
			localStorage.setItem(PANEL_KEY, next ? "open" : "closed");
		} catch {}
	};
	useEffect(() => {
		const root = document.documentElement;
		if (docked && id && !(error && items.length === 0)) root.style.setProperty("--record-panel-w", `${expanded ? PANEL_W : RAIL_W}px`);
		return () => {
			root.style.removeProperty("--record-panel-w");
		};
	}, [docked, expanded, id, error, items.length]);

	useEffect(() => {
		if (!open) return;
		const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [open]);

	const groups = useMemo(() => {
		const out: { label: string; rows: ActivityEventRow[] }[] = [];
		for (const e of items) {
			const label = dayLabel(e.occurredAt);
			const last = out[out.length - 1];
			if (last?.label === label) last.rows.push(e);
			else out.push({ label, rows: [e] });
		}
		return out;
	}, [items]);

	if (!id) return null;
	// 403 (no access to this record's history) or any load failure with nothing to show: stay out of the way.
	if (error && items.length === 0) return null;

	const body = (
		<div className="flex-1 overflow-y-auto px-4 py-3">
			{loading && items.length === 0 ? (
				<div className="space-y-3">
					{[0, 1, 2, 3].map((i) => (
						<div key={i} className="h-10 animate-pulse rounded-lg" style={{ background: "var(--surface-medium)" }} />
					))}
				</div>
			) : items.length === 0 ? (
				<p className="py-10 text-center text-xs" style={{ color: "var(--text-hint)" }}>
					Nothing recorded for this record yet.
				</p>
			) : (
				<div className="space-y-5">
					{groups.map((g) => (
						<section key={g.label}>
							<h3 className="mb-2 text-[0.65rem] font-semibold uppercase tracking-wider" style={{ color: "var(--text-hint)" }}>
								{g.label}
							</h3>
							<ul className="space-y-3">
								{g.rows.map((e) => (
									<EventRow key={e.id} event={e} entityType={type} />
								))}
							</ul>
						</section>
					))}
					{hasMore && (
						<button type="button" onClick={loadMore} disabled={loading} className="flex w-full items-center justify-center gap-1 rounded-lg border py-2 text-xs font-medium" style={{ borderColor: "var(--border-light)", color: "var(--text-secondary)" }}>
							<ChevronDown size={14} /> {loading ? "Loading…" : "Show older"}
						</button>
					)}
				</div>
			)}
		</div>
	);

	const heading = (
		<div>
			<h2 className="flex items-center gap-2 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
				Activity
				<span className="inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[0.6rem] font-semibold" style={{ background: "rgba(22,163,74,0.12)", color: "#16a34a" }}>
					<span className="size-1.5 animate-pulse rounded-full bg-current" /> Live
				</span>
			</h2>
			<p className="text-[0.68rem]" style={{ color: "var(--text-hint)" }}>
				Everything that has happened to this record
			</p>
		</div>
	);

	// lg+: docked flush under the top bar, full height, collapsible to a rail; content makes room.
	if (docked) {
		return (
			<aside
				role="complementary"
				aria-label="Record activity"
				data-testid="record-activity-panel"
				data-expanded={expanded}
				className="bg-card fixed top-24 right-0 bottom-0 z-20 flex flex-col border-l transition-[width] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]"
				style={{ width: expanded ? PANEL_W : RAIL_W, borderColor: "var(--border-light)" }}
			>
				{expanded ? (
					<div className="flex h-full min-w-0 flex-col" style={{ width: PANEL_W }}>
						<header className="flex items-center justify-between gap-2 border-b px-4 py-3" style={{ borderColor: "var(--border-light)" }}>
							{heading}
							<button type="button" onClick={toggleExpanded} aria-label="Collapse activity" data-testid="record-activity-collapse" className="rounded-md p-1.5 hover:bg-black/5" style={{ color: "var(--text-hint)" }}>
								<PanelRightClose size={18} />
							</button>
						</header>
						{body}
						<CommentBox type={type} id={id} onAdded={add} />
					</div>
				) : (
					<button type="button" onClick={toggleExpanded} aria-label="Expand activity" data-testid="record-activity-expand" className="flex h-full w-full flex-col items-center gap-3 pt-4 hover:bg-black/[0.03]">
						<PanelRightOpen size={16} style={{ color: "var(--text-secondary)" }} />
						<span className="text-xs font-semibold tracking-wide" style={{ writingMode: "vertical-rl", color: "var(--text-secondary)" }}>
							Activity
						</span>
						{total > 0 && (
							<span key={total} className="bg-brand text-brand-foreground animate-in zoom-in-50 fade-in rounded-full px-1.5 text-[0.62rem] font-bold duration-500">
								{total}
							</span>
						)}
					</button>
				)}
			</aside>
		);
	}

	return (
		<>
			<button
				type="button"
				onClick={() => setOpen(true)}
				aria-label="Open activity"
				data-testid="record-activity-toggle"
				className="fixed right-0 top-1/2 z-30 flex -translate-y-1/2 flex-col items-center gap-1 rounded-l-xl border border-r-0 px-2 py-3 text-[0.65rem] font-semibold shadow-md transition-transform hover:-translate-x-0.5"
				style={{ background: "var(--surface-paper)", borderColor: "var(--border-light)", color: "var(--text-secondary)" }}
			>
				<span className="relative">
					<Activity size={16} style={{ color: "var(--color-primary)" }} />
					{live > 0 && !open && <span className="absolute -right-1 -top-1 size-2 animate-pulse rounded-full bg-red-500" />}
				</span>
				<span style={{ writingMode: "vertical-rl" }}>Activity{total > 0 ? ` · ${total}` : ""}</span>
			</button>

			{open && <div className="fixed inset-0 z-40 bg-black/30" onClick={() => setOpen(false)} aria-hidden />}
			<aside
				role="complementary"
				aria-label="Record activity"
				data-testid="record-activity-panel"
				aria-hidden={!open}
				className={`fixed right-0 top-0 z-50 flex h-dvh w-full max-w-sm flex-col border-l shadow-2xl transition-transform duration-300 ${open ? "translate-x-0" : "translate-x-full"}`}
				style={{ background: "var(--surface-paper)", borderColor: "var(--border-light)" }}
			>
				<header className="flex items-center justify-between gap-2 border-b px-4 py-3" style={{ borderColor: "var(--border-light)" }}>
					{heading}
					<button type="button" onClick={() => setOpen(false)} aria-label="Close activity" className="rounded-md p-1.5 hover:bg-black/5" style={{ color: "var(--text-hint)" }}>
						<X size={18} />
					</button>
				</header>
				{body}
				<CommentBox type={type} id={id} onAdded={add} />
			</aside>
		</>
	);
};

export default RecordActivity;
