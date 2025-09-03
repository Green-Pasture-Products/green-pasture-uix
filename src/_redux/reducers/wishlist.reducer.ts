import { Product } from "@/types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface WishlistState {
	items: Product[];
	wishlistItemCount: number;
}

const initialState: WishlistState = {
	items: [],
	wishlistItemCount: 0,
};

const wishlistSlice = createSlice({
	name: "wishlist",
	initialState,
	reducers: {
		addToWishlist: (state, action: PayloadAction<Product>) => {
			const existingItem = state.items.find(
				(item) => item.id === action.payload.id
			);

			if (!existingItem) {
				state.items.push(action.payload);
				state.wishlistItemCount += 1;
			}
		},
		removeFromWishlist: (state, action: PayloadAction<string>) => {
			state.items = state.items.filter((item) => item.id !== action.payload);
			state.wishlistItemCount = state.items.length;
		},
		clearWishlist: (state) => {
			state.items = [];
			state.wishlistItemCount = 0;
		},
		toggleWishlist: (state, action: PayloadAction<Product>) => {
			const existingItem = state.items.find(
				(item) => item.id === action.payload.id
			);

			if (existingItem) {
				state.items = state.items.filter(
					(item) => item.id !== action.payload.id
				);
			} else {
				state.items.push(action.payload);
			}

			state.wishlistItemCount = state.items.length;
		},
	},
});

export const {
	addToWishlist,
	removeFromWishlist,
	clearWishlist,
	toggleWishlist,
} = wishlistSlice.actions;

export default wishlistSlice.reducer;
