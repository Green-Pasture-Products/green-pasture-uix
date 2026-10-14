import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import toast from "react-hot-toast";

import withAdminAuth from "@/_components/withAdminAuth";
import AdminLayout from "@/_components/AdminLayout";
import { BackButton, DetailSection } from "@/_UI/DetailField";
import { PanelHeading } from "@/_components/SettingsParts";
import { apiError, dateTime } from "@/_components/FeatureFlagParts";
import { DecisionBadge, DecisionCard, DecisionStatusBadge } from "@/_components/PaymentDecisionParts";
import PageLoader from "@/_UI/PageLoader";
import { useAppSelector } from "@/_redux/store";
import { useLiveEvent } from "@/_hooks/useLiveEvent";
import axiosInstance from "@/_utils/axiosInstance";
import { decisionDetail, formatMoney, type PaymentDecision } from "@/_utils/paymentDecisions";

const TAB = "rounded-md px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-colors";

const Confirmations: React.FC = () => {
	const router = useRouter();
	const meId = String(useAppSelector((s) => s.auth.user?.id ?? ""));
	const [tab, setTab] = useState<"pending" | "decided">("pending");
	const [pending, setPending] = useState<PaymentDecision[]>([]);
	const [decided, setDecided] = useState<PaymentDecision[]>([]);
	const [loading, setLoading] = useState(true);

	const load = useCallback(() => {
		const get = (params?: object) => axiosInstance.get("payment-decisions", { params }).then((r) => (r.data?.data ?? []) as PaymentDecision[]);
		Promise.all([get({ status: "PENDING" }), get()])
			.then(([p, all]) => {
				setPending(p);
				setDecided(all.filter((c) => c.changeStatus !== "PENDING").sort((a, b) => (b.decidedAt ?? b.requestedAt).localeCompare(a.decidedAt ?? a.requestedAt)).slice(0, 30));
			})
			.catch((err) => toast.error(apiError(err, "Failed to load confirmations")))
			.finally(() => setLoading(false));
	}, []);
	useEffect(load, [load]);
	useLiveEvent("payment-decisions-changed", load);

	return (
		<AdminLayout pageTitle="Payment confirmations">
			<div className="mx-auto max-w-4xl animate-page-enter space-y-5">
				<BackButton onClick={() => router.push("/admin/payments/manual")} label="Back to payments" />
				<PanelHeading title="Payment confirmations" description="Approvals, declines and incomplete marks wait here for someone other than the proposer to confirm them." />
				<div className="bg-muted inline-flex max-w-full gap-1 overflow-x-auto rounded-lg p-1" role="tablist">
					<button type="button" role="tab" aria-selected={tab === "pending"} onClick={() => setTab("pending")} className={`${TAB} ${tab === "pending" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
						Pending ({pending.length})
					</button>
					<button type="button" role="tab" aria-selected={tab === "decided"} onClick={() => setTab("decided")} className={`${TAB} ${tab === "decided" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
						Decided
					</button>
				</div>

				{loading ? (
					<PageLoader fullScreen={false} message="Loading confirmations..." />
				) : tab === "pending" ? (
					<DetailSection title="Waiting for confirmation">
						<div className="space-y-3 py-3">
							{pending.length === 0 && <p className="text-muted-foreground py-6 text-center text-sm">Nothing is waiting for confirmation.</p>}
							{pending.map((d) => (
								<DecisionCard key={d.id} decision={d} meId={meId} onDone={load} context />
							))}
						</div>
					</DetailSection>
				) : (
					<DetailSection title="Recently decided (last 30)" flush>
						{decided.length === 0 ? (
							<p className="text-muted-foreground px-5 py-6 text-center text-sm">No decisions yet.</p>
						) : (
							<ul className="divide-border divide-y">
								{decided.map((d) => (
									<li key={d.id} className="min-w-0 space-y-1 px-5 py-3 text-sm">
										<div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1">
											<DecisionStatusBadge status={d.changeStatus} />
											<DecisionBadge kind={d.decision} />
											<Link href={`/admin/payments/${d.paymentId}`} className="text-brand-ink min-w-0 truncate font-medium hover:underline" title={d.orderReference}>{d.orderReference ?? "Payment"}</Link>
											<span className="whitespace-nowrap">{formatMoney(d.amount, d.currency)}</span>
										</div>
										<p className="text-muted-foreground truncate text-xs" title={`${d.requestedByName ?? ""} → ${d.decidedByName ?? ""}`}>
											{d.requestedByName ?? "—"} proposed{d.decidedByName ? `, ${d.decidedByName} ${d.changeStatus.toLowerCase()}` : ""} · {dateTime(d.decidedAt ?? d.requestedAt)}
										</p>
										{(d.decisionNote || decisionDetail(d)) && <p className="text-muted-foreground truncate text-xs" title={d.decisionNote || decisionDetail(d)}>{d.decisionNote || decisionDetail(d)}</p>}
									</li>
								))}
							</ul>
						)}
					</DetailSection>
				)}
			</div>
		</AdminLayout>
	);
};

export default withAdminAuth(Confirmations);
