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
	images?: string[];
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
	orders: Order[];
	customers: any[];
	selectedProduct: Product | null;
	selectedCategory: ProductCategory | null;
	selectedOrder: Order | null;
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
