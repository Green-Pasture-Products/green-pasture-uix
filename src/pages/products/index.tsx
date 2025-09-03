import React, { useMemo } from "react";
import { Search, Filter } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/_redux/store";
import {
	setSearchTerm,
	setSelectedCategory,
} from "@/_redux/reducers/products.reducer";
import Products from "@/_components/Products";

const ProductsPage: React.FC = () => {
	const dispatch = useAppDispatch();
	const { items, categories, selectedCategory, searchTerm } = useAppSelector(
		(state) => state.product
	);

	const filteredProducts = useMemo(() => {
		return items?.filter((product) => {
			const matchesCategory =
				selectedCategory === "All" || product.category === selectedCategory;
			const matchesSearch =
				product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
				product.description
					.toLowerCase()
					.includes(searchTerm.toLowerCase());
			return matchesCategory && matchesSearch;
		});
	}, [items, selectedCategory, searchTerm]);

	return (
		<div className="container page-wrapper mx-auto px-4 py-8">
			{/* Header */}
			<div className="mb-8">
				<h1 className="text-3xl font-bold text-gray-800 mb-4">
					Our Products
				</h1>
				<p className="text-gray-600">
					Browse our complete selection of premium organic products
				</p>
			</div>

			{/* Filters */}
			<div className="flex flex-col md:flex-row gap-4 mb-8">
				{/* Search */}
				<div className="relative flex-1">
					<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
					<input
						type="text"
						placeholder="Search products..."
						value={searchTerm}
						onChange={(e) => dispatch(setSearchTerm(e.target.value))}
						className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
					/>
				</div>

				{/* Category Filter */}
				<div className="flex flex-wrap gap-2">
					{categories?.map((category) => (
						<button
							key={category}
							onClick={() => dispatch(setSelectedCategory(category))}
							className={`px-4 py-2 rounded-md font-medium transition-colors ${
								selectedCategory === category
									? "bg-green-600 text-white"
									: "bg-white text-gray-700 border border-gray-300 hover:bg-green-50"
							}`}
						>
							{category}
						</button>
					))}
				</div>
			</div>

			{/* Products Grid */}
			<Products products={filteredProducts} />

			{/* No Products Found */}
			{filteredProducts?.length === 0 && (
				<div className="text-center py-12">
					<div className="text-gray-400 mb-4">
						<Filter className="h-12 w-12 mx-auto" />
					</div>
					<h3 className="text-lg font-semibold text-gray-700 mb-2">
						No products found
					</h3>
					<p className="text-gray-500">
						Try adjusting your search or filter criteria
					</p>
				</div>
			)}
		</div>
	);
};

export default ProductsPage;
