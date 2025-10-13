import { logger } from "@/_utils";
import { createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance, { handleApiError } from "@/_utils/axiosInstance";

export const getAllStaff = createAsyncThunk(
	"user/getAllStaff",
	async (_, { rejectWithValue }) => {
		try {
			const response = await axiosInstance.get(`staff`);
			return response.data;
		} catch (error: any) {
			const message = handleApiError(error);
			logger.log({ getAllStaffError: message });
			return rejectWithValue(message);
		}
	}
);

export const updateStaff = createAsyncThunk(
	"user/updateStaff",
	async (staffData: any, { rejectWithValue }) => {
		try {
			const response = await axiosInstance.post("staff", staffData);
			return response.data;
		} catch (error: any) {
			const message = handleApiError(error);
			return rejectWithValue(message);
		}
	}
);
