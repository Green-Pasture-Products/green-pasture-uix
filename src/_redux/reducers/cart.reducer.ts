import { CartItem, Product } from "@/types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { appConstants } from "../constants";

interface CartState {
	items: CartItem[];
	total: number;
	itemCount: number;
	freeShippingThreshold: number;
}

const initialState: CartState = {
	items: [],
	total: 0,
	itemCount: 0,
	freeShippingThreshold: appConstants.FREE_SHIPPING_THRESHOLD,
};

const cartSlice = createSlice({
	name: "cart",
	initialState,
	reducers: {
		addToCart: (state, action: PayloadAction<Product>) => {
			const existingItem = state.items.find(
				(item) => item.id === action.payload.id
			);

			if (!existingItem)
				state.items.push({ ...action.payload, quantity: 1 });

			cartSlice.caseReducers.calculateTotals(state);
		},
		removeFromCart: (state, action: PayloadAction<string>) => {
			state.items = state.items.filter((item) => item.id !== action.payload);
			cartSlice.caseReducers.calculateTotals(state);
		},
		updateQuantity: (
			state,
			action: PayloadAction<{ id: string; quantity: number }>
		) => {
			const item = state.items.find((item) => item.id === action.payload.id);
			if (item) {
				item.quantity = action.payload.quantity;
			}
			cartSlice.caseReducers.calculateTotals(state);
		},
		clearCart: (state) => {
			state.items = [];
			state.total = 0;
			state.itemCount = 0;
		},
		calculateTotals: (state) => {
			state.itemCount = state.items?.length;
			// state.itemCount = state.items.reduce(
			// 	(total, item) => total + item.quantity,
			// 	0
			// );
			state.total = state.items.reduce(
				(total, item) => total + item.price * item.quantity,
				0
			);
		},
		setFreeShippingThreshold: (state, action: PayloadAction<number>) => {
			state.freeShippingThreshold = action.payload;
		},
	},
});

export const {
	addToCart,
	removeFromCart,
	updateQuantity,
	clearCart,
	calculateTotals,
	setFreeShippingThreshold,
} = cartSlice.actions;

export default cartSlice.reducer;
