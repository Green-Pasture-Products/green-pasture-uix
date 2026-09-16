import { createAsyncThunk } from "@reduxjs/toolkit";
import {
	CreditAccount,
	CreditTransaction,
	PaymentNotification,
	DashboardMetrics,
	CreditCustomer,
	creditActions,
} from "../reducers/credit.reducer";

const API_BASE = "/api/v1";
const TOKEN_KEY = "token";

const getAuthHeaders = () => ({
	Authorization: `Bearer ${typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : ""}`,
	"Content-Type": "application/json",
});

// Customer Thunks
export const fetchCreditAccountAsync = createAsyncThunk(
	"credit/fetchAccount",
	async (_, { rejectWithValue }) => {
		try {
			const res = await fetch(`${API_BASE}/credit/account`, {
				headers: getAuthHeaders(),
			});
			if (!res.ok) throw new Error("Failed to fetch account");
			return await res.json();
		} catch (error: any) {
			return rejectWithValue(error.message);
		}
	}
);

export const fetchTransactionsAsync = createAsyncThunk(
	"credit/fetchTransactions",
	async ({ page = 1, limit = 10 }: { page?: number; limit?: number }, { rejectWithValue }) => {
		try {
			const res = await fetch(`${API_BASE}/credit/transactions?page=${page}&limit=${limit}`, {
				headers: getAuthHeaders(),
			});
			if (!res.ok) throw new Error("Failed to fetch transactions");
			return await res.json();
		} catch (error: any) {
			return rejectWithValue(error.message);
		}
	}
);

export const submitPaymentNotificationAsync = createAsyncThunk(
	"credit/submitPayment",
	async (
		data: {
			paymentAmount: number;
			paymentDate: string;
			paymentMethod: string;
			transactionReference?: string;
			proofOfPaymentUrl?: string;
		},
		{ rejectWithValue }
	) => {
		try {
			const res = await fetch(`${API_BASE}/credit/payment-notifications`, {
				method: "POST",
				headers: getAuthHeaders(),
				body: JSON.stringify(data),
			});
			if (!res.ok) {
				const error = await res.json();
				throw new Error(error.message || "Failed to submit payment");
			}
			return await res.json();
		} catch (error: any) {
			return rejectWithValue(error.message);
		}
	}
);

export const fetchPaymentNotificationsAsync = createAsyncThunk(
	"credit/fetchPaymentNotifications",
	async ({ page = 1, limit = 10 }: { page?: number; limit?: number }, { rejectWithValue }) => {
		try {
			const res = await fetch(
				`${API_BASE}/credit/payment-notifications?page=${page}&limit=${limit}`,
				{
					headers: getAuthHeaders(),
				}
			);
			if (!res.ok) throw new Error("Failed to fetch notifications");
			return await res.json();
		} catch (error: any) {
			return rejectWithValue(error.message);
		}
	}
);

// Admin Thunks
export const fetchAdminMetricsAsync = createAsyncThunk(
	"credit/fetchMetrics",
	async (_, { rejectWithValue }) => {
		try {
			const res = await fetch(`${API_BASE}/admin/credit/dashboard`, {
				headers: getAuthHeaders(),
			});
			if (!res.ok) throw new Error("Failed to fetch metrics");
			return await res.json();
		} catch (error: any) {
			return rejectWithValue(error.message);
		}
	}
);

export const fetchCreditCustomersAsync = createAsyncThunk(
	"credit/fetchCustomers",
	async ({ page = 1, limit = 10, search = "" }: { page?: number; limit?: number; search?: string }, { rejectWithValue }) => {
		try {
			const url = new URL(`${window.location.origin}${API_BASE}/admin/credit/customers`);
			url.searchParams.set("page", page.toString());
			url.searchParams.set("limit", limit.toString());
			if (search) url.searchParams.set("search", search);

			const res = await fetch(url.toString(), {
				headers: getAuthHeaders(),
			});
			if (!res.ok) throw new Error("Failed to fetch customers");
			return await res.json();
		} catch (error: any) {
			return rejectWithValue(error.message);
		}
	}
);

export const updateCreditAccountAsync = createAsyncThunk(
	"credit/updateAccount",
	async (
		{ customerId, data }: { customerId: string; data: Partial<CreditAccount> },
		{ rejectWithValue }
	) => {
		try {
			const res = await fetch(`${API_BASE}/admin/credit/customers/${customerId}`, {
				method: "PATCH",
				headers: getAuthHeaders(),
				body: JSON.stringify(data),
			});
			if (!res.ok) throw new Error("Failed to update account");
			return await res.json();
		} catch (error: any) {
			return rejectWithValue(error.message);
		}
	}
);

export const verifyPaymentAsync = createAsyncThunk(
	"credit/verifyPayment",
	async (
		{ notificationId, data }: { notificationId: string; data?: { verificationNotes?: string } },
		{ rejectWithValue }
	) => {
		try {
			const res = await fetch(`${API_BASE}/admin/credit/payment-notifications/${notificationId}/verify`, {
				method: "POST",
				headers: getAuthHeaders(),
				body: JSON.stringify(data || {}),
			});
			if (!res.ok) throw new Error("Failed to verify payment");
			return await res.json();
		} catch (error: any) {
			return rejectWithValue(error.message);
		}
	}
);

export const rejectPaymentAsync = createAsyncThunk(
	"credit/rejectPayment",
	async (
		{ notificationId, reason }: { notificationId: string; reason: string },
		{ rejectWithValue }
	) => {
		try {
			const res = await fetch(`${API_BASE}/admin/credit/payment-notifications/${notificationId}/reject`, {
				method: "POST",
				headers: getAuthHeaders(),
				body: JSON.stringify({ rejectionReason: reason }),
			});
			if (!res.ok) throw new Error("Failed to reject payment");
			return await res.json();
		} catch (error: any) {
			return rejectWithValue(error.message);
		}
	}
);

export const suspendCreditAccountAsync = createAsyncThunk(
	"credit/suspendAccount",
	async (customerId: string, { rejectWithValue }) => {
		try {
			const res = await fetch(`${API_BASE}/admin/credit/customers/${customerId}/suspend`, {
				method: "POST",
				headers: getAuthHeaders(),
			});
			if (!res.ok) throw new Error("Failed to suspend account");
			return await res.json();
		} catch (error: any) {
			return rejectWithValue(error.message);
		}
	}
);

// Action creators
export const creditAction = {
	fetchCreditAccountAsync,
	fetchTransactionsAsync,
	submitPaymentNotificationAsync,
	fetchPaymentNotificationsAsync,
	fetchAdminMetricsAsync,
	fetchCreditCustomersAsync,
	updateCreditAccountAsync,
	verifyPaymentAsync,
	rejectPaymentAsync,
	suspendCreditAccountAsync,
};
