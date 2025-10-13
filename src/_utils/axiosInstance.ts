import { appConstants } from "@/_redux/constants";
import axios, {
	AxiosError,
	AxiosInstance,
	AxiosResponse,
	InternalAxiosRequestConfig,
} from "axios";
import { logger } from "./logger";
import { store } from "@/_redux/store";
import toast from "react-hot-toast";
import { logoutAsync } from "@/_redux/actions/auth.action";

// This should return empty (HttpOnly protection working)
logger.log(document.cookie);

// Cache IP info to avoid repeated API calls
let cachedIpInfo: any = null;

/**
 * Fetch IP info once and cache it
 */
async function getIpInfo(): Promise<any> {
	if (cachedIpInfo) return cachedIpInfo;

	try {
		const response = await fetch("/api/ipinfo");
		if (!response.ok) throw new Error("Failed to fetch IP info");

		const data = await response.json();
		logger.log({ getIpInfo: data });
		cachedIpInfo = data?.country || "Unknown";

		return cachedIpInfo;
	} catch (error) {
		logger.error("IPInfo fetch error:", error);
		return { country: "Unknown" };
	}
}

/**
 * Create Axios instance with cookie-based authentication
 * ✅ NO token management needed - cookies are automatic!
 */
const axiosInstance: AxiosInstance = axios.create({
	baseURL: appConstants.API_BASE_URL,
	headers: {
		"Content-Type": "application/json",
	},
	withCredentials: true, // ✅ CRITICAL: This sends HttpOnly cookies with every request
	timeout: 30000, // 30 second timeout
});

/**
 * Track refresh state to prevent duplicate refresh requests
 */
let isRefreshing = false;
let failedQueue: Array<{
	resolve: (value?: any) => void;
	reject: (reason?: any) => void;
}> = [];

/**
 * Process queued requests after token refresh
 */
const processQueue = (error: any = null) => {
	failedQueue.forEach((promise) => {
		if (error) {
			promise.reject(error);
		} else {
			promise.resolve();
		}
	});
	failedQueue = [];
};

/**
 * REQUEST INTERCEPTOR
 * ✅ Simplified - no token management needed!
 * Just add country info to requests
 */
axiosInstance.interceptors.request.use(
	async (
		config: InternalAxiosRequestConfig
	): Promise<InternalAxiosRequestConfig> => {
		try {
			// Add IP/country information to requests
			const ipInfo = await getIpInfo();

			if (config.method?.toLowerCase() === "get") {
				// Add to query params for GET requests
				config.params = {
					...config.params,
					country: ipInfo?.country || "Unknown",
				};
			} else {
				// Add to request body for POST/PUT/PATCH requests
				config.data = {
					...(config.data || {}),
					country: ipInfo?.country || "Unknown",
				};
			}

			// Log request (for debugging - remove in production)
			logger.log({
				request: {
					method: config.method?.toUpperCase(),
					url: config.url,
					withCredentials: config.withCredentials,
				},
			});

			return config;
		} catch (error) {
			logger.warn("Request interceptor error:", error);
			return config; // Continue even if IP info fails
		}
	},
	(error: AxiosError) => {
		logger.log({ requestInterceptorError: error.message });
		return Promise.reject(error);
	}
);

/**
 * RESPONSE INTERCEPTOR
 * ✅ Handles automatic token refresh via cookies
 * ✅ Queues failed requests and retries after refresh
 */
axiosInstance.interceptors.response.use(
	(response: AxiosResponse) => {
		// Log successful response (for debugging - remove in production)
		logger.log({
			response: {
				status: response.status,
				url: response.config.url,
			},
		});
		return response;
	},
	async (error: AxiosError) => {
		const originalRequest = error.config as InternalAxiosRequestConfig & {
			_retry?: boolean;
		};

		// Log error (for debugging)
		logger.log({
			responseError: {
				status: error.response?.status,
				url: originalRequest?.url,
				message: error.message,
			},
		});

		// Handle 401 Unauthorized - token expired or invalid
		if (
			error.response?.status === 401 &&
			originalRequest &&
			!originalRequest._retry
		) {
			// If already refreshing, queue this request
			if (isRefreshing) {
				return new Promise((resolve, reject) => {
					failedQueue.push({ resolve, reject });
				})
					.then(() => {
						return axiosInstance(originalRequest);
					})
					.catch((err) => {
						return Promise.reject(err);
					});
			}

			// Mark request as retried to prevent infinite loops
			originalRequest._retry = true;
			isRefreshing = true;

			try {
				logger.log({ refreshAttempt: "Starting token refresh" });

				// ✅ Call refresh endpoint
				// Backend reads refreshToken from HttpOnly cookie
				// Backend sets new accessToken and refreshToken as cookies
				// NO tokens in request or response body!
				await axios.post(
					`${appConstants.API_BASE_URL}auth/refresh`,
					{}, // Empty body
					{
						withCredentials: true, // ✅ Send cookies (including refreshToken)
					}
				);

				logger.log({ refreshSuccess: "Token refreshed successfully" });

				// Reset refresh state
				isRefreshing = false;

				// Process queued requests
				processQueue(null);

				// Retry the original request
				// New accessToken cookie will be sent automatically
				return axiosInstance(originalRequest);
			} catch (refreshError: any) {
				// Refresh failed - user needs to login again
				isRefreshing = false;
				processQueue(refreshError);

				logger.log({
					refreshError:
						refreshError.response?.data?.message ||
						"Token refresh failed",
				});

				// Dispatch logout action
				store.dispatch(logoutAsync());

				// Show error message to user
				toast.error("Session expired. Please login again.");

				// Redirect to login page
				if (typeof window !== "undefined") {
					window.location.href = `/login?redirect=${window.location.pathname}`;
				}

				return Promise.reject(refreshError);
			}
		}

		// Handle 403 Forbidden - user doesn't have permission
		if (error.response?.status === 403) {
			toast.error("You don't have permission to perform this action");
			logger.log({
				forbiddenError: {
					url: originalRequest?.url,
					message: error.response?.data || "Access forbidden",
				},
			});
		}

		// Handle 404 Not Found
		if (error.response?.status === 404) {
			logger.log({
				notFoundError: {
					url: originalRequest?.url,
					message: "Resource not found",
				},
			});
		}

		// Handle 500 Internal Server Error
		if (error.response?.status === 500) {
			toast.error("Server error. Please try again later.");
			logger.log({
				serverError: {
					url: originalRequest?.url,
					message: error.response?.data || "Internal server error",
				},
			});
		}

		// Handle network errors
		if (!error.response) {
			toast.error("Network error. Please check your connection.");
			logger.log({
				networkError: {
					message: "No response from server",
					url: originalRequest?.url,
				},
			});
		}

		return Promise.reject(error);
	}
);

/**
 * Helper function to handle API errors consistently
 */
export const handleApiError = (error: any): string => {
	if (error.response) {
		// Server responded with error status
		const message =
			error.response.data?.message ||
			error.response.data?.error ||
			error.message ||
			"An error occurred";
		return message;
	} else if (error.request) {
		// Request made but no response received
		return "No response from server. Please check your connection.";
	} else {
		// Something else happened
		return error.message || "An unexpected error occurred";
	}
};

export default axiosInstance;
