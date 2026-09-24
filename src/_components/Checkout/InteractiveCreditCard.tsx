"use client";

import React from "react";
import { motion } from "framer-motion";
import { Wifi, ShieldCheck, Lock } from "lucide-react";

export interface CardData {
	cardNumber: string;
	cardHolder: string;
	expiry: string;
	cvv: string;
}

interface InteractiveCreditCardProps {
	data: CardData;
	isFlipped: boolean;
	onFlipToggle?: () => void;
	className?: string;
}

// Helper to detect card network
export function getCardNetwork(number: string): "visa" | "mastercard" | "verve" | "generic" {
	const cleaned = number.replace(/\D/g, "");
	if (/^4/.test(cleaned)) return "visa";
	if (/^(5[1-5]|2[2-7])/.test(cleaned)) return "mastercard";
	if (/^(506|650|507)/.test(cleaned)) return "verve";
	return "generic";
}

// Helper to format 16-digit spaced string
export function formatCardNumber(number: string): string {
	const cleaned = number.replace(/\D/g, "").slice(0, 16);
	const groups = cleaned.match(/.{1,4}/g) || [];
	return groups.join(" ");
}

export const InteractiveCreditCard: React.FC<InteractiveCreditCardProps> = ({
	data,
	isFlipped,
	onFlipToggle,
	className = "",
}) => {
	const network = getCardNetwork(data.cardNumber);
	const formattedNumber = formatCardNumber(data.cardNumber);

	// Pad masked number to 16 digits
	const rawDigits = data.cardNumber.replace(/\D/g, "");
	const maskedDisplay = Array.from({ length: 16 })
		.map((_, i) => {
			if (i < rawDigits.length) return rawDigits[i];
			return "•";
		})
		.join("")
		.match(/.{1,4}/g)
		?.join(" ") || "•••• •••• •••• ••••";

	return (
		<div className={`w-full max-w-sm mx-auto perspective-1000 select-none ${className}`} style={{ perspective: "1000px" }}>
			<motion.div
				className="relative w-full aspect-[1.586/1] rounded-2xl cursor-pointer shadow-2xl transition-shadow hover:shadow-[0_20px_50px_rgba(22,101,52,0.25)]"
				onClick={onFlipToggle}
				animate={{ rotateY: isFlipped ? 180 : 0 }}
				transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
				style={{ transformStyle: "preserve-3d" }}
			>
				{/* =================================================================
				    CARD FRONT
				   ================================================================= */}
				<div
					className="absolute inset-0 w-full h-full rounded-2xl p-6 flex flex-col justify-between overflow-hidden text-white border border-white/20"
					style={{
						backfaceVisibility: "hidden",
						WebkitBackfaceVisibility: "hidden",
						background: "linear-gradient(135deg, #0f382c 0%, #1b4d3e 45%, #0a2920 100%)",
						boxShadow: "inset 0 1px 1px rgba(255,255,255,0.3), 0 12px 32px rgba(10,41,32,0.4)",
					}}
				>
					{/* Decorative Hologram / Mesh Accents */}
					<div
						className="absolute -right-12 -top-12 w-48 h-48 rounded-full pointer-events-none opacity-20"
						style={{
							background: "radial-gradient(circle, #9aca3c 0%, transparent 70%)",
						}}
					/>
					<div
						className="absolute -left-12 -bottom-12 w-48 h-48 rounded-full pointer-events-none opacity-25"
						style={{
							background: "radial-gradient(circle, #10b981 0%, transparent 70%)",
						}}
					/>

					{/* Top Row: Chip & Contactless & Brand */}
					<div className="flex items-center justify-between z-10">
						<div className="flex items-center gap-3">
							{/* Realistic EMV Gold Chip */}
							<div
								className="w-11 h-8 rounded-md relative overflow-hidden border border-amber-300/40"
								style={{
									background: "linear-gradient(135deg, #ffd700 0%, #d4af37 50%, #aa8c2c 100%)",
									boxShadow: "inset 0 1px 2px rgba(255,255,255,0.6), 0 2px 4px rgba(0,0,0,0.3)",
								}}
							>
								{/* Chip Circuit Grid */}
								<div className="absolute inset-0 opacity-40 grid grid-cols-2 grid-rows-2 border border-black/30">
									<div className="border-r border-b border-black/30" />
									<div className="border-b border-black/30" />
									<div className="border-r border-black/30" />
									<div />
								</div>
								<div className="absolute inset-x-2 inset-y-1.5 border border-black/25 rounded-sm" />
							</div>

							{/* Contactless Wave */}
							<Wifi className="h-5 w-5 rotate-90 text-white/70" />
						</div>

						{/* Network Badge */}
						<div className="font-bold text-base tracking-wider uppercase flex items-center gap-1.5">
							{network === "visa" && (
								<span className="font-black italic text-lg tracking-wider text-blue-200">
									VISA
								</span>
							)}
							{network === "mastercard" && (
								<div className="flex items-center -space-x-2">
									<span className="w-5 h-5 rounded-full bg-red-500 opacity-90" />
									<span className="w-5 h-5 rounded-full bg-amber-400 opacity-90" />
								</div>
							)}
							{network === "verve" && (
								<span className="font-extrabold text-sm tracking-widest text-emerald-300">
									VERVE
								</span>
							)}
							{network === "generic" && (
								<span className="text-xs font-semibold text-white/80 bg-white/10 px-2 py-0.5 rounded">
									DEBIT
								</span>
							)}
						</div>
					</div>

					{/* Middle: Formatted Card Number */}
					<div className="z-10 my-auto">
						<p className="font-mono text-lg sm:text-xl tracking-[0.2em] font-medium text-white/95 drop-shadow">
							{maskedDisplay}
						</p>
					</div>

					{/* Bottom Row: Card Holder & Expiry Date */}
					<div className="flex items-end justify-between z-10">
						<div className="max-w-[65%]">
							<span className="block text-[0.6rem] uppercase tracking-widest text-white/60 font-medium mb-0.5">
								Card Holder
							</span>
							<span className="block text-xs sm:text-sm font-semibold tracking-wider uppercase truncate text-white/90">
								{data.cardHolder || "YOUR FULL NAME"}
							</span>
						</div>
						<div className="text-right">
							<span className="block text-[0.6rem] uppercase tracking-widest text-white/60 font-medium mb-0.5">
								Expires
							</span>
							<span className="block text-xs sm:text-sm font-mono font-semibold tracking-wider text-white/90">
								{data.expiry || "MM/YY"}
							</span>
						</div>
					</div>
				</div>

				{/* =================================================================
				    CARD BACK
				   ================================================================= */}
				<div
					className="absolute inset-0 w-full h-full rounded-2xl flex flex-col justify-between overflow-hidden text-white border border-white/20"
					style={{
						backfaceVisibility: "hidden",
						WebkitBackfaceVisibility: "hidden",
						transform: "rotateY(180deg)",
						background: "linear-gradient(135deg, #09231b 0%, #153e32 45%, #051410 100%)",
						boxShadow: "inset 0 1px 1px rgba(255,255,255,0.2), 0 12px 32px rgba(10,41,32,0.4)",
					}}
				>
					{/* Magnetic Stripe */}
					<div className="w-full h-10 bg-[#111111] mt-5 shadow-inner" />

					{/* Signature Panel & CVV */}
					<div className="px-6 space-y-2">
						<div className="flex items-center justify-between text-[0.6rem] text-white/60 uppercase tracking-wider">
							<span>Authorized Signature</span>
							<span>CVV / CVC</span>
						</div>
						<div className="flex items-center gap-3">
							<div
								className="flex-1 h-8 rounded bg-white/90 flex items-center px-3 text-xs italic font-serif text-gray-700 select-none overflow-hidden"
								style={{
									backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 5px, rgba(0,0,0,0.04) 5px, rgba(0,0,0,0.04) 10px)",
								}}
							>
								{data.cardHolder || "Green Pasture Organics Customer"}
							</div>
							<div className="w-14 h-8 bg-amber-50 rounded border border-amber-200 flex items-center justify-center font-mono font-bold text-sm text-gray-900 shadow-inner">
								{data.cvv ? data.cvv : "•••"}
							</div>
						</div>
					</div>

					{/* Disclaimer & Hologram */}
					<div className="px-6 pb-4 flex items-center justify-between text-[0.55rem] text-white/50 leading-tight">
						<div className="flex items-center gap-1.5">
							<Lock className="h-3 w-3 text-emerald-400" />
							<span>256-Bit Encrypted Secure Checkout</span>
						</div>
						<div className="flex items-center gap-1 text-white/70 font-semibold">
							<ShieldCheck className="h-3.5 w-3.5 text-primary-400" />
							<span>PCI-DSS</span>
						</div>
					</div>
				</div>
			</motion.div>

			<div className="mt-2 text-center">
				<button
					type="button"
					onClick={onFlipToggle}
					className="text-xs text-primary-600 dark:text-primary-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
				>
					<span>Click card or focus CVV to flip</span>
				</button>
			</div>
		</div>
	);
};

export default InteractiveCreditCard;
