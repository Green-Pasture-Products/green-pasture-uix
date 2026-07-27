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

export interface CheckoutCartPayload {
	cartId: number;
	/** Server re-validates and prices this; the client's discount figure is ignored. */
	couponCode?: string;
	shippingMethod?: ShippingMethodType;
}

const checkoutCartAsync = createAsyncThunk<
	any,
	CheckoutCartPayload,
	{ rejectValue: string }
>("checkout/checkoutCart", async ({ cartId, couponCode, shippingMethod }, { rejectWithValue }) => {
	try {
		const response = await axiosInstance.post(`order/checkout/${cartId}`, {
			...(couponCode ? { couponCode } : {}),
			...(shippingMethod ? { shippingMethod } : {}),
		});
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
