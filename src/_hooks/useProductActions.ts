import { useState, MouseEvent } from "react";
import toast from "react-hot-toast";
import { useAppDispatch, useAppSelector } from "@/_redux/store";
import { removeFromCart } from "@/_redux/reducers/cart.reducer";
import { addToCartAsync, removeFromCartAsync } from "@/_redux/actions/cart.action";
import {
	addToWishlist,
	removeFromWishlist,
} from "@/_redux/reducers/wishlist.reducer";
import {
	addToWishlistAsync,
	removeFromWishlistAsync,
} from "@/_redux/actions/wishlist.action";
import { usePathname } from "next/navigation";
import { appConstants } from "@/_redux/constants";
import { variantSummary } from "@/_utils/variantSummary";
import { formatWeight } from "@/_utils/formatWeight";
import { Product } from "@/types";

const ADMIN_ROLES: readonly string[] = appConstants.ADMIN_ROLES;

// Shared by ProductCard (grid) and the list row in FilteredProducts so cart,
// wishlist and size-selection behavior can't drift between the two views the
// way it previously did.
export const useProductActions = (product: Product) => {
	const pathname = usePathname();
	const dispatch = useAppDispatch();
	const { user } = useAppSelector((state) => state.auth);
	const isAdmin = ADMIN_ROLES.includes(user?.profileType?.toUpperCase() || "");
	const isWishlistPage = pathname === "/wishlist";
	const cartItems = useAppSelector((state) => state.cart.items);
	const isInCart = cartItems.some((item) => item.id === product.id);
	const wishlistItems = useAppSelector((state) => state.wishlist.items);
	const isInWishlist = wishlistItems?.some((item) => item.id === product.id);
	const [justAdded, setJustAdded] = useState(false);
	const [choosingSize, setChoosingSize] = useState(false);

	const p = product as any;
	const inStock = p.unit > 0 || p.inStock;
	const price = Number(p.price || 0);
	const { variants, packSize, priceVaries, lowestPrice } = variantSummary(p);
	const showDiscount = useAppSelector((state) => state.settings.showDiscountBadges);
	const originalPrice =
		showDiscount && p.originalPrice ? Number(p.originalPrice) : null;
	const discount = originalPrice && originalPrice > price
		? Math.round(((originalPrice - price) / originalPrice) * 100)
		: null;

	const flashAdded = (name: string) => {
		setJustAdded(true);
		toast.success(`${name} added to cart`);
		setTimeout(() => setJustAdded(false), 1500);
	};

	const handleAddToCart = () => {
		if (isInCart) {
			dispatch(removeFromCart(product.id));
			dispatch(removeFromCartAsync(product.id));
			toast(`${product.name} removed from cart`);
		} else {
			dispatch(addToCartAsync(product));
			flashAdded(product.name);
		}
	};

	const handleAddVariant = (variant: any) => {
		dispatch(addToCartAsync(variant));
		setChoosingSize(false);
		flashAdded(`${variant.name}${formatWeight(variant.weightValue, variant.weightUnit) ? ` (${formatWeight(variant.weightValue, variant.weightUnit)})` : ""}`);
	};

	const handleWishlistToggle = (e: MouseEvent<HTMLButtonElement>) => {
		e.stopPropagation();
		e.preventDefault();
		if (isInWishlist) {
			dispatch(removeFromWishlist(product.id));
			dispatch(removeFromWishlistAsync(product.id));
			toast(`${product.name} removed from wishlist`);
		} else {
			dispatch(addToWishlist(product));
			dispatch(addToWishlistAsync(product));
			toast.success(`${product.name} added to wishlist`);
		}
	};

	return {
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
	};
};
