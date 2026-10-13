import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Controller, useForm } from "react-hook-form";
import { Megaphone, Power, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

import withAdminAuth from "@/_components/withAdminAuth";
import AdminLayout from "@/_components/AdminLayout";
import RecordActivity from "@/_components/RecordActivity";
import { BackButton, DetailHeader, EditableSection, recordDates } from "@/_UI/DetailField";
import Badge from "@/_UI/Badge";
import Modal from "@/_UI/Modal";
import PageLoader from "@/_UI/PageLoader";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/egfm/date-picker";
import RichTextEditor from "@/_UI/RichTextEditor";
import { SanitizedHtml, richTextToPlain } from "@/components/egfm/rich-text";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/egfm/select";
import axiosInstance from "@/_utils/axiosInstance";
import type { Announcement, AnnouncementAudience } from "@/types/live";

const AUDIENCE: Record<AnnouncementAudience, string> = { ALL: "Everyone", CUSTOMERS: "Customers", STAFF: "Staff" };
const when = (iso: string | null) => (iso ? new Date(iso).toLocaleString() : "Never");

interface FormValues {
	title: string;
	message: string;
	audience: AnnouncementAudience;
	expiresAt: string | null;
}

function EditCard({ a, onCancel, onSaved }: { a: Announcement; onCancel: () => void; onSaved: () => void }) {
	const {
		register,
		control,
		handleSubmit,
		watch,
		formState: { isDirty, isSubmitting },
	} = useForm<FormValues>({ defaultValues: { title: a.title, message: a.message, audience: a.audience, expiresAt: a.expiresAt } });
	const valid = watch("title").trim().length > 0 && richTextToPlain(watch("message")).length > 0;

	const save = handleSubmit(async (v) => {
		try {
			await axiosInstance.put(`announcements/${a.id}`, { title: v.title.trim(), message: v.message.trim(), audience: v.audience, expiresAt: v.expiresAt || null });
			toast.success("Announcement saved");
			onSaved();
		} catch (e: any) {
			toast.error(e?.response?.data?.message || "Failed to save the announcement");
		}
	});

	const field = "w-full rounded-lg border px-3 py-2 text-sm";
	const style = { borderColor: "var(--border-light)", background: "var(--surface-low)", color: "var(--text-primary)" } as const;
	return (
		<form onSubmit={save} className="border-border bg-card overflow-hidden rounded-xl border" aria-label="Edit announcement">
			<div className="space-y-4 p-5">
				<div>
					<label htmlFor="ann-title" className="mb-1 block text-xs font-bold" style={{ color: "var(--text-secondary)" }}>
						Title
					</label>
					<input id="ann-title" maxLength={200} className={field} style={style} {...register("title")} />
				</div>
				<div>
					<label htmlFor="ann-message" className="mb-1 block text-xs font-bold" style={{ color: "var(--text-secondary)" }}>
						Message
					</label>
					<Controller name="message" control={control} render={({ field: f }) => <RichTextEditor value={f.value} onChange={f.onChange} placeholder="What do you want people to know?" minHeight={140} />} />
				</div>
				<div className="grid gap-4 sm:grid-cols-2">
					<div>
						<label className="mb-1 block text-xs font-bold" style={{ color: "var(--text-secondary)" }}>
							Send to
						</label>
						<Controller
							name="audience"
							control={control}
							render={({ field: f }) => (
								<Select value={f.value} onValueChange={f.onChange}>
									<SelectTrigger aria-label="Send to">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										{(Object.keys(AUDIENCE) as AnnouncementAudience[]).map((k) => (
											<SelectItem key={k} value={k}>
												{AUDIENCE[k]}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							)}
						/>
					</div>
					<div>
						<label className="mb-1 block text-xs font-bold" style={{ color: "var(--text-secondary)" }}>
							Auto-hide after
						</label>
						<Controller name="expiresAt" control={control} render={({ field: f }) => <DatePicker aria-label="Auto-hide after" includeTime value={f.value} onChange={(d) => f.onChange(d ? d.toISOString() : null)} placeholder="Never" />} />
					</div>
				</div>
			</div>
			<div className="border-border bg-secondary/15 flex justify-end gap-2 border-t px-5 py-3">
				<Button type="button" variant="outline" size="sm" onClick={onCancel}>
					Cancel
				</Button>
				<Button type="submit" size="sm" disabled={!isDirty || !valid || isSubmitting}>
					{isSubmitting ? "Saving…" : "Save changes"}
				</Button>
			</div>
		</form>
	);
}

const AnnouncementDetail: React.FC = () => {
	const router = useRouter();
	const id = router.query.id as string | undefined;
	const [a, setA] = useState<Announcement | null>(null);
	const [loading, setLoading] = useState(true);
	const [confirm, setConfirm] = useState<"toggle" | "delete" | null>(null);
	const [busy, setBusy] = useState(false);

	const load = useCallback(async () => {
		if (!id) return;
		try {
			setA((await axiosInstance.get(`announcements/${id}`)).data?.data ?? null);
		} catch {
			setA(null);
		} finally {
			setLoading(false);
		}
	}, [id]);
	useEffect(() => {
		load();
	}, [load]);

	const toggle = async () => {
		if (!a) return;
		setBusy(true);
		try {
			await axiosInstance.put(`announcements/${a.id}`, { isActive: !a.isActive });
			toast.success(a.isActive ? "Announcement deactivated" : "Announcement reactivated and sent");
			setConfirm(null);
			await load();
		} catch (e: any) {
			toast.error(e?.response?.data?.message || "Could not update the announcement");
		} finally {
			setBusy(false);
		}
	};
	const remove = async () => {
		if (!a) return;
		setBusy(true);
		try {
			await axiosInstance.delete(`announcements/${a.id}`);
			toast.success("Announcement deleted");
			router.push("/admin/announcements");
		} catch (e: any) {
			toast.error(e?.response?.data?.message || "Could not delete the announcement");
			setBusy(false);
		}
	};

	if (loading)
		return (
			<AdminLayout pageTitle="Announcement">
				<PageLoader fullScreen={false} message="Loading announcement..." />
			</AdminLayout>
		);
	if (!a)
		return (
			<AdminLayout pageTitle="Announcement">
				<div className="border-border bg-card mx-auto max-w-3xl space-y-3 rounded-xl border p-8 text-center">
					<p className="text-sm font-semibold">Announcement not found.</p>
					<Button variant="outline" size="sm" onClick={() => router.push("/admin/announcements")}>
						Back to Announcements
					</Button>
				</div>
			</AdminLayout>
		);

	const expired = !!a.expiresAt && new Date(a.expiresAt) < new Date();

	return (
		<AdminLayout pageTitle={a.title}>
			<div className="mx-auto w-full max-w-5xl space-y-6">
				<BackButton onClick={() => router.push("/admin/announcements")} label="Back to Announcements" />
				<DetailHeader
					title={a.title}
					status={expired ? <Badge variant="neutral">Expired</Badge> : a.isActive ? <Badge variant="success" dot>Live</Badge> : <Badge variant="neutral">Inactive</Badge>}
					metrics={[{ label: "Audience", value: AUDIENCE[a.audience] ?? a.audience }, ...recordDates({ createdAt: a.createdAt, createdBy: a.createdByName }).slice(0, 2).map((f) => ({ label: f.label === "Added" ? "Published" : "Published by", value: String(f.value) }))]}
					actions={
						<>
							<Button variant="outline" size="sm" className="gap-1.5" onClick={() => setConfirm("toggle")}>
								<Power className="size-3.5" />
								{a.isActive ? "Deactivate" : "Activate"}
							</Button>
							<Button variant="destructive-outline" size="sm" className="gap-1.5" onClick={() => setConfirm("delete")}>
								<Trash2 className="size-3.5" />
								Delete
							</Button>
						</>
					}
				/>

				<EditableSection
					key={`${a.id}-${a.isActive}-${a.title}-${a.message}-${a.audience}-${a.expiresAt}`}
					title="Announcement"
					icon={Megaphone}
					canEdit
					defaultEditing={router.query.edit === "1"}
					facts={[
						{ label: "Title", value: a.title },
						{ label: "Message", wide: true, value: <SanitizedHtml html={a.message} className="font-normal" /> },
						{ label: "Send to", value: AUDIENCE[a.audience] ?? a.audience },
						{ label: "Auto-hides", value: when(a.expiresAt) },
					]}
				>
					{(close) => <EditCard a={a} onCancel={close} onSaved={load} />}
				</EditableSection>
			</div>

			<RecordActivity type="Announcement" id={a.id} />

			<Modal isOpen={confirm === "toggle"} onClose={() => setConfirm(null)} title={`${a.isActive ? "Deactivate" : "Activate"} announcement`} size="sm">
				<div className="space-y-4">
					<p className="text-sm" style={{ color: "var(--text-secondary)" }}>
						{a.isActive ? "It stops showing as a banner immediately. Notifications already sent stay in inboxes." : "It shows as a banner again and is sent to the audience as a new notification."}
					</p>
					<div className="flex justify-end gap-2">
						<Button variant="outline" size="sm" onClick={() => setConfirm(null)}>
							Cancel
						</Button>
						<Button variant={a.isActive ? "destructive" : "default"} size="sm" onClick={toggle} disabled={busy}>
							{a.isActive ? "Deactivate" : "Activate"}
						</Button>
					</div>
				</div>
			</Modal>
			<Modal isOpen={confirm === "delete"} onClose={() => setConfirm(null)} title="Delete announcement" size="sm">
				<div className="space-y-4">
					<p className="text-sm" style={{ color: "var(--text-secondary)" }}>
						Delete <span className="font-semibold">{a.title}</span>? It disappears from every banner.
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

export default withAdminAuth(AnnouncementDetail);
