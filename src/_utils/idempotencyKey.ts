// _utils/idempotencyKey.ts
//
// Decides whether a checkout attempt should reuse its current idempotency key
// or mint a fresh one. Same key on a retry of the same attempt (double-click,
// dismissing a failure and resubmitting with nothing changed) — that's what
// lets the backend replay the stored response instead of double-charging. A
// fresh key the moment the customer changes anything that changes the
// request body (address, coupon, shipping/payment method) — reusing the old
// key there would hit the backend's "same key, different body" 422, which
// the customer has no way to clear.

export interface IdempotencyState {
	key: string | undefined;
	signature: string | undefined;
}

export function resolveIdempotencyKey(
	current: IdempotencyState,
	nextSignature: string,
	mint: () => string,
): IdempotencyState {
	if (!current.key || current.signature !== nextSignature) {
		return { key: mint(), signature: nextSignature };
	}
	return current;
}
