import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { productsAction } from "../actions";
import { Product, ProductsState } from "@/types";
import { categoryAction } from "../actions/category.action";

const initialState: ProductsState = {
	isFetchingAllProducts: false,
	isFetchingProduct: false,
	products: [],
	product: null,
	categories: ["All"],
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

					// Derive categories from product data
					const productCategories = new Set<string>();
					action.payload.forEach((p: any) => {
						const catName = p.product?.name || p.category;
						if (catName) productCategories.add(catName);
					});
					state.categories = [
						"All",
						...Array.from(productCategories).sort(),
					];
				}
			)
			.addCase(productsAction.fetchAllProducts.rejected, (state) => {
				state.isFetchingAllProducts = false;
			})
			// Fetch Item By Id
			.addCase(
				productsAction.fetchItemByIdAsync.fulfilled,
				(state, action) => {
					state.product = action.payload?.data ?? null;
				}
			)
			// Delete Item
			.addCase(
				productsAction.deleteItemAsync.fulfilled,
				(state, action) => {
					const deletedId = action.payload.itemId;
					state.products = state.products.filter(
						(p) => String(p.id) !== String(deletedId)
					);
				}
			)
			// Also populate categories from the category API
			.addCase(
				categoryAction.fetchAllCategories.fulfilled,
				(state, action: PayloadAction<any>) => {
					const items = action.payload?.items ?? [];
					if (items.length > 0) {
						const names = items.map((c: any) => c.name);
						state.categories = [
							"All",
							...names.sort(),
						];
					}
				}
			);
	},
});

export const { setSelectedCategory, setSearchTerm } = productsSlice.actions;

export default productsSlice.reducer;
