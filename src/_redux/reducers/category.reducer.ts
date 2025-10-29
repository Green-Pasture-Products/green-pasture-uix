import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
	createCategoryAsync,
	deleteCategoryAsync,
	getAllCategoriesAsync,
	updateCategoryAsync,
} from "../actions/category.action";
import { CategoryState } from "@/types";
import { categoryConstants } from "../constants/categories.constant";
import { AppEmitter, logger } from "@/_utils";

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
					// Add the new category to the categories array
					if (action.payload?.data) {
						state.categories.unshift(action.payload.data);
					}
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
			.addCase(updateCategoryAsync.pending, (state) => {
				state.isLoading = true;
				state.error = null;
			})
			.addCase(
				updateCategoryAsync.fulfilled,
				(state, action: PayloadAction<any>) => {
					state.isLoading = false;
					const updatedCategory = action.payload?.data;

					if (updatedCategory) {
						// Find and update the category in the categories array
						const index = state.categories.findIndex(
							(cat) => cat.id === updatedCategory.id
						);

						if (index !== -1) {
							// Update the category at the found index
							state.categories[index] = {
								...state.categories[index],
								...updatedCategory,
							};
						}

						// Also update the single category if it matches
						if (state.category?.id === updatedCategory.id) {
							state.category = {
								...state.category,
								...updatedCategory,
							};
						}
					}
					state.error = null;
					AppEmitter.emit(
						categoryConstants.CREATE_CATEGORY_SUCCESS,
						action.payload?.data
					);
				}
			)
			.addCase(updateCategoryAsync.rejected, (state, action) => {
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
					state.error = null;
				}
			)
			.addCase(getAllCategoriesAsync.rejected, (state, action) => {
				state.isLoading = false;
				state.error = action.payload as any;
			});

		builder
			.addCase(deleteCategoryAsync.pending, (state) => {
				state.isLoading = true;
				state.error = null;
			})
			.addCase(
				deleteCategoryAsync.fulfilled,
				(state, action: PayloadAction<any>) => {
					state.isLoading = false;
					const deletedCategoryId = action.payload;
					state.categories = state.categories.filter(
						(category) => category.id !== deletedCategoryId
					);

					if (state.category?.id === deletedCategoryId) {
						state.category = null;
					}
					state.error = null;
					AppEmitter.emit(
						categoryConstants.DELETE_CATEGORY_SUCCESS,
						action.payload?.data
					);
				}
			)
			.addCase(deleteCategoryAsync.rejected, (state, action) => {
				state.isLoading = false;
				state.error = action.payload as any;
			});
	},
});

// export const { logout, clearError, setLoading } = categorySlice.actions;
export default categorySlice.reducer;
