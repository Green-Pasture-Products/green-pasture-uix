import React from "react";
import { Filter, X, Star } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/_redux/store";
import {
	resetFilters,
	SearchFilters,
	setSearchFilters,
} from "@/_redux/reducers/search.reducer";

const SearchFiltersComponent: React.FC = () => {
	const dispatch = useAppDispatch();
	const { filters } = useAppSelector((state) => state.search);
	const { categories } = useAppSelector((state) => state.product);

	const handleFilterChange = (newFilters: Partial<SearchFilters>) => {
		dispatch(setSearchFilters(newFilters));
	};

	const handleResetFilters = () => {
		dispatch(resetFilters());
	};

	const hasActiveFilters = () => {
		return (
			filters?.category !== "All" ||
			filters?.inStockOnly ||
			filters?.organicOnly ||
			filters?.rating > 0 ||
			filters?.priceRange[0] > 0 ||
			filters?.priceRange[1] < 40000
		);
	};

	return (
		<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
			<div className="flex items-center justify-between mb-6">
				<h3 className="text-lg font-semibold text-gray-800 flex items-center">
					<Filter className="h-5 w-5 mr-2" />
					Filters
				</h3>
				{hasActiveFilters() && (
					<button
						onClick={handleResetFilters}
						className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center"
					>
						<X className="h-4 w-4 mr-1" />
						Clear All
					</button>
				)}
			</div>

			<div className="space-y-6">
				{/* Category Filter */}
				<div>
					<h4 className="font-medium text-gray-800 mb-3">Category</h4>
					<div className="space-y-2">
						{categories?.map((category) => (
							<label key={category} className="flex items-center">
								<input
									type="radio"
									name="category"
									value={category}
									checked={filters?.category === category}
									onChange={(e) =>
										handleFilterChange({ category: e.target.value })
									}
									className="mr-3 text-green-600 focus:ring-green-500"
								/>
								<span className="text-sm text-gray-700">
									{category}
								</span>
							</label>
						))}
					</div>
				</div>

				{/* Price Range */}
				<div>
					<h4 className="font-medium text-gray-800 mb-3">Price Range</h4>
					<div className="space-y-3">
						<div className="flex items-center space-x-3">
							<input
								type="number"
								min="0"
								max="40000"
								value={filters?.priceRange[0]}
								onChange={(e) =>
									handleFilterChange({
										priceRange: [
											Number(e.target.value),
											filters?.priceRange[1],
										],
									})
								}
								className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
							/>
							<span className="text-gray-500">to</span>
							<input
								type="number"
								min="0"
								max="40000"
								value={filters?.priceRange[1]}
								onChange={(e) =>
									handleFilterChange({
										priceRange: [
											filters?.priceRange[0],
											Number(e.target.value),
										],
									})
								}
								className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
							/>
						</div>
						<input
							type="range"
							min="0"
							max="40000"
							value={filters?.priceRange[1]}
							onChange={(e) =>
								handleFilterChange({
									priceRange: [
										filters?.priceRange[0],
										Number(e.target.value),
									],
								})
							}
							className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
						/>
					</div>
				</div>

				{/* Rating Filter */}
				<div>
					<h4 className="font-medium text-gray-800 mb-3">
						Minimum Rating
					</h4>
					<div className="space-y-2">
						{[4, 3, 2, 1].map((rating) => (
							<label
								key={rating}
								className="flex items-center cursor-pointer"
							>
								<input
									type="radio"
									name="rating"
									value={rating}
									checked={filters?.rating === rating}
									onChange={(e) =>
										handleFilterChange({
											rating: Number(e.target.value),
										})
									}
									className="sr-only"
								/>
								<div
									className={`flex items-center space-x-2 p-2 rounded-md transition-colors ${
										filters?.rating === rating
											? "bg-green-50 border border-green-200"
											: "hover:bg-gray-50"
									}`}
								>
									<div className="flex items-center">
										{[...Array(5)].map((_, i) => (
											<Star
												key={i}
												className={`h-4 w-4 ${
													i < rating
														? "text-yellow-400 fill-current"
														: "text-gray-300"
												}`}
											/>
										))}
									</div>
									<span className="text-sm text-gray-700">& up</span>
								</div>
							</label>
						))}
						<label className="flex items-center cursor-pointer">
							<input
								type="radio"
								name="rating"
								value="0"
								checked={filters?.rating === 0}
								onChange={() => handleFilterChange({ rating: 0 })}
								className="sr-only"
							/>
							<div
								className={`p-2 rounded-md transition-colors ${
									filters?.rating === 0
										? "bg-green-50 border border-green-200"
										: "hover:bg-gray-50"
								}`}
							>
								<span className="text-sm text-gray-700">
									Any rating
								</span>
							</div>
						</label>
					</div>
				</div>

				{/* Availability */}
				<div>
					<h4 className="font-medium text-gray-800 mb-3">Availability</h4>
					<label className="flex items-center">
						<input
							type="checkbox"
							checked={filters?.inStockOnly}
							onChange={(e) =>
								handleFilterChange({ inStockOnly: e.target.checked })
							}
							className="mr-3 text-green-600 focus:ring-green-500"
						/>
						<span className="text-sm text-gray-700">In stock only</span>
					</label>
				</div>

				{/* Organic Filter */}
				<div>
					<h4 className="font-medium text-gray-800 mb-3">Product Type</h4>
					<label className="flex items-center">
						<input
							type="checkbox"
							checked={filters?.organicOnly}
							onChange={(e) =>
								handleFilterChange({ organicOnly: e.target.checked })
							}
							className="mr-3 text-green-600 focus:ring-green-500"
						/>
						<span className="text-sm text-gray-700">Organic only</span>
					</label>
				</div>

				{/* Sort By */}
				<div>
					<h4 className="font-medium text-gray-800 mb-3">Sort By</h4>
					<select
						value={filters?.sortBy}
						onChange={(e) =>
							handleFilterChange({
								sortBy: e.target.value as SearchFilters["sortBy"],
							})
						}
						className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
					>
						<option value="name">Name (A-Z)</option>
						<option value="price-low">Price: Low to High</option>
						<option value="price-high">Price: High to Low</option>
						<option value="rating">Customer Rating</option>
						<option value="newest">Newest First</option>
					</select>
				</div>
			</div>
		</div>
	);
};

export default SearchFiltersComponent;
