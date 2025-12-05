import {ProductCategory} from "@/types"
import {createAsyncThunk} from "@reduxjs/toolkit";
import { appConstants } from "../constants/app.constant";

const fetchAllCategories = createAsyncThunk<ProductCategory[]>(
    "product/fetchAll",
    async () => {
         const response = await fetch(`${appConstants.API_BASE_URL}`);
         const res = await response.json();
         return res.products;
    }
);

export const categoriesAction = {
	fetchAllCategories,
};