import React, {
	MouseEvent,
	useCallback,
	useEffect,
	useMemo,
	useState,
} from "react";
import Link from "next/link";
import {
	Minus,
	Plus,
	Trash2,
	ShoppingBag,
	AlertTriangle,
	RefreshCw,
	ArrowLeft,
	Heart,
	Share2,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/_redux/store";
import {
	clearCart,
	removeFromCart,
	setFreeShippingThreshold,
	updateQuantity,
} from "@/_redux/reducers/cart.reducer";
import { appConstants } from "@/_redux/constants";
import Image from "next/image";
import Layout from "@/_components/Layout";
import { useCartOperations } from "@/_hooks/useCart";
import { CartItemSkeleton } from "@/_skeletonLoading/CartItemSkeleton";
import { CartErrorBoundary } from "@/_errorBoundaries/CartErrorBoundary";
import {
	addToWishlist,
	removeFromWishlist,
} from "@/_redux/reducers/wishlist.reducer";
import toast from "react-hot-toast";

const CartPage: React.FC = () => {
	const dispatch = useAppDispatch();
	// const wishlistItems = useAppSelector((state) => state.wishlist.items);
	// 	const isInWishlist = wishlistItems?.some((item) => item.id === product.id);
	const { items, total, itemCount, loading, error } = useAppSelector(
		(state) => state.cart
	);
	const { handleQuantityChange, handleRemoveItem, isUpdating, errors } =
		useCartOperations();

	const [isClearing, setIsClearing] = useState(false);
	const [showClearConfirm, setShowClearConfirm] = useState(false);

	const calculations = useMemo(() => {
		const subtotal = total || 0;
		const freeShippingThreshold =
			appConstants.FREE_SHIPPING_THRESHOLD || 149999;
		const shipping = subtotal > freeShippingThreshold ? 0 : 20000;
		const taxRate = 0.08;
		const tax = Math.round(subtotal * taxRate);
		const finalTotal = subtotal + shipping + tax;
		const remainingForFreeShipping = Math.max(
			0,
			freeShippingThreshold - subtotal
		);

		return {
			subtotal,
			shipping,
			tax,
			finalTotal,
			freeShippingThreshold,
			remainingForFreeShipping,
			hasQualifiedForFreeShipping: subtotal > freeShippingThreshold,
		};
	}, [total]);

	useEffect(() => {
		if (itemCount !== undefined) {
			dispatch(
				setFreeShippingThreshold(appConstants.FREE_SHIPPING_THRESHOLD)
			);
		}
	}, [dispatch, itemCount]);

	const handleClearCart = useCallback(async () => {
		if (!showClearConfirm) {
			setShowClearConfirm(true);
			return;
		}

		setIsClearing(true);
		try {
			await dispatch(clearCart());
			setShowClearConfirm(false);
		} catch (error) {
			console.error("Failed to clear cart:", error);
		} finally {
			setIsClearing(false);
		}
	}, [dispatch, showClearConfirm]);

	const handleWishlistToggle = (e: MouseEvent<HTMLButtonElement>) => {
		e.stopPropagation();
		e.preventDefault();
		// if (isInWishlist) {
		// 	dispatch(removeFromWishlist(product.id));
		// 	toast.error(`${product.name} removed from wishlist 💔`);
		// } else {
		// 	dispatch(addToWishlist(product));
		// 	toast.success(`${product.name} added to wishlist ❤️`);
		// }
	};

	const handleRemoveFromWishlist = (productId: string) => {
		dispatch(removeFromWishlist(productId));
	};

	// Handle loading state
	if (loading) {
		return (
			<Layout>
				<div className="container page-wrapper mx-auto px-4 py-8">
					<div className="flex items-center justify-between mb-8">
						<div className="h-8 bg-gray-200 rounded w-64 animate-pulse"></div>
						<div className="h-6 bg-gray-200 rounded w-24 animate-pulse"></div>
					</div>
					<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
						<div className="lg:col-span-2">
							<div className="bg-white rounded-lg shadow-sm border border-gray-200">
								{[1, 2, 3].map((i) => (
									<CartItemSkeleton key={i} />
								))}
							</div>
						</div>
					</div>
				</div>
			</Layout>
		);
	}

	// Handle error state
	if (error) {
		return (
			<Layout>
				<div className="container mx-auto px-4 py-16 text-center">
					<AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
					<h2 className="text-xl font-bold text-gray-800 mb-2">
						Unable to load your cart
					</h2>
					<p className="text-gray-600 mb-4">{error}</p>
					<button
						onClick={() => window.location.reload()}
						className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 transition-colors"
					>
						<RefreshCw className="h-4 w-4 inline mr-2" />
						Try Again
					</button>
				</div>
			</Layout>
		);
	}

	// Empty cart state
	if (!items || items?.length === 0) {
		return (
			<Layout>
				<div className="container page-wrapper mx-auto px-4 py-16 text-center">
					<div className="max-w-md mx-auto">
						<ShoppingBag className="h-24 w-24 text-gray-300 mx-auto mb-8" />
						<h1 className="text-3xl font-bold text-gray-800 mb-4">
							Your Cart is Empty
						</h1>
						<p className="text-gray-600 mb-8">
							Looks like you haven't added any items to your cart yet.
							Start shopping to fill it up!
						</p>
						<div className="space-y-4">
							<Link
								href="/products"
								className="bg-green-600 text-white px-8 py-3 rounded-md font-semibold hover:bg-green-700 transition-colors inline-block w-full"
							>
								Start Shopping
							</Link>
							<Link
								href="/categories"
								className="bg-gray-100 text-gray-800 px-8 py-3 rounded-md font-semibold hover:bg-gray-200 transition-colors inline-block w-full"
							>
								Browse Categories
							</Link>
						</div>
					</div>
				</div>
			</Layout>
		);
	}

	return (
		<CartErrorBoundary>
			<Layout>
				<div className="container page-wrapper mx-auto px-4 py-8">
					{/* <div className="flex items-center justify-between mb-8">
					<h1 className="text-xl md:text-3xl font-bold text-gray-800">
						Shopping Cart ({itemCount} items)
					</h1>
					<button
						onClick={handleClearCart}
						className="text-red-600 hover:text-red-700 font-medium"
					>
						Clear Cart
					</button>
				</div> */}

					<div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
						<div className="flex items-center gap-4">
							<Link
								href="/products"
								className="p-2 hover:bg-gray-100 rounded-full transition-colors"
								aria-label="Back to products"
							>
								<ArrowLeft className="h-5 w-5 text-gray-600" />
							</Link>
							<h1 className="text-xl md:text-3xl font-bold text-gray-800">
								Shopping Cart ({itemCount}{" "}
								{itemCount === 1 ? "item" : "items"})
							</h1>
						</div>
						<div className="flex items-center gap-2">
							<button
								onClick={() => setShowClearConfirm(!showClearConfirm)}
								disabled={isClearing}
								className="text-red-600 hover:text-red-700 font-medium disabled:opacity-50 transition-colors"
							>
								{isClearing ? (
									<RefreshCw className="h-4 w-4 animate-spin inline mr-1" />
								) : null}
								{showClearConfirm ? "Cancel" : "Clear Cart"}
							</button>
							{showClearConfirm && (
								<button
									onClick={handleClearCart}
									disabled={isClearing}
									className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-50 transition-colors"
								>
									Confirm Clear
								</button>
							)}
						</div>
					</div>

					{!calculations?.hasQualifiedForFreeShipping &&
						calculations?.remainingForFreeShipping > 0 && (
							<div className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-lg p-4 mb-6">
								<div className="flex items-center justify-between mb-2">
									<span className="text-sm font-medium text-green-800">
										Free shipping progress
									</span>
									<span className="text-sm text-green-700">
										₦
										{calculations?.remainingForFreeShipping.toLocaleString()}{" "}
										remaining
									</span>
								</div>
								<div className="w-full bg-green-200 rounded-full h-2">
									<div
										className="bg-green-600 h-2 rounded-full transition-all duration-300"
										style={{
											width: `${Math.min(
												100,
												(calculations?.subtotal /
													calculations?.freeShippingThreshold) *
													100
											)}%`,
										}}
									></div>
								</div>
							</div>
						)}

					{/* <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
						<div className="lg:col-span-2">
							<div className="bg-white rounded-lg shadow-sm border border-gray-200">
								{items?.map((item) => (
									<div
										key={item?.id}
										className="p-4 md:p-6 border-b border-gray-200 last:border-b-0"
									>
										<div className="grid grid-cols-2 md:flex md:items-center space-x-4">
											<Image
												height={100}
												width={100}
												src={item.image}
												alt={item.name}
												className="w-20 h-20 object-cover rounded-md"
											/>
											<div className="flex-1">
												<h3 className="font-semibold text-md md:text-lg text-gray-800 leading-5 md:leading-7">
													{item.name}
												</h3>
												<p className="text-gray-600 text-sm mt-2 md:mt-1">
													{item.category}
												</p>
												<div className="flex items-center mt-2">
												</div>
											</div>
											<div className="flex items-center space-x-3">
												<button
													onClick={() =>
														handleQuantityChange(
															item.id,
															item.quantity - 1
														)
													}
													className="p-1 hover:bg-gray-100 rounded-full transition-colors"
												>
													<Minus className="h-4 w-4 text-gray-600" />
												</button>
												<span className="font-semibold text-lg w-8 text-center">
													{item.quantity}
												</span>
												<button
													onClick={() =>
														handleQuantityChange(
															item.id,
															item.quantity + 1
														)
													}
													className="p-1 hover:bg-gray-100 rounded-full transition-colors"
												>
													<Plus className="h-4 w-4 text-gray-600" />
												</button>
											</div>
											<div className="md:text-right">
												<div className="font-semibold text-lg text-green-600">
													₦
													{(
														item.price * item.quantity
													).toLocaleString()}
												</div>
												<div className="text-sm text-gray-500">
													₦{item.price.toLocaleString()} each
												</div>
											</div>
											<button
												onClick={() => handleRemoveItem(item.id)}
												className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
											>
												<Trash2 className="h-5 w-5" />
											</button>
										</div>
									</div>
								))}
							</div>
						</div>

						<div className="lg:col-span-1">
							<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-8">
								<h2 className="text-xl font-semibold text-gray-800 mb-6">
									Order Summary
								</h2>

								<div className="space-y-4 mb-6">
									<div className="flex justify-between">
										<span className="text-gray-600">Subtotal</span>
										<span className="font-medium">
											₦{subtotal?.toLocaleString()}
										</span>
									</div>
									<div className="flex justify-between">
										<span className="text-gray-600">
											Shipping{" "}
											{total > 50 && (
												<span className="text-green-600">
													(Free!)
												</span>
											)}
										</span>
										<span className="font-medium">
											₦{shipping?.toLocaleString()}
										</span>
									</div>
									<div className="flex justify-between">
										<span className="text-gray-600">Tax</span>
										<span className="font-medium">
											₦{tax?.toLocaleString()}
										</span>
									</div>
									<div className="border-t border-gray-200 pt-4">
										<div className="flex justify-between items-center">
											<span className="text-lg font-semibold text-gray-800">
												Total
											</span>
											<span className="text-2xl font-bold text-green-600">
												₦{finalTotal?.toLocaleString()}
											</span>
										</div>
									</div>
								</div>

								{total < 50 && (
									<div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6">
										<p className="text-sm text-green-800">
											Add ₦{(50 - total)?.toLocaleString()} more to
											get free shipping!
										</p>
									</div>
								)}

								<div className="space-y-3">
									<Link
										href="/checkout"
										className="w-full bg-green-600 text-white py-3 rounded-md font-semibold hover:bg-green-700 transition-colors text-center block"
									>
										Proceed to Checkout
									</Link>
									<Link
										href="/products"
										className="w-full bg-gray-100 text-gray-800 py-3 rounded-md font-semibold hover:bg-gray-200 transition-colors text-center block"
									>
										Continue Shopping
									</Link>
								</div>
							</div>
						</div>
					</div> */}

					<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
						{/* Cart Items */}
						<div className="lg:col-span-2">
							<div className="bg-white rounded-lg shadow-sm border border-gray-200">
								{items?.map((item) => (
									<div
										key={item?.id}
										className="p-4 md:p-6 border-b border-gray-200 last:border-b-0"
									>
										{errors[item?.id] && (
											<div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded mb-4 text-sm">
												{errors[item?.id]}
											</div>
										)}

										<div className="grid grid-cols-2 md:grid-cols-5 gap-4 items-center">
											{/* Product Image */}
											<div className="relative flex items-center justify-center">
												<Image
													height={100}
													width={100}
													src={item?.image}
													alt={item?.name}
													className="w-20 h-20 object-cover rounded-md"
													onError={(e) => {
														const target =
															e.target as HTMLImageElement;
														target.src =
															"/placeholder-product.jpg";
													}}
												/>
												{/* {item?.organic && (
													<span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs px-1 rounded-full">
														Organic
													</span>
												)} */}
											</div>

											{/* Product Info */}
											<div className="md:col-span-2">
												<h3 className="font-semibold text-md md:text-lg text-gray-800 leading-5 md:leading-7">
													{item?.name}
												</h3>
												<p className="text-gray-600 text-sm mt-1">
													{item?.category}
												</p>
												{/* {item?.stock && item?.stock < 10 && (
													<p className="text-orange-600 text-xs mt-1">
														Only {item?.stock} left in stock
													</p>
												)} */}
												<div className="flex items-center mt-2 gap-2">
													<button
														// onClick={
														// 	isWishlistPage
														// 		? () =>
														// 				handleRemoveFromWishlist(
														// 					product.id
														// 				)
														// 		: (e) => handleWishlistToggle(e)
														// }
														className="text-gray-400 hover:text-red-500 transition-colors"
													>
														<Heart className="h-4 w-4" />
													</button>
													<button className="text-gray-400 hover:text-blue-500 transition-colors">
														<Share2 className="h-4 w-4" />
													</button>
												</div>
											</div>

											{/* Quantity Controls */}
											<div className="flex items-center justify-center">
												<div className="flex items-center space-x-3 border rounded-lg p-1">
													<button
														onClick={() =>
															handleQuantityChange(
																item?.id,
																item?.quantity - 1
																// item?.stock
															)
														}
														disabled={
															isUpdating === item?.id ||
															item?.quantity <= 1
														}
														className="p-1 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
														aria-label="Decrease quantity"
													>
														<Minus className="h-4 w-4 text-gray-600" />
													</button>
													<span className="font-semibold text-lg w-8 text-center">
														{isUpdating === item?.id ? (
															<RefreshCw className="h-4 w-4 animate-spin mx-auto" />
														) : (
															item?.quantity
														)}
													</span>
													<button
														onClick={() =>
															handleQuantityChange(
																item?.id,
																item?.quantity + 1
																// item?.stock
															)
														}
														disabled={
															isUpdating === item?.id
															// ||
															// (item?.stock &&
															// 	item?.quantity >= item?.stock)
														}
														className="p-1 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
														aria-label="Increase quantity"
													>
														<Plus className="h-4 w-4 text-gray-600" />
													</button>
												</div>
											</div>

											{/* Price and Remove */}
											<div className="flex items-center justify-between md:flex-col md:items-end">
												<div className="text-right">
													<div className="font-semibold text-lg text-green-600">
														₦
														{(
															item?.price * item?.quantity
														).toLocaleString()}
													</div>
													<div className="text-sm text-gray-500">
														₦{item?.price.toLocaleString()} each
													</div>
												</div>
												<button
													onClick={() =>
														handleRemoveItem(item?.id)
													}
													disabled={isUpdating === item?.id}
													className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors disabled:opacity-50"
													aria-label="Remove item"
												>
													<Trash2 className="h-5 w-5" />
												</button>
											</div>
										</div>
									</div>
								))}
							</div>
						</div>

						{/* Order Summary */}
						<div className="lg:col-span-1">
							<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-8">
								<h2 className="text-xl font-semibold text-gray-800 mb-6">
									Order Summary
								</h2>

								<div className="space-y-4 mb-6">
									<div className="flex justify-between">
										<span className="text-gray-600">Subtotal</span>
										<span className="font-medium">
											₦{calculations?.subtotal?.toLocaleString()}
										</span>
									</div>
									<div className="flex justify-between">
										<span className="text-gray-600">
											Shipping
											{calculations?.hasQualifiedForFreeShipping && (
												<span className="text-green-600 ml-1">
													(Free!)
												</span>
											)}
										</span>
										<span className="font-medium">
											{calculations?.shipping === 0 ? (
												<span className="text-green-600">Free</span>
											) : (
												`₦${calculations?.shipping?.toLocaleString()}`
											)}
										</span>
									</div>
									<div className="flex justify-between">
										<span className="text-gray-600">Tax (8%)</span>
										<span className="font-medium">
											₦{calculations?.tax?.toLocaleString()}
										</span>
									</div>
									<div className="border-t border-gray-200 pt-4">
										<div className="flex justify-between items-center">
											<span className="text-lg font-semibold text-gray-800">
												Total
											</span>
											<span className="text-2xl font-bold text-green-600">
												₦
												{calculations?.finalTotal?.toLocaleString()}
											</span>
										</div>
									</div>
								</div>

								<div className="space-y-3">
									<Link
										href="/checkout"
										className="w-full bg-green-600 text-white py-3 rounded-md font-semibold hover:bg-green-700 transition-colors text-center block"
									>
										Proceed to Checkout
									</Link>
									<Link
										href="/products"
										className="w-full bg-gray-100 text-gray-800 py-3 rounded-md font-semibold hover:bg-gray-200 transition-colors text-center block"
									>
										Continue Shopping
									</Link>
								</div>

								{/* Secure Checkout Info */}
								<div className="mt-4 text-center text-xs text-gray-500">
									🔒 Secure checkout guaranteed
								</div>
							</div>
						</div>
					</div>
				</div>
			</Layout>
		</CartErrorBoundary>
	);
};

export default CartPage;
