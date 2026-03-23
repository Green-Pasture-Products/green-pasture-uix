import { createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "@/_utils/axiosInstance";
import { extractErrorMessage, buildPaginationParams } from "@/_utils/apiHelpers";

const fetchOrdersAsync = createAsyncThunk<any, { page?: number; limit?: number; search?: string; filter?: string }, { rejectValue: string }>(
	"admin/fetchOrders",
	async ({ page = 1, limit = 10, search, filter } = {}, { rejectWithValue }) => {
		try {
			const params = buildPaginationParams(page, limit, search, filter);
			const response = await axiosInstance.get(`order?${params}`);
			return response.data;
		} catch (error: any) {
			return rejectWithValue(extractErrorMessage(error));
		}
	}
);

const cancelOrderAsync = createAsyncThunk<any, number, { rejectValue: string }>(
	"admin/cancelOrder",
	async (orderId, { rejectWithValue }) => {
		try {
			const response = await axiosInstance.patch(`order/cancel/${orderId}`);
			return { ...response.data, orderId };
		} catch (error: any) {
			return rejectWithValue(extractErrorMessage(error));
		}
	}
);

const fetchCustomersAsync = createAsyncThunk<any, { page?: number; limit?: number; search?: string; filter?: string }, { rejectValue: string }>(
	"admin/fetchCustomers",
	async ({ page = 1, limit = 10, search, filter } = {}, { rejectWithValue }) => {
		try {
			const params = buildPaginationParams(page, limit, search, filter);
			const response = await axiosInstance.get(`customers?${params}`);
			return response.data;
		} catch (error: any) {
			return rejectWithValue(extractErrorMessage(error));
		}
	}
);

const fetchStaffAsync = createAsyncThunk<any, { page?: number; limit?: number; search?: string; filter?: string }, { rejectValue: string }>(
	"admin/fetchStaff",
	async ({ page = 1, limit = 10, search, filter } = {}, { rejectWithValue }) => {
		try {
			const params = buildPaginationParams(page, limit, search, filter);
			const response = await axiosInstance.get(`staff?${params}`);
			return response.data;
		} catch (error: any) {
			return rejectWithValue(extractErrorMessage(error));
		}
	}
);

const updateStaffAsync = createAsyncThunk<any, { id: number; data: any }, { rejectValue: string }>(
	"admin/updateStaff",
	async ({ id, data }, { rejectWithValue }) => {
		try {
			const response = await axiosInstance.patch(`staff/${id}`, data);
			return response.data;
		} catch (error: any) {
			return rejectWithValue(extractErrorMessage(error));
		}
	}
);

export const adminAction = { fetchOrdersAsync, cancelOrderAsync, fetchCustomersAsync, fetchStaffAsync, updateStaffAsync };
