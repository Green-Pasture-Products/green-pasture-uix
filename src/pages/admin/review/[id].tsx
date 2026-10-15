import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { MessageSquareQuote, Star, Trash2, Power, Pencil, ExternalLink, Quote } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

import withAdminAuth from "@/_components/withAdminAuth";
import AdminLayout from "@/_components/AdminLayout";
import RecordActivity from "@/_components/RecordActivity";
import { TestimonialForm } from "@/_components/TestimonialForm";
import { BackButton, DetailHeader, DetailSection, DetailRow } from "@/_UI/DetailField";
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
	const [editing, setEditing] = useState(false);
	useEffect(() => {
		if (router.isReady && router.query.edit === "1") setEditing(true);
	}, [router.isReady, router.query.edit]);

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

	const initials = author.split(/\s+/).filter(Boolean).slice(0, 2).map((w: string) => w[0]?.toUpperCase()).join("") || "?";
	const thumb = review.itemImage || (review.item as any)?.photos?.find((p: any) => p.isThumbnail)?.url || (review.item as any)?.photos?.[0]?.url;

	return (
		<AdminLayout pageTitle={`Review by ${author}`}>
			<div className="@container animate-page-enter mx-auto w-full max-w-6xl space-y-5">
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
							{isTestimonial && canModerate && (
								<Button variant="outline" size="sm" className="gap-1.5" onClick={() => setEditing((v) => !v)}>
									<Pencil className="size-3.5" />
									{editing ? "Cancel" : "Edit"}
								</Button>
							)}
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

				<div className="grid grid-cols-1 gap-5 @2xl:grid-cols-[minmax(0,1fr)_320px] @2xl:items-start">
					<div className="min-w-0">
						{isTestimonial && editing ? (
							<TestimonialForm review={review} onCancel={() => setEditing(false)} onSaved={() => { setEditing(false); load(); }} />
						) : (
							<DetailSection title={isTestimonial ? "Testimonial" : "Review"} icon={MessageSquareQuote} description={isTestimonial ? "Written by the team on a customer's behalf." : "Written by a customer, so it can be featured or hidden but not edited."}>
								<div className="space-y-5 py-5">
									<div className="flex flex-wrap items-center gap-x-3 gap-y-1">
										<div className="flex items-center gap-0.5" role="img" aria-label={`${review.rating} out of 5 stars`}>
											{[1, 2, 3, 4, 5].map((n) => (
												<Star key={n} className={`size-5 ${n <= Number(review.rating) ? "fill-amber-400 text-amber-400" : "text-gray-300 dark:text-white/20"}`} />
											))}
										</div>
										<span className="text-sm font-semibold whitespace-nowrap" style={{ color: "var(--text-primary)" }}>
											{review.rating} out of 5
										</span>
									</div>
									{review.comment?.trim() ? (
										<figure className="relative rounded-xl p-5" style={{ background: "var(--surface-low)", border: "1px solid var(--border-light)" }}>
											<Quote className="absolute top-3 right-3 size-6 opacity-15" aria-hidden />
											<blockquote className="pr-6 text-base leading-relaxed" style={{ color: "var(--text-primary)" }}>
												{review.comment}
											</blockquote>
											<figcaption className="mt-4 flex items-center gap-2.5 text-xs" style={{ color: "var(--text-hint)" }}>
												<span className="bg-brand/15 text-brand-ink flex size-7 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold">{initials}</span>
												<span className="min-w-0 truncate font-medium" style={{ color: "var(--text-secondary)" }} title={author}>
													{author}
												</span>
												<span aria-hidden>·</span>
												<span className="whitespace-nowrap">{date(review.createdAt)}</span>
											</figcaption>
										</figure>
									) : (
										<p className="rounded-xl p-5 text-sm" style={{ background: "var(--surface-low)", border: "1px dashed var(--border-light)", color: "var(--text-hint)" }}>
											Only a star rating, no written comment. It cannot be featured on the home page.
										</p>
									)}
									{review.imageUrl && <img src={review.imageUrl} alt="Testimonial" className="max-h-72 rounded-xl object-contain" />}
								</div>
							</DetailSection>
						)}
					</div>

					<div className="min-w-0 space-y-5">
						<DetailSection title="Product">
							<div className="flex items-center gap-3 py-4">
								<span className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-xl" style={{ background: "var(--surface-medium)" }}>
									{thumb ? <img src={thumb} alt="" className="h-full w-full object-cover" /> : <MessageSquareQuote className="size-5 opacity-40" />}
								</span>
								<div className="min-w-0 flex-1">
									<p className="truncate text-sm font-semibold" style={{ color: "var(--text-primary)" }} title={review.item?.name}>
										{review.item?.name ?? "No product"}
									</p>
									{review.item?.id && (
										<Link href={`/admin/product/${review.item.id}`} className="mt-0.5 inline-flex items-center gap-1 text-xs font-medium whitespace-nowrap" style={{ color: "var(--color-primary)" }}>
											Open product <ExternalLink size={12} />
										</Link>
									)}
								</div>
							</div>
						</DetailSection>

						<DetailSection title="Author">
							<DetailRow label="Name" value={author} />
							<DetailRow label="Type" value={isTestimonial ? "Testimonial (added by the team)" : "Customer review"} />
							<DetailRow label="Added" value={date(review.createdAt)} />
						</DetailSection>

						<DetailSection title="Visibility" description="What shoppers can see.">
							<DetailRow label="Shop" value={<Badge variant={active ? "success" : "neutral"} dot>{active ? "Showing" : "Hidden"}</Badge>} />
							<DetailRow label="Home page" value={<Badge variant={review.featured ? "success" : "neutral"} dot>{review.featured ? "Featured" : "Not featured"}</Badge>} />
						</DetailSection>
					</div>
				</div>
			</div>

			<RecordActivity type="Review" id={review.id} created={{ at: (review as any).createdAt, by: (review as any).createdBy }} />

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
