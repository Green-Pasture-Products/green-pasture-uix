import { createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance, { handleApiError } from "@/_utils/axiosInstance";
import toast from "react-hot-toast";

interface Address {
	latitude: string;
	longitude: string;
	houseAddress: string;
	state: string;
	city: string;
	postalCode: string;
}

interface User {
	firstName: string;
	lastName: string;
	email: string;
	password: string;
	phoneNumber?: string;
	role?: "CLIENT" | "ADMIN" | "OTHER";
	address?: Address;
}

export const signupAsync = createAsyncThunk(
	"auth/signupAsync",
	async (user: User, { rejectWithValue }) => {
		try {
			const response = await axiosInstance.post(`auth/signup`, user);
			return response.data;
		} catch (error: any) {
			const message =
				error.response?.data?.message || error.message || "Signup failed";
			return rejectWithValue(message);
		}
	}
);

export const loginAsync = createAsyncThunk(
	"auth/loginAsync",
	async (user: { email: string; password: string }, { rejectWithValue }) => {
		try {
			const response = await axiosInstance.post(`auth/login`, user);
			return response.data;
		} catch (error: any) {
			const message = handleApiError(error);
			toast.error(message);
			return rejectWithValue(message);
		}
	}
);

export const logoutAsync = createAsyncThunk(
	"auth/logoutAsync",
	async (data, { rejectWithValue }) => {
		try {
			const response = await axiosInstance.post(`auth/logout`);
			return response.data;
		} catch (error: any) {
			const message = handleApiError(error);
			toast.error(message);
			return rejectWithValue(message);
		}
	}
);

export const getCurrentUserAsync = createAsyncThunk(
	"auth/getCurrentUserAsync",
	async (_, { rejectWithValue }) => {
		try {
			const response = await axiosInstance.get("auth/me");
			return response.data;
		} catch (error: any) {
			return rejectWithValue("Failed to get user");
		}
	}
);
