import type { FlagConfig } from "@/types/featureFlags";

/** Every flag the app knows about. All default ON, so a failing endpoint never hides the storefront. */
export const FEATURE_KEYS = [
	"auth.signup",
	"auth.google_signin",
	"checkout.enabled",
	"checkout.guest",
	"checkout.coupons",
	"orders.self_cancel",
	"payments.paystack",
	"payments.manual_transfer",
	"storefront.wishlist",
	"storefront.reviews",
	"storefront.announcements",
	"storefront.discount_badges",
	"storefront.multi_currency",
	"notifications.email",
	"admin.comments",
	"admin.analytics",
	"products.maker_checker",
	"payments.maker_checker",
] as const;

export type FeatureKey = (typeof FEATURE_KEYS)[number];

export const DEFAULTS = Object.fromEntries(FEATURE_KEYS.map((k) => [k, true])) as Record<FeatureKey, boolean>;

/** The flag's value: the server's if it sent one, else the default for known keys, else off. */
export function resolveFeature(map: Record<string, boolean> | null | undefined, key: string): boolean {
	const v = map?.[key];
	if (typeof v === "boolean") return v;
	return key in DEFAULTS;
}

const KEY_RE = /^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$/;

export interface FlagForm extends FlagConfig {
	key: string;
	reason: string;
}

/** Field -> message; empty object when the form is valid. `key` is only checked for new flags. */
export function validateFlagForm(f: FlagForm, isNew: boolean): Record<string, string> {
	const e: Record<string, string> = {};
	if (isNew && !KEY_RE.test(f.key.trim())) e.key = "Use lowercase like checkout.coupons (letters, digits, underscores, one or more dots)";
	if (!f.name.trim()) e.name = "Name is required";
	if (!f.module.trim()) e.module = "Module is required";
	if (!Number.isInteger(f.rolloutPercentage) || f.rolloutPercentage < 0 || f.rolloutPercentage > 100) e.rolloutPercentage = "Enter a whole number from 0 to 100";
	if (f.reason.trim().length < 10) e.reason = "Give a reason of at least 10 characters";
	return e;
}

/** Splits pasted text ("a, b\nc") into trimmed unique ids. */
export function parseIds(text: string): string[] {
	return [...new Set(text.split(/[\s,;]+/).map((s) => s.trim()).filter(Boolean))];
}
