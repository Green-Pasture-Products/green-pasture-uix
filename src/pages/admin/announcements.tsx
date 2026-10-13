import { useRouter } from "next/router";
import React, { useCallback, useEffect, useState } from "react";
import { Megaphone, Plus } from "lucide-react";
import toast from "react-hot-toast";
import type { ColumnDef } from "@tanstack/react-table";

import withAdminAuth from "@/_components/withAdminAuth";
import AdminLayout from "@/_components/AdminLayout";
import { DataTable } from "@/_components/DataTable";
import ActionMenu from "@/_UI/ActionMenu";
import Badge from "@/_UI/Badge";
import Button from "@/_UI/Button";
import Modal from "@/_UI/Modal";
import { DatePicker } from "@/components/egfm/date-picker";
import RichTextEditor from "@/_UI/RichTextEditor";
import { richTextToPlain } from "@/components/egfm/rich-text";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/egfm/select";
import axiosInstance from "@/_utils/axiosInstance";
import { useListParams } from "@/_hooks/useListParams";
import type { Announcement, AnnouncementAudience, PageMeta } from "@/types/live";

const AUDIENCE: Record<AnnouncementAudience, { label: string; hint: string }> = {
	ALL: { label: "Everyone", hint: "All customers, staff and visitors" },
	CUSTOMERS: { label: "Customers", hint: "Signed-in customers only" },
	STAFF: { label: "Staff", hint: "Admin users only" },
};

interface FormState {
	title: string;
	message: string;
	audience: AnnouncementAudience;
	expiresAt: string;
}
const EMPTY: FormState = { title: "", message: "", audience: "ALL", expiresAt: "" };

