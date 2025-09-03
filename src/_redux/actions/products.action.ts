import { Product } from "@/types";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { mockProducts } from "../mockData";

const fetchAllProducts = createAsyncThunk<Product[]>(
	"product/fetchAll",
	async () => {
		// const response = await fetch(`${appConstants.API_BASE_URL}`);
		// const response = await fetch("https://dummyjson.com/products");
		// const res = await response.json();
		// return res.products;
		return await mockProducts;
	}
);

// export const createUser = async (userData: any) => {
// 	const response = await axiosInstance.post("/users", userData);
// 	return response.data;
// };

export const productsAction = {
	fetchAllProducts,
};
