import axios from "axios";
import { InternalAxiosRequestConfig, AxiosError } from "axios";

import {
	getAccessToken,
	getRefreshToken,
	removeAccessExpiryCookie,
	removeAccessToken,
	removeRefreshToken,
	setAccessToken,
	setRefreshToken,
} from "./storage";
import { logout } from "@/_redux/reducers/auth.reducer";
import { appConstants, authConstants } from "@/_redux/constants";
import { store } from "@/_redux/store";
import { logger } from "./logger";
import { clearObjectFromStorage } from "./helpers";

let cachedIpInfo: any = null;

// Fetch IP info only once and cache it (UNCHANGED)
async function getIpInfo(): Promise<any> {
	if (cachedIpInfo) return cachedIpInfo;

	try {
		const response = await fetch("/api/ipinfo");
		if (!response.ok) throw new Error("Failed to fetch IP info");

		const data = await response.json();
		logger.log({ country: data });
		cachedIpInfo = data?.country || "Unknown";

		return cachedIpInfo;
	} catch (error) {
		logger.error("IPInfo fetch error:", error);
		return null;
	}
}

// Create Axios instance
const axiosInstance = axios.create({
	baseURL: appConstants.API_BASE_URL,
	headers: {
		"Content-Type": "application/json",
	},
});

// list of URL substrings (or full paths) for which you NEVER want to auto-redirect
const NO_REDIRECT_PATHS = [
	"/login",
	"/setup-password",
	"/forgot-password",
	"/sign-up",
	"view-email",
	"verify-email",
];

axiosInstance.interceptors.request.use(
	async (
		config: InternalAxiosRequestConfig
	): Promise<InternalAxiosRequestConfig> => {
		try {
			const ipInfo = await getIpInfo();
			const accessToken = await getAccessToken();

			config.params = { ...config.params, country: ipInfo?.country };

			if (accessToken) {
				config.headers.Authorization = `Bearer ${accessToken}`;
			}

			return config;
		} catch (error) {
			logger.warn("Failed to get IP info:", error);
			return config;
		}
	},
	(error: AxiosError) => {
		return Promise.reject(error);
	}
);

axiosInstance.interceptors.response.use(
	(response) => {
		return response;
	},
	async (error) => {
		const status = error.response?.status;
		const currentPath = window.location.pathname;

		const isExcludedPath = NO_REDIRECT_PATHS.some((path) =>
			currentPath.includes(path)
		);

		const originalRequest = error.config;

		// If access token expired
		if (status === 401 && !originalRequest._retry && !isExcludedPath) {
			originalRequest._retry = true;

			try {
				const refreshToken = await getRefreshToken();

				const { data } = await axios.post(
					`${appConstants.API_BASE_URL}auth/refresh`,
					{
						refreshToken: `Bearer ${refreshToken}`,
						// userId: user?.id,
						// email: user?.email,
					}
				);

				logger.log({
					accessToken: data?.accessToken,
					refreshToken: data?.refreshToken,
				});

				// Save new access & refresh tokens
				setAccessToken(data?.accessToken);
				setRefreshToken(data?.refreshToken);

				// Retry the original request with the new token
				originalRequest.headers.Authorization = `Bearer ${data?.accessToken}`;
				return axiosInstance(originalRequest);
			} catch (err) {
				// Refresh token invalid — force logout
				logger.error("Token refresh failed", err);

				store.dispatch(logout());
				removeAccessExpiryCookie();
				removeAccessToken();
				removeRefreshToken();
				clearObjectFromStorage(authConstants.USER_KEY);

				window.location.href = "/login";
				return Promise.reject(error);
			}
		}

		return Promise.reject(error);
	}
);

export default axiosInstance;
