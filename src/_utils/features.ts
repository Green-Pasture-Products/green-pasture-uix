// Build-time feature flags (static export bakes env at build). Off unless set to "true".
export const FEATURES = {
	promoCode: process.env.NEXT_PUBLIC_FEATURE_PROMO_CODE === "true",
};
