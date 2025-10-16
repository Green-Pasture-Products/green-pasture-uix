import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AuthState } from "@/types";
// import {
// 	getCurrentUserAsync,
// 	loginAsync,
// 	logoutAsync,
// 	signupAsync,
// } from "../actions/auth.action";
import { handleApiError } from "@/_utils";
import axiosInstance from "@/_utils/axiosInstance";
import toast from "react-hot-toast";

const initialState: AuthState = {
	user: null,
	isAuthenticated: false,
	isLoading: false,
	error: null,
};

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

const signupAsync = createAsyncThunk(
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

const loginAsync = createAsyncThunk(
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

const logoutAsync = createAsyncThunk(
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

const getCurrentUserAsync = createAsyncThunk(
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

const authSlice = createSlice({
	name: "auth",
	initialState,
	reducers: {
		clearError: (state) => {
			state.error = null;
		},
		setLoading: (state, action: PayloadAction<boolean>) => {
			state.isLoading = action.payload;
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(loginAsync.pending, (state) => {
				state.isLoading = true;
				state.error = null;
			})
			.addCase(loginAsync.fulfilled, (state, action: PayloadAction<any>) => {
				state.isLoading = false;
				state.user = action.payload?.data?.profileInfo;
				state.isAuthenticated = true;
				state.error = null;
			})
			.addCase(loginAsync.rejected, (state, action) => {
				state.isLoading = false;
				state.error = action.payload as string;
				state.isAuthenticated = false;
			});

		builder
			.addCase(logoutAsync.pending, (state) => {
				state.isLoading = true;
				state.error = null;
			})
			.addCase(
				logoutAsync.fulfilled,
				(state, action: PayloadAction<any>) => {
					state.isLoading = false;
					state.user = null;
					state.isAuthenticated = false;
					state.error = null;
				}
			)
			.addCase(logoutAsync.rejected, (state, action) => {
				state.isLoading = false;
				state.error = action.payload as string;
				state.isAuthenticated = false;
			});

		builder
			.addCase(getCurrentUserAsync.pending, (state) => {
				state.isLoading = true;
				state.error = null;
			})
			.addCase(
				getCurrentUserAsync.fulfilled,
				(state, action: PayloadAction<any>) => {
					state.isLoading = false;
					state.user = action.payload?.data?.profileInfo;
					state.isAuthenticated = true;
					state.error = null;
				}
			)
			.addCase(getCurrentUserAsync.rejected, (state, action) => {
				state.isLoading = false;
				state.error = action.payload as string;
				state.isAuthenticated = false;
			});

		builder
			.addCase(signupAsync.pending, (state) => {
				state.isLoading = true;
				state.error = null;
			})
			.addCase(signupAsync.fulfilled, (state) => {
				state.isLoading = false;
				state.error = null;
			})
			.addCase(signupAsync.rejected, (state, action) => {
				state.isLoading = false;
				state.error = action.payload as string;
			});
	},
});

export const { clearError, setLoading } = authSlice.actions;
export default authSlice.reducer;
