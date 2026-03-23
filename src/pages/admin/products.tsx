import React, { useEffect, useState } from "react";
import { Plus, Edit, Trash2, Eye } from "lucide-react";

import { useAppDispatch, useAppSelector } from "@/_redux/store";
import AdminLayout from "@/_components/AdminLayout";
import AddProduct from "@/_components/Modals/AddProduct";
import { selectProduct } from "@/_redux/reducers/admin.reducer";
import { Column, CustomTable } from "@/_components/CustomTable";
import { Product } from "@/types";
import { productsAction } from "@/_redux/actions";
import SearchBar from "@/_components/SearchBar";
import { filterAndSortProducts, logger } from "@/_utils";
import ViewProduct from "@/_components/Modals/ViewProduct";

interface ActionDropDownProps {
	row: Product;
}

const AdminProducts: React.FC = () => {
	const dispatch = useAppDispatch();
	const products = useAppSelector((state) => state.product.products);
	const { query, filters } = useAppSelector((state) => state.search);
	const [currentPage, setCurrentPage] = useState(1);
	const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
	const [isViewOpen, setIsViewOpen] = useState(false);

	useEffect(() => {
		dispatch(productsAction.fetchAllProducts());
	}, []);

	const filteredProducts = filterAndSortProducts(products, query, filters);

	const ActionDropDown: React.FC<ActionDropDownProps> = (props) => {
		const handleDelete = (productId: string) => {
			if (window.confirm("Are you sure you want to delete this product?")) {
				// dispatch(removeProduct(productId));
			}
		};

		return (
			<div className="flex items-center justify-end space-x-2">
									
				<ViewProduct
					onClick={() => {
						setSelectedProduct(props?.row);
						setIsViewOpen(true);
						dispatch(selectProduct(props?.row));
					}}
					className="text-blue-600 hover:text-blue-900 p-1 rounded"
					title="View"
					product={selectedProduct}
					isOpen={isViewOpen}
					onClose={() => setIsViewOpen(false)}
				>
					<Eye className="h-4 w-4" />
				</ViewProduct>
				
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

	const columns: Column<Product>[] = [
		
		{
			key: "name",
			header: "Name",
			render: (value: string | number, row: any) => {
				const imageUrl = row?.photos?.[0]?.url ?? null;
				return (
					<div className="flex items-center">
						{imageUrl ? ( // only render img if URL exists
        				<img
          					className="h-10 w-10 rounded-md object-cover"
          					src={imageUrl}
          					alt={row.name}
        				/>
      				) : (
        				<div className="h-10 w-10 rounded-md bg-gray-200 flex items-center justify-center">
          					<span className="text-xs text-gray-400">N/A</span>
        				</div>
      				)}
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
			render: (value: string | number, row: any) => {
				return <div>{row.product?.name ?? row.category ?? "—"}</div>;
			}
		},
		{
			key: "quantity",
			header: "Quantity",
			render: (value: string | number, row: Product) => {
				return <div>{row.quantity ?? row.unit ?? 0}</div>;
			}
		},
		{
			key: "price",
			header: "Price",
			render: (value: string | number, row: Product) => {
				return (
					<div className="flex flex-col">
						₦{row.price.toLocaleString() ?? 0}
					</div>
				);
			},
		},
		{
			key: "inStock",
			header: "Stock",
			render: (value: string | number, row: Product) => {
				const inStock = (row.quantity ?? row.unit ?? 0) > 0;
				return (
					<span
						className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
							row.inStock
								? "bg-green-100 text-green-800"
								: "bg-red-100 text-red-800"
						}`}
					>
						{inStock ? "In Stock" : "Out of Stock"}
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
						{row.rating ? row.rating.toFixed(1) : "0.0"} ({row.reviews ?? 0})
					</span>
				);
			},
		},
		{
			key: "id",
			header: "Actions",
			render: (value: string | number, row: Product) => (
				<ActionDropDown row={row} />
			),
		},
	];

	const handleSearch = (searchQuery: string) => {
		logger.log({ searchQuery });
	};

	return (
		<AdminLayout>
			<div className="space-y-6">
				<div className="flex justify-between items-center">
					<div className="max-w-3xl">
						<SearchBar onSearch={handleSearch} autoFocus />
					</div>
					<AddProduct
						title="add product"
						className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors flex items-center space-x-2"
					>
						<span>Add Product</span>
						<Plus className="h-5 w-5" />
					</AddProduct>
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

export default AdminProducts;
