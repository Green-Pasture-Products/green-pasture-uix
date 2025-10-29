import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { fetchAllProducts } from "../actions";
import { Product, ProductsState } from "@/types";
import { categories } from "../constants/categories.constant";

const initialState: ProductsState = {
	isFetchingAllProducts: false,
	isFetchingProduct: false,
	products: [],
	product: null,
	categories: categories.ALL_CATEGORIES,
	selectedCategory: "All",
	searchTerm: "",
};

const productsSlice = createSlice({
	name: "product",
	initialState,
	reducers: {
		setSelectedCategory: (state, action) => {
			state.selectedCategory = action.payload;
		},
		setSearchTerm: (state, action) => {
			state.searchTerm = action.payload;
		},
	},
	// extraReducers: (builder) => {
	// 	builder
	// 		.addCase(fetchAllProducts.pending, (state) => {
	// 			state.isFetchingAllProducts = true;
	// 		})
	// 		.addCase(
	// 			fetchAllProducts.fulfilled,
	// 			(state, action: PayloadAction<Product[]>) => {
	// 				state.products = action.payload ?? [];
	// 				state.isFetchingAllProducts = false;
	// 			}
	// 		)
	// 		.addCase(fetchAllProducts.rejected, (state) => {
	// 			state.isFetchingAllProducts = false;
	// 		});
	// },
});

export const { setSelectedCategory, setSearchTerm } = productsSlice.actions;

export default productsSlice.reducer;
