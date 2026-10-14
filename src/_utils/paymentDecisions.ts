export type DecisionKind = "APPROVE" | "DECLINE" | "INCOMPLETE";
export type DecisionStatus = "PENDING" | "CONFIRMED" | "REJECTED" | "CANCELLED";

export interface PaymentDecision {
	id: string;
	paymentId: string;
	orderId?: string;
	orderReference?: string;
	customerName?: string;
	amount: number;
	currency: string;
	decision: DecisionKind;
	changeStatus: DecisionStatus;
	payload?: { reason?: string; explanation?: string; note?: string } | null;
	requestedById: string | number;
	requestedByName?: string;
	requestedAt: string;
	decidedById?: string | number | null;
	decidedByName?: string | null;
	decidedAt?: string | null;
	decisionNote?: string | null;
}

export const DECISION_LABEL: Record<DecisionKind, string> = { APPROVE: "Approve", DECLINE: "Decline", INCOMPLETE: "Mark incomplete" };

export const DECLINE_REASONS: Record<string, string> = {
	RECEIPT_UNCLEAR: "Receipt is unclear",
	AMOUNT_MISMATCH: "Amount does not match",
	INVALID_TRANSFER: "Transfer could not be verified",
	DUPLICATE_TRANSFER: "Appears to be duplicate transfer",
	WRONG_REFERENCE: "Wrong order reference",
	OTHER: "Other reason",
};

/** The reason or note a proposal carries, as one line of text ("" for a plain approval). */
export function decisionDetail(d: Pick<PaymentDecision, "decision" | "payload">): string {
	const p = d.payload ?? {};
	if (d.decision === "DECLINE") {
		const reason = p.reason ? (DECLINE_REASONS[p.reason] ?? p.reason) : "";
		return [reason, p.explanation].filter(Boolean).join(": ");
	}
	if (d.decision === "INCOMPLETE") return p.note ?? "";
	return "";
}

/** "3 min ago", "2 h ago", "4 days ago". */
export function timeAgo(iso: string, now = Date.now()): string {
	const min = Math.round((now - new Date(iso).getTime()) / 60_000);
	if (!Number.isFinite(min) || min < 1) return "just now";
	if (min < 60) return `${min} min ago`;
	if (min < 48 * 60) return `${Math.round(min / 60)} h ago`;
	return `${Math.round(min / 1440)} days ago`;
}

/** True when a decision POST answered "queued for a second person" instead of doing the work. */
export const isPending = (data: unknown): boolean => !!(data as { data?: { pending?: boolean } } | null)?.data?.pending;

export const formatMoney = (amount: number, currency: string) =>
	new Intl.NumberFormat("en-NG", { style: "currency", currency: currency || "NGN", minimumFractionDigits: 0 }).format(amount);
