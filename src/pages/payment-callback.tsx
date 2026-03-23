import React, { useEffect } from "react";
import { useRouter } from "next/router";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import Layout from "@/_components/Layout";
import { useAppDispatch, useAppSelector } from "@/_redux/store";
import { checkoutAction } from "@/_redux/actions/checkout.action";
import { resetCheckout } from "@/_redux/reducers/checkout.reducer";
import { clearCart } from "@/_redux/reducers/cart.reducer";
import Card from "@/_UI/Card";
import Button from "@/_UI/Button";

const PaymentCallback: React.FC = () => {
	const router = useRouter();
	const dispatch = useAppDispatch();
	const { paymentStatus, isVerifying, error } = useAppSelector(
		(state) => state.checkout
	);

	useEffect(() => {
		const reference = router.query.reference as string;
		if (reference && router.isReady) {
			dispatch(checkoutAction.verifyPaymentAsync(reference));
		}
	}, [router.query.reference, router.isReady, dispatch]);

	useEffect(() => {
		if (paymentStatus === "success") {
			dispatch(clearCart());
		}
	}, [paymentStatus, dispatch]);

	const handleContinueShopping = () => {
		dispatch(resetCheckout());
		router.push("/products");
	};

	const handleRetry = () => {
		dispatch(resetCheckout());
		router.push("/cart");
	};

	return (
		<Layout pageTitle="Payment Status">
			<div className="min-h-[60vh] flex items-center justify-center px-4">
				<Card elevation={2} padding="lg" className="max-w-md w-full text-center">
					{isVerifying && (
						<>
							<Loader2 className="h-16 w-16 text-primary-600 dark:text-primary-400 animate-spin mx-auto mb-4" />
							<h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
								Verifying Payment
							</h2>
							<p className="text-gray-600 dark:text-gray-400">
								Please wait while we confirm your payment...
							</p>
						</>
					)}

					{paymentStatus === "success" && (
						<>
							<div className="animate-scale-in">
								<CheckCircle className="h-16 w-16 text-primary-600 dark:text-primary-400 mx-auto mb-4" />
							</div>
							<h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
								Payment Successful!
							</h2>
							<p className="text-gray-600 dark:text-gray-400 mb-6">
								Your order has been placed successfully. You
								will receive a confirmation email shortly.
							</p>
							<Button
								variant="filled"
								size="lg"
								fullWidth
								onClick={handleContinueShopping}
							>
								Continue Shopping
							</Button>
						</>
					)}

					{paymentStatus === "failed" && (
						<>
							<div className="animate-scale-in">
								<XCircle className="h-16 w-16 text-red-500 dark:text-red-400 mx-auto mb-4" />
							</div>
							<h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
								Payment Failed
							</h2>
							<p className="text-gray-600 dark:text-gray-400 mb-2">
								{error ||
									"We could not verify your payment. Please try again."}
							</p>
							<div className="space-y-3 mt-6">
								<Button
									variant="filled"
									size="lg"
									fullWidth
									onClick={handleRetry}
								>
									Try Again
								</Button>
								<Button
									variant="outlined"
									color="secondary"
									size="lg"
									fullWidth
									onClick={handleContinueShopping}
								>
									Continue Shopping
								</Button>
							</div>
						</>
					)}
				</Card>
			</div>
		</Layout>
	);
};

export default PaymentCallback;
