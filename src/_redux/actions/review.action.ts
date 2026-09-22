import { createAsyncThunk } from "@reduxjs/toolkit";
import { uuidv7 } from "uuidv7";
import axiosInstance from "@/_utils/axiosInstance";
import { extractErrorMessage } from "@/_utils/apiHelpers";

/** Storefront product page. Public endpoint — published reviews only. */
const fetchItemReviewsAsync = createAsyncThunk<any, { itemId?: string; page?: number; limit?: number; search?: string }, { rejectValue: string }>(
	"review/fetchItemReviews",
	async ({ itemId, page = 1, limit = 10, search }, { rejectWithValue }) => {
		try {
			const response = await axiosInstance.get(
				`reviews?page=${page}&limit=${limit}${itemId ? `&itemId=${itemId}` : ""}${search ? `&search=${encodeURIComponent(search)}` : ""}`
			);
			return response.data;
		} catch (error: any) {
			return rejectWithValue(extractErrorMessage(error));
		}
	}
);

/**
 * Admin moderation table. Its own endpoint because it must show deactivated
 * reviews, which the public one deliberately will not return.
 */
const fetchModerationReviewsAsync = createAsyncThunk<
	any,
	{ page?: number; limit?: number; search?: string; filter?: string },
	{ rejectValue: string }
>("review/fetchModerationReviews", async ({ page = 1, limit = 10, search, filter }, { rejectWithValue }) => {
	try {
		const response = await axiosInstance.get(
			`reviews/moderation?page=${page}&limit=${limit}` +
				`${search ? `&search=${encodeURIComponent(search)}` : ""}${filter ? `&filter=${filter}` : ""}`
		);
		return response.data;
	} catch (error: any) {
		return rejectWithValue(extractErrorMessage(error));
	}
});

const submitReviewAsync = createAsyncThunk<any, { rating: number; comment?: string; itemId: string }, { rejectValue: string }>(
	"review/submitReview",
	async (payload, { rejectWithValue }) => {
		try {
			// One key per submit click, reused automatically by axiosInstance's
			// 401-refresh retry (same request config) so that retry doesn't
			// double-create the review.
			const response = await axiosInstance.post("reviews", payload, { headers: { "Idempotency-Key": uuidv7() } });
			return response.data;
		} catch (error: any) {
			return rejectWithValue(extractErrorMessage(error));
		}
	}
);

/**
 * Public testimonials: 4-star-plus, and only ones that actually say something.
 * Pass an itemId to scope them to a single product. No status filter — the
 * public endpoint serves published reviews and nothing else. (It used to send
 * `filter=ACTIVE`, which is not a value the status column holds; the real
 * enum is 'A'/'I'.)
 */
const fetchTestimonialsAsync = createAsyncThunk<
	any,
	{ page?: number; limit?: number; itemId?: string; featured?: boolean } | void,
	{ rejectValue: string }
>(
	"review/fetchTestimonials",
	async (args, { rejectWithValue }) => {
		const { page = 1, limit = 6, itemId, featured } = args || {};
		try {
			const response = await axiosInstance.get(
				`reviews?minRating=4&withComment=true&page=${page}&limit=${limit}` +
					`${itemId ? `&itemId=${itemId}` : ""}${featured ? "&featured=true" : ""}`
			);
			return response.data;
		} catch (error: any) {
			return rejectWithValue(extractErrorMessage(error));
		}
	}
);

/** Moderator curation: which quotes the marketing pages lead with. */
const setReviewFeaturedAsync = createAsyncThunk<any, { ids: string[]; featured: boolean }, { rejectValue: string }>(
	"review/setFeatured",
	async ({ ids, featured }, { rejectWithValue }) => {
		try {
			const response = await axiosInstance.post(featured ? "reviews/feature" : "reviews/unfeature", { ids });
			return response.data;
		} catch (error: any) {
			return rejectWithValue(extractErrorMessage(error));
		}
	}
);

export const reviewAction = {
	fetchItemReviewsAsync,
	fetchModerationReviewsAsync,
	submitReviewAsync,
	fetchTestimonialsAsync,
	setReviewFeaturedAsync,
};
