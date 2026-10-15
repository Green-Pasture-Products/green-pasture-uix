import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/router";
import toast from "react-hot-toast";
import { GitPullRequest, Power, Trash2 } from "lucide-react";

import withAdminAuth from "@/_components/withAdminAuth";
import AdminLayout from "@/_components/AdminLayout";
import RecordActivity from "@/_components/RecordActivity";
import { BackButton, DetailHeader, DetailRow, DetailSection } from "@/_UI/DetailField";
import Badge from "@/_UI/Badge";
import Button from "@/_UI/Button";
import Modal from "@/_UI/Modal";
import PageLoader from "@/_UI/PageLoader";
import { FormTextarea } from "@/_UI/FormField";
import Can from "@/_components/Can";
import { Switch } from "@/components/egfm/switch";
import { SettingsSaveBar } from "@/_components/SettingsParts";
import { ChangeCard, ChangeStatusBadge, Chip, DisableNowDialog, FlagFormFields, FlagStateBadge, KIND_LABEL, apiError, dateTime, stateLabel } from "@/_components/FeatureFlagParts";
import { useHasPrivilege } from "@/_hooks/usePrivilege";
import { useAppSelector } from "@/_redux/store";
import axiosInstance from "@/_utils/axiosInstance";
import { validateFlagForm, type FlagForm } from "@/_utils/featureFlags";
import type { FeatureFlagDetail } from "@/types/featureFlags";

const toForm = (f: FeatureFlagDetail): FlagForm => ({
	key: f.key,
	name: f.name,
	description: f.description ?? "",
	module: f.module,
	enabled: f.enabled,
	rolloutPercentage: f.rolloutPercentage,
	targetRoles: f.targetRoles,
	targetAccountIds: f.targetAccountIds,
	reason: "",
});

