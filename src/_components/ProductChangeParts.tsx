import React, { useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import Badge from "@/_UI/Badge";
import Button from "@/_UI/Button";
import Can from "@/_components/Can";
import { useHasPrivilege } from "@/_hooks/usePrivilege";
import { useLiveEvent } from "@/_hooks/useLiveEvent";
import { ChangeStatusBadge, DecisionDialog, apiError, dateTime, type Decision } from "@/_components/FeatureFlagParts";
import { useAppDispatch, useAppSelector } from "@/_redux/store";
import { tagAction } from "@/_redux/actions/tag.action";
import axiosInstance from "@/_utils/axiosInstance";
import { changeLines, changeSummary, naira } from "@/_utils/productChanges";
import type { ProductChange } from "@/types/productChanges";

export const PRODUCT_CHANGE_VIEWERS = ["READ_PRODUCT", "MANAGE_PRODUCTS", "APPROVE_PRODUCT_CHANGES"] as const;

export const fetchProductChanges = (params?: { status?: string; itemId?: string }) =>
	axiosInstance.get("product-changes", { params }).then((r) => (r.data?.data ?? []) as ProductChange[]);

const ago = (iso: string) => {
	const s = (Date.now() - new Date(iso).getTime()) / 1000;
	if (s < 60) return "just now";
	if (s < 3600) return `${Math.floor(s / 60)} min ago`;
	if (s < 86400) return `${Math.floor(s / 3600)} h ago`;
	return `${Math.floor(s / 86400)} d ago`;
};

/** Resolves tag ids to names from the shared tag store (fetched once if empty). */
function useTagName() {
	const dispatch = useAppDispatch();
	const tags = useAppSelector((s) => s.tag.tags);
	useEffect(() => {
		if (!tags.length) dispatch(tagAction.fetchTags());
	}, [dispatch, tags.length]);
	return (id: string) => tags.find((t: any) => String(t.id) === id)?.name ?? id;
}

const Lines: React.FC<{ change: ProductChange; tagName: (id: string) => string }> = ({ change, tagName }) => {
	const lines = changeLines(change, tagName);
	if (!lines.length) return <p className="text-muted-foreground text-sm">No field differences.</p>;
	return (
		<dl>
			{lines.map((l) => (
				<div key={l.field} className="border-border/60 grid min-w-0 gap-1 border-b py-2 last:border-b-0 sm:grid-cols-[9rem_minmax(0,1fr)] sm:gap-4">
					<dt className="text-muted-foreground text-sm whitespace-nowrap">{l.label}</dt>
					<dd className={`flex min-w-0 gap-2 text-sm ${l.field === "description" ? "flex-col items-start" : "items-center"}`}>
						{l.before !== null && (
							<>
								<span className={`text-muted-foreground min-w-0 line-through ${l.field === "description" ? "line-clamp-3" : "truncate"}`} title={l.before}>{l.before}</span>
								{l.field !== "description" && <span aria-hidden className="text-muted-foreground shrink-0">→</span>}
							</>
						)}
						<span className={`text-foreground min-w-0 font-semibold ${l.field === "description" ? "line-clamp-3" : "truncate"}`} title={l.after}>{l.after}</span>
					</dd>
				</div>
			))}
		</dl>
	);
};

const Variants: React.FC<{ variants: any[] }> = ({ variants }) => (
	<div className="grid gap-2 sm:grid-cols-2">
		{variants.map((v, i) => {
			const size = v.weightValue ? `${v.weightValue} ${v.weightUnit ?? ""}`.trim() : "Single size";
			return (
				<div key={i} className="border-border bg-muted/40 min-w-0 rounded-lg border px-3 py-2 text-sm" data-testid="change-variant">
					<p className="truncate font-semibold" title={size}>{size}</p>
					<p className="text-muted-foreground truncate text-xs" title={`${naira(Number(v.price))} · ${v.unit} in stock`}>
						{naira(Number(v.price))}
						{v.originalPrice ? ` (was ${naira(Number(v.originalPrice))})` : ""} · {v.unit} in stock
					</p>
				</div>
			);
		})}
	</div>
);

/**
 * One product change: what it does (field by field, plus pack sizes and images for a new product) and, while
 * pending, the actions. The requester can only cancel; approve/reject needs APPROVE_PRODUCT_CHANGES and someone else
 * (the API enforces both). Same pattern as the feature-flag ChangeCard.
 */
export const ProductChangeCard: React.FC<{ change: ProductChange; meId: string; onDone: () => void; showProductLink?: boolean }> = ({ change, meId, onDone, showProductLink }) => {
	const [decision, setDecision] = useState<Decision | null>(null);
	const [busy, setBusy] = useState(false);
	const tagName = useTagName();
	const mine = String(change.requestedById) === meId;
	const pending = change.changeStatus === "PENDING";
	const images: { url: string }[] = change.kind === "CREATE" ? (change.payload?.images ?? []) : [];
	const variants: any[] = change.kind === "CREATE" ? (change.payload?.variants ?? []) : [];
	const link = showProductLink && change.itemId ? `/admin/product/${change.itemId}` : null;

	const send = async (path: string, body: object | undefined, ok: string) => {
		setBusy(true);
		try {
			await axiosInstance.post(`product-changes/${change.id}/${path}`, body);
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
				<Badge variant={pending ? "warning" : "neutral"} className="whitespace-nowrap">{change.kind === "CREATE" ? "New product" : "Change"}</Badge>
				{!pending && <ChangeStatusBadge status={change.changeStatus} />}
				{link ? (
					<Link href={link} className="text-brand-ink min-w-0 truncate text-sm font-semibold hover:underline" title={change.productName}>{change.productName}</Link>
				) : (
					<span className="min-w-0 truncate text-sm font-semibold" title={change.productName}>{change.productName}</span>
				)}
			</div>
			<p className="text-muted-foreground truncate text-xs" title={`${change.requestedByName} · ${dateTime(change.requestedAt)}`}>
				Requested by <span className="text-foreground font-medium">{mine ? "you" : change.requestedByName}</span> · {ago(change.requestedAt)}
			</p>
			{change.note && <p className="text-foreground text-sm break-words">&ldquo;{change.note}&rdquo;</p>}

			<Lines change={change} tagName={tagName} />
			{variants.length > 0 && <Variants variants={variants} />}
			{images.length > 0 && (
				<div className="flex flex-wrap gap-2">
					{images.map((im, i) => (
						<img key={i} src={im.url} alt="" className="border-border size-14 rounded-lg border object-cover" />
					))}
				</div>
			)}

			{!pending && (
				<p className="text-muted-foreground text-xs break-words">
					{change.decidedByName ? `${change.decidedByName} · ` : ""}{dateTime(change.decidedAt)}
					{change.decisionNote ? ` · “${change.decisionNote}”` : ""}
				</p>
			)}

			{pending && (
				<div className="flex flex-wrap items-center gap-2">
					{mine ? (
						<>
							<p className="text-muted-foreground text-sm">Waiting for someone else to approve</p>
							<Button variant="outlined" color="secondary" size="sm" loading={busy} onClick={() => send("cancel", undefined, "Request cancelled")}>
								Cancel request
							</Button>
						</>
					) : (
						<Can privilege="APPROVE_PRODUCT_CHANGES">
							<Button variant="filled" size="sm" onClick={() => setDecision("approve")}>Approve</Button>
							<Button variant="outlined" color="error" size="sm" onClick={() => setDecision("reject")}>Reject</Button>
						</Can>
					)}
				</div>
			)}

			<DecisionDialog
				decision={decision}
				busy={busy}
				summary={changeSummary(change, decision === "reject" ? "Reject" : "Approve")}
				onClose={() => setDecision(null)}
				onConfirm={(note) => send(decision!, { note: note || undefined }, decision === "approve" ? "Change approved" : "Change rejected")}
			/>
		</div>
	);
};


/** Number of changes waiting for a decision; refreshes when the server says changes moved. Null until known or when not allowed to view. */
export function usePendingProductChanges(): number | null {
	const hasPrivilege = useHasPrivilege();
	const allowed = hasPrivilege(PRODUCT_CHANGE_VIEWERS);
	const [n, setN] = useState<number | null>(null);
	const load = () => {
		if (!allowed) return;
		axiosInstance
			.get("product-changes/summary")
			.then((r) => setN(Number(r.data?.data?.pending ?? 0)))
			.catch(() => {});
	};
	useEffect(load, [allowed]);
	useLiveEvent("product-changes-changed", load, allowed);
	return n;
}
