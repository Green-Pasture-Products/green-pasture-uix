import { createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "@/_utils/axiosInstance";
import { extractErrorMessage } from "@/_utils/apiHelpers";
import { ShippingMethodType, PaymentMethodType, ShippingAddress } from "@/types";

export interface PlaceOrderPayload {
	orderId: number;
	shippingMethod: ShippingMethodType;
	paymentMethod: PaymentMethodType;
	shippingAddress: ShippingAddress;
}

const checkoutCartAsync = createAsyncThunk<
	any,
	number,
	{ rejectValue: string }
>("checkout/checkoutCart", async (cartId, { rejectWithValue }) => {
	try {
		const response = await axiosInstance.post(`order/checkout/${cartId}`);
		return response.data;
	} catch (error: any) {
		return rejectWithValue(extractErrorMessage(error));
	}
});

const placeOrderAsync = createAsyncThunk<
	any,
	PlaceOrderPayload,
	{ rejectValue: string }
>("checkout/placeOrder", async (payload, { rejectWithValue }) => {
	try {
		const response = await axiosInstance.post("transaction/place-order", payload);
		return response.data;
	} catch (error: any) {
		return rejectWithValue(extractErrorMessage(error));
	}
});

const verifyPaymentAsync = createAsyncThunk<
	any,
	string,
	{ rejectValue: string }
>("checkout/verifyPayment", async (reference, { rejectWithValue }) => {
	try {
		const response = await axiosInstance.get(
			`transaction/callback?reference=${reference}`
		);
		return response.data;
	} catch (error: any) {
		return rejectWithValue(extractErrorMessage(error));
	}
});

export const checkoutAction = {
	checkoutCartAsync,
	placeOrderAsync,
	verifyPaymentAsync,
};
