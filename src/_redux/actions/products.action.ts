import { Product } from "@/types";
import { createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "@/_utils/axiosInstance";
import { extractErrorMessage } from "@/_utils/apiHelpers";

const fetchAllProducts = createAsyncThunk<Product[]>(
	"product/fetchAll",
	async (_, { rejectWithValue }) => {
		try {
			const response = await axiosInstance.get("/items?page=1&limit=100");
			return response.data?.data?.items ?? [];
		} catch (error: any) {
			return rejectWithValue(
				error.response?.data?.message || "Failed to fetch products"
			);
		}
	}
);

const fetchItemByIdAsync = createAsyncThunk<any, number, { rejectValue: string }>(
	"product/fetchItemById",
	async (id, { rejectWithValue }) => {
		try {
			const res = await axiosInstance.get(`items/${id}`);
			return res.data;
		} catch (error: any) {
			return rejectWithValue(extractErrorMessage(error));
		}
	}
);

const createItemAsync = createAsyncThunk<any, FormData, { rejectValue: string }>(
	"product/createItem",
	async (formData, { rejectWithValue }) => {
		try {
			const res = await axiosInstance.post("items", formData, { headers: { "Content-Type": "multipart/form-data" } });
			return res.data;
		} catch (error: any) {
			return rejectWithValue(extractErrorMessage(error));
		}
	}
);

const updateItemAsync = createAsyncThunk<any, { id: number; data: any }, { rejectValue: string }>(
	"product/updateItem",
	async ({ id, data }, { rejectWithValue }) => {
		try {
			const res = await axiosInstance.patch(`items/${id}`, data);
			return { ...res.data, itemId: id };
		} catch (error: any) {
			return rejectWithValue(extractErrorMessage(error));
		}
	}
);

const deleteItemAsync = createAsyncThunk<any, number, { rejectValue: string }>(
	"product/deleteItem",
	async (id, { rejectWithValue }) => {
		try {
			const res = await axiosInstance.delete(`items/${id}`);
			return { ...res.data, itemId: id };
		} catch (error: any) {
			return rejectWithValue(extractErrorMessage(error));
		}
	}
);

const addItemImagesAsync = createAsyncThunk<any, { id: number; formData: FormData }, { rejectValue: string }>(
	"product/addItemImages",
	async ({ id, formData }, { rejectWithValue }) => {
		try {
			const res = await axiosInstance.post(`items/${id}/images`, formData, { headers: { "Content-Type": "multipart/form-data" } });
			return res.data;
		} catch (error: any) {
			return rejectWithValue(extractErrorMessage(error));
		}
	}
);

const deleteItemImageAsync = createAsyncThunk<any, { itemId: number; imageId: number }, { rejectValue: string }>(
	"product/deleteItemImage",
	async ({ itemId, imageId }, { rejectWithValue }) => {
		try {
			const res = await axiosInstance.delete(`items/${itemId}/images/${imageId}`);
			return { ...res.data, itemId, imageId };
		} catch (error: any) {
			return rejectWithValue(extractErrorMessage(error));
		}
	}
);

export const productsAction = {
	fetchAllProducts,
	fetchItemByIdAsync,
	createItemAsync,
	updateItemAsync,
	deleteItemAsync,
	addItemImagesAsync,
	deleteItemImageAsync,
};
