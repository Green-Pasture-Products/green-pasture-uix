import { CartItem, CartState, Product } from "@/types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { appConstants } from "../constants";
import {
	addToCartAsync,
	clearCartAsync,
	removeFromCartAsync,
	updateQuantityAsync,
	syncCartOnLoginAsync,
	fetchCartAsync,
} from "../actions/cart.action";

const initialState: CartState & { cartId: number | null } = {
	items: [],
	total: 0,
	loading: false,
	itemCount: 0,
	freeShippingThreshold: appConstants.FREE_SHIPPING_THRESHOLD,
	taxRate: 0.08,
	error: null,
	lastUpdated: null,
	appliedCoupons: [],
	discountAmount: 0,
	cartId: null,
};

const cartSlice = createSlice({
	name: "cart",
	initialState,
	reducers: {
		addToCart: (state, action: PayloadAction<Product>) => {
			const existingItem = state.items.find(
				(item) => item.id === action.payload.id
			);

			if (!existingItem) {
				state.items.push({
					...action.payload,
					quantity: 1,
					createdAt: Date.now(),
				});
			}

			cartSlice.caseReducers.calculateTotals(state);
			state.lastUpdated = Date.now();
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
				item.quantity = Math.min(action.payload.quantity, 99);
			}
			cartSlice.caseReducers.calculateTotals(state);
			state.lastUpdated = Date.now();
		},
		clearCart: (state) => {
			state.items = [];
			state.total = 0;
			state.itemCount = 0;
			state.discountAmount = 0;
			// state.appliedCoupons = [];
			state.lastUpdated = Date.now();
		},
		calculateTotals: (state) => {
			state.itemCount = state.items?.length;
			// const subtotal = state.items.reduce(
			// 	(total, item) => total + item.price * item.quantity,
			// 	0
			// );
			state.total = state.items.reduce(
				(total, item) => total + item.price * item.quantity,
				0
			);
			// state.total = Math.max(0, subtotal - state.discountAmount);
		},
		setFreeShippingThreshold: (state, action: PayloadAction<number>) => {
			state.freeShippingThreshold = action.payload;
		},
		applyCoupon: (
			state,
			action: PayloadAction<{ code: string; discount: number }>
		) => {
			const { code, discount } = action.payload;

			if (!state.appliedCoupons.includes(code)) {
				state.appliedCoupons.push(code);
				state.discountAmount += discount;
				cartSlice.caseReducers.calculateTotals(state);
				state.lastUpdated = Date.now();
			}
		},
		removeCoupon: (
			state,
			action: PayloadAction<{ code: string; discount: number }>
		) => {
			const { code, discount } = action.payload;
			const couponIndex = state.appliedCoupons.indexOf(code);

			if (couponIndex !== -1) {
				state.appliedCoupons.splice(couponIndex, 1);
				state.discountAmount = Math.max(0, state.discountAmount - discount);
				cartSlice.caseReducers.calculateTotals(state);
				state.lastUpdated = Date.now();
			}
		},
		clearError: (state) => {
			state.error = null;
		},
	},
	extraReducers: (builder) => {
		// Add to cart async
		builder
			.addCase(addToCartAsync.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(addToCartAsync.fulfilled, (state, action) => {
				state.loading = false;
				cartSlice.caseReducers.addToCart(state, action);
			})
			.addCase(addToCartAsync.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload as string;
			});

		// Remove from cart async
		builder
			.addCase(removeFromCartAsync.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(removeFromCartAsync.fulfilled, (state, action) => {
				state.loading = false;
				cartSlice.caseReducers.removeFromCart(state, action);
			})
			.addCase(removeFromCartAsync.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload as string;
			});

		// Update quantity async
		builder
			.addCase(updateQuantityAsync.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(updateQuantityAsync.fulfilled, (state, action) => {
				state.loading = false;
				cartSlice.caseReducers.updateQuantity(state, action);
			})
			.addCase(updateQuantityAsync.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload as string;
			});

		// Clear cart async
		builder
			.addCase(clearCartAsync.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(clearCartAsync.fulfilled, (state) => {
				state.loading = false;
				cartSlice.caseReducers.clearCart(state);
			})
			.addCase(clearCartAsync.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload as string;
			});

		// Fetch cart
		builder
			.addCase(fetchCartAsync.fulfilled, (state, action) => {
				const cart = action.payload?.data;
				if (cart?.id) {
					state.cartId = cart.id;
				}
			});

		// Sync cart on login
		builder
			.addCase(syncCartOnLoginAsync.pending, (state) => {
				state.loading = true;
			})
			.addCase(syncCartOnLoginAsync.fulfilled, (state, action) => {
				state.loading = false;
				if (action.payload) {
					state.cartId = action.payload.cartId;
				}
				state.lastUpdated = Date.now();
			})
			.addCase(syncCartOnLoginAsync.rejected, (state) => {
				state.loading = false;
			});
	},
});

export const {
	addToCart,
	removeFromCart,
	updateQuantity,
	clearCart,
	calculateTotals,
	setFreeShippingThreshold,
	applyCoupon,
	removeCoupon,
	clearError,
} = cartSlice.actions;

export default cartSlice.reducer;

// export const selectCartSummary = (state: { cart: CartState }) => {
// 	const { total, taxRate, itemCount, freeShippingThreshold, discountAmount } =
// 		state.cart;
// 	const shipping = total > freeShippingThreshold ? 0 : 20000;
// 	const tax = Math.round(total * taxRate);
// 	const finalTotal = total + shipping + tax;
// 	const remainingForFreeShipping = Math.max(0, freeShippingThreshold - total);

// 	return {
// 		subtotal: total || 0,
// 		shipping,
// 		tax,
// 		finalTotal,
// 		itemCount,
// 		freeShippingThreshold,
// 		remainingForFreeShipping,
// 		hasQualifiedForFreeShipping: total > freeShippingThreshold,
// 	};
// };
