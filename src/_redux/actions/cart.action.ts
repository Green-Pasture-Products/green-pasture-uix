import { CartState, Product } from "@/types";
import { createAsyncThunk } from "@reduxjs/toolkit";

export const addToCartAsync = createAsyncThunk(
	"cart/addToCartAsync",
	async (product: Product, { rejectWithValue }) => {
		try {
			// Simulate API call - replace with actual API endpoint
			await new Promise((resolve) => setTimeout(resolve, 500));

			// Add any server-side validation here
			if (!product.id || !product.name || !product.price) {
				throw new Error("Invalid product data");
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
	async (productId: string, { rejectWithValue }) => {
		try {
			// Simulate API call
			await new Promise((resolve) => setTimeout(resolve, 300));
			return productId;
		} catch (error) {
			return rejectWithValue("Failed to remove item from cart");
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
			// Validate quantity
			if (quantity < 0) {
				throw new Error("Quantity cannot be negative");
			}

			if (quantity > 99) {
				throw new Error("Maximum quantity is 99");
			}

			// Check stock availability (if needed)
			const state = getState() as { cart: CartState };
			const item = state.cart.items.find((item) => item.id === id);

			if (item && item.stock && quantity > item.stock) {
				throw new Error(`Only ${item.stock} items available in stock`);
			}

			// Simulate API call
			await new Promise((resolve) => setTimeout(resolve, 300));

			return { id, quantity };
		} catch (error) {
			return rejectWithValue(
				error instanceof Error ? error.message : "Failed to update quantity"
			);
		}
	}
);

export const clearCartAsync = createAsyncThunk(
	"cart/clearCartAsync",
	async (_, { rejectWithValue }) => {
		try {
			// Simulate API call
			await new Promise((resolve) => setTimeout(resolve, 500));
			return true;
		} catch (error) {
			return rejectWithValue("Failed to clear cart");
		}
	}
);
