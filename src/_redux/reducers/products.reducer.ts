import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { productsAction } from "../actions";
import { Product, ProductsState } from "@/types";
import { categories } from "../constants/categories.constant";

const initialState: ProductsState = {
	isFetchingAllProducts: false,
	isFetchingProduct: false,
	products: [], // items from /api/items
	categoryProducts: [], // categories from /api/products
	product: null,
	categories: categories.ALL_CATEGORIES,
	selectedCategory: "All",
	searchTerm: "",
};

const productsSlice = createSlice({
	name: "product",
	initialState,
	reducers: {
		addProduct: (state, action: PayloadAction<Product>) => {
			state.products.unshift(action.payload);
		},
		updateProduct: (state, action: PayloadAction<Product>) => {
  console.log("updating product:", action.payload.id, typeof action.payload.id);
  console.log("products ids:", state.products.map(p => `${p.id} (${typeof p.id})`));
  
  const index = state.products.findIndex(
    p => String(p.id) === String(action.payload.id)
  );
  
  console.log("found index:", index);
  
  if (index !== -1) {
    state.products[index] = action.payload;
  }
},
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
			})
			.addCase(productsAction.fetchAllCategories.fulfilled,
  				(state, action: PayloadAction<Product[]>) => {
   				state.categoryProducts = action.payload.filter(p => p != null); // ✅ filter nulls
  }
);
	},
});

export const { addProduct, updateProduct, setSelectedCategory, setSearchTerm } = productsSlice.actions;

export default productsSlice.reducer;
