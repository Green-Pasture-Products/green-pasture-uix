import React, { MouseEvent, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import toast from "react-hot-toast";
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

const ProductDetailsPage: React.FC = () => {
	const router = useRouter();
	const { id } = router.query;
	const dispatch = useAppDispatch();
	const products = useAppSelector((state) => state.product.items);
	const cartItems = useAppSelector((state) => state.cart.items);
	const wishlistItems = useAppSelector((state) => state.wishlist.items);
	const product = products?.find((p: Product) => p.id === id);
	// const isInWishlist = wishlistItems.some((item) => item.id === product?.id);

	const [quantity, setQuantity] = useState(1);
	const [selectedImage, setSelectedImage] = useState(0);
	const [activeTab, setActiveTab] = useState("description");

	const relatedProducts = products
		.filter((p: Product) => p.category === product?.category && p.id !== id)
		.slice(0, 4);

	const cartItem = cartItems.find((item) => item.id === id);
	const isInCart = !!cartItem;
	const cartQuantity = cartItem?.quantity || 0;
	const isInWishlist = wishlistItems.some((item) => item.id === id);

	if (!product) {
		return (
			<div className="container page-wrapper mx-auto px-4 py-16 text-center">
				<h1 className="text-2xl font-bold text-gray-800 mb-4">
					Product Not Found
				</h1>
				<p className="text-gray-600 mb-8">
					The product you're looking for doesn't exist.
				</p>
				<Link
					href="/products"
					className="bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 transition-colors"
				>
					Browse All Products
				</Link>
			</div>
		);
	}

	const handleCartToggle = () => {
		if (isInCart) {
			for (let i = 0; i < quantity; i++) {
				dispatch(removeFromCart(product.id));
			}
			toast.error(`${product.name} removed from cart ❌`);
		} else {
			for (let i = 0; i < quantity; i++) {
				dispatch(addToCart(product));
				setQuantity(1);
			}
			toast.success(`${product.name} added to cart 🛒`);
		}
	};

	const handleQuantityChange = (newQuantity: number) => {
		if (newQuantity >= 1 && newQuantity <= 10) {
			setQuantity(newQuantity);
		}
	};

	const handleWishlistToggle = (e: MouseEvent<HTMLButtonElement>) => {
		e.stopPropagation();
		if (isInWishlist) {
			dispatch(removeFromWishlist(product.id));
			toast.error(`${product.name} removed from wishlist 💔`);
		} else {
			dispatch(addToWishlist(product));
			toast.success(`${product.name} added to wishlist ❤️`);
		}
	};

	// Mock additional images for demonstration
	const productImages = [
		product.image,
		product.image, // In a real app, you'd have different angles
		product.image,
	];

	const productFeatures = [
		"100% Certified Organic",
		"Non-GMO Verified",
		"Sustainably Grown",
		"Locally Sourced",
		"Pesticide-Free",
	];

	const detailsTab = [
		"description",
		// "nutrition",
		"reviews",
	];

	const productReviews = [
		{
			name: "Sarah M.",
			rating: 5,
			date: "2 weeks ago",
			review:
				"Absolutely fresh and delicious! The quality is outstanding and you can really taste the difference with organic produce.",
		},
		{
			name: "Mike R.",
			rating: 4,
			date: "1 month ago",
			review:
				"Great product, arrived fresh and well-packaged. Will definitely order again.",
		},
		{
			name: "Jennifer L.",
			rating: 5,
			date: "1 month ago",
			review:
				"Perfect ripeness and amazing flavor. Worth every penny for the organic quality.",
		},
	];

	return (
		<Layout pageTitle={`Product Details`}>
			<div className="container page-wrapper mx-auto px-4 py-8">
				<nav className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
					<Link href="/" className="hover:text-green-600">
						Home
					</Link>
					<span>/</span>
					<Link href="/products" className="hover:text-green-600">
						Products
					</Link>
					<span>/</span>
					<Link
						href={`/products?category=${product?.category.toLowerCase()}`}
						className="hover:text-green-600"
					>
						{product?.category}
					</Link>
					<span>/</span>
					<span className="text-gray-800">{product?.name}</span>
				</nav>

				<button
					onClick={() => router.back()}
					className="flex items-center space-x-2 text-green-600 hover:text-green-700 mb-8"
				>
					<ArrowLeft className="h-4 w-4" />
					<span>Back to Products</span>
				</button>

				<div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
					<div className="space-y-4">
						<div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
							<img
								src={productImages[selectedImage]}
								alt={product?.name}
								className="w-full h-full object-cover"
							/>
						</div>

						<div className="flex space-x-4">
							{productImages.map((image, index) => (
								<button
									key={index}
									onClick={() => setSelectedImage(index)}
									className={`w-20 h-20 rounded-md overflow-hidden border-2 ${
										selectedImage === index
											? "border-green-600"
											: "border-gray-200"
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

					<div className="space-y-6">
						<div>
							<h1 className="text-3xl font-bold text-gray-800 mb-2">
								{product?.name}
							</h1>
							<p className="text-gray-600">{product?.category}</p>
						</div>
						<div className="flex items-center space-x-4">
							<div className="flex items-center space-x-1">
								{[...Array(5)].map((_, i) => (
									<Star
										key={i}
										className={`h-5 w-5 ${
											i < Math.floor(product?.rating)
												? "text-yellow-400 fill-current"
												: "text-gray-300"
										}`}
									/>
								))}
							</div>
							<span className="text-lg font-medium">
								{product?.rating}
							</span>
							<span className="text-gray-500">
								({product?.reviews} reviews)
							</span>
						</div>
						<div className="flex items-center space-x-4">
							<span className="text-3xl font-bold text-green-600">
								₦{product?.price.toLocaleString()}
							</span>
							{product?.originalPrice && (
								<div className="flex items-center space-x-2">
									<span className="text-xl text-gray-500 line-through">
										₦{product?.originalPrice.toLocaleString()}
									</span>
									<span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-sm font-medium">
										Save ₦
										{(
											product?.originalPrice - product?.price
										).toLocaleString()}
									</span>
								</div>
							)}
						</div>
						<div className="flex flex-wrap gap-2">
							{product?.organic && (
								<span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
									Organic Certified
								</span>
							)}
							{product?.stock !== 0 ? (
								<span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium flex items-center">
									<Check className="h-4 w-4 mr-1" />
									In Stock
								</span>
							) : (
								<span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
									Out of Stock
								</span>
							)}
						</div>
						<div className="space-y-4">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Quantity
								</label>
								<div className="flex items-center space-x-3">
									<button
										onClick={() => handleQuantityChange(quantity - 1)}
										className="p-2 border border-gray-300 rounded-md hover:bg-gray-50"
										disabled={quantity <= 1}
									>
										<Minus className="h-4 w-4" />
									</button>
									<span className="text-xl font-semibold w-12 text-center">
										{quantity}
									</span>
									<button
										onClick={() => handleQuantityChange(quantity + 1)}
										className="p-2 border border-gray-300 rounded-md hover:bg-gray-50"
										disabled={quantity >= 99 || !isInCart}
									>
										<Plus className="h-4 w-4" />
									</button>
								</div>
								{isInCart && (
									<p className="text-sm text-gray-600 mt-2">
										{cartQuantity} already in cart
									</p>
								)}
							</div>

							<div className="flex space-x-4">
								<button
									onClick={handleCartToggle}
									disabled={product?.stock === 0 && !isInCart}
									className={`flex flex-1 items-center justify-center space-x-1 px-6 py-3 rounded-md transition-colors font-medium ${
										product?.stock === 0 && !isInCart
											? "bg-gray-300 text-gray-500 cursor-not-allowed"
											: isInCart
											? "bg-red-500 text-white hover:bg-red-600"
											: "bg-green-600 text-white hover:bg-green-700"
									}`}
								>
									{isInCart ? (
										<>
											<XCircle className="h-5 w-5" />
											<span>Remove</span>
										</>
									) : (
										<>
											<ShoppingCart className="h-5 w-5" />
											<span>
												{product?.stock !== 0
													? "Add to Cart"
													: "Out of Stock"}
											</span>
										</>
									)}
								</button>

								<button
									aria-label="Add to Wishlist"
									onClick={(e) => handleWishlistToggle(e)}
									className={`p-3 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors ${
										isInWishlist
											? "bg-red-500 hover:bg-red-600"
											: "bg-white hover:bg-gray-100"
									}`}
								>
									<Heart
										className={`h-5 w-5 ${
											isInWishlist
												? "text-white fill-white"
												: "text-gray-600"
										}`}
									/>
								</button>
							</div>
						</div>
						<div className="space-y-3">
							<h3 className="font-semibold text-gray-800">
								Product Features:
							</h3>
							<ul className="space-y-2">
								{productFeatures?.map((feature, index) => (
									<li
										key={index}
										className="flex items-center space-x-2 text-sm text-gray-600"
									>
										<Check className="h-4 w-4 text-green-600" />
										<span>{feature}</span>
									</li>
								))}
							</ul>
						</div>

						<div className="bg-green-50 border border-green-200 rounded-md p-4 space-y-2">
							<div className="flex items-center space-x-2 text-green-800">
								<Truck className="h-5 w-5" />
								<span className="font-medium">
									Free shipping on orders over ₦
									{appConstants.FREE_SHIPPING_THRESHOLD.toLocaleString()}
								</span>
							</div>
							<div className="flex items-center space-x-2 text-green-700 text-sm">
								<Shield className="h-4 w-4" />
								<span>100% satisfaction guarantee</span>
							</div>
						</div>
					</div>
				</div>

				<div className="mb-16">
					<div className="border-b border-gray-200">
						<nav className="flex space-x-8">
							{detailsTab.map((tab) => (
								<button
									key={tab}
									onClick={() => setActiveTab(tab)}
									className={`py-4 px-2 font-medium text-sm capitalize border-b-2 ${
										activeTab === tab
											? "border-green-600 text-green-600"
											: "border-transparent text-gray-500 hover:text-gray-700"
									}`}
								>
									{tab}
								</button>
							))}
						</nav>
					</div>

					<div className="py-8">
						{activeTab === "description" && (
							<div className="prose max-w-none">
								<h3 className="text-xl font-semibold text-gray-800 mb-4">
									About this product
								</h3>
								<p className="text-gray-700 mb-6 leading-relaxed">
									{product?.description}. Our{" "}
									{product?.name.toLowerCase()} is carefully selected
									from certified organic farms that follow sustainable
									farming practices. Each item is hand-picked at peak
									ripeness to ensure maximum flavor and nutritional
									value.
								</p>

								<h4 className="text-lg font-semibold text-gray-800 mb-3">
									Storage Instructions
								</h4>
								<p className="text-gray-700 mb-6">
									Store in a cool, dry place away from direct sunlight.
									{/* For best freshness, consume within 30 days of
									unsealing. */}
								</p>

								<h4 className="text-lg font-semibold text-gray-800 mb-3">
									Origin
								</h4>
								<p className="text-gray-700">
									Sourced from certified organic farms in Northern
									parts of Nigeria, known for their ideal growing
									conditions and commitment to sustainable agriculture.
								</p>
							</div>
						)}

						{activeTab === "nutrition" && (
							<div>
								<h3 className="text-xl font-semibold text-gray-800 mb-4">
									Nutritional Information
								</h3>
								<div className="bg-white border border-gray-200 rounded-lg p-6">
									<div className="grid grid-cols-2 gap-4">
										<div>
											<h4 className="font-medium text-gray-800 mb-2">
												Per Serving (100g)
											</h4>
											<ul className="space-y-2 text-sm">
												<li className="flex justify-between">
													<span>Calories</span>
													<span className="font-medium">160</span>
												</li>
												<li className="flex justify-between">
													<span>Total Fat</span>
													<span className="font-medium">15g</span>
												</li>
												<li className="flex justify-between">
													<span>Protein</span>
													<span className="font-medium">2g</span>
												</li>
												<li className="flex justify-between">
													<span>Carbohydrates</span>
													<span className="font-medium">9g</span>
												</li>
											</ul>
										</div>
										<div>
											<h4 className="font-medium text-gray-800 mb-2">
												Vitamins & Minerals
											</h4>
											<ul className="space-y-2 text-sm">
												<li className="flex justify-between">
													<span>Vitamin K</span>
													<span className="font-medium">
														26% DV
													</span>
												</li>
												<li className="flex justify-between">
													<span>Folate</span>
													<span className="font-medium">
														20% DV
													</span>
												</li>
												<li className="flex justify-between">
													<span>Potassium</span>
													<span className="font-medium">
														14% DV
													</span>
												</li>
												<li className="flex justify-between">
													<span>Vitamin E</span>
													<span className="font-medium">
														10% DV
													</span>
												</li>
											</ul>
										</div>
									</div>
									<div className="mt-4 p-3 bg-blue-50 rounded-md">
										<div className="flex items-start space-x-2">
											<Info className="h-5 w-5 text-blue-600 mt-0.5" />
											<p className="text-sm text-blue-800">
												Nutritional values are approximate and may
												vary based on growing conditions and
												ripeness.
											</p>
										</div>
									</div>
								</div>
							</div>
						)}

						{activeTab === "reviews" && (
							<div>
								<h3 className="text-xl font-semibold text-gray-800 mb-6">
									Customer Reviews
								</h3>

								<div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
									<div className="flex items-center space-x-6">
										<div className="text-center">
											<div className="text-3xl font-bold text-gray-800">
												{product.rating}
											</div>
											<div className="flex items-center justify-center space-x-1 mt-1">
												{[...Array(5)].map((_, i) => (
													<Star
														key={i}
														className={`h-4 w-4 ${
															i < Math.floor(product.rating)
																? "text-yellow-400 fill-current"
																: "text-gray-300"
														}`}
													/>
												))}
											</div>
											<div className="text-sm text-gray-600 mt-1">
												{product.reviews} reviews
											</div>
										</div>

										<div className="flex-1">
											{[5, 4, 3, 2, 1].map((rating) => (
												<div
													key={rating}
													className="flex items-center space-x-3 mb-2"
												>
													<span className="text-sm text-gray-600 w-3">
														{rating}
													</span>
													<Star className="h-4 w-4 text-yellow-400 fill-current" />
													<div className="flex-1 bg-gray-200 rounded-full h-2">
														<div
															className="bg-yellow-400 h-2 rounded-full"
															style={{
																width: `${
																	rating === 5
																		? 70
																		: rating === 4
																		? 20
																		: rating === 3
																		? 8
																		: rating === 2
																		? 1
																		: 1
																}%`,
															}}
														/>
													</div>
													<span className="text-sm text-gray-600 w-8">
														{rating === 5
															? "70%"
															: rating === 4
															? "20%"
															: rating === 3
															? "8%"
															: "1%"}
													</span>
												</div>
											))}
										</div>
									</div>
								</div>

								<div className="space-y-6">
									{productReviews.map((review, index) => (
										<div
											key={index}
											className="bg-white border border-gray-200 rounded-lg p-6"
										>
											<div className="flex items-start justify-between mb-3">
												<div>
													<div className="font-medium text-gray-800">
														{review.name}
													</div>
													<div className="flex items-center space-x-1 mt-1">
														{[...Array(5)].map((_, i) => (
															<Star
																key={i}
																className={`h-4 w-4 ${
																	i < review.rating
																		? "text-yellow-400 fill-current"
																		: "text-gray-300"
																}`}
															/>
														))}
													</div>
												</div>
												<span className="text-sm text-gray-500">
													{review.date}
												</span>
											</div>
											<p className="text-gray-700">
												{review.review}
											</p>
										</div>
									))}
								</div>
							</div>
						)}
					</div>
				</div>

				{relatedProducts?.length > 0 && (
					<div>
						<h2 className="text-2xl font-bold text-gray-800 mb-8">
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
