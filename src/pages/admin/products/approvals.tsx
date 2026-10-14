import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/router";
import toast from "react-hot-toast";

import withAdminAuth from "@/_components/withAdminAuth";
import AdminLayout from "@/_components/AdminLayout";
import { BackButton } from "@/_UI/DetailField";
import { PanelHeading } from "@/_components/SettingsParts";
import { apiError } from "@/_components/FeatureFlagParts";
import { ProductChangeCard, fetchProductChanges } from "@/_components/ProductChangeParts";
import PageLoader from "@/_UI/PageLoader";
import { useAppSelector } from "@/_redux/store";
import { useLiveEvent } from "@/_hooks/useLiveEvent";
import type { ProductChange } from "@/types/productChanges";

const TAB = "rounded-md px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-colors";

const ProductApprovals: React.FC = () => {
	const router = useRouter();
	const meId = String(useAppSelector((s) => s.auth.user?.id ?? ""));
	const [tab, setTab] = useState<"pending" | "decided">("pending");
	const [pending, setPending] = useState<ProductChange[]>([]);
	const [decided, setDecided] = useState<ProductChange[]>([]);
	const [loading, setLoading] = useState(true);

	const load = useCallback(() => {
		Promise.all([fetchProductChanges({ status: "PENDING" }), fetchProductChanges()])
			.then(([p, all]) => {
				setPending(p);
				setDecided(all.filter((c) => c.changeStatus !== "PENDING").sort((a, b) => (b.decidedAt ?? b.requestedAt).localeCompare(a.decidedAt ?? a.requestedAt)).slice(0, 30));
			})
			.catch((err) => toast.error(apiError(err, "Failed to load approvals")))
			.finally(() => setLoading(false));
	}, []);
	useEffect(load, [load]);
	useLiveEvent("product-changes-changed", load);

	const list = tab === "pending" ? pending : decided;

	return (
		<AdminLayout pageTitle="Product approvals">
			<div className="mx-auto max-w-4xl animate-page-enter space-y-5">
				<BackButton onClick={() => router.push("/admin/products")} />
				<PanelHeading title="Product approvals" description="New products and edits wait here until someone other than the requester approves them." />
				<div className="bg-muted inline-flex max-w-full gap-1 overflow-x-auto rounded-lg p-1" role="tablist">
					<button type="button" role="tab" aria-selected={tab === "pending"} onClick={() => setTab("pending")} className={`${TAB} ${tab === "pending" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
						Pending ({pending.length})
					</button>
					<button type="button" role="tab" aria-selected={tab === "decided"} onClick={() => setTab("decided")} className={`${TAB} ${tab === "decided" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
						Decided (last 30)
					</button>
				</div>

				{loading ? (
					<PageLoader fullScreen={false} message="Loading approvals..." />
				) : list.length === 0 ? (
					<p className="text-muted-foreground border-border rounded-xl border py-10 text-center text-sm">{tab === "pending" ? "Nothing is waiting for approval." : "No decisions yet."}</p>
				) : (
					<div className="space-y-3">
						{list.map((c) => (
							<ProductChangeCard key={c.id} change={c} meId={meId} onDone={load} showProductLink />
						))}
					</div>
				)}
			</div>
		</AdminLayout>
	);
};

export default withAdminAuth(ProductApprovals);
