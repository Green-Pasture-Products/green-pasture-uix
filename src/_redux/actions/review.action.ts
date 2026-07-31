import { createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "@/_utils/axiosInstance";
import { extractErrorMessage } from "@/_utils/apiHelpers";

const fetchItemReviewsAsync = createAsyncThunk<any, { itemId: string; page?: number; limit?: number }, { rejectValue: string }>(
	"review/fetchItemReviews",
	async ({ itemId, page = 1, limit = 10 }, { rejectWithValue }) => {
		try {
			const response = await axiosInstance.get(`reviews?itemId=${itemId}&page=${page}&limit=${limit}`);
			return response.data;
		} catch (error: any) {
			return rejectWithValue(extractErrorMessage(error));
		}
	}
);

const submitReviewAsync = createAsyncThunk<any, { rating: number; comment?: string; itemId: string }, { rejectValue: string }>(
	"review/submitReview",
	async (payload, { rejectWithValue }) => {
		try {
			const response = await axiosInstance.post("reviews", payload);
			return response.data;
		} catch (error: any) {
			return rejectWithValue(extractErrorMessage(error));
		}
	}
);

export const reviewAction = { fetchItemReviewsAsync, submitReviewAsync };
