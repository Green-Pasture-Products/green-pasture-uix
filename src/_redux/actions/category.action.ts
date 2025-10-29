import axiosInstance from "@/_utils/axiosInstance";
import { Category, PageParams } from "@/types";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { appConstants } from "../constants";

export const createCategoryAsync = createAsyncThunk(
	"auth/createCategoryAsync",
	async (category: Category, { rejectWithValue }) => {
		try {
			const response = await axiosInstance.post(`products`, category);
			return response.data;
		} catch (error: any) {
			const message =
				error.response?.data?.message ||
				error.message ||
				"createCategory failed";
			return rejectWithValue(message);
		}
	}
);

export const updateCategoryAsync = createAsyncThunk(
	"auth/updateCategoryAsync",
	async (category: Category, { rejectWithValue }) => {
		try {
			const response = await axiosInstance.patch(
				`products/${category?.id}`,
				{ name: category?.name, description: category?.description }
			);
			return response.data;
		} catch (error: any) {
			const message =
				error.response?.data?.message ||
				error.message ||
				"updateCategory failed";
			return rejectWithValue(message);
		}
	}
);

export const deleteCategoryAsync = createAsyncThunk(
	"auth/deleteCategoryAsync",
	async (categoryId: number, { rejectWithValue }) => {
		try {
			const response = await axiosInstance.delete(`products/${categoryId}`);
			// return response.data;
			return categoryId;
		} catch (error: any) {
			const message =
				error.response?.data?.message ||
				error.message ||
				"deleteCategory failed";
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
				error.response?.data?.message ||
				error.message ||
				"getAllCategories failed";
			return rejectWithValue(message);
		}
	}
);
