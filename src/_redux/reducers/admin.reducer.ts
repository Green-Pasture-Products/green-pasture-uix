import { AdminState, AdminStats, AdminUser, Order, Product } from "@/types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
// import { Product, Order } from "../types";
// import { AdminUser, AdminStats, SalesData } from "../types/admin";

const mockOrders: Order[] = [
	{
		id: "1001",
		customer: {
			firstName: "John",
			lastName: "Doe",
			email: "john@example.com",
			phone: "+1234567890",
		},
		shippingAddress: {
			street: "123 Main St",
			city: "New York",
			state: "NY",
			zipCode: "10001",
			country: "USA",
		},
		billingAddress: {
			street: "123 Main St",
			city: "New York",
			state: "NY",
			zipCode: "10001",
			country: "USA",
		},
		items: [
			{
				id: "1",
				name: "Organic Avocados",
				price: 4.99,
				image: "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=400&h=400&fit=crop",
				category: "Fruits",
				description: "Fresh, creamy organic avocados",
				inStock: true,
				// organic: true,
				rating: 4.8,
				reviews: 124,
				quantity: 2,
				createdAt: Date.now(),
			},
		],
		subtotal: 9.98,
		shipping: 9.99,
		tax: 1.6,
		total: 21.57,
		status: "pending",
		createdAt: "2024-01-15T10:30:00Z",
	},
	{
		id: "1002",
		customer: {
			firstName: "Jane",
			lastName: "Smith",
			email: "jane@example.com",
			phone: "+1234567891",
		},
		shippingAddress: {
			street: "456 Oak Ave",
			city: "Los Angeles",
			state: "CA",
			zipCode: "90210",
			country: "USA",
		},
		billingAddress: {
			street: "456 Oak Ave",
			city: "Los Angeles",
			state: "CA",
			zipCode: "90210",
			country: "USA",
		},
		items: [
			{
				id: "3",
				name: "Organic Blueberries",
				price: 8.99,
				image: "https://images.unsplash.com/photo-1498557850523-fd3d118b962e?w=400&h=400&fit=crop",
				category: "Fruits",
				description: "Sweet and juicy organic blueberries",
				inStock: true,
				// organic: true,
				rating: 4.9,
				reviews: 156,
				quantity: 1,
				createdAt: Date.now(),
			},
		],
		subtotal: 8.99,
		shipping: 9.99,
		tax: 1.44,
		total: 20.42,
		status: "shipped",
		createdAt: "2024-01-14T15:20:00Z",
	},
];

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
		selectProduct: (state, action: PayloadAction<Product>) => {
			state.selectedProduct = action.payload;
		},
		selectOrder: (state, action: PayloadAction<Order>) => {
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
	selectOrder,
	updateStats,
} = adminSlice.actions;
export default adminSlice.reducer;
