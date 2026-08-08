"use client";

import React, { MouseEvent, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Star, ShoppingCart, Heart, XCircle, Trash2, Check } from "lucide-react";
import { Product } from "../types";
import toast from "react-hot-toast";
import { useAppDispatch, useAppSelector } from "@/_redux/store";
import { useCurrency } from "@/_hooks/useCurrency";
import { addToCart, removeFromCart } from "@/_redux/reducers/cart.reducer";
import Link from "next/link";
import {
	addToWishlist,
	removeFromWishlist,
} from "@/_redux/reducers/wishlist.reducer";
import { usePathname } from "next/navigation";
import { appConstants } from "@/_redux/constants";

interface ProductCardProps {
	product: Product;
}

const ADMIN_ROLES: readonly string[] = appConstants.ADMIN_ROLES;

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
	const pathname = usePathname();
	const dispatch = useAppDispatch();
	const { formatPrice } = useCurrency();
	const { user } = useAppSelector((state) => state.auth);
	const isAdmin = ADMIN_ROLES.includes(user?.profileType?.toUpperCase() || "");
	const isWishlistPage = pathname === "/wishlist";
	const cartItems = useAppSelector((state) => state.cart.items);
	const isInCart = cartItems.some((item) => item.id === product.id);
	const wishlistItems = useAppSelector((state) => state.wishlist.items);
	const isInWishlist = wishlistItems?.some((item) => item.id === product.id);
	const [justAdded, setJustAdded] = useState(false);

	// Backend item shape adaptation
	const p = product as any;
	const imageUrl = p.photos?.[0]?.url || p.image || "";
	const rating = p.ratingStats?.average ?? p.rating ?? 0;
	const reviewCount = p.ratingStats?.count ?? p.reviews ?? 0;
	const inStock = p.unit > 0 || p.inStock;
	const price = Number(p.price || 0);
	// Admin kill-switch: hide the sale treatment site-wide without touching the
	// stored originalPrice, so it can be switched back on unchanged.
	const showDiscount = useAppSelector((state) => state.settings.showDiscountBadges);
	const originalPrice =
		showDiscount && p.originalPrice ? Number(p.originalPrice) : null;
	const discount = originalPrice && originalPrice > price
		? Math.round(((originalPrice - price) / originalPrice) * 100)
		: null;

	const handleAddToCart = () => {
		if (isInCart) {
			dispatch(removeFromCart(product.id));
			toast.error(`${product.name} removed from cart`);
		} else {
			dispatch(addToCart(product));
			setJustAdded(true);
			toast.success(`${product.name} added to cart`);
			setTimeout(() => setJustAdded(false), 1500);
		}
	};

	const handleWishlistToggle = (e: MouseEvent<HTMLButtonElement>) => {
		e.stopPropagation();
		e.preventDefault();
		if (isInWishlist) {
			dispatch(removeFromWishlist(product.id));
			toast.error(`${product.name} removed from wishlist`);
		} else {
			dispatch(addToWishlist(product));
			toast.success(`${product.name} added to wishlist`);
		}
	};

	return (
		<motion.div
			layout
			className="group relative overflow-hidden rounded-2xl"
			style={{
				background: "var(--surface-paper)",
				border: "1px solid var(--border-light)",
			}}
			whileHover={{
				y: -6,
				boxShadow: "0 22px 44px -18px rgba(12,43,37,0.30)",
				transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
			}}
		>
			{/* Image */}
			<Link href={`/product/${product?.id}`}>
				<div
					className="relative aspect-[4/5] overflow-hidden"
					style={{ background: "var(--surface-medium)" }}
				>
					{imageUrl ? (
						<Image
							src={imageUrl}
							alt={product.name}
							fill
							sizes="(max-width: 640px) 50vw, (max-width: 1280px) 25vw, 20vw"
							className="object-contain p-4 transition-transform duration-700 ease-out group-hover:scale-105"
						/>
					) : (
						<div
							className="w-full h-full flex items-center justify-center text-4xl font-bold"
							style={{ color: "var(--text-disabled)" }}
						>
							{product.name?.charAt(0)?.toUpperCase()}
						</div>
					)}

					{/* Gradient overlay on hover */}
					<div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

					{/* Out of stock overlay */}
					{!inStock && (
						<div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] flex items-center justify-center">
							<span className="text-white text-xs font-semibold px-3 py-1.5 rounded-full bg-red-500/90 shadow-lg">
								Out of Stock
							</span>
						</div>
					)}

					{/* Discount badge */}
					{discount && discount > 0 && (
						<motion.div
							initial={{ scale: 0, rotate: -12 }}
							animate={{ scale: 1, rotate: 0 }}
							className="absolute left-3 top-3 rounded-full px-2.5 py-1 text-[0.6rem] font-bold text-white"
							style={{ background: "#ef4444" }}
						>
							-{discount}%
						</motion.div>
					)}

					{/* Wishlist button */}
					<motion.button
						aria-label="Wishlist"
						onClick={
							isWishlistPage
								? () => dispatch(removeFromWishlist(product.id))
								: (e) => handleWishlistToggle(e)
						}
						className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md transition-all cursor-pointer"
						style={{
							background: isInWishlist
								? "rgba(239,68,68,0.9)"
								: "rgba(255,255,255,0.8)",
							color: isInWishlist ? "#fff" : "var(--text-secondary)",
							opacity: isInWishlist ? 1 : undefined,
						}}
						initial={{ opacity: 0, scale: 0.5 }}
						animate={{ opacity: isInWishlist ? 1 : 0, scale: isInWishlist ? 1 : 0.5 }}
						whileHover={{ opacity: 1, scale: 1 }}
						whileTap={{ scale: 0.85 }}
					>
						<Heart className={`h-4 w-4 ${isInWishlist ? "fill-current" : ""}`} />
					</motion.button>

					{/* Quick view on hover — bottom of image */}
					<div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out">
						<div className="text-center text-[0.65rem] font-medium py-2 rounded-full backdrop-blur-md bg-white text-primary-700 hover:bg-primary-50 hover:shadow-[0_0_12px_rgba(154,202,60,0.5)] dark:hover:shadow-[0_0_10px_rgba(154,202,60,0.25)] transition-all">
							View Details →
						</div>
					</div>
				</div>
			</Link>

			{/* Details */}
			<div className="p-3 sm:p-5">
				<Link href={`/product/${product.id}`}>
					<h3
						className="font-display text-base leading-snug mb-1 line-clamp-1 transition-colors"
						style={{ color: "var(--text-primary)", fontWeight: 500 }}
					>
						{product.name}
					</h3>
				</Link>

				<p
					className="text-[0.7rem] line-clamp-2 leading-relaxed mb-2.5"
					style={{ color: "var(--text-hint)" }}
				>
					{product.description}
				</p>

				{/* Rating */}
				<div className="flex items-center gap-1.5 mb-2.5">
					<div className="flex items-center gap-px">
						{[...Array(5)].map((_, i) => (
							<Star
								key={i}
								className={`h-3 w-3 ${
									i < Math.floor(rating)
										? "text-amber-400 fill-amber-400"
										: ""
								}`}
								style={
									i >= Math.floor(rating)
										? { color: "var(--text-disabled)" }
										: undefined
								}
							/>
						))}
					</div>
					<span className="text-[0.6rem] tabular-nums" style={{ color: "var(--text-hint)" }}>
						{Number(rating).toFixed(1)} ({reviewCount})
					</span>
				</div>

				{/* Price */}
				<div className="flex items-baseline gap-2 mb-3">
					<span className="font-display text-xl tabular-nums" style={{ color: "var(--color-primary)", fontWeight: 600 }}>
						{formatPrice(price)}
					</span>
					{originalPrice && originalPrice > price && (
						<span className="text-xs line-through tabular-nums" style={{ color: "var(--text-disabled)" }}>
							{formatPrice(originalPrice)}
						</span>
					)}
				</div>

				{/* Actions */}
				<div className="flex gap-2">
					{isAdmin ? (
						<Link
							href={`/product/${product.id}`}
							className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-full text-xs font-semibold border border-outline dark:border-white/15 text-primary-700 dark:text-primary-400 hover:bg-primary-50 hover:shadow-[0_0_12px_rgba(154,202,60,0.5)] dark:hover:bg-white/5 dark:hover:shadow-[0_0_10px_rgba(154,202,60,0.25)] transition-all"
						>
							View Details
						</Link>
					) : (
					<AnimatePresence mode="wait">
						{justAdded ? (
							<motion.div
								key="added"
								initial={{ opacity: 0, scale: 0.8 }}
								animate={{ opacity: 1, scale: 1 }}
								exit={{ opacity: 0, scale: 0.8 }}
								className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-full text-xs font-semibold"
								style={{ background: "rgba(154,202,60,0.14)", color: "var(--color-primary)" }}
							>
								<Check className="h-3.5 w-3.5" />
								Added!
							</motion.div>
						) : isInCart ? (
							<motion.button
								key="remove"
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
								onClick={handleAddToCart}
								className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-full text-xs font-semibold transition-all cursor-pointer"
								style={{ border: "1px solid #ef4444", color: "#ef4444" }}
								whileTap={{ scale: 0.95 }}
							>
								<XCircle className="h-3.5 w-3.5" />
								Remove
							</motion.button>
						) : (
							<motion.button
								key="add"
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
								onClick={handleAddToCart}
								disabled={!inStock}
								className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-full text-xs font-semibold text-white bg-primary-600 hover:bg-gradient-to-r hover:from-primary-700 hover:via-primary-600 hover:to-lime-600 hover:shadow-[0_0_16px_rgba(154,202,60,0.45)] dark:hover:to-lime-700 dark:hover:shadow-[0_0_12px_rgba(154,202,60,0.25)] transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
								whileHover={{ scale: 1.02 }}
								whileTap={{ scale: 0.95 }}
							>
								<ShoppingCart className="h-3.5 w-3.5" />
								{inStock ? "Add to Cart" : "Out of Stock"}
							</motion.button>
						)}
					</AnimatePresence>
					)}

					{isWishlistPage && !isAdmin && (
						<motion.button
							onClick={() => dispatch(removeFromWishlist(product.id))}
							className="p-2 rounded-lg cursor-pointer"
							style={{ border: "1px solid #ef4444", color: "#ef4444" }}
							whileTap={{ scale: 0.9 }}
						>
							<Trash2 className="h-3.5 w-3.5" />
						</motion.button>
					)}
				</div>
			</div>
		</motion.div>
	);
};

export default ProductCard;
