import React, { useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import Badge from "@/_UI/Badge";
import Button from "@/_UI/Button";
import Modal from "@/_UI/Modal";
import Can from "@/_components/Can";
import { FormTextarea } from "@/_UI/FormField";
import axiosInstance from "@/_utils/axiosInstance";
import { apiError, dateTime } from "@/_components/FeatureFlagParts";
import { DECISION_LABEL, decisionDetail, formatMoney, timeAgo, type PaymentDecision } from "@/_utils/paymentDecisions";

const KIND_VARIANT = { APPROVE: "success", DECLINE: "error", INCOMPLETE: "warning" } as const;
const STATUS_VARIANT = { PENDING: "warning", CONFIRMED: "success", REJECTED: "error", CANCELLED: "neutral" } as const;

export const DecisionBadge: React.FC<{ kind: PaymentDecision["decision"] }> = ({ kind }) => (
	<Badge variant={KIND_VARIANT[kind]} className="whitespace-nowrap">{DECISION_LABEL[kind]}</Badge>
);

export const DecisionStatusBadge: React.FC<{ status: PaymentDecision["changeStatus"] }> = ({ status }) => (
	<Badge variant={STATUS_VARIANT[status]} className="whitespace-nowrap">{status.charAt(0) + status.slice(1).toLowerCase()}</Badge>
);

type Mode = "confirm" | "reject";

/**
 * A proposed manual-payment decision with its Confirm / Reject (someone else's) or Cancel (your own) actions.
 * `context` adds the order link, customer and amount for the list page; the payment page already shows them.
 */
export const DecisionCard: React.FC<{ decision: PaymentDecision; meId: string; onDone: () => void; context?: boolean }> = ({ decision: d, meId, onDone, context }) => {
	const [mode, setMode] = useState<Mode | null>(null);
	const [note, setNote] = useState("");
	const [busy, setBusy] = useState(false);
	const mine = String(d.requestedById) === meId;
	const detail = decisionDetail(d);
	const noteMissing = mode === "reject" && note.trim().length < 3;
	const summary = `${DECISION_LABEL[d.decision]} ${formatMoney(d.amount, d.currency)}${d.orderReference ? ` for ${d.orderReference}` : ""}${d.customerName ? ` (${d.customerName})` : ""}`;

	const send = async (path: string, body: object | undefined, ok: string) => {
		setBusy(true);
		try {
			await axiosInstance.post(`payment-decisions/${d.id}/${path}`, body);
			toast.success(ok);
			setMode(null);
			setNote("");
			onDone();
		} catch (err) {
			toast.error(apiError(err, "Could not update the proposal"));
		} finally {
			setBusy(false);
		}
	};

	return (
		<div className="border-border bg-card min-w-0 space-y-3 rounded-xl border p-4" data-testid="pending-decision">
			<div className="flex min-w-0 flex-wrap items-center gap-2">
				<DecisionBadge kind={d.decision} />
				{context && (
					<Link href={`/admin/payments/${d.paymentId}`} className="text-brand-ink min-w-0 truncate text-sm font-semibold hover:underline" title={d.orderReference}>
						{d.orderReference ?? "Payment"}
					</Link>
				)}
				{context && <span className="text-sm font-semibold whitespace-nowrap">{formatMoney(d.amount, d.currency)}</span>}
			</div>
			{context && d.customerName && <p className="text-muted-foreground truncate text-sm" title={d.customerName}>{d.customerName}</p>}
			{detail && <p className="text-foreground text-sm whitespace-normal">&ldquo;{detail}&rdquo;</p>}
			<p className="text-muted-foreground truncate text-xs" title={`${d.requestedByName ?? ""} · ${dateTime(d.requestedAt)}`}>
				Proposed by <span className="text-foreground font-medium">{mine ? "you" : (d.requestedByName ?? "someone")}</span> · {timeAgo(d.requestedAt)}
			</p>
			<div className="flex flex-wrap items-center gap-2">
				{mine ? (
					<>
						<p className="text-muted-foreground text-sm">Waiting for someone else to confirm</p>
						<Button variant="outlined" color="secondary" size="sm" loading={busy} onClick={() => send("cancel", undefined, "Proposal cancelled")}>Cancel proposal</Button>
					</>
				) : (
					<Can privilege="APPROVE_PAYMENT_DECISIONS">
						<Button variant="filled" size="sm" onClick={() => setMode("confirm")}>Confirm</Button>
						<Button variant="outlined" color="error" size="sm" onClick={() => setMode("reject")}>Reject</Button>
					</Can>
				)}
			</div>

			<Modal isOpen={!!mode} onClose={() => setMode(null)} title={mode === "reject" ? "Reject proposal" : "Confirm decision"} size="sm">
				<div className="space-y-4">
					<p className="text-sm break-words">{mode === "reject" ? `Reject: ${summary}` : `This takes effect now: ${summary}`}</p>
					<FormTextarea
						label={mode === "reject" ? "Reason for rejecting*" : "Note (optional)"}
						rows={3}
						value={note}
						onChange={(e) => setNote(e.target.value)}
						placeholder={mode === "reject" ? "Tell the proposer why" : "Anything the proposer should know"}
					/>
					<div className="flex justify-end gap-2">
						<Button variant="outlined" color="secondary" onClick={() => setMode(null)}>Cancel</Button>
						<Button
							variant="filled"
							color={mode === "reject" ? "error" : "primary"}
							loading={busy}
							disabled={busy || noteMissing}
							onClick={() => send(mode!, { note: note.trim() || undefined }, mode === "reject" ? "Proposal rejected" : "Decision confirmed")}
						>
							{mode === "reject" ? "Reject proposal" : "Confirm decision"}
						</Button>
					</div>
				</div>
			</Modal>
		</div>
	);
};
