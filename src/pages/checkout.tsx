import React, { useState } from "react";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreditCard, Truck, CheckCircle, AlertCircle } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/_redux/store";
import { CheckoutFormData, checkoutSchema } from "@/_validations/checkout";
import { clearCart } from "@/_redux/reducers/cart.reducer";
import Image from "next/image";

const CheckoutPage: React.FC = () => {
	const router = useRouter();
	const dispatch = useAppDispatch();
	const { items, total } = useAppSelector((state) => state.cart);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [orderPlaced, setOrderPlaced] = useState(false);

	const {
		register,
		handleSubmit,
		watch,
		setValue,
		formState: { errors },
	} = useForm<CheckoutFormData>({
		resolver: zodResolver(checkoutSchema),
		defaultValues: {
			sameAsShipping: true,
		},
	});

	const sameAsShipping = watch("sameAsShipping");
	const subtotal = total;
	const shipping = total > 50 ? 0 : 9.99;
	const tax = total * 0.08;
	const finalTotal = subtotal + shipping + tax;

	React.useEffect(() => {
		if (items.length === 0 && !orderPlaced) {
			router.push("/cart");
		}
	}, [items, orderPlaced, router]);

	const onSubmit = async (data: CheckoutFormData) => {
		setIsSubmitting(true);

		// Simulate API call
		await new Promise((resolve) => setTimeout(resolve, 2000));

		// Create order
		const order = {
			id: Date.now().toString(),
			customer: data.customer,
			shippingAddress: data.shippingAddress,
			billingAddress: data.sameAsShipping
				? data.shippingAddress
				: data.billingAddress,
			items,
			subtotal,
			shipping,
			tax,
			total: finalTotal,
			status: "confirmed" as const,
			createdAt: new Date().toISOString(),
		};

		// Clear cart and show success
		dispatch(clearCart());
		setOrderPlaced(true);
		setIsSubmitting(false);
	};

	React.useEffect(() => {
		if (sameAsShipping) {
			const shippingAddress = watch("shippingAddress");
			if (shippingAddress) {
				setValue("billingAddress", shippingAddress);
			}
		}
	}, [sameAsShipping, watch, setValue]);

	if (orderPlaced) {
		return (
			<div className="container page-wrapper mx-auto px-4 py-16">
				<div className="max-w-md mx-auto text-center">
					<CheckCircle className="h-24 w-24 text-green-600 mx-auto mb-8" />
					<h1 className="text-3xl font-bold text-gray-800 mb-4">
						Order Placed!
					</h1>
					<p className="text-gray-600 mb-8">
						Thank you for your order. We'll send you a confirmation email
						shortly.
					</p>
					<button
						onClick={() => router.push("/")}
						className="bg-green-600 text-white px-8 py-3 rounded-md font-semibold hover:bg-green-700 transition-colors"
					>
						Continue Shopping
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className="container page-wrapper mx-auto px-4 py-8">
			<h1 className="text-xl md:text-3xl font-bold text-gray-800 mb-8">
				Checkout
			</h1>

			<form
				onSubmit={handleSubmit(onSubmit)}
				className="grid grid-cols-1 lg:grid-cols-3 gap-8"
			>
				{/* Checkout Form */}
				<div className="lg:col-span-2 space-y-8">
					{/* Customer Information */}
					<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
						<h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
							<CreditCard className="h-5 w-5 mr-2" />
							Customer Information
						</h2>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									First Name
								</label>
								<input
									{...register("customer.firstName")}
									className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
								/>
								{errors.customer?.firstName && (
									<p className="text-red-500 text-sm mt-1">
										{errors.customer.firstName.message}
									</p>
								)}
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Last Name
								</label>
								<input
									{...register("customer.lastName")}
									className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
								/>
								{errors.customer?.lastName && (
									<p className="text-red-500 text-sm mt-1">
										{errors.customer.lastName.message}
									</p>
								)}
							</div>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Email
								</label>
								<input
									type="email"
									{...register("customer.email")}
									className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
								/>
								{errors.customer?.email && (
									<p className="text-red-500 text-sm mt-1">
										{errors.customer.email.message}
									</p>
								)}
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Phone
								</label>
								<input
									{...register("customer.phone")}
									type="number"
									className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
								/>
								{errors.customer?.phone && (
									<p className="text-red-500 text-sm mt-1">
										{errors.customer.phone.message}
									</p>
								)}
							</div>
						</div>
					</div>

					{/* Shipping Address */}
					<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
						<h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
							<Truck className="h-5 w-5 mr-2" />
							Shipping Address
						</h2>

						<div className="space-y-4">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Street Address
								</label>
								<input
									{...register("shippingAddress.street")}
									className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
								/>
								{errors.shippingAddress?.street && (
									<p className="text-red-500 text-sm mt-1">
										{errors.shippingAddress.street.message}
									</p>
								)}
							</div>

							<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										City
									</label>
									<input
										{...register("shippingAddress.city")}
										className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
									/>
									{errors.shippingAddress?.city && (
										<p className="text-red-500 text-sm mt-1">
											{errors.shippingAddress.city.message}
										</p>
									)}
								</div>

								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										State
									</label>
									<input
										{...register("shippingAddress.state")}
										className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
									/>
									{errors.shippingAddress?.state && (
										<p className="text-red-500 text-sm mt-1">
											{errors.shippingAddress.state.message}
										</p>
									)}
								</div>

								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Zip Code
									</label>
									<input
										{...register("shippingAddress.zipCode")}
										className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
									/>
									{errors.shippingAddress?.zipCode && (
										<p className="text-red-500 text-sm mt-1">
											{errors.shippingAddress.zipCode.message}
										</p>
									)}
								</div>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Country
								</label>
								<input
									{...register("shippingAddress.country")}
									className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
								/>
								{errors.shippingAddress?.country && (
									<p className="text-red-500 text-sm mt-1">
										{errors.shippingAddress.country.message}
									</p>
								)}
							</div>
						</div>
					</div>

					{/* Billing Address */}
					<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
						<h2 className="text-xl font-semibold text-gray-800 mb-6">
							Billing Address
						</h2>

						<div className="mb-4">
							<label className="flex items-center">
								<input
									type="checkbox"
									{...register("sameAsShipping")}
									className="mr-2"
								/>
								<span className="text-sm text-gray-700">
									Same as shipping address
								</span>
							</label>
						</div>

						{!sameAsShipping && (
							<div className="space-y-4">
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Street Address
									</label>
									<input
										{...register("billingAddress.street")}
										className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
									/>
									{errors.billingAddress?.street && (
										<p className="text-red-500 text-sm mt-1">
											{errors.billingAddress.street.message}
										</p>
									)}
								</div>

								<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-2">
											City
										</label>
										<input
											{...register("billingAddress.city")}
											className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
										/>
										{errors.billingAddress?.city && (
											<p className="text-red-500 text-sm mt-1">
												{errors.billingAddress.city.message}
											</p>
										)}
									</div>

									<div>
										<label className="block text-sm font-medium text-gray-700 mb-2">
											State
										</label>
										<input
											{...register("billingAddress.state")}
											className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
										/>
										{errors.billingAddress?.state && (
											<p className="text-red-500 text-sm mt-1">
												{errors.billingAddress.state.message}
											</p>
										)}
									</div>

									<div>
										<label className="block text-sm font-medium text-gray-700 mb-2">
											Zip Code
										</label>
										<input
											{...register("billingAddress.zipCode")}
											className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
										/>
										{errors.billingAddress?.zipCode && (
											<p className="text-red-500 text-sm mt-1">
												{errors.billingAddress.zipCode.message}
											</p>
										)}
									</div>
								</div>

								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Country
									</label>
									<input
										{...register("billingAddress.country")}
										className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
									/>
									{errors.billingAddress?.country && (
										<p className="text-red-500 text-sm mt-1">
											{errors.billingAddress.country.message}
										</p>
									)}
								</div>
							</div>
						)}
					</div>
				</div>

				{/* Order Summary */}
				<div className="lg:col-span-1">
					<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-8">
						<h2 className="text-xl font-semibold text-gray-800 mb-6">
							Order Summary
						</h2>

						{/* Order Items */}
						<div className="space-y-4 mb-6">
							{items.map((item) => (
								<div
									key={item.id}
									className="flex items-center space-x-3"
								>
									<Image
										height={100}
										width={100}
										src={item.image}
										alt={item.name}
										className="w-12 h-12 object-cover rounded-md"
									/>
									<div className="flex-1">
										<h4 className="font-medium text-sm text-gray-800">
											{item.name}
										</h4>
										<p className="text-xs text-gray-500">
											Qty: {item.quantity}
										</p>
									</div>
									<span className="font-medium text-sm">
										₦{(item.price * item.quantity).toLocaleString()}
									</span>
								</div>
							))}
						</div>

						{/* Order Totals */}
						<div className="space-y-3 mb-6 border-t border-gray-200 pt-6">
							<div className="flex justify-between text-sm">
								<span className="text-gray-600">Subtotal</span>
								<span className="font-medium">
									₦{subtotal.toLocaleString()}
								</span>
							</div>
							<div className="flex justify-between text-sm">
								<span className="text-gray-600">Shipping</span>
								<span className="font-medium">
									₦{shipping.toLocaleString()}
								</span>
							</div>
							<div className="flex justify-between text-sm">
								<span className="text-gray-600">Tax</span>
								<span className="font-medium">
									₦{tax.toLocaleString()}
								</span>
							</div>
							<div className="border-t border-gray-200 pt-3">
								<div className="flex justify-between items-center">
									<span className="font-semibold text-gray-800">
										Total
									</span>
									<span className="text-xl font-bold text-green-600">
										₦{finalTotal.toLocaleString()}
									</span>
								</div>
							</div>
						</div>

						<button
							type="submit"
							disabled={isSubmitting}
							className="w-full bg-green-600 text-white py-3 rounded-md font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
						>
							{isSubmitting ? (
								<>
									<div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
									Processing...
								</>
							) : (
								"Place Order"
							)}
						</button>
					</div>
				</div>
			</form>
		</div>
	);
};

export default CheckoutPage;
