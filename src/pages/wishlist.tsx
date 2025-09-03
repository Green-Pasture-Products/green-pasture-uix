import React from "react";
import Link from "next/link";
import { Heart, ShoppingCart, Trash2, Star, XCircle } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/_redux/store";
import {
	clearWishlist,
	removeFromWishlist,
} from "@/_redux/reducers/wishlist.reducer";
import { addToCart } from "@/_redux/reducers/cart.reducer";
import toast from "react-hot-toast";
import Products from "@/_components/Products";

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
				toast.success(`${product.name} added to cart 🛒`);
				dispatch(removeFromWishlist(product.id));
			}
		});
	};

	if (items.length === 0) {
		return (
			<div className="container mx-auto px-4 py-16 text-center">
				<div className="max-w-md mx-auto">
					<Heart className="h-24 w-24 text-gray-300 mx-auto mb-8" />
					<h1 className="text-3xl font-bold text-gray-800 mb-4">
						Your Wishlist is Empty
					</h1>
					<p className="text-gray-600 mb-8">
						Save your favorite products to your wishlist so you can easily
						find them later.
					</p>
					<Link
						href="/products"
						className="bg-green-600 text-white px-8 py-3 rounded-md font-semibold hover:bg-green-700 transition-colors inline-block"
					>
						Start Shopping
					</Link>
				</div>
			</div>
		);
	}

	return (
		<div className="container page-wrapper mx-auto px-4 py-8">
			<div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
				<div>
					<h1 className="text-2xl md:text-3xl font-bold text-gray-800">
						My Wishlist
					</h1>
					<p className="text-gray-600 mt-2">
						{wishlistItemCount}{" "}
						{wishlistItemCount === 1 ? "item" : "items"} saved
					</p>
				</div>
				<div className="flex space-x-4 mt-4 md:mt-0">
					<button
						onClick={handleAddAllToCart}
						className="bg-green-600 text-white px-4 md:px-6 py-2 rounded-md font-medium hover:bg-green-700 transition-colors flex items-center space-x-2 cursor-pointer"
					>
						<ShoppingCart className="h-4 w-4" />
						<span>Add All to Cart</span>
					</button>
					<button
						onClick={handleClearWishlist}
						className="text-red-600 hover:text-red-700 font-medium px-4 py-2 border border-red-200 rounded-md hover:bg-red-50 transition-colors"
					>
						Clear Wishlist
					</button>
				</div>
			</div>

			{/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
				{items.map((product) => (
					<div
						key={product.id}
						className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden"
					>
						<div className="relative">
							<Link href={`/product/${product.id}`}>
								<img
									src={product.image}
									alt={product.name}
									className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
								/>
							</Link>
							<button
								onClick={() => handleRemoveFromWishlist(product.id)}
								className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-red-50 transition-colors group"
							>
								<Heart className="h-4 w-4 text-red-500 fill-current group-hover:text-red-600" />
							</button>
						</div>

						<div className="p-4">
							<Link href={`/product/${product.id}`}>
								<h3 className="font-semibold text-lg text-gray-800 mb-2 hover:text-green-600 transition-colors">
									{product.name}
								</h3>
							</Link>
							<p className="text-gray-600 text-sm mb-3 line-clamp-2">
								{product.description}
							</p>

							<div className="flex items-center mb-3">
								<div className="flex items-center space-x-1">
									{[...Array(5)].map((_, i) => (
										<Star
											key={i}
											className={`h-4 w-4 ${
												i < Math.floor(product.rating)
													? "text-yellow-400 fill-current"
													: "text-gray-300"
											}`}
										/>
									))}
								</div>
								<span className="text-sm text-gray-500 ml-2">
									({product.reviews})
								</span>
							</div>

							<div className="flex items-center justify-between mb-4">
								<div className="flex items-center space-x-2">
									<span className="text-xl font-bold text-green-600">
										${product.price}
									</span>
									{product.originalPrice && (
										<span className="text-sm text-gray-500 line-through">
											${product.originalPrice}
										</span>
									)}
								</div>
								{!product.inStock && (
									<span className="text-red-600 text-sm font-medium">
										Out of Stock
									</span>
								)}
							</div>

							<div className="flex space-x-2">
								<button
									onClick={() => handleAddToCart(product)}
									disabled={!product.inStock && !isInCart}
									className={`flex-1 flex items-center justify-center space-x-1 px-4 py-2 rounded-md font-medium transition-colors ${
										!product.inStock && !isInCart
											? "bg-gray-300 text-gray-500 cursor-not-allowed"
											: isInCart
											? "bg-red-500 text-white hover:bg-red-600"
											: "bg-green-600 text-white hover:bg-green-700"
									}`}
								>
									{isInCart ? (
										<>
											<XCircle className="h-4 w-4" />
											<span className="text-sm">Remove</span>
										</>
									) : (
										<>
											<ShoppingCart className="h-3 md:h-4 w-3 md:w-4" />
											<span className="text-sm">
												{product.inStock
													? "Add to Cart"
													: "Out of Stock"}
											</span>
										</>
									)}
								</button>
								<button
									onClick={() => handleRemoveFromWishlist(product.id)}
									className="p-2 border border-gray-300 rounded-md hover:bg-red-50 hover:border-red-300 transition-colors"
								>
									<Trash2 className="h-4 w-4 text-gray-600 hover:text-red-600" />
								</button>
							</div>
						</div>
					</div>
				))}
			</div> */}

			<Products products={items} />

			{/* Continue Shopping */}
			<div className="text-center mt-12">
				<Link
					href="/products"
					className="bg-gray-100 text-gray-800 px-8 py-3 rounded-md font-semibold hover:bg-gray-200 transition-colors inline-block"
				>
					Continue Shopping
				</Link>
			</div>
		</div>
	);
};

export default WishlistPage;
