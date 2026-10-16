"use client";

import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Activity, ChevronDown, Loader2, MessageSquare, Send, PanelRightClose, PanelRightOpen, Pencil, Plus, ShieldAlert, Trash2, X } from "lucide-react";
import { useRecordActivity } from "@/_hooks/useRecordActivity";
import { Feature } from "@/_components/FeatureFlagProvider";
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
const ISO_DATE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/;
/** "18 Oct 2026", with the time ("21 Oct 2026, 3:30 PM") only when it isn't midnight. */
const friendlyDate = (iso: string) => {
	const d = new Date(iso);
	const midnight = d.getHours() === 0 && d.getMinutes() === 0;
	return d.toLocaleString(undefined, { day: "numeric", month: "short", year: "numeric", ...(midnight ? {} : { hour: "numeric", minute: "2-digit" }) });
};
const show = (v: unknown) => (v === null || v === undefined || v === "" ? "—" : typeof v === "string" && ISO_DATE.test(v) ? friendlyDate(v) : String(v));

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
						<CommentText body={event.metadata.body} names={(event.metadata.mentions ?? []).map((m) => m.name)} />
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
	/**
	 * When and by whom the record was made, from the record itself. Shown as the first entry when no creation event was recorded
	 * (anything made before activity tracking began, or by the seed), so the panel is never blank for a record that exists.
	 */
	created?: { at?: string | null; by?: string | null };
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

type Person = { id: string; name: string };

/** "@Ada Obi" typed just before the caret, if any. */
const mentionAt = (text: string, caret: number) => /(^|\s)@([^\s@]{0,30})$/.exec(text.slice(0, caret));

/** Comment text with the people it names highlighted. */
function CommentText({ body, names }: { body: string; names: string[] }) {
	if (!names.length) return <>{body}</>;
	const pattern = new RegExp(`(@(?:${names.map((n) => n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")}))`, "g");
	return (
		<>
			{body.split(pattern).map((part, i) =>
				i % 2 ? (
					<span key={i} className="rounded px-1 font-medium" style={{ background: "var(--surface-medium)", color: "var(--color-primary)" }}>
						{part}
					</span>
				) : (
					part
				),
			)}
		</>
	);
}

