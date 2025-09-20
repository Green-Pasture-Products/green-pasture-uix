import React, { useEffect } from "react";
import { useRouter } from "next/router";
import {
	Search as SearchIcon,
	Filter,
	Grid,
	List,
	SlidersHorizontal,
} from "lucide-react";

import { resetFilters, setSearchQuery } from "@/_redux/reducers/search.reducer";
import SearchFiltersComponent from "@/_components/SearchFilters";
import { useAppDispatch, useAppSelector } from "@/_redux/store";
import { filterAndSortProducts, logger } from "@/_utils";
import ProductCard from "@/_components/ProductCard";
import SearchBar from "@/_components/SearchBar";
import { usePathname } from "next/navigation";

const FilteredProducts: React.FC = () => {
	const router = useRouter();
	const { q } = router.query;
	const pathanme = usePathname();
	const dispatch = useAppDispatch();
	const isSearchPage = pathanme.includes("/search");

	const { query, filters } = useAppSelector((state) => state.search);
	const products = useAppSelector((state) => state.product.items);

	const [showFilters, setShowFilters] = React.useState(false);
	const [viewMode, setViewMode] = React.useState<"grid" | "list">("grid");

	useEffect(() => {
		if (!isSearchPage) {
			dispatch(resetFilters());
		} else if (q && typeof q === "string" && q !== query) {
			dispatch(setSearchQuery(q));
		}
	}, [q, query, dispatch]);

	const filteredProducts = filterAndSortProducts(products, query, filters);
	logger.log({ filteredProducts });

	const handleSearch = (searchQuery: string) => {
		router.push(`/search?q=${encodeURIComponent(searchQuery)}`, undefined, {
			shallow: true,
		});
	};

	return (
		<div className="container page-wrapper mx-auto px-4 py-8">
			<div className="mb-8">
				{isSearchPage && (
					<div className="max-w-2xl mx-auto mb-6">
						<SearchBar onSearch={handleSearch} autoFocus />
					</div>
				)}

				<div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
					<div className="">
						{isSearchPage ? (
							<h1 className="text-2xl font-bold text-gray-800">
								{query
									? `Search Results for "${query}"`
									: "Search Products"}
							</h1>
						) : (
							<h1 className="text-2xl font-bold text-gray-800">
								All Products
							</h1>
						)}
						{isSearchPage && (
							<p className="text-gray-600 mt-1">
								{filteredProducts?.length}{" "}
								{filteredProducts?.length === 1
									? "product"
									: "products"}{" "}
								found
							</p>
						)}
					</div>

					<div className="flex items-center space-x-4 mt-4 md:mt-0">
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
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
				<div
					className={`lg:col-span-1 ${
						showFilters ? "block" : "hidden lg:block"
					}`}
				>
					<SearchFiltersComponent />
				</div>

				<div className="lg:col-span-3">
					{filteredProducts?.length === 0 ? (
						<div className="text-center py-16">
							<SearchIcon className="h-24 w-24 text-gray-300 mx-auto mb-6" />
							<h2 className="text-2xl font-bold text-gray-800 mb-4">
								No products found
							</h2>
							<p className="text-gray-600 mb-8">
								Try adjusting your search terms or filters to find what
								you're looking for.
							</p>
							<button
								onClick={() => {
									dispatch(setSearchQuery(""));
									router.push("/products");
								}}
								className="bg-green-600 text-white px-6 py-3 rounded-md font-semibold hover:bg-green-700 transition-colors"
							>
								Browse All Products
							</button>
						</div>
					) : (
						<div
							className={`${
								viewMode === "grid"
									? "grid grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6 mb-8"
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
													{/* {product.organic && (
                                          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
                                             Organic
                                          </span>
                                       )}
                                       {!product.inStock && (
                                          <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full font-medium">
                                             Out of Stock
                                          </span>
                                       )} */}
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

export default FilteredProducts;