const AdminAnnouncements: React.FC = () => {
	const router = useRouter();
	const { page, pageSize, search, setPage, setSearch, setPageSize } = useListParams();
	const [rows, setRows] = useState<Announcement[]>([]);
	const [meta, setMeta] = useState<PageMeta | null>(null);
	const [loading, setLoading] = useState(true);

	const [editing, setEditing] = useState<Announcement | "new" | null>(null);
	const [form, setForm] = useState<FormState>(EMPTY);
	const [confirmPublish, setConfirmPublish] = useState(false);
	const [toggleTarget, setToggleTarget] = useState<Announcement | null>(null);
	const [deleteTarget, setDeleteTarget] = useState<Announcement | null>(null);
	const [busy, setBusy] = useState(false);

	const load = useCallback(async () => {
		setLoading(true);
		try {
			const res = await axiosInstance.get("announcements", { params: { page, limit: pageSize, q: search || undefined } });
			setRows(res.data?.data?.items ?? []);
			setMeta(res.data?.data?.meta ?? null);
		} catch {
			toast.error("Could not load announcements");
		} finally {
			setLoading(false);
		}
	}, [page, pageSize, search]);

	useEffect(() => {
		load();
	}, [load]);

	const openForm = (a: Announcement | "new") => {
		setEditing(a);
		setConfirmPublish(false);
		setForm(a === "new" ? EMPTY : { title: a.title, message: a.message, audience: a.audience, expiresAt: a.expiresAt ?? "" });
	};
	const closeForm = () => {
		setEditing(null);
		setConfirmPublish(false);
	};

	const valid = form.title.trim().length > 0 && richTextToPlain(form.message).length > 0;

	const save = async () => {
		setBusy(true);
		try {
			const body = { title: form.title.trim(), message: form.message.trim(), audience: form.audience, expiresAt: form.expiresAt || null };
			if (editing === "new") {
				await axiosInstance.post("announcements", body);
				toast.success("Announcement published");
			} else if (editing) {
				await axiosInstance.put(`announcements/${editing.id}`, body);
				toast.success("Announcement updated");
			}
			closeForm();
			load();
		} catch (e: any) {
			toast.error(e?.response?.data?.message || "Could not save the announcement");
		} finally {
			setBusy(false);
		}
	};

	const toggle = async () => {
		if (!toggleTarget) return;
		setBusy(true);
		try {
			await axiosInstance.put(`announcements/${toggleTarget.id}`, { isActive: !toggleTarget.isActive });
			toast.success(toggleTarget.isActive ? "Announcement deactivated" : "Announcement reactivated and sent");
			setToggleTarget(null);
			load();
		} catch (e: any) {
			toast.error(e?.response?.data?.message || "Could not update the announcement");
		} finally {
			setBusy(false);
		}
	};

	const remove = async () => {
		if (!deleteTarget) return;
		setBusy(true);
		try {
			await axiosInstance.delete(`announcements/${deleteTarget.id}`);
			toast.success("Announcement deleted");
			setDeleteTarget(null);
			load();
		} catch (e: any) {
			toast.error(e?.response?.data?.message || "Could not delete the announcement");
		} finally {
			setBusy(false);
		}
	};

	const columns: ColumnDef<Announcement, any>[] = [
		{
			accessorKey: "title",
			header: "Announcement",
			meta: { maxWidth: "360px" },
			cell: ({ row }) => (
				<div className="min-w-0">
					<p className="truncate text-sm font-medium" style={{ color: "var(--text-primary)" }}>
						{row.original.title}
					</p>
					<p className="line-clamp-1 text-xs" style={{ color: "var(--text-hint)" }}>
						{richTextToPlain(row.original.message)}
					</p>
				</div>
			),
		},
		{
			accessorKey: "audience",
			header: "Audience",
			meta: { width: "120px" },
			cell: ({ row }) => <Badge variant="info">{AUDIENCE[row.original.audience]?.label ?? row.original.audience}</Badge>,
		},
		{
			accessorKey: "isActive",
			header: "Status",
			meta: { width: "130px" },
			cell: ({ row }) => {
				const a = row.original;
				const expired = a.expiresAt && new Date(a.expiresAt) < new Date();
				return expired ? <Badge variant="neutral">Expired</Badge> : a.isActive ? <Badge variant="success" dot>Live</Badge> : <Badge variant="neutral">Inactive</Badge>;
			},
		},
		{
			accessorKey: "createdByName",
			header: "Published by",
			meta: { width: "150px" },
			cell: ({ row }) => <span className="text-sm">{row.original.createdByName ?? "—"}</span>,
		},
		{
			accessorKey: "createdAt",
			header: "Published",
			meta: { width: "140px" },
			cell: ({ row }) => <span className="text-xs">{new Date(row.original.createdAt).toLocaleString()}</span>,
		},
		{
			id: "actions",
			header: "Action",
			enableSorting: false,
			enableHiding: false,
			meta: { width: "50px", align: "center" },
			cell: ({ row }) => (
				<div onClick={(e) => e.stopPropagation()}>
				<ActionMenu
					items={[
						{ label: "View", onClick: () => router.push(`/admin/announcement/${row.original.id}`) },
						{ label: "Edit", onClick: () => router.push(`/admin/announcement/${row.original.id}?edit=1`) },
						{ label: row.original.isActive ? "Deactivate" : "Activate", onClick: () => setToggleTarget(row.original) },
						{ label: "Delete", onClick: () => setDeleteTarget(row.original), variant: "danger" as const },
					]}
				/>
				</div>
			),
		},
	];

	const field = "w-full rounded-lg border px-3 py-2 text-sm";
	const fieldStyle = { borderColor: "var(--border-light)", background: "var(--surface-low)", color: "var(--text-primary)" } as const;

	return (
		<AdminLayout>
			<div className="animate-page-enter space-y-6">
				<DataTable
					columns={columns}
					data={rows}
					isLoading={loading}
					onRefresh={load}
					refreshing={loading}
					manualFiltering
					onRowClick={(row) => router.push(`/admin/announcement/${row.id}`)}
					showAuditColumns={false}
					globalFilter={search}
					onGlobalFilterChange={setSearch}
					searchPlaceholder="Search title or message..."
					pageIndex={page - 1}
					pageSize={pageSize}
					pageCount={meta?.totalPages ?? 1}
					totalItems={meta?.total}
					onPageChange={(idx) => setPage(idx + 1)}
					onPageSizeChange={setPageSize}
					emptyMessage="No announcements yet"
					toolbar={
						<Button variant="filled" leftIcon={Plus} onClick={() => openForm("new")}>
							New announcement
						</Button>
					}
				/>

				<Modal isOpen={!!editing} onClose={closeForm} title={editing === "new" ? "New announcement" : "Edit announcement"} size="lg">
					{confirmPublish ? (
						<div className="space-y-4">
							<p className="text-sm" style={{ color: "var(--text-secondary)" }}>
								<span className="font-semibold">&ldquo;{form.title.trim()}&rdquo;</span> goes out immediately to <span className="font-semibold">{AUDIENCE[form.audience].label.toLowerCase()}</span>: a banner appears and
								everyone connected gets it live.
							</p>
							<div className="flex justify-end gap-2">
								<Button variant="outlined" color="secondary" onClick={() => setConfirmPublish(false)} disabled={busy}>
									Back
								</Button>
								<Button variant="filled" leftIcon={Megaphone} onClick={save} loading={busy} disabled={busy}>
									Publish now
								</Button>
							</div>
						</div>
					) : (
						<form
							className="space-y-4"
							onSubmit={(e) => {
								e.preventDefault();
								if (!valid) return;
								editing === "new" ? setConfirmPublish(true) : save();
							}}
						>
							<div>
								<label htmlFor="ann-title" className="mb-1 block text-xs font-bold" style={{ color: "var(--text-secondary)" }}>
									Title <span style={{ color: "var(--text-hint)" }}>({form.title.length}/200)</span>
								</label>
								<input id="ann-title" maxLength={200} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={field} style={fieldStyle} required />
							</div>
							<div>
								<label htmlFor="ann-message" className="mb-1 block text-xs font-bold" style={{ color: "var(--text-secondary)" }}>
									Message
								</label>
								<RichTextEditor value={form.message} onChange={(html) => setForm({ ...form, message: html })} placeholder="What do you want people to know?" minHeight={140} />
							</div>
							<div className="grid gap-4 sm:grid-cols-2">
								<div>
									<label htmlFor="ann-audience" className="mb-1 block text-xs font-bold" style={{ color: "var(--text-secondary)" }}>
										Send to
									</label>
									<Select value={form.audience} onValueChange={(v) => setForm({ ...form, audience: v as AnnouncementAudience })}>
										<SelectTrigger id="ann-audience" aria-label="Send to">
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											{(Object.keys(AUDIENCE) as AnnouncementAudience[]).map((k) => (
												<SelectItem key={k} value={k}>
													{AUDIENCE[k].label}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									<p className="mt-1 text-[0.7rem]" style={{ color: "var(--text-hint)" }}>
										{AUDIENCE[form.audience].hint}
									</p>
								</div>
								<div>
									<label htmlFor="ann-expires" className="mb-1 block text-xs font-bold" style={{ color: "var(--text-secondary)" }}>
										Auto-hide after <span style={{ color: "var(--text-hint)" }}>(optional)</span>
									</label>
									<DatePicker id="ann-expires" aria-label="Auto-hide after" includeTime minDate={new Date()} value={form.expiresAt || null} onChange={(d) => setForm({ ...form, expiresAt: d ? d.toISOString() : "" })} placeholder="Never" />
								</div>
							</div>
							<div className="flex justify-end gap-2">
								<Button type="button" variant="outlined" color="secondary" onClick={closeForm}>
									Cancel
								</Button>
								<Button type="submit" variant="filled" disabled={!valid || busy} loading={busy}>
									{editing === "new" ? "Review & publish" : "Save changes"}
								</Button>
							</div>
						</form>
					)}
				</Modal>

				<Modal isOpen={!!toggleTarget} onClose={() => setToggleTarget(null)} title={`${toggleTarget?.isActive ? "Deactivate" : "Activate"} announcement`} size="sm">
					<div className="space-y-4">
						<p className="text-sm" style={{ color: "var(--text-secondary)" }}>
							{toggleTarget?.isActive ? "It stops showing as a banner immediately. Notifications already sent stay in people's inboxes." : "It shows as a banner again and is sent to the audience as a new notification."}
						</p>
						<div className="flex justify-end gap-2">
							<Button variant="outlined" color="secondary" onClick={() => setToggleTarget(null)}>
								Cancel
							</Button>
							<Button variant="filled" color={toggleTarget?.isActive ? "error" : "primary"} onClick={toggle} loading={busy} disabled={busy}>
								{toggleTarget?.isActive ? "Deactivate" : "Activate"}
							</Button>
						</div>
					</div>
				</Modal>

				<Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete announcement" size="sm">
					<div className="space-y-4">
						<p className="text-sm" style={{ color: "var(--text-secondary)" }}>
							Delete <span className="font-semibold">{deleteTarget?.title}</span>? It disappears from every banner.
						</p>
						<div className="flex justify-end gap-2">
							<Button variant="outlined" color="secondary" onClick={() => setDeleteTarget(null)}>
								Cancel
							</Button>
							<Button variant="filled" color="error" onClick={remove} loading={busy} disabled={busy}>
								Delete
							</Button>
						</div>
					</div>
				</Modal>
			</div>
		</AdminLayout>
	);
};

export default withAdminAuth(AdminAnnouncements);
