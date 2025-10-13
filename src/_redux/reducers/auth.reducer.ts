import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AuthState } from "@/types";
import {
	getCurrentUserAsync,
	loginAsync,
	logoutAsync,
	signupAsync,
} from "../actions/auth.action";

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
		clearError: (state) => {
			state.error = null;
		},
		setLoading: (state, action: PayloadAction<boolean>) => {
			state.isLoading = action.payload;
		},
		getCurrentUser: (state) => {
			state.isLoading = false;
			state.user;
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
				// setObjectInStorage(authConstants.USER_KEY, {
				// 	user: action.payload?.data?.profileInfo,
				// 	accessToken: action.payload?.data?.accessToken,
				// 	refreshToken: action.payload?.data?.refreshToken,
				// });
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
