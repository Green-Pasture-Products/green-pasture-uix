import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { motion, AnimatePresence } from "framer-motion";
import {
	Grid,
	List,
	SlidersHorizontal,
	X,
} from "lucide-react";

import EmptyState from "@/_UI/EmptyState";
import EmptySearchIllustration from "@/_UI/illustrations/EmptySearchIllustration";
import SearchFiltersComponent from "@/_components/SearchFilters";
import { useAppDispatch, useAppSelector } from "@/_redux/store";
import { filterAndSortProducts } from "@/_utils";
import { groupVariants } from "@/_utils/groupVariants";
import { useProductFilters } from "@/_hooks/useProductFilters";
import ProductCard from "@/_components/ProductCard";
import ProductListRow from "@/_components/ProductListRow";
import SearchBar from "@/_components/SearchBar";
import { usePathname } from "next/navigation";
import { productsAction } from "@/_redux/actions";

const gridContainerVariants = {
	hidden: {},
	visible: {
		transition: { staggerChildren: 0.06 },
	},
};

const gridItemVariants = {
	hidden: { opacity: 0, y: 20, scale: 0.95 },
	visible: {
		opacity: 1,
		y: 0,
		scale: 1,
		transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as const },
	},
};

const FilteredProducts: React.FC = () => {
	const router = useRouter();
	const pathname = usePathname();
	const dispatch = useAppDispatch();
	const isSearchPage = pathname.includes("/search");

	const { query, filters } = useProductFilters();
	const { products, isFetchingAllProducts } = useAppSelector(
		(state) => state.product
	);

	const [showFilters, setShowFilters] = useState(false);
	const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

	useEffect(() => {
		dispatch(productsAction.fetchAllProducts({ activeOnly: true }));
	}, [dispatch]);

	// Same order as the home rail: filter, then collapse pack sizes into one
	// card each. The result count on line 98 then counts products, not SKUs,
	// which is what "12 products found" is meant to mean.
	const filteredProducts = groupVariants(filterAndSortProducts(products, query, filters));

	const handleSearch = (searchQuery: string) => {
		router.push(
			`/search?q=${encodeURIComponent(searchQuery)}`,
			undefined,
			{ shallow: true }
		);
	};

	return (
		<div className="container page-wrapper mx-auto px-4 py-8 md:py-12">
			{/* Header */}
			<div className="mb-8">
				{isSearchPage && (
					<div className="max-w-2xl mx-auto mb-8">
						<SearchBar onSearch={handleSearch} autoFocus />
					</div>
				)}

				<div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
					<div>
						<h1
							className="text-2xl md:text-3xl font-bold"
							style={{ color: "var(--text-primary)" }}
						>
							{isSearchPage
								? query
									? `Results for "${query}"`
									: "Search Products"
								: "All Products"}
						</h1>
						<p
							className="text-sm mt-1"
							style={{ color: "var(--text-hint)" }}
						>
							{isFetchingAllProducts
								? "Loading..."
								: `${filteredProducts?.length ?? 0} product${(filteredProducts?.length ?? 0) !== 1 ? "s" : ""} found`}
						</p>
					</div>

					<div className="flex items-center gap-2">
						{/* View toggle */}
						<div
							className="flex items-center rounded-lg p-0.5"
							style={{ background: "var(--surface-medium)" }}
						>
							{[
								{ mode: "grid" as const, icon: Grid },
								{ mode: "list" as const, icon: List },
							].map(({ mode, icon: Icon }) => (
								<button
									key={mode}
									onClick={() => setViewMode(mode)}
									className="p-2 rounded-md transition-all cursor-pointer"
									style={{
										background:
											viewMode === mode
												? "var(--surface-paper)"
												: "transparent",
										color:
											viewMode === mode
												? "var(--text-primary)"
												: "var(--text-hint)",
										boxShadow:
											viewMode === mode
												? "var(--shadow-sm)"
												: "none",
									}}
								>
									<Icon className="h-4 w-4" />
								</button>
							))}
						</div>

						{/* Mobile filter toggle */}
						<button
							onClick={() => setShowFilters(!showFilters)}
							className="lg:hidden flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer"
							style={{
								border: "1px solid var(--border-medium)",
								color: showFilters
									? "var(--color-primary)"
									: "var(--text-secondary)",
								background: showFilters
									? "rgba(22,163,74,0.06)"
									: "transparent",
							}}
						>
							{showFilters ? (
								<X className="h-3.5 w-3.5" />
							) : (
								<SlidersHorizontal className="h-3.5 w-3.5" />
							)}
							Filters
						</button>
					</div>
				</div>
			</div>

			{/* Content */}
			<div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
				{/* Filters Sidebar */}
				<div
					className={`lg:col-span-1 ${showFilters ? "block" : "hidden lg:block"}`}
				>
					<div
						className="rounded-xl p-5 sticky top-24"
						style={{
							background: "var(--surface-paper)",
							border: "1px solid var(--border-light)",
							boxShadow: "var(--shadow-sm)",
						}}
					>
						<SearchFiltersComponent />
					</div>
				</div>

				{/* Products */}
				<div className="lg:col-span-3">
					{isFetchingAllProducts && products.length === 0 ? (
						<div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
							{[...Array(6)].map((_, i) => (
								<div
									key={i}
									className="rounded-xl overflow-hidden animate-pulse"
									style={{
										background: "var(--surface-paper)",
										border: "1px solid var(--border-light)",
									}}
								>
									<div
										className="aspect-[4/3]"
										style={{
											background:
												"var(--surface-medium)",
										}}
									/>
									<div className="p-4 space-y-3">
										<div
											className="h-4 rounded-full w-3/4"
											style={{
												background:
													"var(--surface-medium)",
											}}
										/>
										<div
											className="h-3 rounded-full w-1/2"
											style={{
												background:
													"var(--surface-medium)",
											}}
										/>
										<div
											className="h-5 rounded-full w-1/3"
											style={{
												background:
													"var(--surface-medium)",
											}}
										/>
										<div
											className="h-9 rounded-lg"
											style={{
												background:
													"var(--surface-medium)",
											}}
										/>
									</div>
								</div>
							))}
						</div>
					) : filteredProducts?.length === 0 ? (
						<div
							className="rounded-xl"
							style={{
								background: "var(--surface-paper)",
								border: "1px solid var(--border-light)",
							}}
						>
							<EmptyState
								illustration={<EmptySearchIllustration className="w-36 h-36" />}
								title="No products found"
								description="Try adjusting your filters or search terms"
							/>
						</div>
					) : viewMode === "grid" ? (
						<motion.div
							className="grid grid-cols-2 lg:grid-cols-3 gap-4"
							variants={gridContainerVariants}
							initial="hidden"
							animate="visible"
							key="grid"
						>
							<AnimatePresence>
								{filteredProducts?.map((product) => (
									<motion.div
										key={product.id}
										variants={gridItemVariants}
										layout
										className="h-full flex flex-col"
									>
										<ProductCard product={product} />
									</motion.div>
								))}
							</AnimatePresence>
						</motion.div>
					) : (
						<motion.div
							className="space-y-3"
							variants={gridContainerVariants}
							initial="hidden"
							animate="visible"
							key="list"
						>
							{filteredProducts?.map((product, i) => (
								<ProductListRow key={product.id} product={product} index={i} />
							))}
						</motion.div>
					)}
				</div>
			</div>
		</div>
	);
};

export default FilteredProducts;
