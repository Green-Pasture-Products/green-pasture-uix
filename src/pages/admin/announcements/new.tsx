import React, { useState } from "react";
import { useRouter } from "next/router";
import { Megaphone } from "lucide-react";
import toast from "react-hot-toast";

import withAdminAuth from "@/_components/withAdminAuth";
import AdminLayout from "@/_components/AdminLayout";
import { BackButton } from "@/_UI/DetailField";
import Button from "@/_UI/Button";
import RichTextEditor from "@/_UI/RichTextEditor";
import { DatePicker } from "@/components/egfm/date-picker";
import { richTextToPlain } from "@/components/egfm/rich-text";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/egfm/select";
import axiosInstance from "@/_utils/axiosInstance";
import type { AnnouncementAudience } from "@/types/live";

const AUDIENCE: Record<AnnouncementAudience, { label: string; hint: string }> = {
	ALL: { label: "Everyone", hint: "All customers, staff and visitors" },
	CUSTOMERS: { label: "Customers", hint: "Signed-in customers only" },
	STAFF: { label: "Staff", hint: "Admin users only" },
};

const field = "w-full rounded-lg border px-3 py-2 text-sm";
const fieldStyle = { borderColor: "var(--border-light)", background: "var(--surface-low)", color: "var(--text-primary)" } as const;
const label = "mb-1 block text-xs font-bold";

/** Publishing goes out immediately, so it takes a review step before it sends. */
const NewAnnouncement: React.FC = () => {
	const router = useRouter();
	const [title, setTitle] = useState("");
	const [message, setMessage] = useState("");
	const [audience, setAudience] = useState<AnnouncementAudience>("ALL");
	const [expiresAt, setExpiresAt] = useState("");
	const [review, setReview] = useState(false);
	const [busy, setBusy] = useState(false);

	const valid = title.trim().length > 0 && richTextToPlain(message).length > 0;

	const publish = async () => {
		setBusy(true);
		try {
			await axiosInstance.post("announcements", { title: title.trim(), message: message.trim(), audience, expiresAt: expiresAt || null });
			toast.success("Announcement published");
			router.push("/admin/announcements");
		} catch (e: any) {
			toast.error(e?.response?.data?.message || "Could not publish the announcement");
			setBusy(false);
		}
	};

	return (
		<AdminLayout pageTitle="New announcement">
			<div className="mx-auto w-full max-w-3xl space-y-6">
				<BackButton onClick={() => router.push("/admin/announcements")} label="Back to Announcements" />
				<h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
					New announcement
				</h1>

				{review ? (
					<div className="border-border bg-card space-y-4 rounded-xl border p-5">
						<p className="text-sm" style={{ color: "var(--text-secondary)" }}>
							<span className="font-semibold">&ldquo;{title.trim()}&rdquo;</span> goes out immediately to <span className="font-semibold">{AUDIENCE[audience].label.toLowerCase()}</span>: a banner appears and everyone connected gets it live.
						</p>
						<div className="flex justify-end gap-2">
							<Button variant="outlined" color="secondary" onClick={() => setReview(false)} disabled={busy}>
								Back
							</Button>
							<Button variant="filled" leftIcon={Megaphone} onClick={publish} loading={busy} disabled={busy}>
								Publish now
							</Button>
						</div>
					</div>
				) : (
					<form
						aria-label="New announcement"
						className="border-border bg-card space-y-4 rounded-xl border p-5"
						onSubmit={(e) => {
							e.preventDefault();
							if (valid) setReview(true);
						}}
					>
						<div>
							<label htmlFor="ann-title" className={label} style={{ color: "var(--text-secondary)" }}>
								Title <span style={{ color: "var(--text-hint)" }}>({title.length}/200)</span>
							</label>
							<input id="ann-title" maxLength={200} value={title} onChange={(e) => setTitle(e.target.value)} className={field} style={fieldStyle} required />
						</div>
						<div>
							<label className={label} style={{ color: "var(--text-secondary)" }}>
								Message
							</label>
							<RichTextEditor value={message} onChange={setMessage} placeholder="What do you want people to know?" minHeight={180} />
						</div>
						<div className="grid gap-4 sm:grid-cols-2">
							<div>
								<label htmlFor="ann-audience" className={label} style={{ color: "var(--text-secondary)" }}>
									Send to
								</label>
								<Select value={audience} onValueChange={(v) => setAudience(v as AnnouncementAudience)}>
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
									{AUDIENCE[audience].hint}
								</p>
							</div>
							<div>
								<label htmlFor="ann-expires" className={label} style={{ color: "var(--text-secondary)" }}>
									Auto-hide after <span style={{ color: "var(--text-hint)" }}>(optional)</span>
								</label>
								<DatePicker id="ann-expires" aria-label="Auto-hide after" includeTime minDate={new Date()} value={expiresAt || null} onChange={(d) => setExpiresAt(d ? d.toISOString() : "")} placeholder="Never" />
							</div>
						</div>
						<div className="flex justify-end gap-2">
							<Button type="button" variant="outlined" color="secondary" onClick={() => router.push("/admin/announcements")}>
								Cancel
							</Button>
							<Button type="submit" variant="filled" disabled={!valid}>
								Review &amp; publish
							</Button>
						</div>
					</form>
				)}
			</div>
		</AdminLayout>
	);
};

export default withAdminAuth(NewAnnouncement);
