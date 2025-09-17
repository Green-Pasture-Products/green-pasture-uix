export interface Product {
	id: string;
	name: string;
	price: number;
	originalPrice?: number;
	image: string;
	category: string;
	description: string;
	inStock: boolean;
	organic: boolean;
	rating: number;
	reviews: number;
}

export interface ProductsState {
	isFetchingAllProducts: boolean;
	isFetchingProduct: boolean;
	products: Product[];
	product: Product | null;

	items: Product[];
	categories: string[];
	selectedCategory: string;
	searchTerm: string;
}

export interface CartItem extends Product {
	quantity: number;
}

export interface Customer {
	firstName: string;
	lastName: string;
	email: string;
	phone: string;
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
	id: string;
	email: string;
	firstName: string;
	lastName: string;
	role?: string;
	isVerified: boolean;
	createdAt: string;
}

export interface AuthState {
	user: User | null;
	isAuthenticated: boolean;
	isLoading: boolean;
	error: string | null;
}
