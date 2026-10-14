import React, { useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { Check, X } from "lucide-react";
import Badge from "@/_UI/Badge";
import Button from "@/_UI/Button";
import Modal from "@/_UI/Modal";
import Can from "@/_components/Can";
import { FormInput, FormTextarea } from "@/_UI/FormField";
import { DetailSection } from "@/_UI/DetailField";
import ModuleLookup from "@/_UI/ModuleLookup";
import AccountLookup from "@/_UI/AccountLookup";
import { Switch } from "@/components/egfm/switch";
import axiosInstance from "@/_utils/axiosInstance";
import type { FlagForm } from "@/_utils/featureFlags";
import type { FeatureFlag, FeatureFlagChange, FlagConfig } from "@/types/featureFlags";

/** The server's message for a 403/409/validation error, else the fallback. */
export const apiError = (err: any, fallback: string): string => {
	const m = err?.response?.data?.message;
	return (Array.isArray(m) ? m.join(", ") : m) || fallback;
};

export const dateTime = (iso?: string | null) => (iso ? new Date(iso).toLocaleString(undefined, { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" }) : "—");

type Stateful = Pick<FlagConfig, "enabled" | "rolloutPercentage" | "targetRoles" | "targetAccountIds">;
export const stateLabel = (f: Stateful) =>
	!f.enabled ? "Off" : f.targetRoles.length || f.targetAccountIds.length ? "Targeted" : f.rolloutPercentage < 100 ? `On · ${f.rolloutPercentage}%` : "On";

export const FlagStateBadge: React.FC<{ flag: Stateful }> = ({ flag }) => {
	const label = stateLabel(flag);
	return (
		<Badge variant={label === "Off" ? "neutral" : label === "Targeted" ? "info" : "success"} dot className="whitespace-nowrap">
			{label}
		</Badge>
	);
};

const STATUS_VARIANT = { PENDING: "warning", APPROVED: "success", REJECTED: "error", CANCELLED: "neutral" } as const;
export const ChangeStatusBadge: React.FC<{ status: FeatureFlagChange["changeStatus"] }> = ({ status }) => (
	<Badge variant={STATUS_VARIANT[status]} className="whitespace-nowrap">
		{status.charAt(0) + status.slice(1).toLowerCase()}
	</Badge>
);

export const KIND_LABEL = { CREATE: "New flag", UPDATE: "Change", DELETE: "Deletion" } as const;

/** Loads role names for the targeting picker. */
export function useRoleNames(): string[] {
	const [roles, setRoles] = useState<string[]>([]);
	useEffect(() => {
		axiosInstance
			.get("role/all")
			.then((res) => {
				const data = res.data?.data;
				if (Array.isArray(data)) setRoles(data.map((r: any) => String(r.name)));
			})
			.catch(() => {});
	}, []);
	return roles;
}

// ── Diff ──

const FIELDS: { key: keyof FlagConfig; label: string; long?: boolean }[] = [
	{ key: "name", label: "Name" },
	{ key: "module", label: "Module" },
	{ key: "enabled", label: "Enabled" },
	{ key: "rolloutPercentage", label: "Rollout" },
	{ key: "targetRoles", label: "Target roles" },
	{ key: "targetAccountIds", label: "Target accounts" },
	{ key: "description", label: "Description", long: true },
];

const show = (k: keyof FlagConfig, v: unknown): string =>
	k === "enabled" ? (v ? "On" : "Off") : k === "rolloutPercentage" ? `${v}%` : Array.isArray(v) ? (v.length ? v.join(", ") : "None") : v === "" || v == null ? "—" : String(v);

/** What a change does, field by field: only changed fields for an update, everything for a new flag. */
export const ChangeDiff: React.FC<{ change: FeatureFlagChange }> = ({ change }) => {
	if (change.kind === "DELETE") return <p className="text-sm font-medium text-red-600">This flag will be deleted.</p>;
	const prev = change.previous as Record<string, unknown> | null;
	const next = (change.proposed ?? {}) as Record<string, unknown>;
	const rows = FIELDS.filter((f) => !prev || JSON.stringify(prev[f.key]) !== JSON.stringify(next[f.key]));
	if (!rows.length) return <p className="text-muted-foreground text-sm">No configuration differences.</p>;
	return (
		<dl>
			{rows.map((f) => (
				<div key={f.key} className="border-border/60 grid min-w-0 gap-1 border-b py-2 last:border-b-0 sm:grid-cols-[9rem_minmax(0,1fr)] sm:gap-4">
					<dt className="text-muted-foreground whitespace-nowrap text-sm">{f.label}</dt>
					<dd className={`flex min-w-0 items-center gap-2 text-sm ${f.long ? "flex-col items-start" : ""}`}>
						{prev && (
							<>
								<span className={`text-muted-foreground min-w-0 line-through ${f.long ? "" : "truncate"}`} title={show(f.key, prev[f.key])}>
									{show(f.key, prev[f.key])}
								</span>
								{!f.long && <span aria-hidden className="text-muted-foreground shrink-0">→</span>}
							</>
						)}
						<span className={`text-foreground min-w-0 font-semibold ${f.long ? "" : "truncate"}`} title={show(f.key, next[f.key])}>
							{show(f.key, next[f.key])}
						</span>
					</dd>
				</div>
			))}
		</dl>
	);
};

// ── Pending change card ──

export type Decision = "approve" | "reject";

/**
 * Approve / reject confirmation shared by every maker/checker screen. Rejecting needs a note (min 3 chars);
 * `summary` is a one-line description of what is being decided.
 */
export const DecisionDialog: React.FC<{
	decision: Decision | null;
	busy: boolean;
	summary?: string;
	onClose: () => void;
	onConfirm: (note: string) => void;
}> = ({ decision, busy, summary, onClose, onConfirm }) => {
	const [note, setNote] = useState("");
	useEffect(() => setNote(""), [decision]);
	const noteMissing = decision === "reject" && note.trim().length < 3;
	return (
		<Modal isOpen={!!decision} onClose={onClose} title={decision === "approve" ? "Approve change" : "Reject change"} size="sm">
			<div className="space-y-4">
				{summary && <p className="text-sm font-medium break-words" data-testid="decision-summary">{summary}</p>}
				<FormTextarea
					label={decision === "reject" ? "Reason for rejecting*" : "Note (optional)"}
					rows={3}
					value={note}
					onChange={(e) => setNote(e.target.value)}
					placeholder={decision === "reject" ? "Tell the requester why" : "Anything the requester should know"}
				/>
				<div className="flex justify-end gap-2">
					<Button variant="outlined" color="secondary" onClick={onClose}>Cancel</Button>
					<Button variant="filled" color={decision === "reject" ? "error" : "primary"} loading={busy} disabled={busy || noteMissing} onClick={() => onConfirm(note.trim())}>
						{decision === "approve" ? "Confirm approval" : "Confirm rejection"}
					</Button>
				</div>
			</div>
		</Modal>
	);
};


/**
 * One request awaiting a decision. The requester can only cancel it; approving or rejecting needs APPROVE_FEATURE_FLAGS
 * and someone other than the requester (the API enforces both; hiding the buttons just saves the round trip).
 */
export const ChangeCard: React.FC<{ change: FeatureFlagChange; meId: string; onDone: () => void; showFlagLink?: boolean }> = ({ change, meId, onDone, showFlagLink }) => {
	const [decision, setDecision] = useState<Decision | null>(null);
	const [busy, setBusy] = useState(false);
	const mine = String(change.requestedById) === meId;

	const send = async (path: string, body: object | undefined, ok: string) => {
		setBusy(true);
		try {
			await axiosInstance.post(`feature-flags/admin/changes/${change.id}/${path}`, body);
			toast.success(ok);
			setDecision(null);
			onDone();
		} catch (err) {
			toast.error(apiError(err, "Could not update the request"));
		} finally {
			setBusy(false);
		}
	};

	return (
		<div className="border-border bg-card min-w-0 space-y-3 rounded-xl border p-4" data-testid="pending-change">
			<div className="flex flex-wrap items-center gap-2">
				<Badge variant="warning" className="whitespace-nowrap">{KIND_LABEL[change.kind]}</Badge>
				{change.emergency && <Badge variant="error" className="whitespace-nowrap">Emergency</Badge>}
				{showFlagLink && change.flagId ? (
					<Link href={`/admin/feature-flag/${change.flagId}`} className="text-brand-ink min-w-0 truncate font-mono text-sm font-semibold hover:underline" title={change.flagKey}>
						{change.flagKey}
					</Link>
				) : (
					<span className="min-w-0 truncate font-mono text-sm font-semibold" title={change.flagKey}>{change.flagKey}</span>
				)}
			</div>
			<ChangeDiff change={change} />
			<div className="text-muted-foreground space-y-1 text-xs">
				<p className="truncate" title={`${change.requestedByName} · ${dateTime(change.requestedAt)}`}>
					Requested by <span className="text-foreground font-medium">{mine ? "you" : change.requestedByName}</span> · {dateTime(change.requestedAt)}
				</p>
				<p className="text-foreground whitespace-normal text-sm">&ldquo;{change.reason}&rdquo;</p>
			</div>
			<div className="flex flex-wrap items-center gap-2">
				{mine ? (
					<>
						<p className="text-muted-foreground text-sm">Waiting for someone else to approve</p>
						<Can privilege="MANAGE_FEATURE_FLAGS">
							<Button variant="outlined" color="secondary" size="sm" loading={busy} onClick={() => send("cancel", undefined, "Request cancelled")}>
								Cancel request
							</Button>
						</Can>
					</>
				) : (
					<Can privilege="APPROVE_FEATURE_FLAGS">
						<Button variant="filled" size="sm" onClick={() => setDecision("approve")}>Approve</Button>
						<Button variant="outlined" color="error" size="sm" onClick={() => setDecision("reject")}>Reject</Button>
					</Can>
				)}
			</div>

			<DecisionDialog
				decision={decision}
				busy={busy}
				onClose={() => setDecision(null)}
				onConfirm={(note) => send(decision!, { note: note || undefined }, decision === "approve" ? "Change approved" : "Change rejected")}
			/>
		</div>
	);
};

// ── Disable now ──

export const DisableNowDialog: React.FC<{ flag: Pick<FeatureFlag, "id" | "name" | "key"> | null; onClose: () => void; onDone: () => void }> = ({ flag, onClose, onDone }) => {
	const [reason, setReason] = useState("");
	const [busy, setBusy] = useState(false);
	useEffect(() => setReason(""), [flag?.id]);
	const submit = async () => {
		if (!flag) return;
		setBusy(true);
		try {
			await axiosInstance.post(`feature-flags/admin/${flag.id}/emergency-disable`, { reason: reason.trim() });
			toast.success(`${flag.name} disabled`);
			onClose();
			onDone();
		} catch (err) {
			toast.error(apiError(err, "Could not disable the flag"));
		} finally {
			setBusy(false);
		}
	};
	return (
		<Modal isOpen={!!flag} onClose={onClose} title="Disable now" size="sm">
			<div className="space-y-4">
				<p className="text-sm" style={{ color: "var(--text-secondary)" }}>
					This switches <span className="font-semibold">{flag?.name}</span> off immediately for everyone, without waiting for approval. It is recorded as an emergency change.
				</p>
				<FormTextarea label="Reason*" rows={3} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="At least 10 characters" />
				<div className="flex justify-end gap-2">
					<Button variant="outlined" color="secondary" onClick={onClose}>Cancel</Button>
					<Button variant="filled" color="error" loading={busy} disabled={busy || reason.trim().length < 10} onClick={submit}>
						Disable now
					</Button>
				</div>
			</div>
		</Modal>
	);
};

// ── Form fields (new flag + request change) ──

const Chip: React.FC<{ label: string; onRemove?: () => void; mono?: boolean }> = ({ label, onRemove, mono }) => (
	<span className="bg-muted text-foreground inline-flex max-w-full items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium">
		<span className={`min-w-0 truncate ${mono ? "font-mono" : ""}`} title={label}>{label}</span>
		{onRemove && (
			<button type="button" onClick={onRemove} aria-label={`Remove ${label}`} className="text-muted-foreground hover:text-foreground cursor-pointer">
				<X className="size-3" />
			</button>
		)}
	</span>
);
export { Chip };

const FIELD_LABEL: Record<string, string> = { name: "Name", module: "Module", description: "Description", enabled: "State", rolloutPercentage: "Rollout", targetRoles: "Roles", targetAccountIds: "Accounts" };

/** What this request would change, field by field, so the approver and the maker read the same thing. */
function changesOf(a: FlagForm, b: FlagForm): { label: string; from: string; to: string }[] {
	const show = (k: string, f: FlagForm): string => {
		const v = (f as any)[k];
		if (k === "enabled") return v ? "On" : "Off";
		if (k === "rolloutPercentage") return `${v}%`;
		if (Array.isArray(v)) return v.length ? v.join(", ") : "Everyone";
		return String(v ?? "") || "—";
	};
	return Object.keys(FIELD_LABEL)
		.filter((k) => JSON.stringify((a as any)[k]) !== JSON.stringify((b as any)[k]))
		.map((k) => ({ label: FIELD_LABEL[k], from: show(k, a), to: show(k, b) }));
}

/**
 * The flag form as sections: what it is, whether it is on and for how many, who it applies to, and (beside them on a wide
 * screen, below on a narrow one) why, with a live summary of what the request would do.
 */
export const FlagFormFields: React.FC<{
	value: FlagForm;
	onChange: (next: FlagForm) => void;
	errors: Record<string, string>;
	isNew?: boolean;
	disabled?: boolean;
	/** The flag as it is now: when given, the request summary lists the differences. */
	original?: FlagForm;
}> = ({ value, onChange, errors, isNew, disabled, original }) => {
	const roles = useRoleNames();
	const set = <K extends keyof FlagForm>(k: K, v: FlagForm[K]) => onChange({ ...value, [k]: v });
	const toggleRole = (r: string) => set("targetRoles", value.targetRoles.includes(r) ? value.targetRoles.filter((x) => x !== r) : [...value.targetRoles, r]);
	const allRoles = [...new Set([...roles, ...value.targetRoles])];
	const pct = Number.isFinite(value.rolloutPercentage) ? Math.min(100, Math.max(0, value.rolloutPercentage)) : 0;
	const targeted = value.targetRoles.length > 0 || value.targetAccountIds.length > 0;
	const diff = original ? changesOf(original, value) : [];
	const label = "mb-1.5 block text-xs font-semibold";

	const reaches = !value.enabled
		? "Nobody: the flag is off."
		: `${pct === 100 ? "Everyone" : pct === 0 ? "Nobody" : `About ${pct} in every 100 visitors`}${targeted ? ", but only those who match the roles or accounts below" : ""}.`;

	return (
		<fieldset disabled={disabled} className="@container min-w-0 border-0 p-0">
			<div className="grid grid-cols-1 gap-5 @3xl:grid-cols-[minmax(0,1fr)_320px] @3xl:items-start">
				<div className="min-w-0 space-y-5">
					<DetailSection title="Flag" description="What it is called and where it lives.">
						<div className="space-y-4 py-4">
							<div className="grid gap-4 @lg:grid-cols-2">
								{isNew && <FormInput label="Key" required placeholder="checkout.coupons" value={value.key} error={errors.key} onChange={(e) => set("key", e.target.value)} />}
								<FormInput label="Name" required placeholder="Coupon codes" value={value.name} error={errors.name} onChange={(e) => set("name", e.target.value)} />
								<ModuleLookup label="Module" required value={value.module} error={errors.module} onChange={(m) => set("module", m)} />
							</div>
							<FormTextarea label="Description" rows={2} value={value.description} onChange={(e) => set("description", e.target.value)} />
						</div>
					</DetailSection>

					<DetailSection title="Availability" description={reaches}>
						<div className="space-y-5 py-4">
							<div className="flex items-center justify-between gap-4 rounded-xl border px-4 py-3" style={{ borderColor: "var(--border-light)", background: "var(--surface-low)" }}>
								<div className="min-w-0">
									<label htmlFor="flag-enabled" className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
										Enabled
									</label>
									<p className="text-xs" style={{ color: "var(--text-hint)" }}>
										{value.enabled ? "On for the people it reaches." : "Off for everyone, whatever the rollout says."}
									</p>
								</div>
								<Switch id="flag-enabled" aria-label="Enabled" checked={value.enabled} onCheckedChange={(v) => set("enabled", v)} />
							</div>

							<div className={value.enabled ? "" : "opacity-50"}>
								<div className="mb-1.5 flex items-center justify-between gap-3">
									<label htmlFor="flag-rollout" className="text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>
										Rollout percentage
									</label>
									<span className="text-sm font-semibold tabular-nums" style={{ color: "var(--text-primary)" }}>
										{pct}%
									</span>
								</div>
								<div className="flex items-center gap-3">
									<input id="flag-rollout" aria-label="Rollout slider" type="range" min={0} max={100} step={5} value={pct} onChange={(e) => set("rolloutPercentage", Number(e.target.value))} className="accent-brand min-w-0 flex-1" />
									<div className="w-24 shrink-0">
										<FormInput aria-label="Rollout percent" type="number" min={0} max={100} value={Number.isFinite(value.rolloutPercentage) ? value.rolloutPercentage : ""} error={errors.rolloutPercentage} onChange={(e) => set("rolloutPercentage", e.target.value === "" ? NaN : Number(e.target.value))} />
									</div>
								</div>
								<div className="mt-2 grid grid-cols-10 gap-1" aria-hidden>
									{Array.from({ length: 10 }).map((_, i) => (
										<span key={i} className="h-1.5 rounded-full" style={{ background: i < Math.round(pct / 10) ? "var(--color-primary)" : "var(--border-light)" }} />
									))}
								</div>
								<p className="mt-1.5 text-xs" style={{ color: "var(--text-hint)" }}>
									Each visitor is always in or always out, so raising the percentage only adds people.
								</p>
							</div>
						</div>
					</DetailSection>

					<DetailSection title="Who it applies to" description={targeted ? "Only the roles and accounts below." : "Everyone, until you narrow it."}>
						<div className="space-y-5 py-4">
							<div>
								<p className={label} style={{ color: "var(--text-secondary)" }}>
									Target roles
								</p>
								<div className="flex flex-wrap gap-2">
									{allRoles.length === 0 && <p className="text-xs" style={{ color: "var(--text-hint)" }}>No roles loaded.</p>}
									{allRoles.map((r) => {
										const on = value.targetRoles.includes(r);
										return (
											<button
												key={r}
												type="button"
												role="checkbox"
												aria-checked={on}
												onClick={() => toggleRole(r)}
												className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 font-mono text-xs font-semibold whitespace-nowrap transition-colors"
												style={{ borderColor: on ? "var(--color-primary)" : "var(--border-light)", background: on ? "rgba(22,163,74,0.1)" : "transparent", color: on ? "var(--color-primary)" : "var(--text-secondary)" }}
											>
												{on && <Check className="size-3" strokeWidth={3} />}
												{r}
											</button>
										);
									})}
								</div>
								<p className="mt-1.5 text-xs" style={{ color: "var(--text-hint)" }}>Leave empty to target everyone.</p>
							</div>

							<AccountLookup label="Target accounts" hint="Only these accounts, on top of the roles above." value={value.targetAccountIds} onChange={(ids) => set("targetAccountIds", ids)} />
						</div>
					</DetailSection>
				</div>

				<div className="min-w-0 space-y-5 @3xl:sticky @3xl:top-4">
					<DetailSection title="Your request" description="A second person approves it before anything changes.">
						<div className="space-y-4 py-4">
							<FormTextarea label="Reason*" rows={4} placeholder="Why this change? At least 10 characters. Shown to the approver." value={value.reason} onChange={(e) => set("reason", e.target.value)} error={errors.reason} />
							<ol className="space-y-2 text-xs" style={{ color: "var(--text-hint)" }}>
								{["You send the request.", "Someone with approval rights reviews it.", "It takes effect the moment they approve."].map((t, i) => (
									<li key={t} className="flex items-start gap-2">
										<span className="flex size-4 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold" style={{ background: "var(--surface-medium)", color: "var(--color-primary)" }}>
											{i + 1}
										</span>
										{t}
									</li>
								))}
							</ol>
						</div>
					</DetailSection>

					{original && (
						<DetailSection title="What changes" description={diff.length ? undefined : "Nothing yet."}>
							{diff.length > 0 && (
								<ul className="space-y-3 py-4 text-sm">
									{diff.map((d) => (
										<li key={d.label} className="min-w-0">
											<p className="text-xs font-medium" style={{ color: "var(--text-hint)" }}>
												{d.label}
											</p>
											<p className="flex flex-wrap items-baseline gap-x-2">
												<span className="line-through opacity-60">{d.from}</span>
												<span aria-hidden>→</span>
												<span className="font-semibold" style={{ color: "var(--text-primary)" }}>
													{d.to}
												</span>
											</p>
										</li>
									))}
								</ul>
							)}
						</DetailSection>
					)}
				</div>
			</div>
		</fieldset>
	);
};
