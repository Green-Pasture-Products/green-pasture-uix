import { AuthState, User } from "@/types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState: AuthState = {
	user: null,
	isAuthenticated: false,
	isLoading: false,
	error: null,
};

const authSlice = createSlice({
	name: "auth",
	initialState,
	reducers: {
		loginStart: (state) => {
			state.isLoading = true;
			state.error = null;
		},
		loginSuccess: (state, action: PayloadAction<User>) => {
			state.isLoading = false;
			state.user = action.payload;
			state.isAuthenticated = true;
			state.error = null;
		},
		loginFailure: (state, action: PayloadAction<string>) => {
			state.isLoading = false;
			state.user = null;
			state.isAuthenticated = false;
			state.error = action.payload;
		},
		signupStart: (state) => {
			state.isLoading = true;
			state.error = null;
		},
		signupSuccess: (state) => {
			state.isLoading = false;
			state.error = null;
		},
		signupFailure: (state, action: PayloadAction<string>) => {
			state.isLoading = false;
			state.error = action.payload;
		},
		logout: (state) => {
			state.user = null;
			state.isAuthenticated = false;
			state.error = null;
		},
		clearError: (state) => {
			state.error = null;
		},
		setLoading: (state, action: PayloadAction<boolean>) => {
			state.isLoading = action.payload;
		},
	},
});

export const {
	loginStart,
	loginSuccess,
	loginFailure,
	signupStart,
	signupSuccess,
	signupFailure,
	logout,
	clearError,
	setLoading,
} = authSlice.actions;

export default authSlice.reducer;
