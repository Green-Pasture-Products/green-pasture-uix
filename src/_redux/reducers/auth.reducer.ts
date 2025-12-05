import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AuthState, User } from "@/types";
import { loginAsync, signupAsync } from "../actions/auth.action";
import { authConstants } from "../constants";
import { clearObjectFromStorage, logger, setObjectInStorage } from "@/_utils";

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
		logout: (state) => {
			state.user = null;
			state.isAuthenticated = false;
			state.error = null;
			state.isLoading = false;
			clearObjectFromStorage(authConstants.USER_KEY);
		},
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
				// save token for future API calls
				setObjectInStorage(authConstants.USER_KEY, {
					user: action.payload?.data?.profileInfo,
					accessToken: action.payload?.data?.accessToken,
					refreshToken: action.payload?.data?.refreshToken,
				});
			})
			.addCase(loginAsync.rejected, (state, action) => {
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

export const { logout, clearError, setLoading } = authSlice.actions;
export default authSlice.reducer;
