import { removeFromCart, updateQuantity } from "@/_redux/reducers/cart.reducer";
import { removeFromCartAsync, updateQuantityAsync } from "@/_redux/actions/cart.action";
import { useAppDispatch, useAppSelector } from "@/_redux/store";
import { useCallback, useRef, useState } from "react";

export const useCartOperations = () => {
	const dispatch = useAppDispatch();
	const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
	const [isUpdating, setIsUpdating] = useState<string | null>(null);
	const [errors, setErrors] = useState<Record<string, string>>({});

	// Per-item write queue. Rapid +/- clicks used to fire parallel PATCHes that
	// the server could apply out of order, leaving it on a stale quantity. Now
	// one request per item is in flight at a time, and clicks made meanwhile
	// collapse into a single follow-up carrying the latest quantity.
	const inFlight = useRef<Set<string>>(new Set());
	const pendingQuantity = useRef<Map<string, number>>(new Map());

	const flushQuantity = useCallback(
		async (id: string) => {
			if (inFlight.current.has(id)) return;
			inFlight.current.add(id);
			try {
				while (pendingQuantity.current.has(id)) {
					const quantity = pendingQuantity.current.get(id)!;
					pendingQuantity.current.delete(id);
					const result = await dispatch(updateQuantityAsync({ id, quantity }));
					if (updateQuantityAsync.rejected.match(result)) {
						setErrors((prev) => ({
							...prev,
							[id]: "Failed to update quantity. Please try again.",
						}));
					}
				}
			} finally {
				inFlight.current.delete(id);
			}
		},
		[dispatch]
	);

	const handleQuantityChange = useCallback(
		async (id: string, newQuantity: number, maxStock?: number) => {
			if (newQuantity < 0) return;

			if (maxStock && newQuantity > maxStock) {
				setErrors((prev) => ({
					...prev,
					[id]: `Only ${maxStock} ${maxStock === 1 ? "item" : "items"} available`,
				}));
				return;
			}

			setErrors((prev) => ({ ...prev, [id]: "" }));

			if (newQuantity === 0) {
				pendingQuantity.current.delete(id);
				// Update local state immediately (optimistic)
				dispatch(removeFromCart(id));
				// Sync to backend in background
				if (isAuthenticated) {
					dispatch(removeFromCartAsync(id));
				}
			} else {
				// Update local state immediately (optimistic)
				dispatch(updateQuantity({ id, quantity: newQuantity }));
				// Sync to backend in background
				if (isAuthenticated) {
					pendingQuantity.current.set(id, newQuantity);
					flushQuantity(id);
				}
			}
		},
		[dispatch, isAuthenticated, flushQuantity]
	);

	const handleRemoveItem = useCallback(
		async (id: string) => {
			setIsUpdating(id);
			pendingQuantity.current.delete(id);
			try {
				// Update local state immediately (optimistic)
				dispatch(removeFromCart(id));
				// Sync to backend in background
				if (isAuthenticated) {
					dispatch(removeFromCartAsync(id));
				}
			} catch (error) {
				setErrors((prev) => ({
					...prev,
					[id]: "Failed to remove item. Please try again.",
				}));
			} finally {
				setIsUpdating(null);
			}
		},
		[dispatch, isAuthenticated]
	);

	return { handleQuantityChange, handleRemoveItem, isUpdating, errors };
};
