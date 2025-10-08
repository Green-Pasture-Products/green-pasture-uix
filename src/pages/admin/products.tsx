import React, { useState } from "react";
import {
	Plus,
	Edit,
	Trash2,
	Search,
	Filter,
	Eye,
	EllipsisVertical,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/_redux/store";
import AdminLayout from "@/_components/AdminLayout";
import AddProduct from "@/_components/Modals/AddProduct";
import { selectProduct } from "@/_redux/reducers/admin.reducer";
import { Column, CustomTable } from "@/_components/CustomTable";
import { Product } from "@/types";

interface ActionDropDownProps {
	row: Product;
}

const AdminProducts: React.FC = () => {
	const dispatch = useAppDispatch();
	const products = useAppSelector((state) => state.product.products);
	const [selectedCategory, setSelectedCategory] = useState("All");
	const [currentPage, setCurrentPage] = useState(1);
	const [searchQuery, setSearchQuery] = useState("");

	const categories = ["All", "Fruits", "Vegetables", "Grains", "Pantry"];

	const filteredProducts = products.filter((product) => {
		const matchesSearch = product.name
			.toLowerCase()
			.includes(searchQuery.toLowerCase());
		const matchesCategory =
			selectedCategory === "All" || product.category === selectedCategory;
		return matchesSearch && matchesCategory;
	});

	const ActionDropDown: React.FC<ActionDropDownProps> = (props) => {
		const handleDelete = (productId: string) => {
			if (window.confirm("Are you sure you want to delete this product?")) {
				// dispatch(removeProduct(productId));
			}
		};

		return (
			<div className="flex items-center justify-end space-x-2">
				<button
					onClick={() => dispatch(selectProduct(props?.row))}
					className="text-blue-600 hover:text-blue-900 p-1 rounded"
					title="View"
				>
					<Eye className="h-4 w-4" />
				</button>
				<AddProduct
					product={props?.row}
					title="edit product"
					className="text-green-600 hover:text-green-900 p-1 rounded"
				>
					<Edit className="h-4 w-4" />
				</AddProduct>
				<button
					onClick={() => handleDelete(props?.row.id)}
					className="text-red-600 hover:text-red-900 p-1 rounded"
					title="Delete"
				>
					<Trash2 className="h-4 w-4" />
				</button>
			</div>
		);
	};

	// const filteredDepartments = allDepartmentsList?.filter(
	// 	(department) =>
	// 		department.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
	// 		department.hodName
	// 			?.toLowerCase()
	// 			.includes(searchQuery.toLowerCase()) ||
	// 		department.hodEmail
	// 			?.toLowerCase()
	// 			.includes(searchQuery.toLowerCase()) ||
	// 		department.hodPhone?.toLowerCase().includes(searchQuery.toLowerCase())
	// );

	const columns: Column<Product>[] = [
		{
			key: "name",
			header: "Name",
			render: (value: string | number, row: Product) => {
				return (
					<div className="flex items-center">
						<img
							className="h-10 w-10 rounded-md object-cover"
							src={row.image}
							alt={row.name}
						/>
						<div className="ml-4">
							<div className="text-sm font-medium text-gray-900">
								{row.name}
							</div>
						</div>
					</div>
				);
			},
		},
		{
			key: "category",
			header: "Category",
			// render: (value: string | number, row: Product) => {
			// 	return <div className="">-</div>;
			// },
		},
		{
			key: "price",
			header: "Price",
			render: (value: string | number, row: Product) => {
				return (
					<div className="">
						${row.price.toFixed(2)}
						{row.originalPrice && (
							<span className="ml-2 text-xs text-gray-500 line-through">
								${row.originalPrice.toFixed(2)}
							</span>
						)}
					</div>
				);
			},
		},
		{
			key: "inStock",
			header: "Stock",
			render: (value: string | number, row: Product) => {
				return (
					<span
						className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
							row.inStock
								? "bg-green-100 text-green-800"
								: "bg-red-100 text-red-800"
						}`}
					>
						{row.inStock ? "In Stock" : "Out of Stock"}
					</span>
				);
			},
		},
		{
			key: "rating",
			header: "Rating",
			render: (value: string | number, row: Product) => {
				return (
					<span>
						{row.rating.toFixed(1)} ({row.reviews})
					</span>
				);
			},
		},
		{
			key: "id",
			header: "#",
			render: (value: string | number, row: Product) => (
				<ActionDropDown row={row} />
			),
		},
	];

	return (
		<AdminLayout>
			<div className="space-y-6">
				<div className="flex justify-end items-center">
					<AddProduct
						title="add product"
						className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors flex items-center space-x-2"
					>
						<span>Add Product</span>
						<Plus className="h-5 w-5" />
					</AddProduct>
				</div>

				<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
					<div className="flex flex-col md:flex-row gap-4">
						<div className="flex-1">
							<div className="relative">
								<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
								<input
									type="text"
									name="searchQuery"
									value={searchQuery}
									placeholder="Search"
									onChange={(e) => {
										setSearchQuery(e.target.value);
									}}
									className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
								/>
							</div>
						</div>
						<div className="flex space-x-2">
							{categories.map((category) => (
								<button
									key={category}
									onClick={() => setSelectedCategory(category)}
									className={`px-4 py-2 rounded-md font-medium transition-colors ${
										selectedCategory === category
											? "bg-green-600 text-white"
											: "bg-gray-100 text-gray-700 hover:bg-gray-200"
									}`}
								>
									{category}
								</button>
							))}
						</div>
					</div>
				</div>

				<CustomTable
					columns={columns}
					tableRow={filteredProducts}
					currentPage={currentPage}
					setCurrentPage={setCurrentPage}
				/>
			</div>
		</AdminLayout>
	);
};

// Product Modal Component

export default AdminProducts;
