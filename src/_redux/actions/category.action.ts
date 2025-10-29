import axiosInstance from "@/_utils/axiosInstance";
import { Category, PageParams } from "@/types";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { appConstants } from "../constants";

export const createCategoryAsync = createAsyncThunk(
	"auth/createCategoryAsync",
	async (category: Category, { rejectWithValue }) => {
		try {
			const response = await axiosInstance.post(`products`, category, {
				// headers: {
				// 	Authorization: getBearerCookie(),
				// 	accessToken: getAccessToken(),
				// },
			});
			return response.data;
		} catch (error: any) {
			const message =
				error.response?.data?.message || error.message || "Signup failed";
			return rejectWithValue(message);
		}
	}
);

export const getAllCategoriesAsync = createAsyncThunk(
	"auth/getAllCategoriesAsync",
	async (params: PageParams, { rejectWithValue }) => {
		try {
			const { page = appConstants.PAGE, limit = appConstants.LIMIT } =
				params;

			const response = await axiosInstance.get(`products`, {
				params: { page, limit },
			});
			return response.data;
		} catch (error: any) {
			const message =
				error.response?.data?.message || error.message || "Signup failed";
			return rejectWithValue(message);
		}
	}
);
