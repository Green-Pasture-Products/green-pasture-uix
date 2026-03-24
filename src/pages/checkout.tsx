import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
	CreditCard,
	Truck,
	CheckCircle,
	Loader2,
	Zap,
	Clock,
	DollarSign,
	Wallet,
	Lock,
	ShieldCheck,
	MapPin,
	Check,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppDispatch, useAppSelector } from "@/_redux/store";
import { checkoutAction } from "@/_redux/actions/checkout.action";
import { clearCart } from "@/_redux/reducers/cart.reducer";
import { resetCheckout } from "@/_redux/reducers/checkout.reducer";
import Image from "next/image";
import Layout from "@/_components/Layout";
import toast from "react-hot-toast";
import { FormInput } from "@/_UI/FormField";
import Button from "@/_UI/Button";

/* ------------------------------------------------------------------ */
/*  Zod schema                                                        */
/* ------------------------------------------------------------------ */

const checkoutFormSchema = z.object({
	shippingAddress: z.object({
		street: z.string().min(1, "Street is required"),
		city: z.string().min(1, "City is required"),
		state: z.string().min(1, "State is required"),
		country: z.string().min(1, "Country is required"),
		postalCode: z.string().min(1, "Postal code is required"),
	}),
	shippingMethod: z.enum(["STANDARD", "EXPRESS"]),
	paymentMethod: z.enum(["CARD", "CASH_ON_DELIVERY"]),
});

type CheckoutFormData = z.infer<typeof checkoutFormSchema>;

/* ------------------------------------------------------------------ */
/*  Option data                                                       */
/* ------------------------------------------------------------------ */

const shippingOptions = [
	{ value: "STANDARD" as const, label: "Standard Shipping", desc: "5-7 business days", Icon: Truck },
	{ value: "EXPRESS" as const, label: "Express Shipping", desc: "2-3 business days", Icon: Zap },
];

const paymentOptions = [
	{ value: "CARD" as const, label: "Pay with Card", desc: "Secure payment via Paystack", Icon: CreditCard },
	{ value: "CASH_ON_DELIVERY" as const, label: "Cash on Delivery", desc: "Pay when you receive your order", Icon: DollarSign },
];

/* ------------------------------------------------------------------ */
/*  Steps data                                                        */
/* ------------------------------------------------------------------ */

const steps = [
	{ num: 1, label: "Shipping" },
	{ num: 2, label: "Payment" },
	{ num: 3, label: "Review" },
];

/* ------------------------------------------------------------------ */
/*  Animation variants                                                */
/* ------------------------------------------------------------------ */

const containerVariants = {
	hidden: {},
	visible: {
		transition: { staggerChildren: 0.12, delayChildren: 0.1 },
	},
};

const sectionVariants = {
	hidden: { opacity: 0, x: -30 },
	visible: {
		opacity: 1,
		x: 0,
		transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const },
	},
};

const sidebarVariants = {
	hidden: { opacity: 0, y: 20 },
	visible: {
		opacity: 1,
		y: 0,
		transition: { duration: 0.5, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] as const },
	},
};

const checkmarkVariants = {
	hidden: { scale: 0, opacity: 0 },
	visible: {
		scale: 1,
		opacity: 1,
		transition: { type: "spring" as const, stiffness: 200, damping: 12, mass: 0.8 },
	},
};

const successTextVariants = {
	hidden: { opacity: 0, y: 20 },
	visible: (i: number) => ({
		opacity: 1,
		y: 0,
		transition: { delay: 0.3 + i * 0.12, duration: 0.5 },
	}),
};

/* ------------------------------------------------------------------ */
/*  OptionCard                                                        */
/* ------------------------------------------------------------------ */

interface OptionCardProps {
	selected: boolean;
	Icon: React.FC<{ size?: number; className?: string }>;
	label: string;
	desc: string;
	value: string;
	onChange: () => void;
	name: string;
	inputRef?: React.Ref<HTMLInputElement>;
}

