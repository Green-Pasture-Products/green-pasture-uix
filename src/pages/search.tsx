import React, { useMemo, useEffect } from "react";
import { useRouter } from "next/router";
// import { useSelector, useDispatch } from "react-redux";
// import { RootState } from "../store";
// import { setSearchQuery } from "../store/searchSlice";
// import ProductCard from "../components/ProductCard";
// import SearchBar from "../components/SearchBar";
// import SearchFiltersComponent from "../components/SearchFilters";
import {
	Search as SearchIcon,
	Filter,
	Grid,
	List,
	SlidersHorizontal,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/_redux/store";
import { setSearchQuery } from "@/_redux/reducers/search.reducer";
import SearchBar from "@/_components/SearchBar";
import SearchFiltersComponent from "@/_components/SearchFilters";
import ProductCard from "@/_components/ProductCard";
import Products from "@/_components/Products";

const SearchPage: React.FC = () => {
	const router = useRouter();
	const dispatch = useAppDispatch();
	const { q } = router.query;

	const { query, filters } = useAppSelector((state) => state.search);
	const products = useAppSelector((state) => state.product.items);

	const [showFilters, setShowFilters] = React.useState(false);
	const [viewMode, setViewMode] = React.useState<"grid" | "list">("grid");

	// Update search query from URL parameter
	useEffect(() => {
		if (q && typeof q === "string" && q !== query) {
			dispatch(setSearchQuery(q));
		}
	}, [q, query, dispatch]);

	// Filter and sort products
	const filteredProducts = useMemo(() => {
		let filtered = products?.filter((product) => {
			// Text search
			const matchesQuery =
				!query ||
				product.name.toLowerCase().includes(query.toLowerCase()) ||
				product.description.toLowerCase().includes(query.toLowerCase()) ||
				product.category.toLowerCase().includes(query.toLowerCase());

			// Category filter
			const matchesCategory =
				filters?.category === "All" ||
				product?.category === filters?.category;

			// Price range filter
			const matchesPrice =
				product?.price >= filters?.priceRange[0] &&
				product?.price <= filters?.priceRange[1];

			// Stock filter
			const matchesStock = !filters?.inStockOnly || product.inStock;

			// Organic filter
			const matchesOrganic = !filters?.organicOnly || product.organic;

			// Rating filter
			const matchesRating =
				filters?.rating === 0 || product.rating >= filters?.rating;

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
		switch (filters?.sortBy) {
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
				// Assuming newer products have higher IDs
				filtered.sort((a, b) => parseInt(b.id) - parseInt(a.id));
				break;
			case "name":
			default:
				filtered.sort((a, b) => a.name.localeCompare(b.name));
				break;
		}

		return filtered;
	}, [products, query, filters]);

	const handleSearch = (searchQuery: string) => {
		router.push(`/search?q=${encodeURIComponent(searchQuery)}`, undefined, {
			shallow: true,
		});
	};

	return (
		<div className="container page-wrapper mx-auto px-4 py-8">
			{/* Search Header */}
			<div className="mb-8">
				<div className="max-w-2xl mx-auto mb-6">
					<SearchBar onSearch={handleSearch} autoFocus />
				</div>

				{query ? (
					<div className="flex items-center justify-between mb-4">
						<div>
							<h1 className="text-2xl font-bold text-gray-800">
								Search Results for "{query}"
							</h1>
							<p className="text-gray-600 mt-1">
								{filteredProducts?.length}{" "}
								{filteredProducts?.length === 1
									? "product"
									: "products"}{" "}
								found
							</p>
						</div>

						{/* View Controls */}
						<div className="flex items-center space-x-4">
							<div className="flex items-center bg-gray-100 rounded-md p-1">
								<button
									onClick={() => setViewMode("grid")}
									className={`p-2 rounded ${
										viewMode === "grid" ? "bg-white shadow-sm" : ""
									}`}
								>
									<Grid className="h-4 w-4" />
								</button>
								<button
									onClick={() => setViewMode("list")}
									className={`p-2 rounded ${
										viewMode === "list" ? "bg-white shadow-sm" : ""
									}`}
								>
									<List className="h-4 w-4" />
								</button>
							</div>

							<button
								onClick={() => setShowFilters(!showFilters)}
								className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 lg:hidden"
							>
								<SlidersHorizontal className="h-4 w-4" />
								<span>Filters</span>
							</button>
						</div>
					</div>
				) : (
					<div className="mb-6">
						<p className="text-gray-600">
							Showing {products.length}{" "}
							{products.length === 1 ? "result" : "results"}
							{query && ` for "${query}"`}
						</p>
					</div>
				)}
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
				{/* Filters Sidebar */}
				<div
					className={`lg:col-span-1 ${
						showFilters ? "block" : "hidden lg:block"
					}`}
				>
					<SearchFiltersComponent />
				</div>

				{/* Search Results */}
				<div className="lg:col-span-3">
					{(filteredProducts || products)?.length === 0 ? (
						<>
							<div className="text-center py-16">
								<SearchIcon className="h-24 w-24 text-gray-300 mx-auto mb-6" />
								<h2 className="text-2xl font-bold text-gray-800 mb-4">
									{query ? "No products found" : "Start your search"}
								</h2>
								<p className="text-gray-600 mb-8">
									{query
										? "Try adjusting your search terms or filters to find what you're looking for."
										: "Enter a search term above to find organic products."}
								</p>
								{query && (
									<button
										onClick={() => {
											dispatch(setSearchQuery(""));
											router.push("/products");
										}}
										className="bg-green-600 text-white px-6 py-3 rounded-md font-semibold hover:bg-green-700 transition-colors"
									>
										Browse All Products
									</button>
								)}
							</div>
							{/* <Products products={products} /> */}
						</>
					) : (
						<div
							className={`${
								viewMode === "grid"
									? "grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 mb-8"
									: "space-y-4"
							}`}
						>
							{(filteredProducts || products)?.map((product) =>
								viewMode === "grid" ? (
									<ProductCard key={product.id} product={product} />
								) : (
									<div
										key={product.id}
										className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
									>
										<div className="flex items-center space-x-4">
											<img
												src={product.image}
												alt={product.name}
												className="w-20 h-20 object-cover rounded-md"
											/>
											<div className="flex-1">
												<h3 className="font-semibold text-lg text-gray-800 mb-1">
													{product.name}
												</h3>
												<p className="text-gray-600 text-sm mb-2">
													{product.description}
												</p>
												<div className="flex items-center space-x-4">
													<span className="text-xl font-bold text-green-600">
														₦{product.price}
													</span>
													<div className="flex items-center space-x-1">
														<div className="flex items-center">
															{[...Array(5)].map((_, i) => (
																<span
																	key={i}
																	className={`text-sm ${
																		i <
																		Math.floor(product.rating)
																			? "text-yellow-400"
																			: "text-gray-300"
																	}`}
																>
																	★
																</span>
															))}
														</div>
														<span className="text-sm text-gray-500">
															({product.reviews})
														</span>
													</div>
													{product.organic && (
														<span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
															Organic
														</span>
													)}
													{!product.inStock && (
														<span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full font-medium">
															Out of Stock
														</span>
													)}
												</div>
											</div>
										</div>
									</div>
								)
							)}
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default SearchPage;
