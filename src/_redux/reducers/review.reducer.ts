import { createSlice } from "@reduxjs/toolkit";
import { ReviewState } from "@/types";
import { reviewAction } from "../actions/review.action";

const initialState: ReviewState = {
	reviews: [],
	pagination: null,
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
				state.reviews = action.payload?.data?.items ?? [];
				state.pagination = action.payload?.data?.meta ?? null;
			})
			.addCase(reviewAction.fetchItemReviewsAsync.rejected, (state, action) => {
				state.isLoading = false;
				state.error = action.payload as string;
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
