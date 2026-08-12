/**
 * Collapse the catalogue so one product is one card, however many pack sizes
 * it sells in.
 *
 * The key is `variantGroupId ?? id`, so an ungrouped item is its own group of
 * one and callers never branch on "does this have variants".
 *
 * Call this AFTER filtering, never before: grouping first would let a size
 * excluded by a price or tag filter drag its siblings back into the results.
 *
 * ponytail: grouping is client-side because the storefront loads the whole
 * catalogue in one page (`items?page=1&limit=100`). Once real pagination
 * lands, a group can straddle a page boundary and the same product will appear
 * twice — the fix then is a server-side listing using
 * `DISTINCT ON (variant_group_id)`.
 */
export type WithVariants<T> = T & { variants: T[] };

export function variantGroupKey(item: any): string {
	return item?.variantGroupId ?? item?.id;
}

const inStock = (item: any): boolean => Number(item?.unit) > 0;

const bySizeAscending = (a: any, b: any): number => Number(a?.weightValue ?? 0) - Number(b?.weightValue ?? 0);

export function groupVariants<T extends Record<string, any>>(items: T[] | undefined): WithVariants<T>[] {
	const groups = new Map<string, T[]>();
	for (const item of items ?? []) {
		const key = variantGroupKey(item);
		const group = groups.get(key);
		if (group) group.push(item);
		else groups.set(key, [item]);
	}

	return [...groups.values()].map((members) => {
		const variants = [...members].sort(bySizeAscending);
		// Smallest size that can actually be bought — the cheapest way in. When
		// the whole group is sold out we still show it, using the first member,
		// so the product does not silently vanish from the shelf.
		const representative = variants.find(inStock) ?? members[0];
		return { ...representative, variants };
	});
}
