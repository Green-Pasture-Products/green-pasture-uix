import React, { useEffect, useState } from "react";
import { Star, X } from "lucide-react";
import toast from "react-hot-toast";
import { uuidv7 } from "uuidv7";

import { SelectField } from "@/_UI/SelectField";
import { FormInput } from "@/_UI/FormField";
import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppSelector } from "@/_redux/store";
import { reviewAction } from "@/_redux/actions/review.action";
import { adminAction } from "@/_redux/actions/admin.action";
import axiosInstance from "@/_utils/axiosInstance";
import type { BackendReview } from "@/types";

const label = "mb-1 block text-xs font-semibold";

/** Create or edit an admin testimonial. Shared by the "new" page and the record page's in-place edit. */
export const TestimonialForm: React.FC<{ review?: BackendReview; onCancel: () => void; onSaved: () => void }> = ({ review, onCancel, onSaved }) => {
	const dispatch = useAppDispatch();
	const { adminItems } = useAppSelector((s) => s.admin);
	const [itemId, setItemId] = useState(review?.item?.id ?? "");
	const [reviewerName, setReviewerName] = useState(review?.reviewerName ?? "");
	const [rating, setRating] = useState(review?.rating ?? 5);
	const [comment, setComment] = useState(review?.comment ?? "");
	const [image, setImage] = useState<File | null>(null);
	const [preview, setPreview] = useState<string | null>(review?.imageUrl ?? null);
	const [saving, setSaving] = useState(false);

	useEffect(() => {
		if (!adminItems?.length) dispatch(adminAction.fetchAdminItemsAsync({ page: 1, limit: 1000 }));
	}, [dispatch, adminItems?.length]);

	const pick = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;
		setImage(file);
		const reader = new FileReader();
		reader.onload = (ev) => setPreview(ev.target?.result as string);
		reader.readAsDataURL(file);
	};

	const submit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!comment.trim()) return void toast.error("Review comment is required");
		if (!itemId) return void toast.error("Please select a product");
		if (!review && !image) return void toast.error("Please upload an image file");

		setSaving(true);
		try {
			if (review) {
				await dispatch(reviewAction.updateTestimonialAsync({ reviewId: review.id, rating, comment, reviewerName, itemId, image: image ?? undefined })).unwrap();
				toast.success("Testimonial saved");
			} else {
				const form = new FormData();
				form.append("rating", String(rating));
				form.append("comment", comment);
				form.append("reviewerName", reviewerName);
				form.append("itemId", itemId);
				form.append("image", image!);
				await axiosInstance.post("reviews/testimonials", form, { headers: { "Content-Type": "multipart/form-data", "Idempotency-Key": uuidv7() } });
				toast.success("Testimonial created");
			}
			onSaved();
		} catch (error: any) {
			toast.error(typeof error === "string" ? error : error?.response?.data?.message || "Could not save the testimonial");
			setSaving(false);
		}
	};

	return (
		<form onSubmit={submit} aria-label={review ? "Edit testimonial" : "New testimonial"} className="border-border bg-card overflow-hidden rounded-xl border">
			<div className="space-y-4 p-5">
				<div>
					<label className={label} style={{ color: "var(--text-secondary)" }}>
						Product <span aria-hidden>*</span>
					</label>
					<SelectField value={itemId} onValueChange={setItemId} placeholder="Select a product" aria-label="Product" className="w-full" options={(adminItems ?? []).map((i) => ({ value: String(i.id), label: i.name }))} />
				</div>
				<FormInput label="Reviewer name" placeholder="e.g. Sarah M." value={reviewerName} onChange={(e: any) => setReviewerName(e.target.value)} />
				<div>
					<label className={label} style={{ color: "var(--text-secondary)" }}>
						Rating <span aria-hidden>*</span>
					</label>
					<div className="flex gap-1">
						{[1, 2, 3, 4, 5].map((n) => (
							<button key={n} type="button" aria-label={`${n} star${n > 1 ? "s" : ""}`} onClick={() => setRating(n)} className={`rounded-lg p-1.5 ${rating >= n ? "text-yellow-400" : "text-muted-foreground/40"}`}>
								<Star size={22} fill={rating >= n ? "currentColor" : "none"} />
							</button>
						))}
					</div>
				</div>
				<div>
					<label className={label} style={{ color: "var(--text-secondary)" }}>
						Comment <span aria-hidden>*</span>
					</label>
					<textarea
						value={comment}
						onChange={(e) => setComment(e.target.value)}
						placeholder="What did the customer say?"
						rows={4}
						className="w-full resize-none rounded-lg border px-3 py-2 text-sm"
						style={{ borderColor: "var(--border-light)", background: "var(--surface-low)", color: "var(--text-primary)" }}
					/>
				</div>
				<div>
					<label className={label} style={{ color: "var(--text-secondary)" }}>
						Image {review ? "" : <span aria-hidden>*</span>}
					</label>
					<input type="file" accept="image/*" onChange={pick} className="w-full rounded-lg border px-3 py-2 text-sm" style={{ borderColor: "var(--border-light)" }} />
					{preview && (
						<div className="relative mt-2 inline-block">
							<img src={preview} alt="Preview" className="h-24 w-24 rounded-lg object-cover" />
							{image && (
								<button type="button" aria-label="Remove new image" onClick={() => { setImage(null); setPreview(review?.imageUrl ?? null); }} className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1">
									<X size={12} className="text-white" />
								</button>
							)}
						</div>
					)}
					{review && <p className="mt-1 text-xs" style={{ color: "var(--text-hint)" }}>Leave blank to keep the current image.</p>}
				</div>
			</div>
			<div className="border-border bg-secondary/15 flex justify-end gap-2 border-t px-5 py-3">
				<Button type="button" variant="outline" size="sm" onClick={onCancel} disabled={saving}>
					Cancel
				</Button>
				<Button type="submit" size="sm" disabled={saving}>
					{saving ? "Saving…" : review ? "Save changes" : "Create testimonial"}
				</Button>
			</div>
		</form>
	);
};
