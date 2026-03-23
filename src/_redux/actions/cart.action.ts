import { CartState, Product } from "@/types";
import { createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "@/_utils/axiosInstance";
import { extractErrorMessage } from "@/_utils/apiHelpers";

interface RootState {
	cart: CartState & { cartId: number | null };
	auth: { isAuthenticated: boolean; user: any };
}

export const fetchCartAsync = createAsyncThunk<
	any,
	number,
	{ rejectValue: string }
>("cart/fetchCart", async (customerId, { rejectWithValue }) => {
	try {
		const response = await axiosInstance.get(`cart/customer/${customerId}`);
		return response.data;
	} catch (error: any) {
		return rejectWithValue(extractErrorMessage(error));
	}
});

export const fetchCartItemsAsync = createAsyncThunk<
	any,
	number,
	{ rejectValue: string }
>("cart/fetchCartItems", async (cartId, { rejectWithValue }) => {
	try {
		const response = await axiosInstance.get(`cart-item/${cartId}`);
		return response.data;
	} catch (error: any) {
		return rejectWithValue(extractErrorMessage(error));
	}
});

export const createCartAsync = createAsyncThunk<
	any,
	number,
	{ rejectValue: string }
>("cart/createCart", async (customerId, { rejectWithValue }) => {
	try {
		const response = await axiosInstance.post(`cart/create/${customerId}`);
		return response.data;
	} catch (error: any) {
		return rejectWithValue(extractErrorMessage(error));
	}
});

export const addToCartAsync = createAsyncThunk(
	"cart/addToCartAsync",
	async (product: Product, { rejectWithValue, getState }) => {
		try {
			if (!product.id || !product.name || !product.price) {
				throw new Error("Invalid product data");
			}

			const state = getState() as RootState;

			if (state.auth.isAuthenticated && state.cart.cartId) {
				await axiosInstance.post("cart-item/create", {
					cartId: state.cart.cartId,
					itemId: Number(product.id),
					quantity: 1,
				});
			}

			return product;
		} catch (error) {
			return rejectWithValue(
				error instanceof Error
					? error.message
					: "Failed to add item to cart"
			);
		}
	}
);

export const removeFromCartAsync = createAsyncThunk(
	"cart/removeFromCartAsync",
	async (productId: string, { rejectWithValue, getState }) => {
		try {
			const state = getState() as RootState;

			if (state.auth.isAuthenticated && state.cart.cartId) {
				await axiosInstance.delete("cart-item/remove", {
					data: Number(productId),
				});
			}

			return productId;
		} catch (error) {
			return rejectWithValue(
				error instanceof Error
					? error.message
					: "Failed to remove item from cart"
			);
		}
	}
);

export const updateQuantityAsync = createAsyncThunk(
	"cart/updateQuantityAsync",
	async (
		{ id, quantity }: { id: string; quantity: number },
		{ rejectWithValue, getState }
	) => {
		try {
			if (quantity < 0) throw new Error("Quantity cannot be negative");
			if (quantity > 99) throw new Error("Maximum quantity is 99");

			const state = getState() as RootState;

			if (state.auth.isAuthenticated && state.cart.cartId) {
				await axiosInstance.patch("cart-item/update", {
					cartId: state.cart.cartId,
					itemId: Number(id),
					quantity,
				});
			}

			return { id, quantity };
		} catch (error) {
			return rejectWithValue(
				error instanceof Error
					? error.message
					: "Failed to update quantity"
			);
		}
	}
);

export const clearCartAsync = createAsyncThunk(
	"cart/clearCartAsync",
	async (_, { rejectWithValue }) => {
		try {
			return true;
		} catch (error) {
			return rejectWithValue("Failed to clear cart");
		}
	}
);

export const syncCartOnLoginAsync = createAsyncThunk<
	any,
	{ customerId: number },
	{ rejectValue: string }
>(
	"cart/syncOnLogin",
	async ({ customerId }, { rejectWithValue, getState }) => {
		try {
			const state = getState() as RootState;
			const localItems = state.cart.items;

			// Try to fetch existing cart
			let cartData: any;
			try {
				const cartRes = await axiosInstance.get(
					`cart/customer/${customerId}`
				);
				cartData = cartRes.data?.data;
			} catch {
				// No cart exists, create one
				const createRes = await axiosInstance.post(
					`cart/create/${customerId}`
				);
				cartData = createRes.data?.data;
			}

			if (!cartData?.id) return null;

			// Sync local items to backend cart
			for (const item of localItems) {
				try {
					await axiosInstance.post("cart-item/create", {
						cartId: cartData.id,
						itemId: Number(item.id),
						quantity: item.quantity,
					});
				} catch {
					// Item may already exist in cart, skip
				}
			}

			// Fetch the full cart items from backend
			const itemsRes = await axiosInstance.get(
				`cart-item/${cartData.id}`
			);

			return {
				cartId: cartData.id,
				items: itemsRes.data?.data ?? [],
			};
		} catch (error: any) {
			return rejectWithValue(extractErrorMessage(error));
		}
	}
);

export const cartAction = {
	fetchCartAsync,
	fetchCartItemsAsync,
	createCartAsync,
	addToCartAsync,
	removeFromCartAsync,
	updateQuantityAsync,
	clearCartAsync,
	syncCartOnLoginAsync,
};
