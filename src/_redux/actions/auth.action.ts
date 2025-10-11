import { createAsyncThunk } from "@reduxjs/toolkit";
import { appConstants } from "../constants";
import axiosInstance from "@/_utils/axiosInstance";

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
			const response = await axiosInstance.post(
				`${appConstants.API_BASE_URL}auth/signup`,
				user
			);
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
			const response = await axiosInstance.post(
				`${appConstants.API_BASE_URL}auth/login`,
				user
			);
			return response.data;
		} catch (error: any) {
			const message =
				error.response?.data?.message || error.message || "Login failed";
			return rejectWithValue(message);
		}
	}
);
