import { AdminState, AdminStats, AdminUser, Order, Product, ProductCategory } from "@/types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { mockOrders } from "../mockData";

const initialState: AdminState = {
	isAuthenticated: false,
	user: null,
	stats: {
		totalProducts: 8,
		totalOrders: 25,
		totalCustomers: 15,
		totalRevenue: 1250.75,
		ordersToday: 3,
		revenueToday: 87.5,
		lowStockProducts: 2,
		pendingOrders: 5,
	},
	salesData: [
		{ date: "2024-01-10", sales: 150, orders: 5 },
		{ date: "2024-01-11", sales: 200, orders: 8 },
		{ date: "2024-01-12", sales: 175, orders: 6 },
		{ date: "2024-01-13", sales: 225, orders: 9 },
		{ date: "2024-01-14", sales: 180, orders: 7 },
		{ date: "2024-01-15", sales: 250, orders: 10 },
		{ date: "2024-01-16", sales: 190, orders: 8 },
	],
	orders: mockOrders,
	customers: [],
	selectedProduct: null,
	selectedCategory: null,
	selectedOrder: null,
};

const adminSlice = createSlice({
	name: "admin",
	initialState,
	reducers: {
		login: (state, action: PayloadAction<AdminUser>) => {
			state.isAuthenticated = true;
			state.user = action.payload;
		},
		logout: (state) => {
			state.isAuthenticated = false;
			state.user = null;
		},
		updateOrderStatus: (
			state,
			action: PayloadAction<{ id: string; status: Order["status"] }>
		) => {
			const order = state.orders.find((o) => o.id === action.payload.id);
			if (order) {
				order.status = action.payload.status;
			}
		},
		selectProduct: (state, action: PayloadAction<Product | null>) => {
			state.selectedProduct = action.payload;
		},
		selectCategory: (state, action: PayloadAction<ProductCategory | null>) => {
			state.selectedCategory = action.payload;
		},
		selectOrder: (state, action: PayloadAction<Order | null>) => {
			state.selectedOrder = action.payload;
		},
		updateStats: (state, action: PayloadAction<Partial<AdminStats>>) => {
			state.stats = { ...state.stats, ...action.payload };
		},
	},
});

export const {
	login,
	logout,
	updateOrderStatus,
	selectProduct,
	selectCategory,
	selectOrder,
	updateStats,
} = adminSlice.actions;
export default adminSlice.reducer;