const OptionCard: React.FC<OptionCardProps> = ({ selected, Icon, label, desc, value, onChange, name, inputRef }) => (
	<motion.label
		whileTap={{ scale: 0.985 }}
		style={{
			borderColor: selected ? "var(--color-primary)" : "var(--border-light)",
			background: selected ? "rgba(22,163,74,0.06)" : "var(--surface-paper)",
			cursor: "pointer",
		}}
		className="relative flex items-center gap-4 rounded-xl border-2 p-4 transition-all"
	>
		<input ref={inputRef} type="radio" name={name} value={value} checked={selected} onChange={onChange} className="sr-only" />

		{/* Icon circle */}
		<div
			className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-colors"
			style={{
				background: selected ? "rgba(22,163,74,0.12)" : "var(--surface-low)",
				color: selected ? "var(--color-primary)" : "var(--text-secondary)",
			}}
		>
			<Icon size={20} />
		</div>

		{/* Text */}
		<div className="flex-1 min-w-0">
			<p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
				{label}
			</p>
			<p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>
				{desc}
			</p>
		</div>

		{/* Checkmark */}
		<AnimatePresence>
			{selected && (
				<motion.div
					initial={{ scale: 0 }}
					animate={{ scale: 1 }}
					exit={{ scale: 0 }}
					transition={{ type: "spring", stiffness: 300, damping: 18 }}
					className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
					style={{ background: "var(--color-primary)" }}
				>
					<Check size={14} className="text-white" />
				</motion.div>
			)}
		</AnimatePresence>
	</motion.label>
);

/* ------------------------------------------------------------------ */
/*  StepIndicator                                                     */
/* ------------------------------------------------------------------ */

const StepIndicator: React.FC<{ currentStep: number }> = ({ currentStep }) => (
	<div className="flex items-center justify-center gap-0 mb-10">
		{steps.map((step, idx) => {
			const isActive = step.num <= currentStep;
			return (
				<React.Fragment key={step.num}>
					<div className="flex items-center gap-2.5">
						<motion.div
							initial={false}
							animate={{
								background: isActive ? "var(--color-primary)" : "var(--surface-medium)",
								color: isActive ? "#fff" : "var(--text-secondary)",
							}}
							transition={{ duration: 0.35 }}
							className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold"
						>
							{step.num < currentStep ? <Check size={14} /> : step.num}
						</motion.div>
						<span
							className="text-sm font-medium hidden sm:inline"
							style={{ color: isActive ? "var(--text-primary)" : "var(--text-secondary)" }}
						>
							{step.label}
						</span>
					</div>
					{idx < steps.length - 1 && (
						<div
							className="w-10 sm:w-16 h-px mx-2 sm:mx-4"
							style={{
								background: step.num < currentStep ? "var(--color-primary)" : "var(--border-light)",
							}}
						/>
					)}
				</React.Fragment>
			);
		})}
	</div>
);

/* ------------------------------------------------------------------ */
/*  CheckoutPage                                                      */
/* ------------------------------------------------------------------ */

