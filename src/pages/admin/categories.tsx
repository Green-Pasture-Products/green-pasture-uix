import React, { useEffect, useState } from "react";
import { Plus, Edit, Trash2, Eye } from "lucide-react";
import toast from "react-hot-toast";
import { useAppDispatch, useAppSelector } from "@/_redux/store";
import AdminLayout from "@/_components/AdminLayout";
import AddCategory from "@/_components/Modals/AddCategory";
import { selectCategory } from "@/_redux/reducers/admin.reducer";
import { Column, CustomTable } from "@/_components/CustomTable";
import { ProductCategory } from "@/types";
import { categoryAction } from "@/_redux/actions/category.action";
import SearchBar from "@/_components/SearchBar";
import { filterAndSortProducts, logger } from "@/_utils";

interface ActionDropDownProps {
	row: ProductCategory;
}

const AdminProducts: React.FC = () => {
	const dispatch = useAppDispatch();
	const categories = useAppSelector((state) => state.category.productCategories);
	const { query, filters } = useAppSelector((state) => state.search);
	const [currentPage, setCurrentPage] = useState(1);
	const isDeleting = useAppSelector((state) => state.category.isDeletingCategory);

	useEffect(() => {
		dispatch(categoryAction.fetchAllCategories());
	}, []);

	// const filteredProducts = filterAndSortProducts(categories, query, filters);

	const ActionDropDown: React.FC<ActionDropDownProps> = (props) => {
		const handleDelete = async (id: number) => {
		if (!window.confirm("Are you sure you want to delete this product?")) return;

		try {
			await dispatch(categoryAction.deleteCategory(id)).unwrap();
			toast.success("Category deleted successfully");
		} catch (error) {
			toast.error(error as string);
		}
		};


		return (
			<div className="flex items-center space-x-2">
				<button
					onClick={() => dispatch(selectCategory(props?.row))}
					className="text-blue-600 hover:text-blue-900 p-1 rounded"
					title="View"
				>
					<Eye className="h-4 w-4" />
				</button>
				<AddCategory
					category={props?.row}
					title="edit product"
					className="text-green-600 hover:text-green-900 p-1 rounded"
				>
					<Edit className="h-4 w-4" />
				</AddCategory>
				<button
					onClick={() => handleDelete(props?.row.id)}
					className="text-red-600 hover:text-red-900 p-1 rounded"
					title="Delete"
					disabled={isDeleting}
				>
					<Trash2 className="h-4 w-4" />
				</button>
			</div>
		);
	};

	const columns: Column<ProductCategory>[] = [
		
		{
			key: "name",
			header: "Name",
			render: (value: string | number, row: ProductCategory) => {
				return (
					<div className="flex items-center">
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
			key: "description",
			header: "Description",
			render: (value: string | number, row: ProductCategory) => {
				return (
					<div className="flex items-center">
						<div className="ml-4">
							<div className="text-sm font-medium text-gray-900">
								{row.description}
							</div>
						</div>
					</div>
				);
			},
		},
		
		{
			key: "id",
			header: "Actions",
			render: (value: string | number, row: ProductCategory) => (
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
					<AddCategory
						title="add product"
						className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors flex items-center space-x-2"
					>
						<span>Add Category</span>
						<Plus className="h-5 w-5" />
					</AddCategory>
				</div>

				<CustomTable
					columns={columns}
					tableRow={categories}
					currentPage={currentPage}
					setCurrentPage={setCurrentPage}
				/>
			</div>
		</AdminLayout>
	);
};

export default AdminProducts;
