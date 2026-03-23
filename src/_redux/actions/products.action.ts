import { Product } from "@/types";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { secureTokenStorage } from "@/_utils/secureStorage";

const fetchAllProducts = createAsyncThunk<Product[]>(
  "product/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      // Get access token from secure storage
      let tokenData = secureTokenStorage.getTokens();
      let accessToken = tokenData?.accessToken ?? undefined;
      console.log("Token before fetch:", accessToken);

      if (!accessToken) {
        accessToken = (await secureTokenStorage.refreshAccessToken()) ?? undefined;
        if (!accessToken) return rejectWithValue("No access token found");
      }

      let response = await fetch("/api/items", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // If 401, try refreshing token once and retry
      if (response.status === 401) {
        accessToken = (await secureTokenStorage.refreshAccessToken()) ?? undefined;
        if (!accessToken) return rejectWithValue("Session expired. Please log in again.");

        response = await fetch("/api/items", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        });
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Backend error: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      // Ensure we return an array
      console.log("Products API response:", data);
      return data?.data?.items || [];
      //return Array.isArray(data) ? data : data?.data?.items || data?.data || data?.products || [];
      //return Array.isArray(data) ? data : data.products || [];
    } catch (error) {
      console.error("Error fetching products:", error);
      // Only return empty array on error
      return [];
    }
  }
);

const fetchAllCategories = createAsyncThunk<Product[]>(
  "product/fetchAllCategories",
  async (_, { rejectWithValue }) => {
    try {
      let tokenData = secureTokenStorage.getTokens();
      let accessToken: string | undefined = tokenData?.accessToken || undefined;

      if (!accessToken) {
        accessToken = (await secureTokenStorage.refreshAccessToken()) || undefined;
        if (!accessToken) return rejectWithValue("Not authenticated");
      }

      const response = await fetch("/api/products", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) return rejectWithValue("Failed to fetch categories");

      const data = await response.json();
      return data?.data?.items || [];
    } catch (error) {
      return rejectWithValue("Failed to fetch categories");
    }
  }
);

// export const createUser = async (userData: any) => {
// 	const response = await axiosInstance.post("/users", userData);
// 	return response.data;
// };

export const productsAction = {
	fetchAllProducts,
  fetchAllCategories,
};
