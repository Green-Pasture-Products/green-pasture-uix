import { Product } from "@/types";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { mockProducts } from "../mockData";

const fetchAllProducts = createAsyncThunk<Product[]>(
	"product/fetchAll",
	async (_, { rejectWithValue }) => {
		try {
			const response = await fetch("/api/products", {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
				},
			});

			if (!response.ok) {
				// Fallback to mockData if backend fails
				console.warn(
					"Backend unavailable, using fallback mock data",
					response.status
				);
				return mockProducts;
			}

			const data = await response.json();
			// Ensure we return an array
			return Array.isArray(data) ? data : data.products || mockProducts;
		} catch (error) {
			console.error("Error fetching products:", error);
			// Fallback to mockData on network error
			return mockProducts;
		}
	}
);

// export const createUser = async (userData: any) => {
// 	const response = await axiosInstance.post("/users", userData);
// 	return response.data;
// };

export const productsAction = {
	fetchAllProducts,
};
