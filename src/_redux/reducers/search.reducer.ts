import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface SearchFilters {
	category: string;
	priceRange: [number, number];
	inStockOnly: boolean;
	organicOnly: boolean;
	rating: number;
	sortBy: "name" | "price-low" | "price-high" | "rating" | "newest";
}

interface SearchState {
	query: string;
	filters: SearchFilters;
	recentSearches: string[];
	suggestions: string[];
}

const initialState: SearchState = {
	query: "",
	filters: {
		category: "All",
		priceRange: [0, 100],
		inStockOnly: false,
		organicOnly: false,
		rating: 0,
		sortBy: "name",
	},
	recentSearches: [],
	suggestions: [],
};

const searchSlice = createSlice({
	name: "search",
	initialState,
	reducers: {
		setSearchQuery: (state, action: PayloadAction<string>) => {
			state.query = action.payload;
		},
		setSearchFilters: (
			state,
			action: PayloadAction<Partial<SearchFilters>>
		) => {
			state.filters = { ...state.filters, ...action.payload };
		},
		addRecentSearch: (state, action: PayloadAction<string>) => {
			const query = action.payload.trim();
			if (query && !state?.recentSearches?.includes(query)) {
				state.recentSearches = [
					query,
					...(state?.recentSearches?.slice(0, 4) || []),
				];
			}
		},
		clearRecentSearches: (state) => {
			state.recentSearches = [];
		},
		setSuggestions: (state, action: PayloadAction<string[]>) => {
			state.suggestions = action.payload;
		},
		resetFilters: (state) => {
			state.filters = initialState.filters;
		},
	},
});

export const {
	setSearchQuery,
	setSearchFilters,
	addRecentSearch,
	clearRecentSearches,
	setSuggestions,
	resetFilters,
} = searchSlice.actions;

export default searchSlice.reducer;
