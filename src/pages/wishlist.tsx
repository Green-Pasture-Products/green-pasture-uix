import React from "react";
import Link from "next/link";
import { Heart, ShoppingCart } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/_redux/store";
import toast from "react-hot-toast";

import {
	clearWishlist,
	removeFromWishlist,
} from "@/_redux/reducers/wishlist.reducer";
import { addToCart } from "@/_redux/reducers/cart.reducer";
import Products from "@/_components/Products";
import Layout from "@/_components/Layout";
import EmptyState from "@/_UI/EmptyState";
import Button from "@/_UI/Button";
import Badge from "@/_UI/Badge";

const WishlistPage: React.FC = () => {
	const dispatch = useAppDispatch();
	const cartItems = useAppSelector((state) => state.cart.items);
	const { items, wishlistItemCount } = useAppSelector(
		(state) => state.wishlist
	);

	const handleClearWishlist = () => {
		dispatch(clearWishlist());
	};

	const handleAddAllToCart = () => {
		items.forEach((product) => {
			const isInCart = cartItems.some((item) => item.id === product.id);
			if (product.inStock && !isInCart) {
				dispatch(addToCart(product));
				toast.success(`${product.name} added to cart`);
				dispatch(removeFromWishlist(product.id));
			}
		});
	};

	if (items.length === 0) {
		return (
			<Layout pageTitle="Wishlist">
				<div className="container page-wrapper mx-auto px-4 py-16">
					<EmptyState
						icon={Heart}
						title="Your Wishlist is Empty"
						description="Save your favorite products to your wishlist so you can easily find them later."
						actionLabel="Start Shopping"
						actionHref="/products"
					/>
				</div>
			</Layout>
		);
	}

	return (
		<Layout pageTitle="Wishlist">
			<div className="container page-wrapper mx-auto px-4 py-8">
				<div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
					<div>
						<h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
							My Wishlist
							<Badge variant="neutral">{wishlistItemCount} {wishlistItemCount === 1 ? "item" : "items"}</Badge>
						</h1>
					</div>
					<div className="flex space-x-3 mt-4 md:mt-0">
						<Button
							variant="tonal"
							leftIcon={ShoppingCart}
							onClick={handleAddAllToCart}
						>
							Add All to Cart
						</Button>
						<Button
							variant="outlined"
							color="error"
							onClick={handleClearWishlist}
						>
							Clear Wishlist
						</Button>
					</div>
				</div>

				<Products products={items} />

				<div className="text-center mt-12">
					<Link href="/products">
						<Button variant="tonal" color="secondary" size="lg">
							Continue Shopping
						</Button>
					</Link>
				</div>
			</div>
		</Layout>
	);
};

export default WishlistPage;
