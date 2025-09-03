import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { productsAction } from "../actions";
import { Product, ProductsState } from "@/types";
import { mockProducts } from "../mockData";

const initialState: ProductsState = {
	isFetchingAllProducts: false,
	isFetchingProduct: false,
	products: [],
	product: null,

	items: mockProducts,
	categories: ["All", "Fruits", "Vegetables", "Grains", "Pantry"],
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
	extraReducers: (builder) => {
		builder
			.addCase(productsAction.fetchAllProducts.pending, (state) => {
				state.isFetchingAllProducts = true;
			})
			.addCase(
				productsAction.fetchAllProducts.fulfilled,
				(state, action: PayloadAction<Product[]>) => {
					state.products = action.payload;
					state.isFetchingAllProducts = false;
				}
			)
			.addCase(productsAction.fetchAllProducts.rejected, (state) => {
				state.isFetchingAllProducts = false;
			});
	},
});

export const { setSelectedCategory, setSearchTerm } = productsSlice.actions;

export default productsSlice.reducer;
