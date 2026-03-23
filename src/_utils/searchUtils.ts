import { SearchFilters } from "@/_redux/reducers/search.reducer";
import { Product } from "../types";

export const filterAndSortProducts = (
	products: Product[],
	query: string,
	filters: SearchFilters
): Product[] => {
	if (!products) return [];

	let filtered = products.filter((product) => {
		const p = product as any;

		// Adapt to both old Product type and backend Item shape
		const name = p.name || "";
		const description = p.description || "";
		const category = p.product?.name || p.category || "";
		const price = Number(p.price || 0);
		const inStock = p.unit !== undefined ? p.unit > 0 : p.inStock;
		const rating = p.ratingStats?.average ?? p.rating ?? 0;

		// Text search
		const matchesQuery =
			!query ||
			query.trim() === "" ||
			name.toLowerCase().includes(query.toLowerCase()) ||
			description.toLowerCase().includes(query.toLowerCase()) ||
			category.toLowerCase().includes(query.toLowerCase());

		// Category filter
		const matchesCategory =
			!filters?.category ||
			filters.category === "All" ||
			category === filters.category;

		// Price range filter
		const matchesPrice =
			price >= (filters?.priceRange?.[0] ?? 0) &&
			price <= (filters?.priceRange?.[1] ?? Infinity);

		// Stock filter
		const matchesStock = !filters?.inStockOnly || inStock;

		// Rating filter
		const matchesRating =
			!filters?.rating || filters.rating === 0 || rating >= filters.rating;

		return (
			matchesQuery &&
			matchesCategory &&
			matchesPrice &&
			matchesStock &&
			matchesRating
		);
	});

	// Sort
	switch (filters?.sortBy) {
		case "price-low":
			filtered.sort((a, b) => Number(a.price) - Number(b.price));
			break;
		case "price-high":
			filtered.sort((a, b) => Number(b.price) - Number(a.price));
			break;
		case "rating": {
			filtered.sort((a, b) => {
				const ra = (a as any).ratingStats?.average ?? (a as any).rating ?? 0;
				const rb = (b as any).ratingStats?.average ?? (b as any).rating ?? 0;
				return rb - ra;
			});
			break;
		}
		case "newest":
			filtered.sort((a, b) => Number(b.id) - Number(a.id));
			break;
		case "name":
		default:
			break;
	}

	return filtered;
};
