import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { MessageSquareQuote, Star, Trash2, Power } from "lucide-react";
import toast from "react-hot-toast";

import withAdminAuth from "@/_components/withAdminAuth";
import AdminLayout from "@/_components/AdminLayout";
import RecordActivity from "@/_components/RecordActivity";
import { TestimonialForm } from "@/_components/TestimonialForm";
import { BackButton, DetailHeader, DetailSection, EditableSection, FactGrid } from "@/_UI/DetailField";
import Badge from "@/_UI/Badge";
import Modal from "@/_UI/Modal";
import PageLoader from "@/_UI/PageLoader";
import { Button } from "@/components/ui/button";
import axiosInstance from "@/_utils/axiosInstance";
import { useHasPrivilege } from "@/_hooks/usePrivilege";
import type { BackendReview } from "@/types";

const date = (iso?: string | null) => (iso ? new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }) : "—");

const ReviewDetail: React.FC = () => {
	const router = useRouter();
	const id = router.query.id as string | undefined;
	const hasPrivilege = useHasPrivilege();
	const canModerate = hasPrivilege("MODERATE_REVIEWS");
	const canDelete = hasPrivilege("DELETE_REVIEW");

	const [review, setReview] = useState<BackendReview | null>(null);
	const [loading, setLoading] = useState(true);
	const [confirm, setConfirm] = useState<"toggle" | "delete" | null>(null);
	const [busy, setBusy] = useState(false);

	const load = useCallback(async () => {
		if (!id) return;
		try {
			setReview((await axiosInstance.get(`reviews/${id}`)).data?.data ?? null);
		} catch {
			setReview(null);
		} finally {
			setLoading(false);
		}
	}, [id]);
	useEffect(() => {
		load();
	}, [load]);

	const run = async (fn: () => Promise<unknown>, done: string, after?: () => void) => {
		setBusy(true);
		try {
			await fn();
			toast.success(done);
			setConfirm(null);
			after ? after() : await load();
		} catch (e: any) {
			toast.error(e?.response?.data?.message || "Something went wrong");
		} finally {
			setBusy(false);
		}
	};

	if (loading)
		return (
			<AdminLayout pageTitle="Review">
				<PageLoader fullScreen={false} message="Loading review..." />
			</AdminLayout>
		);
	if (!review)
		return (
			<AdminLayout pageTitle="Review">
				<div className="border-border bg-card mx-auto max-w-3xl space-y-3 rounded-xl border p-8 text-center">
					<p className="text-sm font-semibold">Review not found.</p>
					<Button variant="outline" size="sm" onClick={() => router.push("/admin/reviews")}>
						Back to Reviews
					</Button>
				</div>
			</AdminLayout>
		);

	const isTestimonial = review.source === "admin";
	const active = review.status === "A";
	const author = review.customer || review.reviewerName || "Anonymous";
	const canFeature = !!review.comment?.trim();

	const facts = [
		{ label: "Author", value: author },
		{ label: "Product", value: review.item?.name },
		{ label: "Rating", value: `${review.rating} ★` },
		{ label: "Comment", wide: true, value: review.comment ? <span className="font-normal">{review.comment}</span> : "" },
		...(review.imageUrl ? [{ label: "Image", wide: true, value: <img src={review.imageUrl} alt="Testimonial" className="max-h-72 rounded-lg object-contain" /> }] : []),
	];

	return (
		<AdminLayout pageTitle={`Review by ${author}`}>
			<div className="mx-auto w-full max-w-5xl space-y-6">
				<BackButton onClick={() => router.push("/admin/reviews")} label="Back to Reviews" />
				<DetailHeader
					title={`${isTestimonial ? "Testimonial" : "Review"} by ${author}`}
					subtitle={review.item?.name}
					status={<Badge variant={active ? "success" : "neutral"} dot>{active ? "Active" : "Inactive"}</Badge>}
					metrics={[
						{ label: "Type", value: isTestimonial ? "Testimonial" : "Customer review" },
						{ label: "Rating", value: `${review.rating} ★` },
						{ label: "Home page", value: review.featured ? "Featured" : "Not featured" },
						{ label: "Added", value: date(review.createdAt) },
					]}
					actions={
						<>
							{canModerate && (
								<Button
									variant="outline"
									size="sm"
									className="gap-1.5"
									disabled={!canFeature || busy}
									title={canFeature ? undefined : "Needs a written comment"}
									onClick={() => run(() => axiosInstance.post(review.featured ? "reviews/unfeature" : "reviews/feature", { ids: [review.id] }), review.featured ? "Removed from the home page" : "Featured on the home page")}
								>
									<Star className={`size-3.5 ${review.featured ? "fill-current" : ""}`} />
									{review.featured ? "Unfeature" : "Feature"}
								</Button>
							)}
							{canModerate && (
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

				{isTestimonial ? (
					<EditableSection key={review.updatedAt} title="Testimonial" icon={MessageSquareQuote} canEdit defaultEditing={router.query.edit === "1"} facts={facts}>
						{(close) => <TestimonialForm review={review} onCancel={close} onSaved={load} />}
					</EditableSection>
				) : (
					<DetailSection title="Review" icon={MessageSquareQuote} description="Written by a customer, so it can be featured or hidden but not edited.">
						<FactGrid facts={facts} />
					</DetailSection>
				)}
			</div>

			<RecordActivity type="Review" id={review.id} />

			<Modal isOpen={confirm === "toggle"} onClose={() => setConfirm(null)} title={`${active ? "Deactivate" : "Activate"} review`} size="sm">
				<div className="space-y-4">
					<p className="text-sm" style={{ color: "var(--text-secondary)" }}>
						{active ? "It stops showing on the storefront." : "It shows on the storefront again."}
					</p>
					<div className="flex justify-end gap-2">
						<Button variant="outline" size="sm" onClick={() => setConfirm(null)}>
							Cancel
						</Button>
						<Button variant={active ? "destructive" : "default"} size="sm" disabled={busy} onClick={() => run(() => axiosInstance.post(active ? "reviews/deactivate" : "reviews/activate", { ids: [review.id] }), active ? "Review deactivated" : "Review activated")}>
							{active ? "Deactivate" : "Activate"}
						</Button>
					</div>
				</div>
			</Modal>
			<Modal isOpen={confirm === "delete"} onClose={() => setConfirm(null)} title="Delete review" size="sm">
				<div className="space-y-4">
					<p className="text-sm" style={{ color: "var(--text-secondary)" }}>
						Delete this {isTestimonial ? "testimonial" : "review"} by <span className="font-semibold">{author}</span>? This cannot be undone.
					</p>
					<div className="flex justify-end gap-2">
						<Button variant="outline" size="sm" onClick={() => setConfirm(null)}>
							Cancel
						</Button>
						<Button variant="destructive" size="sm" disabled={busy} onClick={() => run(() => axiosInstance.delete(`reviews/${review.id}`), "Review deleted", () => router.push("/admin/reviews"))}>
							Delete
						</Button>
					</div>
				</div>
			</Modal>
		</AdminLayout>
	);
};

export default withAdminAuth(ReviewDetail);