const CheckoutPage: React.FC = () => {
	const router = useRouter();
	const dispatch = useAppDispatch();
	const { items, total, cartId } = useAppSelector((state) => state.cart);
	const { isAuthenticated, user } = useAppSelector((state) => state.auth);
	const isAdmin = ["STAFF", "ADMIN", "SUPER_ADMIN", "MANAGER"].includes(user?.profileType?.toUpperCase() || "");
	const { isCheckingOut, isPlacingOrder, paymentUrl, error } = useAppSelector((state) => state.checkout);
	const [orderPlaced, setOrderPlaced] = useState(false);

	const {
		register,
		handleSubmit,
		setValue,
		control,
		formState: { errors },
	} = useForm<CheckoutFormData>({
		resolver: zodResolver(checkoutFormSchema),
		defaultValues: {
			shippingMethod: "STANDARD",
			paymentMethod: "CARD",
		},
	});

	const selectedShipping = useWatch({ control, name: "shippingMethod" });
	const selectedPayment = useWatch({ control, name: "paymentMethod" });

	/* Derive visual step based on form completion (all sections visible) */
	const hasShippingErrors =
		errors.shippingAddress?.street ||
		errors.shippingAddress?.city ||
		errors.shippingAddress?.state ||
		errors.shippingAddress?.country ||
		errors.shippingAddress?.postalCode;

	const visualStep = hasShippingErrors ? 1 : selectedPayment ? 3 : 2;

	const [storeConfig, setStoreConfig] = useState<any>(null);

	// Fetch store settings for tax/shipping
	useEffect(() => {
		const fetchConfig = async () => {
			try {
				const axiosInstance = (await import("@/_utils/axiosInstance")).default;
				const res = await axiosInstance.get("store/settings");
				setStoreConfig(res.data?.data);
			} catch {}
		};
		fetchConfig();
	}, []);

	const taxRate = storeConfig?.orderSettings?.taxRate ?? 0.08;
	const freeShippingThreshold = storeConfig?.orderSettings?.freeShippingThreshold ?? 50000;
	const shippingFee = storeConfig?.shippingConfig?.methods?.[0]?.baseCost ?? 10000;

	const subtotal = total;
	const shipping = subtotal > freeShippingThreshold ? 0 : shippingFee;
	const tax = Math.round(subtotal * taxRate);
	const finalTotal = subtotal + shipping + tax;

	/* ---- Auth & role guard ---- */
	useEffect(() => {
		if (!isAuthenticated) {
			router.push("/login?redirect=/checkout");
		} else if (isAdmin) {
			router.push("/cart");
		}
	}, [isAuthenticated, isAdmin, router]);

	/* ---- Empty cart guard ---- */
	useEffect(() => {
		if (items.length === 0 && !orderPlaced) {
			router.push("/cart");
		}
	}, [items, orderPlaced, router]);

	/* ---- Paystack redirect ---- */
	useEffect(() => {
		if (paymentUrl) {
			window.location.href = paymentUrl;
		}
	}, [paymentUrl]);

	/* ---- Double-click guard ---- */
	const submittingRef = React.useRef(false);

	/* ---- Submit handler ---- */
	const onSubmit = async (data: CheckoutFormData) => {
		// Prevent double submission
		if (submittingRef.current) return;
		submittingRef.current = true;

		try {
			const axiosInstance = (await import("@/_utils/axiosInstance")).default;
			let activeCartId = cartId;

			// Step 1: Ensure backend cart exists with items
			if (!activeCartId) {
				const customerRes = await axiosInstance.get("customers/me");
				const customerId = customerRes.data?.data?.id;
				if (!customerId) {
					toast.error("Please complete your profile before checkout.");
					return;
				}

				// Backend cart creation is idempotent — returns existing if one exists
				const cartRes = await axiosInstance.post(`cart/create/${customerId}`);
				activeCartId = cartRes.data?.data?.id;
				if (!activeCartId) {
					toast.error("Failed to create cart. Please try again.");
					return;
				}

				// Sync local items to backend cart (addItemToCart is atomic)
				for (const item of items) {
					try {
						await axiosInstance.post("cart-item/create", {
							cartId: activeCartId,
							itemId: Number(item.id),
							quantity: item.quantity,
						});
					} catch {
						// Item may already exist — backend handles idempotently
					}
				}
			}

			// Step 2: Create order from cart (idempotent — returns existing if cart already checked out)
			const orderResult = await dispatch(
				checkoutAction.checkoutCartAsync(activeCartId)
			).unwrap();

			const orderId = orderResult?.data?.id;
			if (!orderId) {
				toast.error("Failed to create order");
				return;
			}

			// Step 3: Handle payment method
			const backendPaymentMethod = data.paymentMethod === "CARD" ? "Paystack" : "Cash On Delivery";

			if (data.paymentMethod === "CASH_ON_DELIVERY") {
				dispatch(clearCart());
				dispatch(resetCheckout());
				setOrderPlaced(true);
				toast.success("Order placed successfully!");
				return;
			}

			// Step 4: Initialize payment (idempotent — returns existing transaction if one exists)
			await dispatch(
				checkoutAction.placeOrderAsync({
					orderId,
					shippingMethod: data.shippingMethod as any,
					paymentMethod: backendPaymentMethod as any,
					shippingAddress: {
						...data.shippingAddress,
						latitude: "0",
						longitude: "0",
						region: data.shippingAddress.state || "",
						houseAddress: data.shippingAddress.street,
					} as any,
				}),
			).unwrap();

			// Step 5: Clear cart immediately after payment init (order is created, cart is done)
			dispatch(clearCart());
			// Paystack redirect happens via the paymentUrl effect

		} catch (err: any) {
			const msg = typeof err === "string"
				? err
				: err?.message || err?.response?.data?.message || "Checkout failed. Please try again.";
			toast.error(msg);
		} finally {
			submittingRef.current = false;
		}
	};

	const isProcessing = isCheckingOut || isPlacingOrder;

	/* ================================================================ */
	/*  Success state                                                   */
	/* ================================================================ */

	if (orderPlaced) {
		return (
			<Layout pageTitle="Order Confirmed">
				<div
					className="flex min-h-[70vh] items-center justify-center px-4"
					style={{ background: "var(--surface-paper)" }}
				>
					<motion.div
						initial="hidden"
						animate="visible"
						className="max-w-md w-full text-center py-16"
					>
						{/* Animated checkmark */}
						<motion.div
							variants={checkmarkVariants}
							className="mx-auto mb-8 flex h-28 w-28 items-center justify-center rounded-full"
							style={{ background: "rgba(22,163,74,0.1)" }}
						>
							<motion.div
								className="flex h-20 w-20 items-center justify-center rounded-full"
								style={{ background: "var(--color-primary)" }}
							>
								<CheckCircle size={40} className="text-white" strokeWidth={2.5} />
							</motion.div>
						</motion.div>

						<motion.h1
							custom={0}
							variants={successTextVariants}
							className="text-3xl font-bold mb-3"
							style={{ color: "var(--text-primary)" }}
						>
							Order Placed!
						</motion.h1>

						<motion.p
							custom={1}
							variants={successTextVariants}
							className="text-base mb-10 leading-relaxed"
							style={{ color: "var(--text-secondary)" }}
						>
							Thank you for your order. We&apos;ll send you a confirmation email shortly.
						</motion.p>

						<motion.div custom={2} variants={successTextVariants}>
							<Button variant="filled" size="lg" onClick={() => router.push("/")}>
								Continue Shopping
							</Button>
						</motion.div>
					</motion.div>
				</div>
			</Layout>
		);
	}

	/* ================================================================ */
	/*  Main checkout form                                              */
	/* ================================================================ */

	return (
		<Layout pageTitle="Checkout">
			<div className="container page-wrapper mx-auto px-4 py-8">
				{/* Header */}
				<motion.div
					initial={{ opacity: 0, y: -10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.4 }}
					className="mb-2"
				>
					<h1 className="text-2xl md:text-3xl font-bold text-center" style={{ color: "var(--text-primary)" }}>
						Checkout
					</h1>
					<p className="text-center text-sm mt-1.5 flex items-center justify-center gap-1.5" style={{ color: "var(--text-secondary)" }}>
						<Lock size={13} />
						Secure checkout
					</p>
				</motion.div>

				{/* Step indicators */}
				<StepIndicator currentStep={visualStep} />

				{/* Error banner */}
				<AnimatePresence>
					{error && (
						<motion.div
							initial={{ opacity: 0, height: 0 }}
							animate={{ opacity: 1, height: "auto" }}
							exit={{ opacity: 0, height: 0 }}
							className="rounded-lg px-4 py-3 mb-6 text-sm font-medium"
							style={{
								background: "rgba(239,68,68,0.08)",
								border: "1px solid rgba(239,68,68,0.25)",
								color: "#dc2626",
							}}
						>
							{typeof error === "string" ? error : "Something went wrong. Please try again."}
						</motion.div>
					)}
				</AnimatePresence>

				<form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
					{/* ---- Left column ---- */}
					<motion.div
						className="lg:col-span-2 space-y-8"
						variants={containerVariants}
						initial="hidden"
						animate="visible"
					>
						{/* ===== Shipping Address ===== */}
						<motion.section
							variants={sectionVariants}
							className="rounded-2xl p-6 md:p-8"
							style={{
								background: "var(--surface-paper)",
								border: "1px solid var(--border-light)",
							}}
						>
							<h2
								className="text-lg font-semibold mb-6 flex items-center gap-2"
								style={{ color: "var(--text-primary)" }}
							>
								<MapPin size={18} style={{ color: "var(--color-primary)" }} />
								Shipping Address
							</h2>

							<div className="space-y-4">
								<FormInput
									label="Street Address"
									required
									placeholder="123 Main Street"
									{...register("shippingAddress.street")}
									error={errors.shippingAddress?.street?.message}
								/>

								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<FormInput
										label="City"
										required
										placeholder="Lagos"
										{...register("shippingAddress.city")}
										error={errors.shippingAddress?.city?.message}
									/>
									<FormInput
										label="State"
										required
										placeholder="Lagos"
										{...register("shippingAddress.state")}
										error={errors.shippingAddress?.state?.message}
									/>
								</div>

								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<FormInput
										label="Postal Code"
										required
										placeholder="100001"
										{...register("shippingAddress.postalCode")}
										error={errors.shippingAddress?.postalCode?.message}
									/>
									<FormInput
										label="Country"
										required
										defaultValue="Nigeria"
										{...register("shippingAddress.country")}
										error={errors.shippingAddress?.country?.message}
									/>
								</div>
							</div>
						</motion.section>

						{/* ===== Shipping Method ===== */}
						<motion.section
							variants={sectionVariants}
							className="rounded-2xl p-6 md:p-8"
							style={{
								background: "var(--surface-paper)",
								border: "1px solid var(--border-light)",
							}}
						>
							<h2
								className="text-lg font-semibold mb-5 flex items-center gap-2"
								style={{ color: "var(--text-primary)" }}
							>
								<Truck size={18} style={{ color: "var(--color-primary)" }} />
								Shipping Method
							</h2>

							<div className="space-y-3">
								{shippingOptions.map((opt) => (
									<OptionCard
										key={opt.value}
										selected={selectedShipping === opt.value}
										Icon={opt.Icon}
										label={opt.label}
										desc={opt.desc}
										value={opt.value}
										name="shippingMethod"
										onChange={() => setValue("shippingMethod", opt.value)}
									/>
								))}
							</div>
						</motion.section>

						{/* ===== Payment Method ===== */}
						<motion.section
							variants={sectionVariants}
							className="rounded-2xl p-6 md:p-8"
							style={{
								background: "var(--surface-paper)",
								border: "1px solid var(--border-light)",
							}}
						>
							<h2
								className="text-lg font-semibold mb-5 flex items-center gap-2"
								style={{ color: "var(--text-primary)" }}
							>
								<CreditCard size={18} style={{ color: "var(--color-primary)" }} />
								Payment Method
							</h2>

							<div className="space-y-3">
								{paymentOptions.map((opt) => (
									<OptionCard
										key={opt.value}
										selected={selectedPayment === opt.value}
										Icon={opt.Icon}
										label={opt.label}
										desc={opt.desc}
										value={opt.value}
										name="paymentMethod"
										onChange={() => setValue("paymentMethod", opt.value)}
									/>
								))}
							</div>

							{/* Security badges */}
							<div
								className="mt-5 flex items-center gap-4 text-xs pt-4"
								style={{ borderTop: "1px solid var(--border-light)", color: "var(--text-secondary)" }}
							>
								<span className="flex items-center gap-1">
									<ShieldCheck size={13} />
									256-bit encryption
								</span>
								<span className="flex items-center gap-1">
									<Lock size={13} />
									PCI compliant
								</span>
							</div>
						</motion.section>
					</motion.div>

					{/* ---- Right column: Order Summary ---- */}
					<motion.div
						className="lg:col-span-1"
						variants={sidebarVariants}
						initial="hidden"
						animate="visible"
					>
						<div
							className="sticky top-24 rounded-2xl p-6"
							style={{
								background: "var(--surface-paper)",
								border: "1px solid var(--border-light)",
							}}
						>
							<h2 className="text-lg font-semibold mb-5" style={{ color: "var(--text-primary)" }}>
								Order Summary
							</h2>

							{/* Product list */}
							<div className="space-y-4 mb-5">
								{items.map((item) => {
									const imgSrc = (item as any).photos?.[0]?.url || item.image || "";
									return (
										<div key={item.id} className="flex items-center gap-3">
											<div
												className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg"
												style={{ background: "var(--surface-low)" }}
											>
												{imgSrc ? (
													<Image
														height={48}
														width={48}
														src={imgSrc}
														alt={item.name}
														className="h-full w-full object-cover"
													/>
												) : (
													<div className="flex h-full w-full items-center justify-center text-xs" style={{ color: "var(--text-secondary)" }}>
														No img
													</div>
												)}
											</div>
											<div className="flex-1 min-w-0">
												<h4
													className="text-sm font-medium truncate"
													style={{ color: "var(--text-primary)" }}
												>
													{item.name}
												</h4>
												<p className="text-xs" style={{ color: "var(--text-secondary)" }}>
													Qty: {item.quantity}
												</p>
											</div>
											<span className="text-sm font-semibold shrink-0" style={{ color: "var(--text-primary)" }}>
												&#8358;{(item.price * item.quantity).toLocaleString()}
											</span>
										</div>
									);
								})}
							</div>

							{/* Divider */}
							<div className="h-px w-full mb-4" style={{ background: "var(--border-light)" }} />

							{/* Pricing breakdown */}
							<div className="space-y-2.5 mb-5">
								<div className="flex justify-between text-sm">
									<span style={{ color: "var(--text-secondary)" }}>Subtotal</span>
									<span className="font-medium" style={{ color: "var(--text-primary)" }}>
										&#8358;{subtotal.toLocaleString()}
									</span>
								</div>
								<div className="flex justify-between text-sm">
									<span style={{ color: "var(--text-secondary)" }}>Shipping</span>
									<span className="font-medium" style={{ color: shipping === 0 ? "var(--color-primary)" : "var(--text-primary)" }}>
										{shipping === 0 ? "Free" : `\u20A6${shipping.toLocaleString()}`}
									</span>
								</div>
								<div className="flex justify-between text-sm">
									<span style={{ color: "var(--text-secondary)" }}>Tax ({Math.round(taxRate * 100)}%)</span>
									<span className="font-medium" style={{ color: "var(--text-primary)" }}>
										&#8358;{tax.toLocaleString()}
									</span>
								</div>

								{/* Total divider */}
								<div className="h-px w-full" style={{ background: "var(--border-light)" }} />

								<div className="flex justify-between items-center pt-1">
									<span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
										Total
									</span>
									<span className="text-xl font-bold" style={{ color: "var(--color-primary)" }}>
										&#8358;{finalTotal.toLocaleString()}
									</span>
								</div>
							</div>

							{/* Place Order button */}
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

							{/* Trust text */}
							<p
								className="text-center text-xs mt-4 flex items-center justify-center gap-1"
								style={{ color: "var(--text-secondary)" }}
							>
								<Lock size={11} />
								Secure checkout
							</p>
						</div>
					</motion.div>
				</form>
			</div>
		</Layout>
	);
};

export default CheckoutPage;
