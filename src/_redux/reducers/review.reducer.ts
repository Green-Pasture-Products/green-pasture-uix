import { createSlice } from "@reduxjs/toolkit";
import { ReviewState } from "@/types";
import { reviewAction } from "../actions/review.action";
import { mergePages } from "@/_utils/mergePages";

const initialState: ReviewState = {
	reviews: [],
	pagination: null,
	moderationReviews: [],
	moderationPagination: null,
	isLoadingModeration: false,
	testimonials: [],
	testimonialsPagination: null,
	isLoadingTestimonials: false,
	isLoading: false,
	isSubmitting: false,
	error: null,
};

const reviewSlice = createSlice({
	name: "review",
	initialState,
	reducers: {
		clearReviews: (state) => {
			state.reviews = [];
			state.pagination = null;
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(reviewAction.fetchItemReviewsAsync.pending, (state) => {
				state.isLoading = true;
				state.error = null;
			})
			.addCase(reviewAction.fetchItemReviewsAsync.fulfilled, (state, action) => {
				state.isLoading = false;
				const meta = action.payload?.data?.meta ?? null;
				// "Load More" must add to the list, not swap it out. Replacing
				// dropped page 1 the moment page 2 arrived.
				state.reviews = mergePages(state.reviews, action.payload?.data?.items ?? [], meta?.currentPage ?? 1);
				state.pagination = meta;
			})
			.addCase(reviewAction.fetchItemReviewsAsync.rejected, (state, action) => {
				state.isLoading = false;
				state.error = action.payload as string;
			})
			// The moderation table pages server-side through a table UI, so it
			// replaces rather than accumulates — and it reads a different
			// endpoint, so it cannot share the storefront's list.
			.addCase(reviewAction.fetchModerationReviewsAsync.pending, (state) => {
				state.isLoadingModeration = true;
				state.error = null;
			})
			.addCase(reviewAction.fetchModerationReviewsAsync.fulfilled, (state, action) => {
				state.isLoadingModeration = false;
				state.moderationReviews = action.payload?.data?.items ?? [];
				state.moderationPagination = action.payload?.data?.meta ?? null;
			})
			.addCase(reviewAction.fetchModerationReviewsAsync.rejected, (state, action) => {
				state.isLoadingModeration = false;
				state.error = action.payload as string;
			})
			.addCase(reviewAction.fetchTestimonialsAsync.pending, (state) => {
				state.isLoadingTestimonials = true;
			})
			.addCase(reviewAction.fetchTestimonialsAsync.fulfilled, (state, action) => {
				state.isLoadingTestimonials = false;
				const meta = action.payload?.data?.meta ?? null;
				state.testimonials = mergePages(state.testimonials, action.payload?.data?.items ?? [], meta?.currentPage ?? 1);
				state.testimonialsPagination = meta;
			})
			.addCase(reviewAction.fetchTestimonialsAsync.rejected, (state) => {
				state.isLoadingTestimonials = false;
			})
			.addCase(reviewAction.submitReviewAsync.pending, (state) => {
				state.isSubmitting = true;
				state.error = null;
			})
			.addCase(reviewAction.submitReviewAsync.fulfilled, (state) => {
				state.isSubmitting = false;
			})
			.addCase(reviewAction.submitReviewAsync.rejected, (state, action) => {
				state.isSubmitting = false;
				state.error = action.payload as string;
			});
	},
});

export const { clearReviews } = reviewSlice.actions;
export default reviewSlice.reducer;
