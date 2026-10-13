import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Power, Trash2, type LucideIcon } from "lucide-react";
import toast from "react-hot-toast";

import AdminLayout from "@/_components/AdminLayout";
import RecordActivity from "@/_components/RecordActivity";
import { BackButton, DetailHeader, EditableSection, recordDates } from "@/_UI/DetailField";
import { FormInput } from "@/_UI/FormField";
import RichTextEditor from "@/_UI/RichTextEditor";
import SanitizedHtml from "@/_UI/SanitizedHtml";
import PageLoader from "@/_UI/PageLoader";
import Modal from "@/_UI/Modal";
import Badge from "@/_UI/Badge";
import { Button } from "@/components/ui/button";
import axiosInstance from "@/_utils/axiosInstance";
import { useHasPrivilege } from "@/_hooks/usePrivilege";

export interface NameDescriptionRecord {
	id: string;
	name: string;
	description: string | null;
	status: string;
	createdAt: string;
	createdBy: string;
	updatedAt: string;
}

export interface RecordConfig {
	/** Audited entity name, for the Activity panel. */
	entityType: string;
	/** "Category", "Tag" */
	label: string;
	listPath: string;
	listLabel: string;
	privileges: { write: string[]; delete: string[] };
	icon: LucideIcon;
	api: {
		get: (id: string) => Promise<NameDescriptionRecord | null>;
		update: (id: string, v: { name: string; description: string }) => Promise<void>;
		setActive: (id: string, active: boolean) => Promise<void>;
		remove: (id: string) => Promise<void>;
	};
	/** Extra read-only facts (e.g. a tag's slug). */
	extraFacts?: (r: NameDescriptionRecord) => { label: string; value: React.ReactNode }[];
}

const schema = z.object({ name: z.string().trim().min(1, "Name is required"), description: z.string().optional() });
type FormValues = z.infer<typeof schema>;

/** In-place edit form, shown when the section's Edit is chosen. */
function EditCard({ config, category, onCancel, onSaved }: { config: RecordConfig; category: NameDescriptionRecord; onCancel: () => void; onSaved: () => void }) {
	const {
		register,
		control,
		handleSubmit,
		formState: { errors, isDirty, isSubmitting },
	} = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { name: category.name, description: category.description ?? "" } });

	const save = handleSubmit(async (values) => {
		try {
			await config.api.update(category.id, { name: values.name.trim(), description: values.description ?? "" });
			toast.success(`${config.label} saved`);
			onSaved();
		} catch (e: any) {
			toast.error(e?.response?.data?.message || `Failed to save ${config.label.toLowerCase()}`);
		}
	});

	return (
		<form onSubmit={save} className="border-border bg-card overflow-hidden rounded-xl border" aria-label={`Edit ${config.label.toLowerCase()}`}>
			<div className="space-y-4 p-5">
				<FormInput label="Name" required error={errors.name?.message} {...register("name")} />
				<div>
					<label className="mb-1 block text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>
						Description
					</label>
					<Controller name="description" control={control} render={({ field }) => <RichTextEditor value={field.value ?? ""} onChange={field.onChange} placeholder={`Brief description of this ${config.label.toLowerCase()}`} minHeight={160} />} />
				</div>
			</div>
			<div className="border-border bg-secondary/15 flex justify-end gap-2 border-t px-5 py-3">
				<Button type="button" variant="outline" size="sm" onClick={onCancel}>
					Cancel
				</Button>
				<Button type="submit" size="sm" disabled={!isDirty || isSubmitting}>
					{isSubmitting ? "Saving…" : "Save changes"}
				</Button>
			</div>
		</form>
	);
}