function CommentBox({ type, id, onAdded }: { type: string; id: string; onAdded: (e: ActivityEventRow) => void }) {
	const [text, setText] = useState("");
	const [caret, setCaret] = useState(0);
	const [picked, setPicked] = useState<Map<string, string>>(new Map());
	const [people, setPeople] = useState<Person[]>([]);
	const [active, setActive] = useState(0);
	const [dismissed, setDismissed] = useState(false);
	const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
	const [busy, setBusy] = useState(false);
	const [err, setErr] = useState("");
	const box = useRef<HTMLTextAreaElement>(null);
	const pendingCaret = useRef<number | null>(null);

	useLayoutEffect(() => {
		if (pendingCaret.current == null) return;
		box.current?.setSelectionRange(pendingCaret.current, pendingCaret.current);
		pendingCaret.current = null;
	}, [text]);

	const token = mentionAt(text, caret);
	const query = token?.[2] ?? "";
	const open = !!token && !dismissed;
	useEffect(() => {
		if (!open) return setPeople([]);
		let stale = false;
		setPeople([]); // never leave the previous query's people pickable while the new search is pending
		setStatus("loading");
		const t = setTimeout(() => {
			axiosInstance
				.get(`activity/record/${type}/${id}/mentionable`, { params: { q: query } })
				.then((res) => {
					if (stale) return;
					setPeople(res.data?.data ?? []);
					setStatus("ready");
				})
				.catch(() => {
					if (stale) return;
					setPeople([]);
					setStatus("error");
				});
		}, 120);
		return () => {
			stale = true;
			clearTimeout(t);
		};
	}, [open, query, type, id]);
	const options = open ? people : [];

	const update = (value: string, at: number) => {
		setText(value);
		setCaret(at);
		setDismissed(false);
		setActive(0);
	};

	const choose = (person: Person) => {
		if (!token) return;
		const start = caret - query.length - 1;
		const at = start + person.name.length + 2;
		setPicked((m) => new Map(m).set(person.name, person.id));
		pendingCaret.current = at;
		update(`${text.slice(0, start)}@${person.name} ${text.slice(caret)}`, at);
	};

	const send = async () => {
		const body = text.trim();
		if (!body || busy) return;
		setBusy(true);
		setErr("");
		try {
			// Only people still named in the text are told.
			const mentions = [...picked].filter(([name]) => body.includes(`@${name}`)).map(([, pid]) => pid);
			const res = await axiosInstance.post(`activity/record/${type}/${id}/comments`, { body, mentions });
			onAdded(res.data?.data);
			setText("");
			setPicked(new Map());
		} catch {
			setErr("Could not post comment.");
		} finally {
			setBusy(false);
		}
	};

	const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if (e.nativeEvent.isComposing || e.keyCode === 229) return; // IME: Enter confirms the composition
		if (open && e.key === "Escape") return setDismissed(true);
		if (options.length) {
			if (e.key === "ArrowDown" || e.key === "ArrowUp") {
				e.preventDefault();
				setActive((i) => (i + (e.key === "ArrowDown" ? 1 : options.length - 1)) % options.length);
				return;
			}
			if (e.key === "Enter" || e.key === "Tab") {
				e.preventDefault();
				choose(options[active] ?? options[0]);
				return;
			}
		}
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			send();
		}
	};

	return (
		<div className="relative border-t p-3" style={{ borderColor: "var(--border-light)" }}>
			{open && options.length === 0 && (
				<p role="status" className="absolute inset-x-3 bottom-full z-10 mb-1 rounded-xl border px-3 py-2 text-xs shadow-lg" style={{ background: "var(--surface-paper)", borderColor: "var(--border-light)", color: "var(--text-hint)" }}>
					{status === "loading" ? "Searching…" : status === "error" ? "Could not load people. Keep typing to retry." : "No one to mention here."}
				</p>
			)}
			{options.length > 0 && (
				<ul role="listbox" aria-label="People to mention" className="absolute inset-x-3 bottom-full z-10 mb-1 overflow-hidden rounded-xl border py-1 shadow-lg" style={{ background: "var(--surface-paper)", borderColor: "var(--border-light)" }}>
					{options.map((p, i) => (
						<li
							key={p.id}
							role="option"
							aria-selected={i === active}
							onMouseDown={(e) => {
								e.preventDefault();
								choose(p);
							}}
							onMouseEnter={() => setActive(i)}
							className="flex cursor-pointer items-center gap-2.5 px-3 py-2 text-xs"
							style={{ background: i === active ? "var(--surface-medium)" : undefined, color: "var(--text-primary)" }}
						>
							<span className="flex size-6 items-center justify-center rounded-full text-[0.6rem] font-semibold" style={{ background: "var(--surface-medium)", color: "var(--color-primary)" }}>
								{p.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()}
							</span>
							<span className="truncate">{p.name}</span>
						</li>
					))}
				</ul>
			)}
			<div className="rounded-xl border focus-within:border-[var(--color-primary)]" style={{ borderColor: "var(--border-light)" }}>
				<textarea
					ref={box}
					value={text}
					onChange={(e) => update(e.target.value, e.target.selectionStart ?? e.target.value.length)}
					onSelect={(e) => setCaret(e.currentTarget.selectionStart ?? 0)}
					onBlur={() => setDismissed(true)}
					onKeyDown={onKeyDown}
					rows={2}
					maxLength={2000}
					placeholder="Comment, or type @ to mention someone"
					aria-label="Write a comment"
					data-testid="record-comment-input"
					className="block max-h-40 w-full resize-none bg-transparent px-3 pt-2.5 text-xs outline-none"
					style={{ color: "var(--text-primary)" }}
				/>
				<div className="flex items-center justify-between gap-2 px-3 pb-2">
					<span className="text-[0.65rem]" style={{ color: "var(--text-hint)" }}>
						Enter to send · Shift+Enter for a new line
					</span>
					<button
						type="button"
						onClick={send}
						disabled={busy || !text.trim()}
						aria-label="Post comment"
						data-testid="record-comment-send"
						className="group flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-white transition-[transform,opacity,box-shadow] duration-150 ease-out enabled:hover:-translate-y-px enabled:hover:shadow-md enabled:active:translate-y-0 enabled:active:scale-95 disabled:cursor-default disabled:opacity-40 motion-reduce:transition-none motion-reduce:enabled:hover:translate-y-0 motion-reduce:enabled:active:scale-100"
						style={{ background: "var(--color-primary)" }}
					>
						{/* the plane lifts off on hover; while posting it gives way to a spinner */}
						{busy ? (
							<Loader2 size={14} className="animate-spin motion-reduce:animate-none" aria-hidden />
						) : (
							<Send size={14} className="transition-transform duration-200 ease-out group-enabled:group-hover:translate-x-0.5 group-enabled:group-hover:-translate-y-0.5 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0 motion-reduce:group-hover:translate-y-0" aria-hidden />
						)}
					</button>
				</div>
			</div>
			{err && <p className="mt-1 text-[0.68rem] text-red-600">{err}</p>}
		</div>
	);
}

