import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import toast from "react-hot-toast";

import withAdminAuth from "@/_components/withAdminAuth";
import AdminLayout from "@/_components/AdminLayout";
import { BackButton, DetailSection } from "@/_UI/DetailField";
import { PanelHeading } from "@/_components/SettingsParts";
import { ChangeCard, ChangeStatusBadge, KIND_LABEL, apiError, dateTime } from "@/_components/FeatureFlagParts";
import PageLoader from "@/_UI/PageLoader";
import { useAppSelector } from "@/_redux/store";
import axiosInstance from "@/_utils/axiosInstance";
import type { FeatureFlagChange } from "@/types/featureFlags";

const TAB = "rounded-md px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-colors";

const Approvals: React.FC = () => {
	const router = useRouter();
	const meId = String(useAppSelector((s) => s.auth.user?.id ?? ""));
	const [pending, setPending] = useState<FeatureFlagChange[]>([]);
	const [decided, setDecided] = useState<FeatureFlagChange[]>([]);
	const [loading, setLoading] = useState(true);

	const load = useCallback(() => {
		const get = (params?: object) => axiosInstance.get("feature-flags/admin/changes", { params }).then((r) => (r.data?.data ?? []) as FeatureFlagChange[]);
		Promise.all([get({ status: "PENDING" }), get()])
			.then(([p, all]) => {
				setPending(p);
				setDecided(all.filter((c) => c.changeStatus !== "PENDING").sort((a, b) => (b.decidedAt ?? b.requestedAt).localeCompare(a.decidedAt ?? a.requestedAt)).slice(0, 20));
			})
			.catch((err) => toast.error(apiError(err, "Failed to load approvals")))
			.finally(() => setLoading(false));
	}, []);
	useEffect(load, [load]);

	return (
		<AdminLayout pageTitle="Feature flag approvals">
			<div className="mx-auto max-w-4xl animate-page-enter space-y-5">
				<BackButton onClick={() => router.push("/admin/feature-flags")} />
				<PanelHeading title="Feature Flags" description="Requests wait here for someone other than the requester to approve them." />
				<div className="bg-muted inline-flex max-w-full gap-1 overflow-x-auto rounded-lg p-1" role="tablist">
					<Link role="tab" aria-selected="false" href="/admin/feature-flags" className={`${TAB} text-muted-foreground hover:text-foreground`}>Flags</Link>
					<span role="tab" aria-selected="true" className={`${TAB} bg-card text-foreground shadow-sm`}>Approvals ({pending.length} pending)</span>
				</div>

				{loading ? (
					<PageLoader fullScreen={false} message="Loading approvals..." />
				) : (
					<>
						<DetailSection title="Pending approval">
							<div className="space-y-3 py-3">
								{pending.length === 0 && <p className="text-muted-foreground py-6 text-center text-sm">Nothing is waiting for approval.</p>}
								{pending.map((c) => (
									<ChangeCard key={c.id} change={c} meId={meId} onDone={load} showFlagLink />
								))}
							</div>
						</DetailSection>

						<DetailSection title="Recently decided" flush>
							{decided.length === 0 ? (
								<p className="text-muted-foreground px-5 py-6 text-center text-sm">No decisions yet.</p>
							) : (
								<ul className="divide-border divide-y">
									{decided.map((c) => (
										<li key={c.id} className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1 px-5 py-3 text-sm">
											<ChangeStatusBadge status={c.changeStatus} />
											<span className="min-w-0 truncate font-mono font-medium" title={c.flagKey}>{c.flagKey}</span>
											<span className="text-muted-foreground whitespace-nowrap">{KIND_LABEL[c.kind]}</span>
											<span className="text-muted-foreground ml-auto min-w-0 truncate text-xs" title={`${c.decidedByName ?? ""} ${dateTime(c.decidedAt)}`}>
												{c.decidedByName ? `${c.decidedByName} · ` : ""}{dateTime(c.decidedAt)}
											</span>
										</li>
									))}
								</ul>
							)}
						</DetailSection>
					</>
				)}
			</div>
		</AdminLayout>
	);
};

export default withAdminAuth(Approvals);
