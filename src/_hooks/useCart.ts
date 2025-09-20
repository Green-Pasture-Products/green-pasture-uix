import { removeFromCart, updateQuantity } from "@/_redux/reducers/cart.reducer";
import { useAppDispatch } from "@/_redux/store";
import { useCallback, useState } from "react";

export const useCartOperations = () => {
	const dispatch = useAppDispatch();
	const [isUpdating, setIsUpdating] = useState<string | null>(null);
	const [errors, setErrors] = useState<Record<string, string>>({});

	const handleQuantityChange = useCallback(
		async (id: string, newQuantity: number, maxStock?: number) => {
			if (newQuantity < 0) return;

			// Check stock limits
			if (maxStock && newQuantity > maxStock) {
				setErrors((prev) => ({
					...prev,
					[id]: `Only ${maxStock} items available`,
				}));
				return;
			}

			setIsUpdating(id);
			setErrors((prev) => ({ ...prev, [id]: "" }));

			try {
				if (newQuantity === 0) {
					await dispatch(removeFromCart(id));
				} else {
					await dispatch(updateQuantity({ id, quantity: newQuantity }));
				}
			} catch (error) {
				setErrors((prev) => ({
					...prev,
					[id]: "Failed to update quantity. Please try again.",
				}));
			} finally {
				setIsUpdating(null);
			}
		},
		[dispatch]
	);

	const handleRemoveItem = useCallback(
		async (id: string) => {
			setIsUpdating(id);
			try {
				await dispatch(removeFromCart(id));
			} catch (error) {
				setErrors((prev) => ({
					...prev,
					[id]: "Failed to remove item. Please try again.",
				}));
			} finally {
				setIsUpdating(null);
			}
		},
		[dispatch]
	);

	return { handleQuantityChange, handleRemoveItem, isUpdating, errors };
};
