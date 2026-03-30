export interface ProductCategory{
id: number;
name: string;
description:string
}

export interface PaginatedProducts {
  items: ProductCategory[];
  meta: {
    totalItems: number;
    itemCount: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
  };
}

export interface UpdateCategoryPayload {
  id: number | null ;
  name: string;
  description: string;
}


export interface Product {
	id: string;
	name: string;
	price: number;
	originalPrice?: number;
	image: string;
	category: string;
	description: string;
	quantity: number;
	inStock: boolean;
	rating: number;
	reviews: number;
}

export interface CategoriesState {
  isFetchingAllCategories: boolean;
  isFetchingCategory: boolean;
  isCreatingCategory: boolean;
  isUpdatingCategory: boolean;
  isDeletingCategory:boolean;
  productCategories: ProductCategory[];
  pagination?: PaginatedProducts["meta"];
  categories?: string[];
  selectedCategory?: string;
  searchTerm: string;
  error: string | null;
}

export interface ProductsState {
	isFetchingAllProducts: boolean;
	isFetchingProduct: boolean;
	products: Product[];
	product: Product | null;
	categories: string[];
	selectedCategory: string;
	searchTerm: string;
}

export interface CartItem extends Product {
	quantity: number;
	createdAt: number;
}

export interface Customer {
	firstName: string;
	lastName: string;
	email: string;
	phone: string;
	totalSpent: number;
	address: {
		street: string;
		city: string;
		state: string;
		zipCode: string;
		country: string;
	};
	lastOrderDate: string;
	totalOrders: number;
}

export interface Address {
	street: string;
	city: string;
	state: string;
	zipCode: string;
	country: string;
}

export interface Order {
	id: string;
	customer: Customer;
	shippingAddress: Address;
	billingAddress: Address;
	items: CartItem[];
	subtotal: number;
	shipping: number;
	tax: number;
	total: number;
	status: "pending" | "confirmed" | "shipped" | "delivered";
	createdAt: string;
}

// Define the IP info structure
export interface IpInfo {
	ip: string;
	hostname?: string;
	city?: string;
	region?: string;
	country?: string;
	loc?: string;
	org?: string;
	postal?: string;
	timezone?: string;
	[key: string]: any; // For any extra fields from IPInfo API
}

export interface User {
	id: number;
	email: string;
	firstName: string;
	lastName: string;
	role?: string;
	isVerified: boolean;
	createdAt: string;

	createdBy: string;
	gender: string;
	phoneNumber: string;
	profileStatus: string;
	profileType: string;
	status: string;
	updatedAt: string;
	updatedBy: string;
}

export interface AuthState {
	user: User | null;
	isAuthenticated: boolean;
	isLoading: boolean;
	error: string | null;
}

export interface BioProp {
	isLoading: boolean;
	bio: User | null;
}

export interface CartState {
	items: CartItem[];

	total: number;
	error: string | null;
	appliedCoupons: string[];
	discountAmount: number;
	loading: boolean;
	itemCount: number;
	taxRate: number;
	freeShippingThreshold: number;
	lastUpdated: number | null;
}

export interface AdminUser {
	id: string;
	username: string;
	email: string;
	role: "admin" | "manager" | "editor";
	lastLogin: string;
}

export interface AdminStats {
	totalProducts: number;
	totalOrders: number;
	totalCustomers: number;
	totalRevenue: number;
	ordersToday: number;
	revenueToday: number;
	lowStockProducts: number;
	pendingOrders: number;
}

export interface SalesData {
	date: string;
	sales: number;
	orders: number;
}

export interface AdminState {
	isAuthenticated: boolean;
	user: AdminUser | null;
	stats: AdminStats;
	salesData: SalesData[];
	orders: any[];
	customers: any[];
	selectedProduct: Product | null;
	selectedCategory: ProductCategory | null;
	selectedOrder: any | null;
}

type NotificationType = "success" | "error";