const RecordActivity: React.FC<Props> = ({ type, id, created }) => {
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

	// Chat-style: oldest at the top, newest at the bottom. Stick to the bottom as events arrive; keep position when older ones are prepended.
	const scroller = useRef<HTMLDivElement>(null);
	const prev = useRef({ h: 0, newest: "" });
	useLayoutEffect(() => {
		const el = scroller.current;
		if (!el) return;
		const newest = items[0]?.id ?? "";
		if (newest !== prev.current.newest || prev.current.h === 0) el.scrollTop = el.scrollHeight;
		else el.scrollTop += el.scrollHeight - prev.current.h;
		prev.current = { h: el.scrollHeight, newest };
	}, [items, expanded, open]);

	// A "created" entry from the record's own fields, once the whole history is loaded and no recorded creation is in it.
	const baseline = useMemo<ActivityEventRow | null>(() => {
		if (!created?.at || !id || hasMore || loading) return null;
		if (items.some((e) => e.action === "CREATE" && e.entityType === type)) return null;
		return { id: `created-${id}`, occurredAt: created.at, action: "CREATE", actorId: null, actorName: created.by ?? "", entityType: type, entityId: id, summary: created.by ? `${created.by} created this record` : "Record created", changes: null };
	}, [created?.at, created?.by, id, hasMore, loading, items, type]);

	const groups = useMemo(() => {
		const out: { label: string; rows: ActivityEventRow[] }[] = [];
		for (const e of [...items, ...(baseline ? [baseline] : [])].reverse()) {
			const label = dayLabel(e.occurredAt);
			const last = out[out.length - 1];
			if (last?.label === label) last.rows.push(e);
			else out.push({ label, rows: [e] });
		}
		return out;
	}, [items, baseline]);

	if (!id) return null;
	// 403 (no access to this record's history) or any load failure with nothing to show: stay out of the way.
	if (error && items.length === 0) return null;

	const body = (
		<div ref={scroller} className="flex-1 overflow-y-auto px-4 py-3">
			<div className="flex min-h-full flex-col justify-end">
			{loading && items.length === 0 ? (
				<div className="space-y-3">
					{[0, 1, 2, 3].map((i) => (
						<div key={i} className="h-10 animate-pulse rounded-lg" style={{ background: "var(--surface-medium)" }} />
					))}
				</div>
			) : items.length === 0 && !baseline ? (
				<p className="py-10 text-center text-xs" style={{ color: "var(--text-hint)" }}>
					Nothing recorded for this record yet.
				</p>
			) : (
				<div className="space-y-5">
					{hasMore && (
						<button type="button" onClick={loadMore} disabled={loading} className="flex w-full items-center justify-center gap-1 rounded-lg border py-2 text-xs font-medium" style={{ borderColor: "var(--border-light)", color: "var(--text-secondary)" }}>
							<ChevronDown size={14} /> {loading ? "Loading…" : "Show older"}
						</button>
					)}
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
					{items.length === 0 && (
						<p className="rounded-lg border px-3 py-2 text-[0.7rem]" style={{ borderColor: "var(--border-light)", color: "var(--text-hint)" }}>
							Nothing has changed since activity tracking began. Changes made from now on appear here.
						</p>
					)}
				</div>
			)}
			</div>
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
						<Feature name="admin.comments"><CommentBox type={type} id={id} onAdded={add} /></Feature>
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
				<Feature name="admin.comments"><CommentBox type={type} id={id} onAdded={add} /></Feature>
			</aside>
		</>
	);
};

export default RecordActivity;
