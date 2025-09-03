import React, { useEffect } from "react";
import Link from "next/link";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/_redux/store";
import {
	clearCart,
	removeFromCart,
	setFreeShippingThreshold,
	updateQuantity,
} from "@/_redux/reducers/cart.reducer";
import { appConstants } from "@/_redux/constants";
import Image from "next/image";

const CartPage: React.FC = () => {
	const dispatch = useAppDispatch();
	const { items, total, itemCount } = useAppSelector((state) => state.cart);

	useEffect(() => {
		dispatch(setFreeShippingThreshold(appConstants.FREE_SHIPPING_THRESHOLD));
	}, [itemCount]);

	const handleQuantityChange = (id: string, newQuantity: number) => {
		if (newQuantity === 0) {
			dispatch(removeFromCart(id));
		} else {
			dispatch(updateQuantity({ id, quantity: newQuantity }));
		}
	};

	const handleRemoveItem = (id: string) => {
		dispatch(removeFromCart(id));
	};

	const handleClearCart = () => {
		dispatch(clearCart());
	};

	const subtotal = total;
	const shipping = total > 149999 ? 0 : 20000;
	const tax = total * 0.08;
	const finalTotal = subtotal + shipping + tax;

	if (items.length === 0) {
		return (
			<div className="container page-wrapper mx-auto px-4 py-16 text-center">
				<div className="max-w-md mx-auto">
					<ShoppingBag className="h-24 w-24 text-gray-300 mx-auto mb-8" />
					<h1 className="text-3xl font-bold text-gray-800 mb-4">
						Your Cart is Empty
					</h1>
					<p className="text-gray-600 mb-8">
						Looks like you haven't added any items to your cart yet. Start
						shopping to fill it up!
					</p>
					<Link
						href="/products"
						className="bg-green-600 text-white px-8 py-3 rounded-md font-semibold hover:bg-green-700 transition-colors inline-block"
					>
						Continue Shopping
					</Link>
				</div>
			</div>
		);
	}

	return (
		<div className="container page-wrapper mx-auto px-4 py-8">
			<div className="flex items-center justify-between mb-8">
				<h1 className="text-xl md:text-3xl font-bold text-gray-800">
					Shopping Cart ({itemCount} items)
				</h1>
				<button
					onClick={handleClearCart}
					className="text-red-600 hover:text-red-700 font-medium"
				>
					Clear Cart
				</button>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
				{/* Cart Items */}
				<div className="lg:col-span-2">
					<div className="bg-white rounded-lg shadow-sm border border-gray-200">
						{items?.map((item) => (
							<div
								key={item.id}
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
											{/* {item.organic && (
												<span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
													Organic
												</span>
											)} */}
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
											{(item.price * item.quantity).toLocaleString()}
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
									₦{subtotal?.toLocaleString()}
								</span>
							</div>
							<div className="flex justify-between">
								<span className="text-gray-600">
									Shipping{" "}
									{total > 50 && (
										<span className="text-green-600">(Free!)</span>
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
									Add ₦{(50 - total)?.toLocaleString()} more to get
									free shipping!
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
			</div>
		</div>
	);
};

export default CartPage;
