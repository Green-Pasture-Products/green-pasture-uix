import React, {
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
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useAppDispatch, useAppSelector } from "@/_redux/store";
import {
	clearCart,
	setFreeShippingThreshold,
} from "@/_redux/reducers/cart.reducer";
import { appConstants } from "@/_redux/constants";
import Image from "next/image";
import Layout from "@/_components/Layout";
import { useCartOperations } from "@/_hooks/useCart";
import { CartItemSkeleton } from "@/_skeletonLoading/CartItemSkeleton";
import Card from "@/_UI/Card";
import Badge from "@/_UI/Badge";
import Button from "@/_UI/Button";
import EmptyState from "@/_UI/EmptyState";

const CartPage: React.FC = () => {
	const dispatch = useAppDispatch();
	const { items, total, itemCount, loading, error } = useAppSelector(
		(state) => state.cart
	);
	const { handleQuantityChange, handleRemoveItem, isUpdating, errors } =
		useCartOperations();

	const [isClearing, setIsClearing] = useState(false);
	const [showClearConfirm, setShowClearConfirm] = useState(false);

	const calculations = useMemo(() => {
		const subtotal = total || 0;
		const freeShippingThreshold = appConstants.FREE_SHIPPING_THRESHOLD;
		const shipping =
			subtotal > freeShippingThreshold ? 0 : appConstants.SHIPPING_FEE;
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

	if (loading) {
		return (
			<Layout>
				<div className="container page-wrapper mx-auto px-4 py-8">
					<div className="flex items-center justify-between mb-8">
						<div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-radius-md w-64 animate-pulse" />
						<div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-radius-md w-24 animate-pulse" />
					</div>
					<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
						<div className="lg:col-span-2">
							<Card elevation={1} padding="none">
								{[1, 2, 3].map((i) => (
									<CartItemSkeleton key={i} />
								))}
							</Card>
						</div>
					</div>
				</div>
			</Layout>
		);
	}

	if (error) {
		return (
			<Layout>
				<div className="container mx-auto px-4 py-16 text-center">
					<AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
					<h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
						Unable to load your cart
					</h2>
					<p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
					<Button
						variant="filled"
						color="error"
						leftIcon={RefreshCw}
						onClick={() => window.location.reload()}
					>
						Try Again
					</Button>
				</div>
			</Layout>
		);
	}

	if (!items || items?.length === 0) {
		return (
			<Layout>
				<div className="container page-wrapper mx-auto px-4 py-16">
					<EmptyState
						icon={ShoppingBag}
						title="Your Cart is Empty"
						description="Looks like you haven't added any items to your cart yet. Start shopping to fill it up!"
						actionLabel="Start Shopping"
						actionHref="/products"
					/>
				</div>
			</Layout>
		);
	}

	return (
		<Layout>
			<div className="container page-wrapper mx-auto px-4 py-8">
				{/* Header */}
				<div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
					<div className="flex items-center gap-4">
						<Link
							href="/products"
							className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
							aria-label="Back to products"
						>
							<ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-300" />
						</Link>
						<h1 className="text-xl md:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
							Shopping Cart
							<Badge variant="neutral">{itemCount} {itemCount === 1 ? "item" : "items"}</Badge>
						</h1>
					</div>
					<div className="flex items-center gap-2">
						<Button
							variant="text"
							color="error"
							onClick={() => setShowClearConfirm(!showClearConfirm)}
							disabled={isClearing}
							loading={isClearing}
						>
							{showClearConfirm ? "Cancel" : "Clear Cart"}
						</Button>
						{showClearConfirm && (
							<Button
								variant="filled"
								color="error"
								size="sm"
								onClick={handleClearCart}
								disabled={isClearing}
							>
								Confirm Clear
							</Button>
						)}
					</div>
				</div>

				{/* Free Shipping Progress */}
				{!calculations?.hasQualifiedForFreeShipping &&
					calculations?.remainingForFreeShipping > 0 && (
						<Card elevation={0} padding="md" className="bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800 mb-6">
							<div className="flex items-center justify-between mb-2">
								<span className="text-sm font-medium text-primary-800 dark:text-primary-300">
									Free shipping progress
								</span>
								<span className="text-sm text-primary-700 dark:text-primary-400">
									&#8358;{calculations?.remainingForFreeShipping.toLocaleString()} remaining
								</span>
							</div>
							<div className="w-full bg-primary-200 dark:bg-primary-900/40 rounded-full h-2">
								<div
									className="bg-primary-600 dark:bg-primary-400 h-2 rounded-full transition-all duration-500"
									style={{
										width: `${Math.min(
											100,
											(calculations?.subtotal /
												calculations?.freeShippingThreshold) *
												100
										)}%`,
									}}
								/>
							</div>
						</Card>
					)}

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
					{/* Cart Items */}
					<div className="lg:col-span-2">
						<Card elevation={1} padding="none">
							<AnimatePresence mode="popLayout">
								{items?.map((item) => (
									<motion.div
										key={item?.id}
										layout
										initial={{ opacity: 1, scale: 1 }}
										exit={{ opacity: 0, scale: 0.95, height: 0 }}
										transition={{ duration: 0.3 }}
										className="p-4 md:p-6 border-b border-gray-200 dark:border-white/15 last:border-b-0"
									>
										{errors[item?.id] && (
											<div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-3 py-2 rounded-radius-md mb-4 text-sm">
												{errors[item?.id]}
											</div>
										)}

										<div className="grid grid-cols-2 md:grid-cols-5 gap-4 items-center">
											<div className="relative flex items-center justify-center">
												<Image
													height={100}
													width={100}
													src={item?.image}
													alt={item?.name}
													className="w-20 h-20 object-cover rounded-radius-md"
													onError={(e) => {
														const target = e.target as HTMLImageElement;
														target.src = "/placeholder-product.jpg";
													}}
												/>
											</div>

											<div className="md:col-span-2">
												<h3 className="font-semibold text-md md:text-lg text-gray-900 dark:text-white leading-5 md:leading-7">
													{item?.name}
												</h3>
												<p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
													{item?.category}
												</p>
												{item?.inStock && item?.quantity < 5 && (
													<p className="text-amber-600 dark:text-amber-400 text-xs mt-1">
														Only {item?.quantity} left in stock
													</p>
												)}
											</div>

											<div className="flex items-center justify-center">
												<div className="flex items-center space-x-3 border rounded-radius-md p-1" style={{ borderColor: "var(--border-light)" }}>
													<button
														onClick={() =>
															handleQuantityChange(
																item?.id,
																item?.quantity - 1,
																item?.quantity
															)
														}
														disabled={
															isUpdating === item?.id ||
															item?.quantity <= 1
														}
														className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
														aria-label="Decrease quantity"
													>
														<Minus className="h-4 w-4 text-gray-600 dark:text-gray-300" />
													</button>
													<span className="font-semibold text-lg w-8 text-center text-gray-900 dark:text-white">
														{isUpdating === item?.id ? (
															<RefreshCw className="h-4 w-4 animate-spin mx-auto text-gray-500" />
														) : (
															item?.quantity
														)}
													</span>
													<button
														onClick={() =>
															handleQuantityChange(
																item?.id,
																item?.quantity + 1,
																item?.quantity
															)
														}
														disabled={
															isUpdating === item?.id ||
															(item?.inStock &&
																item?.quantity >= 10)
														}
														className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
														aria-label="Increase quantity"
													>
														<Plus className="h-4 w-4 text-gray-600 dark:text-gray-300" />
													</button>
												</div>
											</div>

											<div className="flex items-center justify-between md:flex-col md:items-end">
												<div className="text-right">
													<div className="font-semibold text-lg text-primary-600 dark:text-primary-400">
														&#8358;{(item?.price * item?.quantity).toLocaleString()}
													</div>
													<div className="text-sm text-gray-500 dark:text-gray-400">
														&#8358;{item?.price.toLocaleString()} each
													</div>
												</div>
												<button
													onClick={() => handleRemoveItem(item?.id)}
													disabled={isUpdating === item?.id}
													className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors disabled:opacity-50"
													aria-label="Remove item"
												>
													<Trash2 className="h-5 w-5" />
												</button>
											</div>
										</div>
									</motion.div>
								))}
							</AnimatePresence>
						</Card>
					</div>

					{/* Order Summary */}
					<div className="lg:col-span-1">
						<Card elevation={2} padding="lg" className="sticky top-24">
							<h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
								Order Summary
							</h2>

							<div className="space-y-4 mb-6">
								<div className="flex justify-between">
									<span className="text-gray-600 dark:text-gray-400">Subtotal</span>
									<span className="font-medium text-gray-900 dark:text-white">
										&#8358;{calculations?.subtotal?.toLocaleString()}
									</span>
								</div>
								<div className="flex justify-between">
									<span className="text-gray-600 dark:text-gray-400">
										Shipping
										{calculations?.hasQualifiedForFreeShipping && (
											<span className="text-primary-600 dark:text-primary-400 ml-1">(Free!)</span>
										)}
									</span>
									<span className="font-medium text-gray-900 dark:text-white">
										{calculations?.shipping === 0 ? (
											<span className="text-primary-600 dark:text-primary-400">Free</span>
										) : (
											`\u20A6${calculations?.shipping?.toLocaleString()}`
										)}
									</span>
								</div>
								<div className="flex justify-between">
									<span className="text-gray-600 dark:text-gray-400">Tax (8%)</span>
									<span className="font-medium text-gray-900 dark:text-white">
										&#8358;{calculations?.tax?.toLocaleString()}
									</span>
								</div>
								<div className="border-t border-gray-200 dark:border-white/15 pt-4">
									<div className="flex justify-between items-center">
										<span className="text-lg font-semibold text-gray-900 dark:text-white">
											Total
										</span>
										<span className="text-2xl font-bold text-primary-600 dark:text-primary-400">
											&#8358;{calculations?.finalTotal?.toLocaleString()}
										</span>
									</div>
								</div>
							</div>

							<div className="space-y-3">
								<Link href="/checkout">
									<Button variant="filled" size="lg" fullWidth>
										Proceed to Checkout
									</Button>
								</Link>
								<Link href="/products">
									<Button variant="tonal" color="secondary" size="lg" fullWidth>
										Continue Shopping
									</Button>
								</Link>
							</div>

							<div className="mt-4 text-center text-xs text-gray-500 dark:text-gray-400">
								Secure checkout guaranteed
							</div>
						</Card>
					</div>
				</div>
			</div>
		</Layout>
	);
};

export default CartPage;
