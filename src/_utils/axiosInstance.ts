// _utils/axiosInstance.ts
import { appConstants } from "@/_redux/constants";
import axios, {
	AxiosInstance,
	InternalAxiosRequestConfig,
	AxiosError,
} from "axios";
import Cookies from "js-cookie";
import { authCookies, AUTH_COOKIES } from "./authCookies";
import { logger } from "./logger";

let cachedIpInfo: any = null;
// ✅ CHANGE 2: Add refresh management variables
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

// ✅ CHANGE 3: Add helper functions for refresh queue
const onRefreshed = (token: string) => {
	refreshSubscribers.forEach((callback) => callback(token));
	refreshSubscribers = [];
};

const addRefreshSubscriber = (callback: (token: string) => void) => {
	refreshSubscribers.push(callback);
};

// Fetch IP info only once and cache it (UNCHANGED)
async function getIpInfo(): Promise<any> {
	if (cachedIpInfo) return cachedIpInfo;

	try {
		const response = await fetch(`https://ipinfo.io/json?token=${appConstants.IPINFO_TOKEN}`);
		if (!response.ok) throw new Error("Failed to fetch IP info");

		const data = await response.json();
		logger.log({ country: data });
		cachedIpInfo = data?.country || "Unknown";

		return cachedIpInfo;
	} catch (error) {
		console.error("IPInfo fetch error:", error);
		return null;
	}
}

// Create Axios instance (UNCHANGED)
const axiosInstance: AxiosInstance = axios.create({
	baseURL: appConstants.API_BASE_URL,
	headers: {
		"Content-Type": "application/json",
	},
	timeout: 15000
	// withCredentials: true,
});

// ✅ CHANGE 4: Update request interceptor
axiosInstance.interceptors.request.use(
	async (
		config: InternalAxiosRequestConfig
	): Promise<InternalAxiosRequestConfig> => {
		try {
			//const ipInfo = await getIpInfo();

			//config.params = { ...config.params, country: ipInfo?.country };
			// if (config.method?.toLowerCase() === "get") {
			// } else {
			// 	config.data = { ...(config.data || {}), country: ipInfo?.country };
			// }

			// Get access token from the auth cookie
			const tokenData = authCookies.getTokens();
			const token = tokenData?.accessToken;

			if (token && !config.headers.Authorization) {
				config.headers.Authorization = `Bearer ${token}`;
			}

			return config;
		} catch (error) {
			console.warn("Failed to get IP info:", error);
			return config;
		}
	},
	(error) => Promise.reject(error)
);

// ✅ CHANGE 5: Update response interceptor with token refresh
axiosInstance.interceptors.response.use(
	(response) => response,
	async (error: AxiosError) => {
		const originalRequest: any = error.config;

		// Handle 401 errors (token expired)
		if (error.response?.status === 401 && !originalRequest._retry) {
			// If already refreshing, queue this request
			if (isRefreshing) {
				return new Promise((resolve) => {
					addRefreshSubscriber((token: string) => {
						if (originalRequest.headers) {
							originalRequest.headers.Authorization = `Bearer ${token}`;
						}
						resolve(axiosInstance(originalRequest));
					});
				});
			}

			originalRequest._retry = true;
			isRefreshing = true;

			try {
				// Read the refresh token directly — getTokens() returns null once
				// the access JWT has expired, which is exactly when we refresh.
				const refreshToken = Cookies.get(AUTH_COOKIES.refreshToken);

				if (!refreshToken) {
					throw new Error("No refresh token available");
				}

				// Backend expects refresh token in Authorization header (not body)
				const response = await axios.post(
					`${appConstants.API_BASE_URL}auth/refresh`,
					{},
					{
						headers: {
							Authorization: `Bearer ${refreshToken}`,
						},
					}
				);

				const { accessToken, refreshToken: newRefreshToken } =
					response.data.data;

				// Update tokens in cookies (role cookie is left untouched)
				authCookies.setTokens(accessToken, newRefreshToken || refreshToken);

				// Update the failed request with new token
				if (originalRequest.headers) {
					originalRequest.headers.Authorization = `Bearer ${accessToken}`;
				}

				// Notify all queued requests
				//onRefreshed(accessToken);
				isRefreshing = false;
				onRefreshed(accessToken);


				// Retry the original request
				return axiosInstance(originalRequest);
			} catch (refreshError) {
				isRefreshing = false;
				refreshSubscribers = [];

				// Clear tokens and logout — but DON'T redirect
				// Protected pages handle their own redirect to /login
				authCookies.clearTokens();

				try {
					const { logout } = await import("@/_redux/reducers/auth.reducer");
					const { store } = await import("@/_redux/store");
					store.dispatch(logout());
				} catch {}

				return Promise.reject(refreshError);
			}
		}

		console.error("API Error:", error.response || error.message);
		return Promise.reject(error);
	}
);

export default axiosInstance;
