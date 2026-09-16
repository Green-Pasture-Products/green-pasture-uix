import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface CreditAccount {
	id: string;
	customerId: string;
	creditStatus: "ACTIVE" | "SUSPENDED" | "DISABLED";
	creditLimit: number;
	outstandingBalance: number;
	availableCredit: number;
	paymentTermDays: number;
	dueDate?: string;
	version: number;
}

export interface CreditTransaction {
	id: string;
	customerId: string;
	transactionType: "DEBIT" | "CREDIT" | "ADJUSTMENT";
	amount: number;
	description: string;
	referenceId?: string;
	createdAt: string;
	createdBy: string;
}

export interface PaymentNotification {
	id: string;
	customerId: string;
	creditAccountId: string;
	notificationStatus: "PENDING" | "VERIFIED" | "REJECTED";
	paymentAmount: number;
	paymentDate: string;
	paymentMethod: string;
	transactionReference?: string;
	proofOfPaymentUrl?: string;
	rejectionReason?: string;
	verifiedBy?: string;
	verifiedAt?: string;
	submittedAt: string;
}

export interface CreditCustomer {
	id: string;
	name: string;
	email: string;
	phone: string;
	creditAccount: CreditAccount;
}

export interface DashboardMetrics {
	pendingPaymentNotifications: number;
	totalCreditCustomers?: number;
	totalOutstandingCredit?: number;
	overdueCount?: number;
}

export interface CreditState {
	creditAccount: CreditAccount | null;
	transactions: CreditTransaction[];
	paymentNotifications: PaymentNotification[];
	adminMetrics: DashboardMetrics | null;
	customers: CreditCustomer[];
	loading: boolean;
	error: string | null;
	pagination: {
		currentPage: number;
		totalPages: number;
		limit: number;
	};
}

const initialState: CreditState = {
	creditAccount: null,
	transactions: [],
	paymentNotifications: [],
	adminMetrics: null,
	customers: [],
	loading: false,
	error: null,
	pagination: {
		currentPage: 1,
		totalPages: 1,
		limit: 10,
	},
};

const creditSlice = createSlice({
	name: "credit",
	initialState,
	reducers: {
		setCreditAccount: (state, action: PayloadAction<CreditAccount>) => {
			state.creditAccount = action.payload;
		},
		setTransactions: (state, action: PayloadAction<CreditTransaction[]>) => {
			state.transactions = action.payload;
		},
		setPaymentNotifications: (state, action: PayloadAction<PaymentNotification[]>) => {
			state.paymentNotifications = action.payload;
		},
		setAdminMetrics: (state, action: PayloadAction<DashboardMetrics>) => {
			state.adminMetrics = action.payload;
		},
		setCustomers: (state, action: PayloadAction<CreditCustomer[]>) => {
			state.customers = action.payload;
		},
		setLoading: (state, action: PayloadAction<boolean>) => {
			state.loading = action.payload;
		},
		setError: (state, action: PayloadAction<string | null>) => {
			state.error = action.payload;
		},
		setPagination: (
			state,
			action: PayloadAction<{ currentPage: number; totalPages: number; limit: number }>
		) => {
			state.pagination = action.payload;
		},
		clearCredit: (state) => {
			state.creditAccount = null;
			state.transactions = [];
			state.paymentNotifications = [];
			state.loading = false;
			state.error = null;
		},
	},
});

export const creditReducer = creditSlice.reducer;
export const creditActions = creditSlice.actions;
