import { Product } from "@/types";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { mockProducts } from "../mockData";
import axiosInstance from "@/_utils/axiosInstance";
import { appConstants } from "../constants";

export const fetchAllProducts = createAsyncThunk<Product[]>(
	"product/fetchAll",
	async (_, { rejectWithValue }) => {
		try {
			// const response = await axiosInstance.post(
			// 	`${appConstants.API_BASE_URL}items`,
			// 	product
			// );
			// return response.data;
			return await mockProducts;
		} catch (error: any) {
			const message =
				error.response?.data?.message || error.message || "Signup failed";
			return rejectWithValue(message);
		}
	}
);

export const addProductAsync = createAsyncThunk(
	"auth/addProductAsync",
	async (product: Product, { rejectWithValue }) => {
		try {
			const response = await axiosInstance.post(
				`${appConstants.API_BASE_URL}items`,
				product
			);
			return response.data;
		} catch (error: any) {
			const message =
				error.response?.data?.message || error.message || "Signup failed";
			return rejectWithValue(message);
		}
	}
);
