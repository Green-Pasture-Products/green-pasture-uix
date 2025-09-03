import { SearchFilters } from "@/_redux/reducers/search.reducer";
import { Product } from "../types";

export const generateSearchSuggestions = (
	products: Product[],
	query: string
): string[] => {
	if (!query || query.length < 2) return [];

	const suggestions = new Set<string>();
	const queryLower = query.toLowerCase();

	products.forEach((product) => {
		// Add product names that match
		if (product.name.toLowerCase().includes(queryLower)) {
			suggestions.add(product.name);
		}

		// Add categories that match
		if (product.category.toLowerCase().includes(queryLower)) {
			suggestions.add(product.category);
		}

		// Add partial matches from descriptions
		const words = product.description.toLowerCase().split(" ");
		words.forEach((word) => {
			if (word.includes(queryLower) && word.length > 3) {
				suggestions.add(word);
			}
		});
	});

	return Array.from(suggestions).slice(0, 8);
};

export const highlightSearchTerm = (
	text: string,
	searchTerm: string
): string => {
	if (!searchTerm) return text;

	const regex = new RegExp(`(${searchTerm})`, "gi");
	return text.replace(regex, '<mark class="bg-yellow-200">$1</mark>');
};

export const filterAndSortProducts = (
	products: Product[],
	query: string,
	filters: SearchFilters
): Product[] => {
	let filtered = products.filter((product) => {
		// Text search
		const matchesQuery =
			!query ||
			product.name.toLowerCase().includes(query.toLowerCase()) ||
			product.description.toLowerCase().includes(query.toLowerCase()) ||
			product.category.toLowerCase().includes(query.toLowerCase());

		// Category filter
		const matchesCategory =
			filters.category === "All" || product.category === filters.category;

		// Price range filter
		const matchesPrice =
			product.price >= filters.priceRange[0] &&
			product.price <= filters.priceRange[1];

		// Stock filter
		const matchesStock = !filters.inStockOnly || product.inStock;

		// Organic filter
		const matchesOrganic = !filters.organicOnly || product.organic;

		// Rating filter
		const matchesRating =
			filters.rating === 0 || product.rating >= filters.rating;

		return (
			matchesQuery &&
			matchesCategory &&
			matchesPrice &&
			matchesStock &&
			matchesOrganic &&
			matchesRating
		);
	});

	// Sort products
	switch (filters.sortBy) {
		case "price-low":
			filtered.sort((a, b) => a.price - b.price);
			break;
		case "price-high":
			filtered.sort((a, b) => b.price - a.price);
			break;
		case "rating":
			filtered.sort((a, b) => b.rating - a.rating);
			break;
		case "newest":
			filtered.sort((a, b) => parseInt(b.id) - parseInt(a.id));
			break;
		case "name":
		default:
			filtered.sort((a, b) => a.name.localeCompare(b.name));
			break;
	}

	return filtered;
};
