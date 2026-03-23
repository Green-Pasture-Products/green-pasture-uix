import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CreditCard, Truck, CheckCircle, Loader2 } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/_redux/store";
import { checkoutAction } from "@/_redux/actions/checkout.action";
import { clearCart } from "@/_redux/reducers/cart.reducer";
import { resetCheckout } from "@/_redux/reducers/checkout.reducer";
import Image from "next/image";
import Layout from "@/_components/Layout";
import toast from "react-hot-toast";
import Card from "@/_UI/Card";
import Input from "@/_UI/Input";
import Button from "@/_UI/Button";

const checkoutFormSchema = z.object({
	shippingAddress: z.object({
		street: z.string().min(1, "Street is required"),
		city: z.string().min(1, "City is required"),
		state: z.string().min(1, "State is required"),
		country: z.string().min(1, "Country is required"),
		postalCode: z.string().min(1, "Postal code is required"),
	}),
	shippingMethod: z.enum(["STANDARD", "EXPRESS", "OVERNIGHT"]),
	paymentMethod: z.enum(["CARD", "CASH_ON_DELIVERY", "WALLET"]),
});

type CheckoutFormData = z.infer<typeof checkoutFormSchema>;

const CheckoutPage: React.FC = () => {
	const router = useRouter();
	const dispatch = useAppDispatch();
	const { items, total, cartId } = useAppSelector((state) => state.cart);
	const { isAuthenticated } = useAppSelector((state) => state.auth);
	const { isCheckingOut, isPlacingOrder, paymentUrl, error } = useAppSelector(
		(state) => state.checkout
	);
	const [orderPlaced, setOrderPlaced] = useState(false);

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<CheckoutFormData>({
		resolver: zodResolver(checkoutFormSchema),
		defaultValues: {
			shippingMethod: "STANDARD",
			paymentMethod: "CARD",
		},
	});

	const subtotal = total;
	const shipping = total > 50000 ? 0 : 10000;
	const tax = Math.round(total * 0.08);
	const finalTotal = subtotal + shipping + tax;

	useEffect(() => {
		if (!isAuthenticated) {
			router.push("/login?redirect=/checkout");
		}
	}, [isAuthenticated, router]);

	useEffect(() => {
		if (items.length === 0 && !orderPlaced) {
			router.push("/cart");
		}
	}, [items, orderPlaced, router]);

	useEffect(() => {
		if (paymentUrl) {
			window.location.href = paymentUrl;
		}
	}, [paymentUrl]);

	const onSubmit = async (data: CheckoutFormData) => {
		if (!cartId) {
			toast.error("Cart not found. Please add items to your cart.");
			return;
		}

		try {
			const orderResult = await dispatch(
				checkoutAction.checkoutCartAsync(cartId)
			).unwrap();

			const orderId = orderResult?.data?.id;
			if (!orderId) {
				toast.error("Failed to create order");
				return;
			}

			if (data.paymentMethod === "CASH_ON_DELIVERY") {
				dispatch(clearCart());
				dispatch(resetCheckout());
				setOrderPlaced(true);
				toast.success("Order placed successfully!");
				return;
			}

			await dispatch(
				checkoutAction.placeOrderAsync({
					orderId,
					shippingMethod: data.shippingMethod,
					paymentMethod: data.paymentMethod,
					shippingAddress: data.shippingAddress,
				})
			).unwrap();
		} catch (err: any) {
			toast.error(err || "Checkout failed. Please try again.");
		}
	};

	if (orderPlaced) {
		return (
			<Layout pageTitle="Checkout">
				<div className="container page-wrapper mx-auto px-4 py-16">
					<div className="max-w-md mx-auto text-center animate-page-enter">
						<CheckCircle className="h-24 w-24 text-primary-600 dark:text-primary-400 mx-auto mb-8" />
						<h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
							Order Placed!
						</h1>
						<p className="text-gray-600 dark:text-gray-400 mb-8">
							Thank you for your order. We&apos;ll send you a
							confirmation email shortly.
						</p>
						<Button
							variant="filled"
							size="lg"
							onClick={() => router.push("/")}
						>
							Continue Shopping
						</Button>
					</div>
				</div>
			</Layout>
		);
	}

	const isProcessing = isCheckingOut || isPlacingOrder;

	return (
		<Layout pageTitle="Checkout">
			<div className="container page-wrapper mx-auto px-4 py-8">
				<h1 className="text-xl md:text-3xl font-bold text-gray-900 dark:text-white mb-8">
					Checkout
				</h1>

				{error && (
					<div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-radius-md mb-6">
						{error}
					</div>
				)}

				<form
					onSubmit={handleSubmit(onSubmit)}
					className="grid grid-cols-1 lg:grid-cols-3 gap-8"
				>
					<div className="lg:col-span-2 space-y-8">
						{/* Shipping Address */}
						<Card elevation={1} padding="lg">
							<h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
								<Truck className="h-5 w-5 mr-2 text-primary-600 dark:text-primary-400" />
								Shipping Address
							</h2>

							<div className="space-y-4">
								<Input
									label="Street Address"
									{...register("shippingAddress.street")}
									error={errors.shippingAddress?.street?.message}
								/>

								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<Input
										label="City"
										{...register("shippingAddress.city")}
										error={errors.shippingAddress?.city?.message}
									/>
									<Input
										label="State"
										{...register("shippingAddress.state")}
										error={errors.shippingAddress?.state?.message}
									/>
								</div>

								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<Input
										label="Postal Code"
										{...register("shippingAddress.postalCode")}
										error={errors.shippingAddress?.postalCode?.message}
									/>
									<Input
										label="Country"
										{...register("shippingAddress.country")}
										defaultValue="Nigeria"
										error={errors.shippingAddress?.country?.message}
									/>
								</div>
							</div>
						</Card>

						{/* Shipping Method */}
						<Card elevation={1} padding="lg">
							<h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
								Shipping Method
							</h2>
							<div className="space-y-3">
								{[
									{ value: "STANDARD", label: "Standard Shipping", desc: "5-7 business days" },
									{ value: "EXPRESS", label: "Express Shipping", desc: "2-3 business days" },
									{ value: "OVERNIGHT", label: "Overnight Shipping", desc: "Next business day" },
								].map((option) => (
									<label
										key={option.value}
										className="flex items-center rounded-radius-md border-2 p-4 cursor-pointer hover:border-primary-400 dark:hover:border-primary-600 transition-all has-[:checked]:border-primary-600 has-[:checked]:bg-primary-50 dark:has-[:checked]:bg-primary-900/20 border-gray-200 dark:border-white/15"
									>
										<input
											type="radio"
											value={option.value}
											{...register("shippingMethod")}
											className="mr-3 text-primary-600 focus:ring-primary-500"
										/>
										<div>
											<p className="font-medium text-gray-900 dark:text-white">
												{option.label}
											</p>
											<p className="text-sm text-gray-500 dark:text-gray-400">
												{option.desc}
											</p>
										</div>
									</label>
								))}
							</div>
						</Card>

						{/* Payment Method */}
						<Card elevation={1} padding="lg">
							<h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
								<CreditCard className="h-5 w-5 mr-2 text-primary-600 dark:text-primary-400" />
								Payment Method
							</h2>
							<div className="space-y-3">
								{[
									{ value: "CARD", label: "Pay with Card", desc: "Secure payment via Paystack" },
									{ value: "CASH_ON_DELIVERY", label: "Cash on Delivery", desc: "Pay when you receive your order" },
									{ value: "WALLET", label: "Wallet", desc: "Pay from your wallet balance" },
								].map((option) => (
									<label
										key={option.value}
										className="flex items-center rounded-radius-md border-2 p-4 cursor-pointer hover:border-primary-400 dark:hover:border-primary-600 transition-all has-[:checked]:border-primary-600 has-[:checked]:bg-primary-50 dark:has-[:checked]:bg-primary-900/20 border-gray-200 dark:border-white/15"
									>
										<input
											type="radio"
											value={option.value}
											{...register("paymentMethod")}
											className="mr-3 text-primary-600 focus:ring-primary-500"
										/>
										<div>
											<p className="font-medium text-gray-900 dark:text-white">
												{option.label}
											</p>
											<p className="text-sm text-gray-500 dark:text-gray-400">
												{option.desc}
											</p>
										</div>
									</label>
								))}
							</div>
						</Card>
					</div>

					{/* Order Summary */}
					<div className="lg:col-span-1">
						<Card elevation={2} padding="lg" className="sticky top-24">
							<h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
								Order Summary
							</h2>

							<div className="space-y-4 mb-6">
								{items.map((item) => (
									<div
										key={item.id}
										className="flex items-center space-x-3"
									>
										<Image
											height={48}
											width={48}
											src={item.image}
											alt={item.name}
											className="w-12 h-12 object-cover rounded-radius-md"
										/>
										<div className="flex-1">
											<h4 className="font-medium text-sm text-gray-900 dark:text-white">
												{item.name}
											</h4>
											<p className="text-xs text-gray-500 dark:text-gray-400">
												Qty: {item.quantity}
											</p>
										</div>
										<span className="font-medium text-sm text-gray-900 dark:text-white">
											&#8358;{(item.price * item.quantity).toLocaleString()}
										</span>
									</div>
								))}
							</div>

							<div className="space-y-3 mb-6 border-t border-gray-200 dark:border-white/15 pt-6">
								<div className="flex justify-between text-sm">
									<span className="text-gray-600 dark:text-gray-400">Subtotal</span>
									<span className="font-medium text-gray-900 dark:text-white">
										&#8358;{subtotal.toLocaleString()}
									</span>
								</div>
								<div className="flex justify-between text-sm">
									<span className="text-gray-600 dark:text-gray-400">Shipping</span>
									<span className="font-medium text-gray-900 dark:text-white">
										{shipping === 0 ? "Free" : `\u20A6${shipping.toLocaleString()}`}
									</span>
								</div>
								<div className="flex justify-between text-sm">
									<span className="text-gray-600 dark:text-gray-400">Tax</span>
									<span className="font-medium text-gray-900 dark:text-white">
										&#8358;{tax.toLocaleString()}
									</span>
								</div>
								<div className="border-t border-gray-200 dark:border-white/15 pt-3">
									<div className="flex justify-between items-center">
										<span className="font-semibold text-gray-900 dark:text-white">Total</span>
										<span className="text-xl font-bold text-primary-600 dark:text-primary-400">
											&#8358;{finalTotal.toLocaleString()}
										</span>
									</div>
								</div>
							</div>

							<Button
								type="submit"
								variant="filled"
								size="lg"
								fullWidth
								loading={isProcessing}
								disabled={isProcessing}
							>
								{isProcessing ? "Processing..." : "Place Order"}
							</Button>
						</Card>
					</div>
				</form>
			</div>
		</Layout>
	);
};

export default CheckoutPage;
