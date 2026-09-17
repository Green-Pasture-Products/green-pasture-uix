"use client";

import React from "react";
import { useRouter } from "next/router";
import { motion, AnimatePresence } from "framer-motion";
import { Star, ShoppingCart, Heart, XCircle, Trash2, Check } from "lucide-react";
import { Product } from "../types";
import { useAppDispatch } from "@/_redux/store";
import { useCurrency } from "@/_hooks/useCurrency";
import { removeFromWishlist } from "@/_redux/reducers/wishlist.reducer";
import { removeFromWishlistAsync } from "@/_redux/actions/wishlist.action";
import { htmlToText } from "@/_utils/htmlToText";
import { formatWeight } from "@/_utils/formatWeight";
import { useProductActions } from "@/_hooks/useProductActions";

interface ProductListRowProps {
	product: Product;
	index: number;
}

// The row layout for list view. Shares its cart/wishlist/size-selection
// behavior with ProductCard (grid view) via useProductActions so the two
// views can't drift out of sync with each other again.
const ProductListRow: React.FC<ProductListRowProps> = ({ product, index }) => {
	const router = useRouter();
	const dispatch = useAppDispatch();
	const { formatPrice } = useCurrency();
	const {
		isAdmin,
		isWishlistPage,
		isInCart,
		isInWishlist,
		justAdded,
		choosingSize,
		setChoosingSize,
		inStock,
		price,
		variants,
		packSize,
		priceVaries,
		lowestPrice,
		originalPrice,
		discount,
		handleAddToCart,
		handleAddVariant,
		handleWishlistToggle,
	} = useProductActions(product);

	const p = product as any;
	const imageUrl = p.photos?.[0]?.url || p.image || "";
	const rating = p.ratingStats?.average ?? p.rating ?? 0;
	const reviewCount = p.ratingStats?.count ?? p.reviews ?? 0;

	return (
		<div
			onClick={() => router.push(`/product/${product.id}`)}
			className="flex items-center gap-4 p-4 rounded-xl transition-all cursor-pointer animate-row-enter"
			style={{
				background: "var(--surface-paper)",
				border: "1px solid var(--border-light)",
				animationDelay: `${index * 30}ms`,
			}}
			onMouseEnter={(e) => {
				e.currentTarget.style.boxShadow = "var(--shadow-md)";
				e.currentTarget.style.transform = "translateY(-1px)";
			}}
			onMouseLeave={(e) => {
				e.currentTarget.style.boxShadow = "none";
				e.currentTarget.style.transform = "none";
			}}
		>
			<div className="relative shrink-0">
				{imageUrl ? (
					<img
						src={imageUrl}
						alt={product.name}
						className="w-20 h-20 rounded-lg object-cover"
						style={{ border: "1px solid var(--border-light)" }}
					/>
				) : (
					<div
						className="w-20 h-20 rounded-lg flex items-center justify-center text-xl font-bold"
						style={{ background: "var(--surface-medium)", color: "var(--text-disabled)" }}
					>
						{product.name?.charAt(0)?.toUpperCase()}
					</div>
				)}
				{!priceVaries && discount && discount > 0 && (
					<span
						className="absolute top-1.5 left-1.5 text-[0.6rem] font-bold px-1 py-0.5 rounded text-white leading-none"
						style={{ background: "#ef4444" }}
					>
						-{discount}%
					</span>
				)}
			</div>

			<div className="flex-1 min-w-0">
				<h3 className="font-semibold text-sm truncate" style={{ color: "var(--text-primary)" }}>
					{product.name}
				</h3>
				{packSize && (
					<p className="text-xs mt-0.5" style={{ color: "var(--text-hint)" }}>
						{packSize}
					</p>
				)}
				<p className="text-xs mt-0.5 line-clamp-1" style={{ color: "var(--text-hint)" }}>
					{htmlToText(product.description)}
				</p>
				<div className="flex items-center gap-3 mt-2">
					<span className="text-sm font-bold" style={{ color: "var(--color-primary)" }}>
						{priceVaries && (
							<span className="mr-0.5 text-[0.65rem] font-normal" style={{ color: "var(--text-hint)" }}>
								from
							</span>
						)}
						{formatPrice(priceVaries ? lowestPrice : price)}
					</span>
					{!priceVaries && originalPrice && discount && discount > 0 && (
						<span className="text-xs line-through" style={{ color: "var(--text-hint)" }}>
							{formatPrice(originalPrice)}
						</span>
					)}
					{Number(reviewCount) > 0 && (
						<div className="flex items-center gap-0.5">
							<Star className="h-3 w-3 text-amber-400 fill-amber-400" />
							<span className="text-[0.65rem]" style={{ color: "var(--text-hint)" }}>
								{Number(rating).toFixed(1)} ({reviewCount})
							</span>
						</div>
					)}
				</div>
			</div>

			{/* Actions — stopPropagation everywhere so a tap here doesn't also
			    navigate to the product page via the row's own onClick. */}
			<div
				className="relative flex items-center gap-2 shrink-0"
				onClick={(e) => e.stopPropagation()}
			>
				{!isWishlistPage && (
					<motion.button
						aria-label="Wishlist"
						onClick={handleWishlistToggle}
						className="w-9 h-9 rounded-full flex items-center justify-center transition-colors cursor-pointer shrink-0"
						style={{
							background: isInWishlist ? "rgba(239,68,68,0.95)" : "var(--surface-high, #fff)",
							color: isInWishlist ? "#fff" : "var(--text-secondary)",
							border: `1px solid ${isInWishlist ? "rgba(239,68,68,0.95)" : "var(--border-light)"}`,
						}}
						whileHover={{ scale: 1.1 }}
						whileTap={{ scale: 0.85 }}
					>
						<Heart className={`h-4 w-4 ${isInWishlist ? "fill-current" : ""}`} />
					</motion.button>
				)}

				{isWishlistPage && !isAdmin && (
					<motion.button
						onClick={() => {
							dispatch(removeFromWishlist(product.id));
							dispatch(removeFromWishlistAsync(product.id));
						}}
						className="w-9 h-9 rounded-full flex items-center justify-center cursor-pointer shrink-0"
						style={{ border: "1px solid #ef4444", color: "#ef4444" }}
						whileTap={{ scale: 0.9 }}
						aria-label="Remove from wishlist"
					>
						<Trash2 className="h-3.5 w-3.5" />
					</motion.button>
				)}

				{variants.length > 0 && choosingSize && !justAdded && (
					<div
						className="absolute right-0 top-full mt-2 z-10 w-56 p-3 rounded-xl shadow-lg"
						style={{ background: "var(--surface-paper)", border: "1px solid var(--border-light)" }}
					>
						<div className="mb-1.5 flex items-center justify-between">
							<span className="text-[0.6rem] font-semibold uppercase tracking-[0.14em]" style={{ color: "var(--text-hint)" }}>
								Choose size
							</span>
							<button
								type="button"
								onClick={() => setChoosingSize(false)}
								aria-label="Cancel size selection"
								className="text-[0.6rem] font-medium cursor-pointer"
								style={{ color: "var(--text-hint)" }}
							>
								Cancel
							</button>
						</div>
						<div className="flex flex-wrap gap-1.5">
							{variants.map((variant: any) => {
								const soldOut = !(Number(variant.unit) > 0);
								return (
									<button
										key={variant.id}
										type="button"
										disabled={soldOut}
										onClick={() => handleAddVariant(variant)}
										className={`rounded-full px-2.5 py-1.5 text-[0.65rem] font-semibold transition-all ${soldOut ? "cursor-not-allowed line-through opacity-45" : "cursor-pointer hover:bg-primary-50 dark:hover:bg-white/5"}`}
										style={{ border: "1px solid var(--border-light)", color: "var(--text-primary)" }}
									>
										{formatWeight(variant.weightValue, variant.weightUnit) || "One size"}
									</button>
								);
							})}
						</div>
					</div>
				)}

				{isAdmin ? null : (
					<AnimatePresence mode="wait">
						{justAdded ? (
							<motion.div
								key="added"
								initial={{ opacity: 0, scale: 0.8 }}
								animate={{ opacity: 1, scale: 1 }}
								exit={{ opacity: 0, scale: 0.8 }}
								className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-full text-xs font-semibold whitespace-nowrap"
								style={{ background: "rgba(154,202,60,0.14)", color: "var(--color-primary)" }}
							>
								<Check className="h-3.5 w-3.5" />
								Added!
							</motion.div>
						) : isInCart && variants.length === 0 ? (
							<motion.button
								key="remove"
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
								onClick={handleAddToCart}
								className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-full text-xs font-semibold transition-all cursor-pointer whitespace-nowrap"
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
								onClick={variants.length > 0 ? () => setChoosingSize(true) : handleAddToCart}
								disabled={!inStock}
								className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-full text-xs font-semibold transition-all cursor-pointer border border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
								whileHover={{ scale: 1.02 }}
								whileTap={{ scale: 0.95 }}
							>
								<ShoppingCart className="h-3.5 w-3.5" />
								{inStock ? "Add to Cart" : "Out of Stock"}
							</motion.button>
						)}
					</AnimatePresence>
				)}
			</div>
		</div>
	);
};

export default ProductListRow;
