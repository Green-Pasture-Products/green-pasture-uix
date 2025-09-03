"use client";

import React from "react";
import { useAppSelector } from "@/_redux/store";
import { Truck } from "lucide-react";

const PromoBanner: React.FC = () => {
	const { total, itemCount, freeShippingThreshold } = useAppSelector(
		(state) => state.cart
	);

	// If cart is empty, don't show the banner
	if (itemCount === 0) return null;

	const amountLeft = freeShippingThreshold - total;
	const qualifiesForFreeShipping = total >= freeShippingThreshold;

	return (
		<div
			className={`w-full text-white text-center py-2 md:py-3 shadow-md transition-all duration-500 ${
				qualifiesForFreeShipping
					? "bg-green-700 scale-[1.02]"
					: "bg-green-600"
			}`}
		>
			<div className="flex items-center justify-center space-x-2 text-white font-medium text-xs md:text-base">
				<Truck className="w-5 h-5" />
				{qualifiesForFreeShipping ? (
					<span>
						🎉 Congratulations! You qualify for <b>Free Shipping</b>!
					</span>
				) : (
					<span>
						You're <b>₦{amountLeft?.toLocaleString()}</b> away from
						getting
						<b> Free Shipping</b> 🚀
					</span>
				)}
			</div>
		</div>
	);
};

export default PromoBanner;
