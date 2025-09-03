"use client";

import React, { MouseEvent, useState } from "react";
import Image from "next/image";
import { Star, ShoppingCart, Heart, XCircle, Trash2 } from "lucide-react";
import { Product } from "../types";
import toast from "react-hot-toast";
import { useAppDispatch, useAppSelector } from "@/_redux/store";
import { addToCart, removeFromCart } from "@/_redux/reducers/cart.reducer";
import Link from "next/link";
import {
	addToWishlist,
	removeFromWishlist,
	toggleWishlist,
} from "@/_redux/reducers/wishlist.reducer";
import { usePathname } from "next/navigation";

interface ProductCardProps {
	product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
	const pathname = usePathname();
	const dispatch = useAppDispatch();
	const isWishlistPage = pathname === "/wishlist";
	const cartItems = useAppSelector((state) => state.cart.items);
	const isInCart = cartItems.some((item) => item.id === product.id);
	const wishlistItems = useAppSelector((state) => state.wishlist.items);
	const isInWishlist = wishlistItems.some((item) => item.id === product.id);

	const handleAddToCart = () => {
		if (isInCart) {
			dispatch(removeFromCart(product.id));
			toast.error(`${product.name} removed from cart ❌`);
		} else {
			dispatch(addToCart(product));
			toast.success(`${product.name} added to cart 🛒`);
		}
	};

	const handleWishlistToggle = (e: MouseEvent<HTMLButtonElement>) => {
		e.stopPropagation();
		e.preventDefault();
		if (isInWishlist) {
			dispatch(removeFromWishlist(product.id));
			toast.error(`${product.name} removed from wishlist 💔`);
		} else {
			dispatch(addToWishlist(product));
			toast.success(`${product.name} added to wishlist ❤️`);
		}
	};

	const handleRemoveFromWishlist = (productId: string) => {
		dispatch(removeFromWishlist(productId));
	};

	return (
		<div
			key={product.id}
			className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow md:mb-4 duration-300 overflow-hidden"
		>
			{/* Product Image */}
			<Link href={`/products/${product?.id}`}>
				<div className="relative w-full aspect-square bg-[#f6f6f6]">
					<Image
						src={product?.image}
						alt={product.name}
						fill
						sizes="(max-width: 768px) 100vw, 33vw"
						priority={false}
						className="object-cover"
					/>
					{/* {product.organic && (
					<div className="absolute top-2 left-2 bg-green-600 text-white px-2 py-1 rounded-full text-xs font-semibold shadow">
						Organic
					</div>
				)}
				{product.originalPrice && (
					<div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold shadow">
						Sale
					</div>
				)} */}
					{/* Wishlist Button */}
					<button
						aria-label="Add to Wishlist"
						onClick={
							isWishlistPage
								? () => handleRemoveFromWishlist(product.id)
								: (e) => handleWishlistToggle(e)
						}
						className={`absolute bottom-2 right-2 p-2 rounded-full shadow-md transition ${
							isInWishlist
								? "bg-red-500 hover:bg-red-600"
								: "bg-white hover:bg-gray-100"
						}`}
					>
						<Heart
							className={`h-5 w-5 ${
								isInWishlist ? "text-white fill-white" : "text-gray-600"
							}`}
						/>
					</button>
				</div>
			</Link>

			{/* Product Details */}
			<div className="p-2 md:p-4">
				<Link href={`/product/${product.id}`}>
					<h3 className="font-semibold text-sm md:text-lg text-gray-800 leading-[1.15rem] md:leading-6">
						{product.name}
					</h3>
				</Link>
				<p className="text-gray-600 text-sm mt-2 line-clamp-2 leading-4 md:leading-5">
					{product.description}
				</p>

				{/* Rating */}
				<div className="flex items-center my-2 md:my-3">
					<div className="flex items-center space-x-1">
						{[...Array(5)].map((_, i) => (
							<Star
								key={i}
								className={`h-3 w-3 ${
									i < Math.floor(product.rating)
										? "text-yellow-400 fill-current"
										: "text-gray-300"
								}`}
							/>
						))}
					</div>
					<span className="text-xs text-gray-500 ml-2">
						({product.reviews})
					</span>
				</div>

				{/* Price & Button */}
				<div className="flex flex-col items-start justify-between">
					{/* Price Section */}
					<div className="flex items-center space-x-2">
						<span className="text-sm md:text-xl font-bold text-green-600">
							₦{product.price?.toLocaleString()}
						</span>
						{product.originalPrice && (
							<span className="text-xs md:text-sm text-gray-500 line-through">
								₦{product.originalPrice?.toLocaleString()}
							</span>
						)}
						{/* {!product.inStock && (
							<span className="text-red-600 text-sm font-medium">
								Out of Stock
							</span>
						)} */}
					</div>

					{/* Add / Remove from Cart */}
					<div className="flex gap-2 mt-2">
						<div className="flex-1">
							<button
								onClick={handleAddToCart}
								disabled={!product.inStock && !isInCart}
								className={`flex items-center justify-center w-full space-x-1 px-2 md:px-4 py-2 rounded-md transition-colors text-xs md:text-sm font-medium ${
									!product.inStock && !isInCart
										? "bg-gray-300 text-gray-500 cursor-not-allowed"
										: isInCart
										? "bg-red-500 text-white hover:bg-red-600"
										: "bg-green-600 text-white hover:bg-green-700"
								}`}
							>
								{isInCart ? (
									<>
										<XCircle className="h-3 md:h-4 w-3 md:w-4" />
										<span>Remove</span>
									</>
								) : (
									<>
										<ShoppingCart className="h-3 md:h-4 w-3 md:w-4" />
										<span>
											{product.inStock
												? "Add to Cart"
												: "Out of Stock"}
										</span>
									</>
								)}
							</button>
						</div>
						<div className="flex flex-wrap">
							{isWishlistPage && (
								<button
									onClick={() => handleRemoveFromWishlist(product.id)}
									className="px-2 md:px-4 py-2 border border-gray-300 rounded-md hover:bg-red-50 hover:border-red-300 transition-colors"
								>
									<Trash2 className="h-3 md:h-4 w-3 md:w-4 text-gray-600 hover:text-red-600" />
								</button>
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default ProductCard;
