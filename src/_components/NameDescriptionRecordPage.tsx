import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Power, Trash2, Info, type LucideIcon } from "lucide-react";
import toast from "react-hot-toast";

import AdminLayout from "@/_components/AdminLayout";
import RecordActivity from "@/_components/RecordActivity";
import { BackButton, DetailHeader, DetailSection, EditableSection, recordDates } from "@/_UI/DetailField";
import { SettingsSaveBar } from "@/_components/SettingsParts";
import { slugify } from "@/_utils/slugify";
import { htmlToText } from "@/_utils/htmlToText";
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
		create: (v: { name: string; description: string }) => Promise<void>;
		update: (id: string, v: { name: string; description: string }) => Promise<void>;
		setActive: (id: string, active: boolean) => Promise<void>;
		remove: (id: string) => Promise<void>;
	};
	/** Extra read-only facts (e.g. a tag's slug). */
	extraFacts?: (r: NameDescriptionRecord) => { label: string; value: React.ReactNode }[];
	/** How the record shows up in the shop: a pill (tags) or a tile (categories). */
	appearsAs?: "chip" | "tile";
	/** The record has a URL slug derived from its name (tags). */
	slugged?: boolean;
	/** One line under the page title when creating. */
	createHint?: string;
}

const schema = z.object({ name: z.string().trim().min(1, "Name is required"), description: z.string().optional() });
type FormValues = z.infer<typeof schema>;

/** What the record looks like to shoppers, live as you type. */
function Appearance({ config, name, description, slug }: { config: RecordConfig; name: string; description?: string | null; slug?: string }) {
	const Icon = config.icon;
	const shown = name.trim() || `${config.label} name`;
	const about = htmlToText(description);
	return (
		<div className="space-y-4 py-4">
			{config.appearsAs === "chip" ? (
				<div className="flex flex-wrap gap-2" aria-hidden>
					<span className="inline-flex max-w-full items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium" style={{ borderColor: "var(--border-light)", background: "var(--surface-paper)", color: "var(--text-primary)" }}>
						<Icon className="size-3.5 shrink-0" style={{ color: "var(--color-primary)" }} />
						<span className="truncate">{shown}</span>
					</span>
					<span className="inline-flex max-w-full items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium" style={{ borderColor: "var(--color-primary)", background: "rgba(22,163,74,0.08)", color: "var(--color-primary)" }}>
						<Icon className="size-3.5 shrink-0" />
						<span className="truncate">{shown}</span>
					</span>
				</div>
			) : (
				<div className="flex items-start gap-3 rounded-xl border p-3" style={{ borderColor: "var(--border-light)", background: "var(--surface-paper)" }} aria-hidden>
					<span className="bg-brand/15 text-brand-ink flex size-10 shrink-0 items-center justify-center rounded-xl">
						<Icon className="size-5" />
					</span>
					<div className="min-w-0">
						<p className="truncate text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
							{shown}
						</p>
						{about && (
							<p className="line-clamp-2 text-xs" style={{ color: "var(--text-hint)" }}>
								{about}
							</p>
						)}
					</div>
				</div>
			)}
			<p className="text-xs" style={{ color: "var(--text-hint)" }}>
				{config.appearsAs === "chip" ? "Idle, then selected: how it looks in the shop's filters and on a product." : "How it appears in the shop's category list."}
			</p>
			{config.slugged && (
				<div>
					<p className="mb-1 text-xs font-medium" style={{ color: "var(--text-hint)" }}>
						Web address name
					</p>
					<code className="block truncate rounded-lg px-2.5 py-1.5 text-xs" style={{ background: "var(--surface-medium)", color: "var(--text-primary)" }} title={slug}>
						{slug || "—"}
					</code>
				</div>
			)}
		</div>
	);
}

/**
 * The name + description form. On its own page (`layout="page"`) it sits beside a live preview; inside a record page
 * (`layout="inline"`) the preview is already on screen, so it is just the fields.
 */
