import React, { useCallback, useEffect, useState, useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Star, Upload, X } from "lucide-react";
import toast from "react-hot-toast";
import { uuidv7 } from "uuidv7";

import withAdminAuth from "@/_components/withAdminAuth";
import AdminLayout from "@/_components/AdminLayout";
import { DataTable } from "@/_components/DataTable";
import Button from "@/_UI/Button";
import Badge from "@/_UI/Badge";
import { useAppDispatch, useAppSelector } from "@/_redux/store";
import { reviewAction } from "@/_redux/actions/review.action";
import { adminAction } from "@/_redux/actions/admin.action";
import { useListParams } from "@/_hooks/useListParams";
import axiosInstance from "@/_utils/axiosInstance";
import { BackendReview } from "@/types";

/**
 * Reviews & Testimonials management.
 * - Reviews: submitted by customers
 * - Testimonials: created by admins (with images and custom names)
 * Featured items appear in the home page testimonial carousel.
 */
type FilterType = "all" | "customer" | "admin";

const AdminReviews: React.FC = () => {
	const dispatch = useAppDispatch();
	// Moderation state, not the storefront's: this table has to see deactivated
	// reviews, and it pages server-side rather than accumulating like the
	// product page's "Load More" list does.
	const {
		moderationReviews: reviews,
		moderationPagination: pagination,
		isLoadingModeration: isLoading,
	} = useAppSelector((state) => state.review);
	const { adminItems } = useAppSelector((state) => state.admin);

	const { page: currentPage, pageSize, search: searchTerm, setPage, setSearch, setPageSize } = useListParams();
	const [togglingId, setTogglingId] = useState<string | null>(null);
	const [filterType, setFilterType] = useState<FilterType>("all");
	const [showAddTestimonial, setShowAddTestimonial] = useState(false);
	const [testimonialForm, setTestimonialForm] = useState({
		rating: 5,
		comment: "",
		reviewerName: "",
		itemId: "",
		image: null as File | null,
	});
	const [imagePreview, setImagePreview] = useState<string | null>(null);
	const [isSubmittingTestimonial, setIsSubmittingTestimonial] = useState(false);
	const [viewingImage, setViewingImage] = useState<string | null>(null);

	const refresh = useCallback(() => {
		dispatch(reviewAction.fetchModerationReviewsAsync({ page: currentPage, limit: pageSize, search: searchTerm || undefined }));
		dispatch(adminAction.fetchAdminItemsAsync({ page: 1, limit: 1000 }));
	}, [dispatch, currentPage, pageSize, searchTerm]);

	useEffect(() => {
		refresh();
	}, [refresh]);

	// Filter reviews based on source (customer vs admin/testimonial)
	const filteredReviews = useMemo(() => {
		if (!reviews) return [];
		if (filterType === "customer") {
			// Treat undefined/null source as 'customer' (legacy data)
			return reviews.filter((r) => r.source === "customer" || !r.source);
		}
		if (filterType === "admin") {
			return reviews.filter((r) => r.source === "admin");
		}
		return reviews; // All
	}, [reviews, filterType]);

	const toggleFeatured = async (review: BackendReview) => {
		setTogglingId(review.id);
		try {
			await dispatch(reviewAction.setReviewFeaturedAsync({ ids: [review.id], featured: !review.featured })).unwrap();
			toast.success(review.featured ? "Removed from the home page" : "Featured on the home page");
			refresh();
		} catch (error) {
			toast.error(error as string);
		} finally {
			setTogglingId(null);
		}
	};

	const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			setTestimonialForm((prev) => ({ ...prev, image: file }));
			const reader = new FileReader();
			reader.onload = (event) => {
				setImagePreview(event.target?.result as string);
			};
			reader.readAsDataURL(file);
		}
	};

	const handleAddTestimonial = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!testimonialForm.comment.trim()) {
			toast.error("Review comment is required");
			return;
		}
		if (!testimonialForm.itemId) {
			toast.error("Please select a product");
			return;
		}
		if (!testimonialForm.image) {
			toast.error("Please upload an image file");
			return;
		}

		setIsSubmittingTestimonial(true);
		try {
			const form = new FormData();
			form.append("rating", String(testimonialForm.rating));
			form.append("comment", testimonialForm.comment);
			form.append("reviewerName", testimonialForm.reviewerName || "");
			form.append("itemId", testimonialForm.itemId);
			form.append("image", testimonialForm.image);

			await axiosInstance.post("reviews/testimonials", form, {
				headers: {
					"Content-Type": "multipart/form-data",
					"Idempotency-Key": uuidv7(),
				},
			});

			toast.success("Testimonial created successfully!");
			setTestimonialForm({
				rating: 5,
				comment: "",
				reviewerName: "",
				itemId: "",
				image: null,
			});
			setImagePreview(null);
			setShowAddTestimonial(false);
			refresh();
		} catch (error: any) {
			toast.error(error?.response?.data?.message || "Failed to create testimonial");
		} finally {
			setIsSubmittingTestimonial(false);
		}
	};

	const columns: ColumnDef<BackendReview, any>[] = [
		{
			id: "source",
			header: "Type",
			meta: { width: "120px" },
			cell: ({ row }) => {
				const isTestimonial = row.original.source === "admin";
				return (
					<Badge variant={isTestimonial ? "info" : "neutral"} dot>
						{isTestimonial ? "Testimonial" : "Review"}
					</Badge>
				);
			},
		},
		{
			accessorKey: "customer",
			header: "Customer / Author",
			meta: { width: "180px" },
			cell: ({ row }) => (
				<span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
					{row.original.customer || row.original.reviewerName || "—"}
				</span>
			),
		},
		{
			id: "item",
			header: "Product",
			meta: { width: "180px" },
			cell: ({ row }) => (
				<span className="text-sm" style={{ color: "var(--text-secondary)" }}>
					{row.original.item?.name ?? "—"}
				</span>
			),
		},
		{
			accessorKey: "rating",
			header: "Rating",
			meta: { width: "90px" },
			cell: ({ row }) => (
				<span className="text-sm tabular-nums" style={{ color: "var(--text-secondary)" }}>
					{row.original.rating}★
				</span>
			),
		},
		{
			accessorKey: "comment",
			header: "Comment",
			meta: { maxWidth: "420px", truncate: true },
			cell: ({ row }) => (
				<span className="text-sm" style={{ color: "var(--text-secondary)" }}>
					{row.original.comment || "— no written feedback —"}
				</span>
			),
		},
		{
			id: "featured",
			header: "Home page",
			enableSorting: false,
			meta: { width: "130px", align: "center" },
			cell: ({ row }) => {
				const review = row.original;
				// Only reviews that carry text can be a testimonial — the carousel has
				// nothing to show without a quote, so don't let one be featured.
				const canFeature = !!review.comment?.trim();
				return (
					<button
						onClick={() => toggleFeatured(review)}
						disabled={!canFeature || togglingId === review.id}
						title={canFeature ? (review.featured ? "Remove from home page" : "Feature on home page") : "Needs a written comment"}
						className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40"
						style={{
							background: review.featured ? "rgba(154,202,60,0.16)" : "transparent",
							border: `1px solid ${review.featured ? "transparent" : "var(--border-light)"}`,
							color: review.featured ? "var(--color-primary)" : "var(--text-secondary)",
						}}
					>
						<Star className={`h-3.5 w-3.5 ${review.featured ? "fill-current" : ""}`} />
						{review.featured ? "Featured" : "Feature"}
					</button>
				);
			},
		},
		{
			id: "image",
			header: "Image",
			enableSorting: false,
			meta: { width: "100px", align: "center" },
			cell: ({ row }) => {
				const isAdmin = row.original.source === "admin";
				const hasImage = !!row.original.imageUrl;

				// Only admin testimonials can have images
				if (!isAdmin) {
					return <span style={{ color: "var(--text-secondary)" }}>—</span>;
				}

				return (
					<button
						onClick={() => hasImage && setViewingImage(row.original.imageUrl!)}
						disabled={!hasImage}
						title={hasImage ? "View image" : "No image"}
						className="inline-flex items-center justify-center rounded-lg px-3 py-1.5 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40"
						style={{
							background: hasImage ? "var(--color-primary)" : "transparent",
							border: `1px solid ${hasImage ? "transparent" : "var(--border-light)"}`,
							color: hasImage ? "white" : "var(--text-secondary)",
						}}
					>
						{hasImage ? "View" : "—"}
					</button>
				);
			},
		},
	];

	return (
		<AdminLayout>
			<div className="animate-page-enter space-y-6">
				{/* Filter and Add Testimonial */}
				<div className="flex items-center justify-between gap-4">
					<div className="flex gap-2">
						<button
							onClick={() => setFilterType("all")}
							className={`px-4 py-2 rounded-lg font-medium transition ${
								filterType === "all"
									? "text-white"
									: "text-gray-600 hover:bg-gray-100"
							}`}
							style={filterType === "all" ? { backgroundColor: "var(--color-primary)" } : {}}
						>
							All
						</button>
						<button
							onClick={() => setFilterType("customer")}
							className={`px-4 py-2 rounded-lg font-medium transition ${
								filterType === "customer"
									? "text-white"
									: "text-gray-600 hover:bg-gray-100"
							}`}
							style={filterType === "customer" ? { backgroundColor: "var(--color-primary)" } : {}}
						>
							Customer Reviews
						</button>
						<button
							onClick={() => setFilterType("admin")}
							className={`px-4 py-2 rounded-lg font-medium transition ${
								filterType === "admin"
									? "text-white"
									: "text-gray-600 hover:bg-gray-100"
							}`}
							style={filterType === "admin" ? { backgroundColor: "var(--color-primary)" } : {}}
						>
							Admin Testimonials
						</button>
					</div>
					{filterType === "admin" && (
						<Button variant="filled" onClick={() => setShowAddTestimonial(!showAddTestimonial)}>
							{showAddTestimonial ? "Cancel" : "Add Testimonial"}
						</Button>
					)}
				</div>

				{/* Add Testimonial Form */}
				{filterType === "admin" && showAddTestimonial && (
					<form
						onSubmit={handleAddTestimonial}
						className="rounded-lg border p-6"
						style={{ borderColor: "var(--border-light)" }}
					>
						<div className="space-y-4 max-w-2xl">
							<div>
								<label className="block text-sm font-medium mb-2">Product *</label>
								<select
									value={testimonialForm.itemId}
									onChange={(e) => setTestimonialForm((prev) => ({ ...prev, itemId: e.target.value }))}
									className="w-full px-4 py-2 rounded-lg border"
									style={{ borderColor: "var(--border-light)" }}
								>
									<option value="">Select a product</option>
									{adminItems?.map((item) => (
										<option key={item.id} value={item.id}>
											{item.name}
										</option>
									))}
								</select>
							</div>

							<div>
								<label className="block text-sm font-medium mb-2">Reviewer Name</label>
								<input
									type="text"
									value={testimonialForm.reviewerName}
									onChange={(e) => setTestimonialForm((prev) => ({ ...prev, reviewerName: e.target.value }))}
									placeholder="e.g., Sarah M."
									className="w-full px-4 py-2 rounded-lg border"
									style={{ borderColor: "var(--border-light)" }}
								/>
							</div>

							<div>
								<label className="block text-sm font-medium mb-2">Rating *</label>
								<div className="flex gap-2">
									{[1, 2, 3, 4, 5].map((num) => (
										<button
											key={num}
											type="button"
											onClick={() => setTestimonialForm((prev) => ({ ...prev, rating: num }))}
											className={`p-2 rounded-lg ${
												testimonialForm.rating >= num ? "text-yellow-400" : "text-gray-300"
											}`}
										>
											<Star
												size={24}
												fill={testimonialForm.rating >= num ? "currentColor" : "none"}
											/>
										</button>
									))}
								</div>
							</div>

							<div>
								<label className="block text-sm font-medium mb-2">Comment *</label>
								<textarea
									value={testimonialForm.comment}
									onChange={(e) => setTestimonialForm((prev) => ({ ...prev, comment: e.target.value }))}
									placeholder="What did the customer say?"
									rows={3}
									className="w-full px-4 py-2 rounded-lg border resize-none"
									style={{ borderColor: "var(--border-light)" }}
								/>
							</div>

							<div>
								<label className="block text-sm font-medium mb-2">Image *</label>
								<input
									type="file"
									accept="image/*"
									onChange={handleImageChange}
									className="w-full px-4 py-2 rounded-lg border"
									style={{ borderColor: "var(--border-light)" }}
								/>
								{imagePreview && (
									<div className="mt-2 relative inline-block">
										<img src={imagePreview} alt="Preview" className="h-20 w-20 rounded object-cover" />
										<button
											type="button"
											onClick={() => {
												setImagePreview(null);
												setTestimonialForm((prev) => ({ ...prev, image: null }));
											}}
											className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1"
										>
											<X size={14} className="text-white" />
										</button>
									</div>
								)}
							</div>

							<button
								type="submit"
								disabled={isSubmittingTestimonial}
								className="w-full px-6 py-2 rounded-lg font-medium text-white disabled:opacity-50"
								style={{ backgroundColor: "var(--color-primary)" }}
							>
								{isSubmittingTestimonial ? "Creating..." : "Create Testimonial"}
							</button>
						</div>
					</form>
				)}

				{/* Reviews Table */}
				<DataTable
					columns={columns}
					data={filteredReviews ?? []}
					isLoading={isLoading}
					onRefresh={refresh}
					refreshing={isLoading}
					manualFiltering
					globalFilter={searchTerm}
					onGlobalFilterChange={setSearch}
					searchPlaceholder="Search by comment..."
					pageIndex={currentPage - 1}
					pageSize={pageSize}
					pageCount={pagination?.totalPages ?? 1}
					totalItems={pagination?.totalItems}
					onPageChange={(idx) => setPage(idx + 1)}
					onPageSizeChange={setPageSize}
					emptyMessage="No reviews yet"
					showAuditColumns={false}
				/>
			</div>

			{/* Image Viewer Modal */}
			{viewingImage && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
					<div className="relative max-h-screen max-w-2xl rounded-lg bg-white p-4">
						<button
							onClick={() => setViewingImage(null)}
							className="absolute -top-10 right-0 text-white hover:opacity-70"
							title="Close"
						>
							<X size={28} />
						</button>
						<img
							src={viewingImage}
							alt="Testimonial"
							className="max-h-[80vh] max-w-full object-contain"
						/>
					</div>
				</div>
			)}
		</AdminLayout>
	);
};

export default withAdminAuth(AdminReviews);