const FeatureFlagDetailPage: React.FC = () => {
	const router = useRouter();
	const id = router.query.id as string | undefined;
	const hasPrivilege = useHasPrivilege();
	const meId = String(useAppSelector((s) => s.auth.user?.id ?? ""));
	const [flag, setFlag] = useState<FeatureFlagDetail | null>(null);
	const [loading, setLoading] = useState(true);
	const [editing, setEditing] = useState(false);
	const [form, setForm] = useState<FlagForm | null>(null);
	const [errors, setErrors] = useState<Record<string, string>>({});
	const [saving, setSaving] = useState(false);
	const [disableOpen, setDisableOpen] = useState(false);
	const [deleteOpen, setDeleteOpen] = useState(false);
	const [deleteReason, setDeleteReason] = useState("");
	const [busy, setBusy] = useState(false);

	const load = useCallback(
		(silent = false) => {
			if (!id) return;
			if (!silent) setLoading(true);
			axiosInstance
				.get(`feature-flags/admin/${id}`)
				.then((res) => {
					const data: FeatureFlagDetail = res.data?.data;
					setFlag(data);
					setForm(toForm(data));
				})
				.catch((err) => {
					setFlag(null);
					toast.error(apiError(err, "Failed to load the feature flag"));
				})
				.finally(() => setLoading(false));
		},
		[id],
	);
	useEffect(() => {
		if (router.isReady) load();
	}, [router.isReady, load]);
	useEffect(() => {
		if (router.isReady && router.query.edit === "1" && hasPrivilege("MANAGE_FEATURE_FLAGS")) setEditing(true);
	}, [router.isReady, router.query.edit]); // eslint-disable-line react-hooks/exhaustive-deps

	if (loading) {
		return (
			<AdminLayout pageTitle="Feature flag">
				<PageLoader fullScreen={false} message="Loading feature flag..." />
			</AdminLayout>
		);
	}
	if (!flag || !form) {
		return (
			<AdminLayout pageTitle="Feature flag">
				<div className="mx-auto max-w-4xl space-y-5">
					<BackButton onClick={() => router.push("/admin/feature-flags")} />
					<p className="text-muted-foreground py-16 text-center text-sm">Feature flag not found</p>
				</div>
			</AdminLayout>
		);
	}

	const pending = flag.pendingChange;
	const canManage = hasPrivilege("MANAGE_FEATURE_FLAGS");

	const submitChange = async (e: React.FormEvent) => {
		e.preventDefault();
		const errs = validateFlagForm(form, false);
		setErrors(errs);
		if (Object.keys(errs).length) return;
		const { key: _key, ...body } = form;
		setSaving(true);
		try {
			await axiosInstance.put(`feature-flags/admin/${flag.id}`, { ...body, name: body.name.trim(), module: body.module.trim(), reason: body.reason.trim() });
			toast.success("Request sent for approval");
			setEditing(false);
			load(true);
		} catch (err) {
			toast.error(apiError(err, "Could not create the request"));
		} finally {
			setSaving(false);
		}
	};

	const requestDeletion = async () => {
		setBusy(true);
		try {
			await axiosInstance.post(`feature-flags/admin/${flag.id}/delete-request`, { reason: deleteReason.trim() });
			toast.success("Request sent for approval");
			setDeleteOpen(false);
			setDeleteReason("");
			load(true);
		} catch (err) {
			toast.error(apiError(err, "Could not create the request"));
		} finally {
			setBusy(false);
		}
	};

	return (
		<AdminLayout pageTitle={flag.name}>
			<div className="mx-auto max-w-6xl animate-page-enter space-y-5">
				<BackButton onClick={() => router.push("/admin/feature-flags")} />

				<DetailHeader
					title={flag.name}
					subtitle={flag.key}
					status={
						<>
							<FlagStateBadge flag={flag} />
							{flag.system && <Badge variant="neutral" className="whitespace-nowrap">System</Badge>}
							{pending && <Badge variant="warning" className="whitespace-nowrap">Pending approval</Badge>}
						</>
					}
					actions={
						<>
							<Can privilege="MANAGE_FEATURE_FLAGS">
								<Button variant="outlined" size="sm" leftIcon={GitPullRequest} disabled={!!pending} onClick={() => setEditing((v) => !v)}>
									{editing ? "Cancel" : "Request change"}
								</Button>
							</Can>
							<Can privilege="EMERGENCY_DISABLE_FEATURE_FLAGS">
								{flag.enabled && !flag.key.endsWith(".maker_checker") && (
									<Button variant="outlined" color="error" size="sm" leftIcon={Power} onClick={() => setDisableOpen(true)}>Disable now</Button>
								)}
							</Can>
							{!flag.system && (
								<Can privilege="MANAGE_FEATURE_FLAGS">
									<Button variant="outlined" color="error" size="sm" leftIcon={Trash2} disabled={!!pending} onClick={() => setDeleteOpen(true)}>Request deletion</Button>
								</Can>
							)}
						</>
					}
					metrics={[
						{ label: "State", value: stateLabel(flag) },
						{ label: "Rollout", value: `${flag.rolloutPercentage}%` },
						{ label: "Targeting", value: flag.targetRoles.length || flag.targetAccountIds.length ? `${flag.targetRoles.length} roles · ${flag.targetAccountIds.length} accounts` : "Everyone" },
						{ label: "Updated", value: dateTime(flag.updatedAt) },
					]}
				/>

				{pending && (
					<DetailSection title="Pending request">
						<div className="py-3">
							<ChangeCard change={pending} meId={meId} onDone={() => load(true)} />
						</div>
					</DetailSection>
				)}

				{editing && canManage ? (
					<form onSubmit={submitChange} noValidate className="space-y-5">
						<FlagFormFields value={form} onChange={setForm} errors={errors} disabled={!!pending} original={toForm(flag)} />
						<SettingsSaveBar
							hint={pending ? "A change is already pending for this flag. Decide or cancel it first." : "Sent to an approver; nothing changes until it is approved."}
							submitLabel="Send for approval"
							onReset={() => {
								setForm(toForm(flag));
								setErrors({});
							}}
							saving={saving}
						/>
					</form>
				) : (
					<>
						{canManage && pending && (
							<p className="text-muted-foreground text-sm" data-testid="change-disabled-note">
								Requesting a change is disabled while a request is pending for this flag.
							</p>
						)}
						<div className="grid grid-cols-1 gap-5 lg:grid-cols-2 lg:items-start">
							<DetailSection title="Status & rollout">
								<div className="space-y-4 py-3">
									<div className="flex items-center justify-between gap-4">
										<span className="text-sm font-medium">Enabled</span>
										<Switch checked={flag.enabled} onCheckedChange={() => {}} disabled aria-label="Enabled" />
									</div>
									<div>
										<div className="mb-1 flex items-center justify-between text-xs">
											<span className="text-muted-foreground">Rollout</span>
											<span className="font-semibold">{flag.rolloutPercentage}%</span>
										</div>
										<div className="bg-muted h-2 overflow-hidden rounded-full" role="progressbar" aria-valuenow={flag.rolloutPercentage} aria-valuemin={0} aria-valuemax={100}>
											<div className="bg-brand h-full rounded-full" style={{ width: `${flag.rolloutPercentage}%` }} />
										</div>
									</div>
									<dl>
										<DetailRow label="Module" value={flag.module} />
										<DetailRow label="Effective now" value={flag.effective ? "On" : "Off"} />
									</dl>
								</div>
							</DetailSection>

							<DetailSection title="Targeting" description="Empty means everyone.">
								<div className="space-y-4 py-3">
									<div>
										<p className="text-muted-foreground mb-2 text-xs font-medium">Roles</p>
										<div className="flex flex-wrap gap-2">
											{flag.targetRoles.length ? flag.targetRoles.map((r) => <Chip key={r} label={r} />) : <span className="text-muted-foreground text-sm">None</span>}
										</div>
									</div>
									<div>
										<p className="text-muted-foreground mb-2 text-xs font-medium">Account ids</p>
										<div className="flex flex-wrap gap-2">
											{flag.targetAccountIds.length ? flag.targetAccountIds.map((a) => <Chip key={a} mono label={a} />) : <span className="text-muted-foreground text-sm">None</span>}
										</div>
									</div>
								</div>
							</DetailSection>
						</div>

						<DetailSection title="Description">
							<dl>
								<DetailRow label="Description" wide value={flag.description} />
							</dl>
						</DetailSection>
					</>
				)}

				<DetailSection title="Request history" flush>
					{flag.history?.length ? (
						<div className="overflow-x-auto">
							<table className="w-full min-w-[40rem] text-left text-sm">
								<thead className="text-muted-foreground text-xs">
									<tr>
										{["Request", "Status", "Requested by", "Reason", "Decided"].map((h) => (
											<th key={h} className="px-4 py-2 font-medium whitespace-nowrap">{h}</th>
										))}
									</tr>
								</thead>
								<tbody className="divide-border divide-y">
									{flag.history.map((c) => (
										<tr key={c.id}>
											<td className="px-4 py-2.5 whitespace-nowrap">{KIND_LABEL[c.kind]}{c.emergency ? " (emergency)" : ""}</td>
											<td className="px-4 py-2.5"><ChangeStatusBadge status={c.changeStatus} /></td>
											<td className="max-w-[12rem] px-4 py-2.5"><span className="block truncate" title={`${c.requestedByName} · ${dateTime(c.requestedAt)}`}>{c.requestedByName}</span></td>
											<td className="max-w-[16rem] px-4 py-2.5"><span className="block truncate" title={c.reason}>{c.reason}</span></td>
											<td className="max-w-[14rem] px-4 py-2.5"><span className="text-muted-foreground block truncate" title={c.decisionNote ?? ""}>{c.decidedByName ? `${c.decidedByName} · ${dateTime(c.decidedAt)}` : "—"}</span></td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					) : (
						<p className="text-muted-foreground px-5 py-6 text-center text-sm">No requests yet.</p>
					)}
				</DetailSection>

				<DisableNowDialog flag={disableOpen ? flag : null} onClose={() => setDisableOpen(false)} onDone={() => load(true)} />
				<Modal isOpen={deleteOpen} onClose={() => setDeleteOpen(false)} title="Request deletion" size="sm">
					<div className="space-y-4">
						<p className="text-sm" style={{ color: "var(--text-secondary)" }}>
							Ask for <span className="font-semibold">{flag.name}</span> to be deleted. Someone else has to approve it.
						</p>
						<FormTextarea label="Reason*" rows={3} value={deleteReason} onChange={(e) => setDeleteReason(e.target.value)} placeholder="At least 10 characters" />
						<div className="flex justify-end gap-2">
							<Button variant="outlined" color="secondary" onClick={() => setDeleteOpen(false)}>Cancel</Button>
							<Button variant="filled" color="error" loading={busy} disabled={busy || deleteReason.trim().length < 10} onClick={requestDeletion}>Request deletion</Button>
						</div>
					</div>
				</Modal>
			</div>

			{/* Outside the animated wrapper: a transformed ancestor would make this fixed panel position against the wrapper, not the screen. */}
			<RecordActivity type="FeatureFlag" id={flag.id} created={{ at: (flag as any).createdAt, by: (flag as any).createdBy }} />
		</AdminLayout>
	);
};

export default withAdminAuth(FeatureFlagDetailPage);
