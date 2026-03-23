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
      product.name?.toLowerCase().includes(query.toLowerCase()) ||
      product.description?.toLowerCase().includes(query.toLowerCase()) || // ✅ optional chaining
      product.category?.toLowerCase().includes(query.toLowerCase()); // ✅ optional chaining

    // Category filter
    const matchesCategory =
      filters?.category === "All" || 
      product?.category === filters?.category;

    // Price range filter
    const matchesPrice =
      (product?.price ?? 0) >= (filters?.priceRange?.[0] ?? 0) &&
      (product?.price ?? 0) <= (filters?.priceRange?.[1] ?? Infinity); // ✅ safe fallbacks

    // Stock filter
    const inStock = (product as any)?.unit > 0 || product?.inStock; // ✅ check unit too
    const matchesStock = !filters?.inStockOnly || inStock;

    // Rating filter
    const rating = (product as any)?.ratingStats?.average ?? product?.rating ?? 0; // ✅ backend shape
    const matchesRating =
      filters?.rating === 0 || rating >= filters?.rating;

    return matchesQuery && matchesCategory && matchesPrice && matchesStock && matchesRating;
  });

  logger.log("Filtered results:", filtered?.length);

		
	// 	const passes =
	// 		matchesQuery &&
	// 		matchesCategory &&
	// 		matchesPrice &&
	// 		matchesStock &&
	// 		matchesRating;

	// 	// Debug individual product filtering
	// 	if (query && product.name.toLowerCase().includes(query.toLowerCase())) {
	// 		logger.log("Product filter result:", {
	// 			product: product.name,
	// 			matchesQuery,
	// 			matchesCategory,
	// 			matchesPrice: `${product.price} in [${filters.priceRange[0]}, ${filters.priceRange[1]}] = ${matchesPrice}`,
	// 			matchesStock,
	// 			matchesRating,
	// 			passes,
	// 		});
	// 	}

	// 	return passes;
	// });

	//logger.log("Filtered results:", filtered?.length);

	// Sort products
	switch (filters?.sortBy) {
    case "price-low":
      filtered?.sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
      break;
    case "price-high":
      filtered?.sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
      break;
    case "rating":
      filtered?.sort((a, b) => {
        const ratingA = (a as any)?.ratingStats?.average ?? a?.rating ?? 0;
        const ratingB = (b as any)?.ratingStats?.average ?? b?.rating ?? 0;
        return ratingB - ratingA;
      });
      break;
    case "newest":
      filtered?.sort((a, b) => parseInt(String(b.id)) - parseInt(String(a.id)));
      break;
    default:
      break;
  }

  return filtered;
};
