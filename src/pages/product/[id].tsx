import React, { MouseEvent, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import {
	Star,
	ShoppingCart,
	Heart,
	Minus,
	Plus,
	Truck,
	Shield,
	ArrowLeft,
	Check,
	Info,
	XCircle,
} from "lucide-react";

import { useAppDispatch, useAppSelector } from "@/_redux/store";
import { addToCart, removeFromCart } from "@/_redux/reducers/cart.reducer";
import { Product } from "@/types";
import Products from "@/_components/Products";
import {
	addToWishlist,
	removeFromWishlist,
} from "@/_redux/reducers/wishlist.reducer";
import Layout from "@/_components/Layout";
import { appConstants } from "@/_redux/constants";
import ReviewList from "@/_components/ReviewList";
import ReviewForm from "@/_components/ReviewForm";
import Breadcrumb from "@/_UI/Breadcrumb";
import Card from "@/_UI/Card";
import Button from "@/_UI/Button";
import Badge from "@/_UI/Badge";
import EmptyState from "@/_UI/EmptyState";
import PageLoader from "@/_UI/PageLoader";

const ProductDetailsPage: React.FC = () => {
	const router = useRouter();
	const { id } = router.query;
	const dispatch = useAppDispatch();
	const { products, isFetchingAllProducts } = useAppSelector((state) => state.product);
	const cartItems = useAppSelector((state) => state.cart.items);
	const wishlistItems = useAppSelector((state) => state.wishlist.items);
	const product = products?.find((p: Product) => String(p.id) === String(id));

	const [quantity, setQuantity] = useState(1);
	const [selectedImage, setSelectedImage] = useState(0);
	const [activeTab, setActiveTab] = useState("description");

	const p = product as any;
	const productCategory = p?.product?.name || p?.category || "";
	const relatedProducts = products
		.filter((pr: any) => {
			const cat = pr.product?.name || pr.category || "";
			return cat === productCategory && String(pr.id) !== String(id);
		})
		.slice(0, 4);

	const cartItem = cartItems.find((item) => String(item.id) === String(id));
	const isInCart = !!cartItem;
	const isInWishlist = wishlistItems.some((item) => String(item.id) === String(id));

	if (!product && (isFetchingAllProducts || !products?.length)) {
		return (
			<Layout pageTitle="Loading Product...">
				<PageLoader fullScreen={false} message="Loading product details..." />
			</Layout>
		);
	}

	if (!product) {
		return (
			<Layout pageTitle="Product Not Found">
				<div className="container page-wrapper mx-auto px-4 py-16">
					<EmptyState
						icon={ShoppingCart}
						title="Product Not Found"
						description="The product you're looking for doesn't exist."
						actionLabel="Browse All Products"
						actionHref="/products"
					/>
				</div>
			</Layout>
		);
	}

	const handleCartToggle = () => {
		if (isInCart) {
			for (let i = 0; i < quantity; i++) {
				dispatch(removeFromCart(product.id));
			}
			toast.error(`${product.name} removed from cart`);
		} else {
			for (let i = 0; i < quantity; i++) {
				dispatch(addToCart(product));
			}
			toast.success(`${product.name} added to cart`);
		}
		setQuantity(1);
	};

	const handleQuantityChange = (newQuantity: number) => {
		if (newQuantity >= 1 && newQuantity <= itemMaxQuantity) {
			setQuantity(newQuantity);
		}
	};

	const handleWishlistToggle = (e: MouseEvent<HTMLButtonElement>) => {
		e.stopPropagation();
		if (isInWishlist) {
			dispatch(removeFromWishlist(product.id));
			toast.error(`${product.name} removed from wishlist`);
		} else {
			dispatch(addToWishlist(product));
			toast.success(`${product.name} added to wishlist`);
		}
	};

	// Adapt to backend item shape
	const itemData = product as any;
	const productImages = itemData.photos?.length > 0
		? itemData.photos.map((photo: any) => photo.url)
		: itemData.image ? [itemData.image] : [];
	const itemRating = itemData.ratingStats?.average ?? itemData.rating ?? 0;
	const itemReviewCount = itemData.ratingStats?.count ?? itemData.reviews ?? 0;
	const itemInStock = itemData.unit > 0 || itemData.inStock;
	const itemOriginalPrice = itemData.originalPrice ? Number(itemData.originalPrice) : null;
	const itemPrice = Number(itemData.price || 0);
	const itemMaxQuantity = Number(itemData.availableQuantity) || Number(itemData.unit) || 10;

	const productFeatures: string[] = (itemData.features as string[]) ?? [];

	const detailsTab = ["description", "reviews"];

	return (
		<Layout pageTitle={product?.name}>
			<div className="container page-wrapper mx-auto px-4 py-8">
				{/* Breadcrumb */}
				<div className="mb-6">
					<Breadcrumb
						items={[
							{ label: "Home", href: "/" },
							{ label: "Products", href: "/products" },
							{ label: productCategory || "Products", href: `/products?category=${(productCategory || "").toLowerCase()}` },
							{ label: product?.name },
						]}
					/>
				</div>

				<button
					onClick={() => router.back()}
					className="flex items-center space-x-2 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 mb-8 transition-colors"
				>
					<ArrowLeft className="h-4 w-4" />
					<span className="text-sm font-medium">Back to Products</span>
				</button>

				{/* Main Product Section */}
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-16">
					{/* Image Column */}
					<div className="space-y-4">
						<Card elevation={1} padding="none" className="overflow-hidden">
							<div className="aspect-square bg-mint-100 dark:bg-white/[0.04]">
								<img
									src={productImages[selectedImage]}
									alt={product?.name}
									className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
								/>
							</div>
						</Card>

						<div className="flex space-x-3">
							{productImages.map((image: string, index: number) => (
								<button
									key={index}
									onClick={() => setSelectedImage(index)}
									className={`w-20 h-20 rounded-radius-md overflow-hidden border-2 transition-all ${
										selectedImage === index
											? "border-primary-600 dark:border-primary-400 shadow-elevation-1"
											: "border-outline-variant dark:border-white/15 hover:border-primary-300 dark:hover:border-primary-600"
									}`}
								>
									<img
										src={image}
										alt={`${product?.name} view ${index + 1}`}
										className="w-full h-full object-cover"
									/>
								</button>
							))}
						</div>
					</div>

					{/* Info Column */}
					<div className="space-y-6">
						<div>
							<h1 className="text-2xl md:text-3xl font-bold text-on-surface dark:text-white mb-2">
								{product?.name}
							</h1>
							<p className="text-on-surface-variant dark:text-gray-400">{productCategory}</p>
						</div>

						{/* Rating */}
						<div className="flex items-center space-x-4">
							<div className="flex items-center space-x-1">
								{[...Array(5)].map((_, i) => (
									<Star
										key={i}
										className={`h-5 w-5 ${
											i < Math.floor(itemRating)
												? "text-amber-400 fill-amber-400"
												: "text-on-surface/30 dark:text-gray-600"
										}`}
									/>
								))}
							</div>
							<span className="text-lg font-medium text-on-surface dark:text-white">
								{itemRating}
							</span>
							<span className="text-on-surface-variant dark:text-gray-400">
								({itemReviewCount} reviews)
							</span>
						</div>

						{/* Price */}
						<div className="flex items-center space-x-4">
							<span className="text-3xl font-bold text-primary-600 dark:text-primary-400">
								&#8358;{itemPrice.toLocaleString()}
							</span>
							{itemOriginalPrice && (
								<div className="flex items-center space-x-2">
									<span className="text-xl text-on-surface/50 dark:text-gray-500 line-through">
										&#8358;{itemOriginalPrice.toLocaleString()}
									</span>
									<Badge variant="error">
										Save &#8358;{(itemOriginalPrice - itemPrice).toLocaleString()}
									</Badge>
								</div>
							)}
						</div>

						{/* Badges */}
						<div className="flex flex-wrap gap-2">
							<Badge variant="success">Organic Certified</Badge>
							{itemInStock ? (
								<Badge variant="info">
									<Check className="h-3 w-3 mr-1" />
									In Stock
								</Badge>
							) : (
								<Badge variant="error">Out of Stock</Badge>
							)}
						</div>

						{/* Quantity & Actions */}
						<div className="space-y-4">
							<div>
								<label className="block text-sm font-medium text-on-surface/80 dark:text-gray-300 mb-2">
									Quantity
								</label>
								<div className="flex items-center space-x-3">
									<button
										onClick={() => handleQuantityChange(quantity - 1)}
										className="p-2 border rounded-radius-md transition-colors disabled:opacity-50"
										style={{ borderColor: "var(--border-light)" }}
										disabled={quantity <= 1}
									>
										<Minus className="h-4 w-4 text-on-surface-variant dark:text-gray-300" />
									</button>
									<span className="text-xl font-semibold w-12 text-center text-on-surface dark:text-white">
										{quantity}
									</span>
									<button
										onClick={() => handleQuantityChange(quantity + 1)}
										className="p-2 border rounded-radius-md transition-colors disabled:opacity-50"
										style={{ borderColor: "var(--border-light)" }}
										disabled={quantity >= itemMaxQuantity}
									>
										<Plus className="h-4 w-4 text-on-surface-variant dark:text-gray-300" />
									</button>
								</div>
								{isInCart && (
									<p className="text-sm text-on-surface-variant dark:text-gray-400 mt-2">
										Already in cart
									</p>
								)}
							</div>

							<div className="flex space-x-4">
								{isInCart ? (
									<Button
										variant="outlined"
										color="error"
										size="lg"
										fullWidth
										leftIcon={XCircle}
										onClick={handleCartToggle}
									>
										Remove from Cart
									</Button>
								) : (
									<Button
										variant="filled"
										size="lg"
										fullWidth
										leftIcon={ShoppingCart}
										onClick={handleCartToggle}
										disabled={!itemInStock}
									>
										{itemInStock ? "Add to Cart" : "Out of Stock"}
									</Button>
								)}

								<button
									aria-label="Add to Wishlist"
									onClick={(e) => handleWishlistToggle(e)}
									className={`p-3 border rounded-radius-md transition-all ${
										isInWishlist
											? "bg-red-500 border-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700"
											: ""
									}`}
									style={!isInWishlist ? { borderColor: "var(--border-light)" } : undefined}
								>
									<Heart
										className={`h-5 w-5 ${
											isInWishlist
												? "text-white fill-white"
												: "text-on-surface-variant dark:text-gray-300"
										}`}
									/>
								</button>
							</div>
						</div>

						{/* Features */}
						{productFeatures.length > 0 && (
							<div className="space-y-3">
								<h3 className="font-semibold text-on-surface dark:text-white">
									Product Features:
								</h3>
								<ul className="space-y-2">
									{productFeatures.map((feature, index) => (
										<li
											key={index}
											className="flex items-center space-x-2 text-sm text-on-surface-variant dark:text-gray-400"
										>
											<Check className="h-4 w-4 text-primary-600 dark:text-primary-400" />
											<span>{feature}</span>
										</li>
									))}
								</ul>
							</div>
						)}

						{/* Shipping Info */}
						<Card elevation={0} padding="md" className="bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800">
							<div className="space-y-2">
								<div className="flex items-center space-x-2 text-primary-800 dark:text-primary-300">
									<Truck className="h-5 w-5" />
									<span className="font-medium">
										Free shipping on orders over &#8358;
										{appConstants.FREE_SHIPPING_THRESHOLD.toLocaleString()}
									</span>
								</div>
								<div className="flex items-center space-x-2 text-primary-700 dark:text-primary-400 text-sm">
									<Shield className="h-4 w-4" />
									<span>100% satisfaction guarantee</span>
								</div>
							</div>
						</Card>
					</div>
				</div>

				{/* Tabs Section */}
				<div className="mb-16">
					<div className="border-b border-outline-variant dark:border-white/15 relative">
						<nav className="flex space-x-8">
							{detailsTab.map((tab) => (
								<button
									key={tab}
									onClick={() => setActiveTab(tab)}
									className={`py-4 px-2 font-medium text-sm capitalize relative transition-colors ${
										activeTab === tab
											? "text-primary-600 dark:text-primary-400"
											: "text-on-surface-variant dark:text-gray-400 hover:text-on-surface/80 dark:hover:text-gray-300"
									}`}
								>
									{tab}
									{activeTab === tab && (
										<motion.div
											layoutId="tab-indicator"
											className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 dark:bg-primary-400"
											transition={{ type: "spring", stiffness: 400, damping: 30 }}
										/>
									)}
								</button>
							))}
						</nav>
					</div>

					<div className="py-8">
						{activeTab === "description" && (
							<Card elevation={0} padding="lg" className="dark:bg-white/[0.04]">
								<div className="prose max-w-none dark:prose-invert">
									<h3 className="text-xl font-semibold text-on-surface dark:text-white mb-4">
										About this product
									</h3>
									<p className="text-on-surface/80 dark:text-gray-300 leading-relaxed whitespace-pre-line">
										{product?.description || "No description available."}
									</p>
								</div>
							</Card>
						)}

						{activeTab === "reviews" && (
							<div className="space-y-8">
								<h3 className="text-xl font-semibold text-on-surface dark:text-white">
									Customer Reviews
								</h3>
								<Card elevation={0} padding="lg" className="dark:bg-white/[0.04]">
									<ReviewList itemId={Number(id)} />
								</Card>
								<Card elevation={0} padding="lg" className="dark:bg-white/[0.04]">
									<ReviewForm itemId={Number(id)} />
								</Card>
							</div>
						)}
					</div>
				</div>

				{/* Related Products */}
				{relatedProducts?.length > 0 && (
					<div>
						<h2 className="text-2xl font-bold text-on-surface dark:text-white mb-8">
							Related Products
						</h2>
						<Products products={relatedProducts} />
					</div>
				)}
			</div>
		</Layout>
	);
};

export default ProductDetailsPage;
