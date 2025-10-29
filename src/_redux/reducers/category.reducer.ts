import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
	createCategoryAsync,
	getAllCategoriesAsync,
} from "../actions/category.action";
import { CategoryState } from "@/types";
import { categoryConstants } from "../constants/categories.constant";
import { AppEmitter } from "@/_utils";

const initialState: CategoryState = {
	category: null,
	categories: [],
	pagination: null,
	isLoading: false,
	error: null,
};

const categorySlice = createSlice({
	name: "category",
	initialState,
	reducers: {},
	extraReducers: (builder) => {
		builder
			.addCase(createCategoryAsync.pending, (state) => {
				state.isLoading = true;
				state.error = null;
			})
			.addCase(
				createCategoryAsync.fulfilled,
				(state, action: PayloadAction<any>) => {
					state.isLoading = false;
					state.category = action.payload?.data;
					state.error = null;
					AppEmitter.emit(
						categoryConstants.CREATE_CATEGORY_SUCCESS,
						action.payload?.data
					);
				}
			)
			.addCase(createCategoryAsync.rejected, (state, action) => {
				state.isLoading = false;
				state.error = action.payload as any;
			});

		builder
			.addCase(getAllCategoriesAsync.pending, (state) => {
				state.isLoading = true;
				state.error = null;
			})
			.addCase(
				getAllCategoriesAsync.fulfilled,
				(state, action: PayloadAction<any>) => {
					state.isLoading = false;
					state.categories = action.payload?.data?.items ?? [];
					state.pagination = action.payload?.data?.meta;
					state.error = null;
				}
			)
			.addCase(getAllCategoriesAsync.rejected, (state, action) => {
				state.isLoading = false;
				state.error = action.payload as any;
			});
	},
});

// export const { logout, clearError, setLoading } = categorySlice.actions;
export default categorySlice.reducer;
