import axios, { AxiosInstance, InternalAxiosRequestConfig } from "axios";

let cachedIpInfo: any = null;

// Fetch IP info only once and cache it
async function getIpInfo(): Promise<any> {
	if (cachedIpInfo) return cachedIpInfo;

	try {
		const response = await fetch("/api/ipinfo");
		if (!response.ok) throw new Error("Failed to fetch IP info");

		const data = await response.json();
		cachedIpInfo = data?.country || "Unknown";

		return cachedIpInfo;
	} catch (error) {
		console.error("IPInfo fetch error:", error);
		return null;
	}
}

// Create Axios instance
const axiosInstance: AxiosInstance = axios.create({
	baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
	headers: {
		"Content-Type": "application/json",
		// Authorization: `Bearer 1`,
	},
});

// ✅ Correctly type the interceptor for Axios v1+
axiosInstance.interceptors.request.use(
	async (
		config: InternalAxiosRequestConfig
	): Promise<InternalAxiosRequestConfig> => {
		const ipInfo = await getIpInfo();

		if (config.method?.toLowerCase() === "get") {
			config.params = { ...config.params, country: ipInfo?.country };
		} else {
			config.data = { ...(config.data || {}), country: ipInfo?.country };
		}

		return config;
	},
	(error) => Promise.reject(error)
);

// Handle API errors globally
axiosInstance.interceptors.response.use(
	(response) => response,
	(error) => {
		console.error("API Error:", error.response || error.message);
		return Promise.reject(error);
	}
);

export default axiosInstance;
