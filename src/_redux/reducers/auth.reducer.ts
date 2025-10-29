import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AuthState } from "@/types";
import { loginAsync, logoutAsync, signupAsync } from "../actions/auth.action";
import { authConstants } from "../constants";
import { clearObjectFromStorage, setObjectInStorage } from "@/_utils";
import {
	removeAccessExpiryCookie,
	removeAccessToken,
	removeRefreshToken,
	setAccessToken,
	setRefreshToken,
	// setBearerCookie,
} from "@/_utils/storage";
import { persistor } from "../store";

const initialState: AuthState = {
	user: null,
	isAuthenticated: false,
	isLoading: false,
	error: null,
	accessToken: "",
	refreshToken: "",
};

const authSlice = createSlice({
	name: "auth",
	initialState,
	reducers: {
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
				setAccessToken(action.payload?.data?.accessToken);
				setRefreshToken(action.payload?.data?.refreshToken);
				setObjectInStorage(
					authConstants.USER_KEY,
					action.payload?.data?.profileInfo
				);
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
			.addCase(logoutAsync.fulfilled, (state) => {
				state.isLoading = false;
				state.error = null;
			})
			.addCase(logoutAsync.rejected, (state, action) => {
				state.isLoading = false;
				state.error = action.payload as string;
				state.isAuthenticated = false;
			});

		builder
			.addCase(signupAsync.pending, (state) => {
				state.isLoading = true;
				state.error = null;
			})
			.addCase(
				signupAsync.fulfilled,
				(state, action: PayloadAction<any>) => {
					state.isLoading = false;
					state.error = null;
					if (action.payload?.data?.accessToken) {
						state.accessToken = action.payload.data.accessToken;
						state.refreshToken = action.payload.data.refreshToken;
						state.user = action.payload.data.profileInfo;
						state.isAuthenticated = true;
					}
				}
			)
			.addCase(signupAsync.rejected, (state, action) => {
				state.isLoading = false;
				state.error = action.payload as string;
			});
	},
});

export const { logout, clearError, setLoading } = authSlice.actions;
export default authSlice.reducer;
