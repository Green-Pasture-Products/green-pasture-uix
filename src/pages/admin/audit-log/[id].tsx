import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { ArrowRight, Globe, ScrollText, UserRound } from "lucide-react";

import withAdminAuth from "@/_components/withAdminAuth";
import AdminLayout from "@/_components/AdminLayout";
import { BackButton, DetailHeader, DetailSection, FactGrid } from "@/_UI/DetailField";
import Badge from "@/_UI/Badge";
import PageLoader from "@/_UI/PageLoader";
import { Button } from "@/components/ui/button";
import axiosInstance from "@/_utils/axiosInstance";
import { actorLabel, auditFailed, auditKind } from "@/_utils/auditLog";
import type { ActivityEventRow } from "@/types/live";

const show = (v: unknown) => (v === null || v === undefined || v === "" ? "—" : typeof v === "object" ? JSON.stringify(v) : String(v));

const AuditEntry: React.FC = () => {
	const router = useRouter();
	const id = router.query.id as string | undefined;
	const [entry, setEntry] = useState<ActivityEventRow | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (!id) return;
		axiosInstance
			.get(`activity/entry/${id}`)
			.then((res) => setEntry(res.data?.data ?? null))
			.catch(() => setEntry(null))
			.finally(() => setLoading(false));
	}, [id]);

	const back = () => router.push("/admin/audit-log");

	if (loading)
		return (
			<AdminLayout pageTitle="Audit entry">
				<PageLoader fullScreen={false} message="Loading entry..." />
			</AdminLayout>
		);
	if (!entry)
		return (
			<AdminLayout pageTitle="Audit entry">
				<div className="border-border bg-card mx-auto max-w-3xl space-y-3 rounded-xl border p-8 text-center">
					<p className="text-sm font-semibold">Entry not found.</p>
					<Button variant="outline" size="sm" onClick={back}>
						Back to Audit Log
					</Button>
				</div>
			</AdminLayout>
		);

	const kind = auditKind(entry);
	const failed = auditFailed(entry);
	const m = entry.metadata ?? {};
	const changes = entry.changes ? Object.entries(entry.changes) : [];

	return (
		<AdminLayout pageTitle="Audit entry">
			<div className="mx-auto w-full max-w-5xl space-y-6">
				<BackButton onClick={back} label="Back to Audit Log" />
				<DetailHeader
					title={entry.summary}
					status={failed ? <Badge variant="error" dot>Failed</Badge> : <Badge variant="success" dot>Succeeded</Badge>}
					metrics={[
						{ label: "When", value: new Date(entry.occurredAt).toLocaleString() },
						{ label: "Who", value: entry.actorName },
						{ label: "Kind", value: kind.label },
						{ label: "Actor", value: actorLabel(entry.actorType) },
					]}
				/>

				<DetailSection title="Who" icon={UserRound}>
					<FactGrid
						facts={[
							{ label: "Name", value: entry.actorName },
							{ label: "Type", value: actorLabel(entry.actorType) },
							{ label: "Profile id", value: entry.actorId && entry.actorId !== "0" ? <code className="text-xs">{entry.actorId}</code> : "" },
							...(m.email ? [{ label: "Email tried", value: m.email }] : []),
						]}
					/>
				</DetailSection>

				{entry.entityType !== "Request" && (
					<DetailSection title="Record" icon={ScrollText}>
						<FactGrid
							facts={[
								{ label: "Type", value: entry.entityType },
								{ label: "Id", value: entry.entityId ? <code className="text-xs">{entry.entityId}</code> : "" },
							]}
						/>
					</DetailSection>
				)}

				{(m.method || m.ip || m.userAgent) && (
					<DetailSection title="Request" icon={Globe}>
						<FactGrid
							facts={[
								...(m.method ? [{ label: "Call", value: <code className="text-xs">{m.method} {m.path}</code> }] : []),
								...(m.status ? [{ label: "Status", value: m.status }] : []),
								...(m.durationMs !== undefined ? [{ label: "Took", value: `${m.durationMs} ms` }] : []),
								...(m.reason ? [{ label: "Reason", value: m.reason }] : []),
								{ label: "IP address", value: m.ip },
								{ label: "Device", value: m.userAgent, wide: true },
							]}
						/>
					</DetailSection>
				)}

				{m.body && (
					<DetailSection title="Comment">
						<p className="whitespace-pre-wrap py-3 text-sm">{m.body}</p>
					</DetailSection>
				)}

				{changes.length > 0 && (
					<DetailSection title="Changes" description="Sensitive fields show that they changed, never their values." flush>
						<ul className="divide-border divide-y">
							{changes.map(([field, [before, after]]) => (
								<li key={field} className="grid gap-1 px-5 py-3 text-sm sm:grid-cols-[12rem_minmax(0,1fr)] sm:gap-4">
									<span className="text-muted-foreground">{field}</span>
									<span className="flex flex-wrap items-center gap-2 break-words">
										<span className="line-through opacity-70">{show(before)}</span>
										<ArrowRight className="size-3.5 shrink-0" aria-hidden />
										<span className="font-semibold">{show(after)}</span>
									</span>
								</li>
							))}
						</ul>
					</DetailSection>
				)}
			</div>
		</AdminLayout>
	);
};

export default withAdminAuth(AuditEntry);