export interface StatusModalProps {
	isOpen: boolean;
	onClose: () => void;
	type: NotificationType;
	title: string;
	message: string;
	autoClose?: boolean;
	autoCloseDelay?: number;
}

// ─── API Response Types ─────────────────────────────────────────────────

export interface ApiResponse<T> {
	message: string;
	data: T | null;
}

export interface PaginationMeta {
	totalItems: number;
	itemCount: number;
	itemsPerPage: number;
	totalPages: number;
	currentPage: number;
}

export interface PaginationLinks {
	first: string;
	previous: string;
	next: string;
	last: string;
}

export interface PaginatedData<T> {
	items: T[];
	meta: PaginationMeta;
	links: PaginationLinks;
}

// ─── Backend Entity Types ───────────────────────────────────────────────

export interface BackendItem {
	id: number;
	name: string;
	description?: string;
	price: number;
	unit: number;
	product?: { id: number; name: string };
	photos?: { id: number; url: string; publicId: string }[];
	ratingStats?: { average: number; count: number };
	reviews?: BackendReview[];
	status: string;
	createdAt: string;
	updatedAt: string;
}

export interface BackendReview {
	id: number;
	rating: number;
	comment?: string;
	customer: string;
	item?: BackendItem;
	status: string;
	createdAt: string;
	updatedAt: string;
}

export interface BackendOrder {
	id: number;
	orderReference: string;
	orderStatus: OrderStatusType;
	customer?: BackendCustomer;
	items?: BackendOrderItem[];
	totalAmount: number;
	status: string;
	createdAt: string;
	updatedAt: string;
}

export interface BackendOrderItem {
	id: number;
	item: BackendItem;
	quantity: number;
	unitPrice: number;
}

export interface BackendCustomer {
	id: number;
	referrerCode?: string;
	profile: ProfileData;
	status: string;
	createdAt: string;
	updatedAt: string;
}

export interface BackendStaff {
	id: number;
	profile: ProfileData;
	status: string;
	createdAt: string;
	updatedAt: string;
}

export interface ProfileData {
	id: number;
	firstName: string;
	lastName: string;
	email: string;
	phoneNumber?: string;
	gender?: string;
	profileStatus?: string;
	profileType?: string;
	profileImage?: { url: string; publicId: string };
	address?: ShippingAddress;
	status?: string;
	createdAt?: string;
	updatedAt?: string;
	role?: { id: number; name: string; permissions?: BackendPermission[] };
}

export interface ShippingAddress {
	street: string;
	city: string;
	state: string;
	country: string;
	postalCode: string;
}

export type OrderStatusType =
	| "PENDING"
	| "PROCESSING"
	| "SHIPPED"
	| "DELIVERED"
	| "CANCELLED";

export type ShippingMethodType = "STANDARD" | "EXPRESS" | "OVERNIGHT";

export type PaymentMethodType = "CARD" | "CASH_ON_DELIVERY" | "WALLET";

// ─── Extended State Types ───────────────────────────────────────────────

export interface CheckoutState {
	orderId: number | null;
	paymentUrl: string | null;
	paymentReference: string | null;
	paymentStatus: "idle" | "pending" | "success" | "failed";
	isCheckingOut: boolean;
	isPlacingOrder: boolean;
	isVerifying: boolean;
	error: string | null;
}

export interface ReviewState {
	reviews: BackendReview[];
	pagination: PaginationMeta | null;
	isLoading: boolean;
	isSubmitting: boolean;
	error: string | null;
}

export interface ProfileState {
	profile: ProfileData | null;
	isLoading: boolean;
	isUpdating: boolean;
	error: string | null;
}

export interface BackendRole {
	id: number;
	name: string;
	description: string;
	permissions: BackendPermission[];
	status: string;
	createdAt: string;
}

export interface BackendPermission {
	id: number;
	name: string;
	description: string;
	status: string;
}
