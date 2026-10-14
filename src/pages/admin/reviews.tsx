import React, { useCallback, useEffect, useMemo, useState } from "react";
import { statusColumn } from "@/_components/statusColumn";
import { useRouter } from "next/router";
import type { ColumnDef } from "@tanstack/react-table";
import { Plus } from "lucide-react";
import toast from "react-hot-toast";

import withAdminAuth from "@/_components/withAdminAuth";
import AdminLayout from "@/_components/AdminLayout";
import { DataTable, type FilterDef } from "@/_components/DataTable";
import ActionMenu from "@/_UI/ActionMenu";
import Button from "@/_UI/Button";
import Badge from "@/_UI/Badge";
import { useAppDispatch, useAppSelector } from "@/_redux/store";
import { reviewAction } from "@/_redux/actions/review.action";
import { useListParams } from "@/_hooks/useListParams";
import { BackendReview } from "@/types";

/**
 * Reviews & Testimonials management.
 * - Reviews: submitted by customers
 * - Testimonials: created by admins (with images and custom names)
 * Featured items appear in the home page testimonial carousel.
 */
const VIEW_ICON = (
	<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
);
const EDIT_ICON = (
	<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4L16.5 3.5z" /></svg>
);
const STAR_ICON = (
	<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
);

const TYPE_FILTERS: FilterDef[] = [
	{
		key: "type",
		label: "Type",
		options: [
			{ value: "customer", label: "Customer reviews" },
			{ value: "admin", label: "Admin testimonials" },
		],
	},
];

const AdminReviews: React.FC = () => {
	const dispatch = useAppDispatch();
	const router = useRouter();
	// Moderation state, not the storefront's: this table has to see deactivated
	// reviews, and it pages server-side rather than accumulating like the
	// product page's "Load More" list does.
	const { moderationReviews: reviews, moderationPagination: pagination, isLoadingModeration: isLoading } = useAppSelector((state) => state.review);

	const { page: currentPage, pageSize, search: searchTerm, setPage, setSearch, setPageSize } = useListParams();
	const [type, setType] = useState("");

	const refresh = useCallback(() => {
		dispatch(reviewAction.fetchModerationReviewsAsync({ page: currentPage, limit: pageSize, search: searchTerm || undefined }));
	}, [dispatch, currentPage, pageSize, searchTerm]);

	useEffect(() => {
		refresh();
	}, [refresh]);

	// Filter reviews based on source (customer vs admin/testimonial)
	const rows = useMemo(() => {
		if (!reviews) return [];
		// Treat undefined/null source as 'customer' (legacy data)
		if (type === "customer") return reviews.filter((r) => r.source === "customer" || !r.source);
		if (type === "admin") return reviews.filter((r) => r.source === "admin");
		return reviews;
	}, [reviews, type]);

	const toggleFeatured = async (review: BackendReview) => {
		try {
			await dispatch(reviewAction.setReviewFeaturedAsync({ ids: [review.id], featured: !review.featured })).unwrap();
			toast.success(review.featured ? "Removed from the home page" : "Featured on the home page");
			refresh();
		} catch (error) {
			toast.error(error as string);
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
			meta: { width: "130px" },
			cell: ({ row }) => (row.original.featured ? <Badge variant="success" dot>Featured</Badge> : <Badge variant="neutral">Not featured</Badge>),
		},
		statusColumn(),
		{
			id: "actions",
			header: "Action",
			enableSorting: false,
			enableHiding: false,
			meta: { width: "50px", align: "center" },
			cell: ({ row }) => {
				const review = row.original;
				// Only reviews that carry text can be a testimonial — the carousel has
				// nothing to show without a quote, so don't let one be featured.
				const canFeature = !!review.comment?.trim();
				return (
					<div onClick={(e) => e.stopPropagation()}>
						<ActionMenu
							items={[
								{ label: "View", icon: VIEW_ICON, onClick: () => router.push(`/admin/review/${review.id}`) },
								// Customers' own words aren't ours to edit; only admin testimonials are.
								{ label: "Edit", icon: EDIT_ICON, onClick: () => router.push(`/admin/review/${review.id}?edit=1`), hidden: review.source !== "admin" },
								{ label: review.featured ? "Remove from home page" : "Feature on home page", icon: STAR_ICON, onClick: () => toggleFeatured(review), hidden: !canFeature },
							]}
						/>
					</div>
				);
			},
		},
	];

	return (
		<AdminLayout>
			<div className="animate-page-enter space-y-6">
				<DataTable
					columns={columns}
					data={rows}
					isLoading={isLoading}
					onRefresh={refresh}
					refreshing={isLoading}
					manualFiltering
					onRowClick={(row) => router.push(`/admin/review/${row.id}`)}
					globalFilter={searchTerm}
					onGlobalFilterChange={setSearch}
					searchPlaceholder="Search by comment..."
					filters={TYPE_FILTERS}
					filterValues={{ type }}
					onFilterChange={(_key, value) => setType(value)}
					pageIndex={currentPage - 1}
					pageSize={pageSize}
					pageCount={pagination?.totalPages ?? 1}
					totalItems={pagination?.totalItems}
					onPageChange={(idx) => setPage(idx + 1)}
					onPageSizeChange={setPageSize}
					emptyMessage="No reviews yet"
					showAuditColumns={false}
					toolbar={
						<Button variant="filled" leftIcon={Plus} onClick={() => router.push("/admin/reviews/new")}>
							Add Testimonial
						</Button>
					}
				/>
			</div>
		</AdminLayout>
	);
};

export default withAdminAuth(AdminReviews);
