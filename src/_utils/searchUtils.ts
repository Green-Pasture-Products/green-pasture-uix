import { SearchFilters } from "@/_redux/reducers/search.reducer";
import { Product } from "../types";
import { logger } from "./logger";

export const filterAndSortProducts = (
	products: Product[],
	query: string,
	filters: SearchFilters
): Product[] => {
	let filtered = products?.filter((product) => {
		// Text search
		const matchesQuery =
			!query ||
			query.trim() === "" ||
			product.name.toLowerCase().includes(query.toLowerCase()) ||
			product.description.toLowerCase().includes(query.toLowerCase()) ||
			product.category.toLowerCase().includes(query.toLowerCase());

		// Category filter
		const matchesCategory =
			filters?.category === "All" || product?.category === filters?.category;

		// Price range filter
		const matchesPrice =
			product?.price >= filters?.priceRange[0] &&
			product?.price <= filters?.priceRange[1];

		// Stock filter
		const matchesStock = !filters?.inStockOnly || product.inStock;

		// Rating filter
		const matchesRating =
			filters?.rating === 0 || product.rating >= filters?.rating;

		const passes =
			matchesQuery &&
			matchesCategory &&
			matchesPrice &&
			matchesStock &&
			matchesRating;

		// Debug individual product filtering
		if (query && product.name.toLowerCase().includes(query.toLowerCase())) {
			logger.log("Product filter result:", {
				product: product.name,
				matchesQuery,
				matchesCategory,
				matchesPrice: `${product.price} in [${filters.priceRange[0]}, ${filters.priceRange[1]}] = ${matchesPrice}`,
				matchesStock,
				matchesRating,
				passes,
			});
		}

		return passes;
	});

	logger.log("Filtered results:", filtered?.length);

	// Sort products
	switch (filters?.sortBy) {
		case "price-low":
			filtered?.sort((a, b) => a.price - b.price);
			break;
		case "price-high":
			filtered?.sort((a, b) => b.price - a.price);
			break;
		case "rating":
			filtered?.sort((a, b) => b.rating - a.rating);
			break;
		case "newest":
			filtered?.sort((a, b) => parseInt(b.id) - parseInt(a.id));
			break;
		case "name":
		default:
			// filtered?.sort((a, b) => a.name.localeCompare(b.name));
			break;
	}

	return filtered;
};