export const NameDescriptionRecordPage: React.FC<{ config: RecordConfig }> = ({ config }) => {
	const router = useRouter();
	const id = router.query.id as string | undefined;
	const hasPrivilege = useHasPrivilege();
	const canWrite = config.privileges.write.some((p) => hasPrivilege(p));
	const canDelete = config.privileges.delete.some((p) => hasPrivilege(p));

	const [category, setCategory] = useState<NameDescriptionRecord | null>(null);
	const [loading, setLoading] = useState(true);
	const [confirm, setConfirm] = useState<"toggle" | "delete" | null>(null);
	const [busy, setBusy] = useState(false);

	const load = useCallback(async () => {
		if (!id) return;
		try {
			setCategory(await config.api.get(id));
		} catch {
			setCategory(null);
		} finally {
			setLoading(false);
		}
	}, [id, config]);

	useEffect(() => {
		load();
	}, [load]);

	const toggle = async () => {
		if (!category) return;
		setBusy(true);
		try {
			await config.api.setActive(category.id, category.status !== "A");
			toast.success(`${config.label} ${category.status === "A" ? "deactivated" : "activated"}`);
			setConfirm(null);
			await load();
		} catch (e: any) {
			toast.error(e?.response?.data?.message || `Could not update the ${config.label.toLowerCase()}`);
		} finally {
			setBusy(false);
		}
	};

	const remove = async () => {
		if (!category) return;
		setBusy(true);
		try {
			await config.api.remove(category.id);
			toast.success(`${config.label} deleted`);
			router.push(config.listPath);
		} catch (e: any) {
			toast.error(e?.response?.data?.message || `Could not delete the ${config.label.toLowerCase()}`);
			setBusy(false);
		}
	};

	if (loading)
		return (
			<AdminLayout pageTitle={config.label}>
				<PageLoader fullScreen={false} message={`Loading ${config.label.toLowerCase()}...`} />
			</AdminLayout>
		);

	if (!category)
		return (
			<AdminLayout pageTitle={config.label}>
				<div className="border-border bg-card mx-auto max-w-3xl space-y-3 rounded-xl border p-8 text-center">
					<p className="text-sm font-semibold">{config.label} not found.</p>
					<Button variant="outline" size="sm" onClick={() => router.push(config.listPath)}>
						{config.listLabel}
					</Button>
				</div>
			</AdminLayout>
		);

	const active = category.status === "A";

	return (
		<AdminLayout pageTitle={category.name}>
			<div className="mx-auto w-full max-w-5xl space-y-6">
				<BackButton onClick={() => router.push(config.listPath)} label={config.listLabel} />

				<DetailHeader
					title={category.name}
					status={<Badge variant={active ? "success" : "neutral"} dot>{active ? "Active" : "Inactive"}</Badge>}
					metrics={recordDates(category).map((f) => ({ label: f.label, value: String(f.value) }))}
					actions={
						<>
							{canWrite && (
								<Button variant="outline" size="sm" className="gap-1.5" onClick={() => setConfirm("toggle")}>
									<Power className="size-3.5" />
									{active ? "Deactivate" : "Activate"}
								</Button>
							)}
							{canDelete && (
								<Button variant="destructive-outline" size="sm" className="gap-1.5" onClick={() => setConfirm("delete")}>
									<Trash2 className="size-3.5" />
									Delete
								</Button>
							)}
						</>
					}
				/>

				<EditableSection
					key={category.updatedAt}
					title={`${config.label} details`}
					icon={config.icon}
					canEdit={canWrite}
					defaultEditing={router.query.edit === "1"}
					facts={[...(config.extraFacts?.(category) ?? []), { label: "Description", wide: true, value: category.description ? <SanitizedHtml html={category.description} className="font-normal" /> : "" }]}
				>
					{(close) => <EditCard config={config} category={category} onCancel={close} onSaved={load} />}
				</EditableSection>
			</div>

			<RecordActivity type={config.entityType} id={category.id} />

			<Modal isOpen={confirm === "toggle"} onClose={() => setConfirm(null)} title={`${active ? "Deactivate" : "Activate"} ${config.label.toLowerCase()}`} size="sm">
				<div className="space-y-4">
					<p className="text-sm" style={{ color: "var(--text-secondary)" }}>
						{active ? "It stops being offered or assignable. Existing links are kept." : "It can be picked and assigned again."}
					</p>
					<div className="flex justify-end gap-2">
						<Button variant="outline" size="sm" onClick={() => setConfirm(null)}>
							Cancel
						</Button>
						<Button variant={active ? "destructive" : "default"} size="sm" onClick={toggle} disabled={busy}>
							{active ? "Deactivate" : "Activate"}
						</Button>
					</div>
				</div>
			</Modal>

			<Modal isOpen={confirm === "delete"} onClose={() => setConfirm(null)} title={`Delete ${config.label.toLowerCase()}`} size="sm">
				<div className="space-y-4">
					<p className="text-sm" style={{ color: "var(--text-secondary)" }}>
						Delete <span className="font-semibold">{category.name}</span>? This cannot be undone.
					</p>
					<div className="flex justify-end gap-2">
						<Button variant="outline" size="sm" onClick={() => setConfirm(null)}>
							Cancel
						</Button>
						<Button variant="destructive" size="sm" onClick={remove} disabled={busy}>
							Delete
						</Button>
					</div>
				</div>
			</Modal>
		</AdminLayout>
	);
};