function RecordForm({ config, category, layout, onCancel, onSaved }: { config: RecordConfig; category?: NameDescriptionRecord; layout: "page" | "inline"; onCancel: () => void; onSaved: () => void }) {
	const {
		register,
		control,
		handleSubmit,
		watch,
		formState: { errors, isDirty, isSubmitting },
	} = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { name: category?.name ?? "", description: category?.description ?? "" } });
	const name = watch("name") ?? "";
	const description = watch("description");

	const save = handleSubmit(async (values) => {
		try {
			const body = { name: values.name.trim(), description: values.description ?? "" };
			if (category) await config.api.update(category.id, body);
			else await config.api.create(body);
			toast.success(category ? `${config.label} saved` : `${config.label} created`);
			onSaved();
		} catch (e: any) {
			toast.error(e?.response?.data?.message || `Failed to save ${config.label.toLowerCase()}`);
		}
	});

	const fields = (
		<DetailSection title={`${config.label} details`} icon={config.icon}>
			<div className="space-y-5 py-4">
				<div>
					<FormInput label="Name" required maxLength={100} error={errors.name?.message} {...register("name")} />
					<p className="mt-1 text-right text-[11px] tabular-nums" style={{ color: "var(--text-hint)" }}>
						{name.length}/100
					</p>
				</div>
				<div>
					<label className="mb-1.5 block text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>
						Description
					</label>
					<Controller name="description" control={control} render={({ field }) => <RichTextEditor value={field.value ?? ""} onChange={field.onChange} placeholder={`Brief description of this ${config.label.toLowerCase()}`} minHeight={160} />} />
				</div>
			</div>
		</DetailSection>
	);

	const bar = (
		<SettingsSaveBar
			hint={category ? (isDirty ? "You have unsaved changes." : "No changes yet.") : `It is available in the shop as soon as you create it.`}
			resetLabel="Cancel"
			onReset={onCancel}
			submitLabel={category ? "Save changes" : `Create ${config.label.toLowerCase()}`}
			saving={isSubmitting}
			submitDisabled={category ? !isDirty : false}
		/>
	);

	return (
		<form onSubmit={save} className="@container space-y-5" aria-label={`${category ? "Edit" : "New"} ${config.label.toLowerCase()}`}>
			{layout === "page" ? (
				<div className="grid grid-cols-1 gap-5 @3xl:grid-cols-[minmax(0,1fr)_340px] @3xl:items-start">
					{fields}
					<div className="space-y-5">
						<DetailSection title="Preview" description="Updates as you type.">
							<Appearance config={config} name={name} description={description} slug={slugify(name)} />
						</DetailSection>
						{config.slugged && (
							<p className="flex items-start gap-2 text-xs" style={{ color: "var(--text-hint)" }}>
								<Info className="mt-0.5 size-3.5 shrink-0" />
								<span>The web address name is made from the name, so renaming the {config.label.toLowerCase()} later keeps links working.</span>
							</p>
						)}
					</div>
				</div>
			) : (
				fields
			)}
			{bar}
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
			<div className="@container animate-page-enter mx-auto w-full max-w-6xl space-y-5">
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

				<div className="grid grid-cols-1 gap-5 @2xl:grid-cols-[minmax(0,1fr)_340px] @2xl:items-start">
					<div className="min-w-0">
						<EditableSection
							key={category.updatedAt}
							title={`${config.label} details`}
							icon={config.icon}
							canEdit={canWrite}
							defaultEditing={router.query.edit === "1"}
							facts={[{ label: "Description", wide: true, value: category.description ? <SanitizedHtml html={category.description} className="text-sm font-normal" /> : "" }]}
						>
							{(close) => <RecordForm config={config} category={category} layout="inline" onCancel={close} onSaved={load} />}
						</EditableSection>
					</div>
					<DetailSection title="How it appears" description={active ? "As shoppers see it." : "Inactive: shoppers do not see it."}>
						<Appearance config={config} name={category.name} description={category.description} slug={(category as any).slug ?? slugify(category.name)} />
					</DetailSection>
				</div>
			</div>

			<RecordActivity type={config.entityType} id={category.id} created={{ at: (category as any).createdAt, by: (category as any).createdBy }} />

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


/** The "new" page for a name + description record: the form beside a live preview. */
export const NameDescriptionCreatePage: React.FC<{ config: RecordConfig }> = ({ config }) => {
	const router = useRouter();
	const Icon = config.icon;
	return (
		<AdminLayout pageTitle={`New ${config.label.toLowerCase()}`}>
			<div className="animate-page-enter mx-auto w-full max-w-6xl space-y-5">
				<BackButton onClick={() => router.push(config.listPath)} label={config.listLabel} />
				<div className="flex items-center gap-3">
					<span className="bg-brand/15 text-brand-ink flex size-11 shrink-0 items-center justify-center rounded-xl">
						<Icon className="size-5" />
					</span>
					<div className="min-w-0">
						<h1 className="truncate text-xl font-semibold" style={{ color: "var(--text-primary)" }}>
							New {config.label.toLowerCase()}
						</h1>
						{config.createHint && (
							<p className="text-sm" style={{ color: "var(--text-hint)" }}>
								{config.createHint}
							</p>
						)}
					</div>
				</div>
				<RecordForm config={config} layout="page" onCancel={() => router.push(config.listPath)} onSaved={() => router.push(config.listPath)} />
			</div>
		</AdminLayout>
	);
};
