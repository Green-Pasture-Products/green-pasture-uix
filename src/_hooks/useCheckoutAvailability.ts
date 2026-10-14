import { useFeature } from "@/_hooks/useFeature";

/** Whether checkout can be used, and which payment methods are on. No method on = checkout is unavailable. */
export function useCheckoutAvailability() {
	const enabled = useFeature("checkout.enabled");
	const card = useFeature("payments.paystack");
	const transfer = useFeature("payments.manual_transfer");
	return { available: enabled && (card || transfer), card, transfer };
}
