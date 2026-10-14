import React, { useState } from "react";
import { useRouter } from "next/router";
import toast from "react-hot-toast";

import withAdminAuth from "@/_components/withAdminAuth";
import AdminLayout from "@/_components/AdminLayout";
import { BackButton } from "@/_UI/DetailField";
import { PanelHeading, SettingsSaveBar } from "@/_components/SettingsParts";
import { FlagFormFields, apiError } from "@/_components/FeatureFlagParts";
import axiosInstance from "@/_utils/axiosInstance";
import { validateFlagForm, type FlagForm } from "@/_utils/featureFlags";

const EMPTY: FlagForm = { key: "", name: "", description: "", module: "", enabled: false, rolloutPercentage: 100, targetRoles: [], targetAccountIds: [], reason: "" };

const NewFeatureFlag: React.FC = () => {
	const router = useRouter();
	const [form, setForm] = useState<FlagForm>(EMPTY);
	const [errors, setErrors] = useState<Record<string, string>>({});
	const [saving, setSaving] = useState(false);

	const submit = async (e: React.FormEvent) => {
		e.preventDefault();
		const errs = validateFlagForm(form, true);
		setErrors(errs);
		if (Object.keys(errs).length) return;
		setSaving(true);
		try {
			await axiosInstance.post("feature-flags/admin", { ...form, key: form.key.trim(), name: form.name.trim(), module: form.module.trim(), reason: form.reason.trim() });
			toast.success("Request sent for approval");
			router.push("/admin/feature-flags/approvals");
		} catch (err) {
			toast.error(apiError(err, "Could not create the request"));
		} finally {
			setSaving(false);
		}
	};

	return (
		<AdminLayout pageTitle="New feature flag">
			<form onSubmit={submit} noValidate className="@container mx-auto max-w-6xl animate-page-enter space-y-5">
				<BackButton onClick={() => router.push("/admin/feature-flags")} />
				<PanelHeading title="New feature flag" description="The flag is created once someone else approves this request." />
				<FlagFormFields value={form} onChange={setForm} errors={errors} isNew />
				<SettingsSaveBar hint="Sent to an approver; nothing changes until it is approved." resetLabel="Reset" submitLabel="Send for approval" onReset={() => { setForm(EMPTY); setErrors({}); }} saving={saving} />
			</form>
		</AdminLayout>
	);
};

export default withAdminAuth(NewFeatureFlag, "MANAGE_FEATURE_FLAGS");
