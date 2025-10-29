import React, { useEffect, useState } from "react";
import {
	Plus,
	Edit,
	Trash2,
	Eye,
	DotIcon,
	EllipsisVertical,
} from "lucide-react";

import { useAppDispatch, useAppSelector } from "@/_redux/store";
import AdminLayout from "@/_components/AdminLayout";
import AddProduct from "@/_components/Modals/AddProduct";
import { selectProduct } from "@/_redux/reducers/admin.reducer";
import { Column, CustomTable } from "@/_components/CustomTable";
import { Category, CategoryState, Product } from "@/types";
import { fetchAllProducts } from "@/_redux/actions";
import SearchBar from "@/_components/SearchBar";
import { logger } from "@/_utils";
import {
	deleteCategoryAsync,
	getAllCategoriesAsync,
} from "@/_redux/actions/category.action";
import AddCategory from "@/_components/Modals/AddCategory";
import Loader from "@/_components/Loader";
import DeleteModal from "@/_components/Modals/DeleteDialogue";

interface ActionDropDownProps {
	row: Category;
}

const AdminCategories: React.FC = () => {
	const dispatch = useAppDispatch();
	const { categories, isLoading } = useAppSelector((state) => state.category);
	// const { query, filters } = useAppSelector((state) => state.search);
	const [currentPage, setCurrentPage] = useState(1);
	// const [searchTerm, setSearchTerm] = useState("");

	// const filteredCategories =
	// 	categories &&
	// 	categories?.filter(
	// 		(category) =>
	// 			category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
	// 			category.description
	// 				.toLowerCase()
	// 				.includes(searchTerm.toLowerCase())
	// 	);

	useEffect(() => {
		dispatch(getAllCategoriesAsync({ page: 1, limit: 10 }));
	}, []);

	logger.log({ categories });

	const ActionDropDown: React.FC<ActionDropDownProps> = (props) => {
		const [dropdownOpen, setDropdownOpen] = useState(false);

		const handleConfirmDelete = () => {
			if (props?.row?.id) dispatch(deleteCategoryAsync(props?.row?.id));
		};

		return (
			<>
				<button
					onClick={() => setDropdownOpen((prevState) => !prevState)}
					className="flex items-center space-x-2 text-gray-700 hover:text-green-600 transition-colors cursor-pointer"
				>
					<EllipsisVertical />
				</button>

				{dropdownOpen && (
					<div className="absolute right-0 w-fit bg-white rounded-md shadow-lg py-1 z-50">
						<AddCategory
							category={props?.row}
							title="edit category"
							className="text-green-600 hover:text-green-900"
						>
							<Edit className="h-4 w-4 mr-1" /> Update
						</AddCategory>
						<DeleteModal
							className="text-red-600 hover:text-red-900"
							onDeleteAction={handleConfirmDelete}
							isLoading={isLoading}
						>
							<Trash2 className="h-4 w-4 mr-1" /> Delete
						</DeleteModal>
					</div>
				)}
			</>
		);
	};

	const columns: Column<Category>[] = [
		{
			key: "id",
			header: "Category ID",
		},
		{
			key: "name",
			header: "Name",
		},
		{
			key: "description",
			header: "Description",
		},
		{
			key: "id",
			header: "#",
			render: (value: string | number, row: Category) => (
				<ActionDropDown row={row} />
			),
		},
	];

	const handleSearch = (searchQuery: string) => {
		logger.log({ searchQuery });
	};

	if (isLoading) {
		return (
			<AdminLayout isLoading={isLoading}>
				<div className="flex items-center justify-center h-[100% - 72px] w-full">
					<Loader />
				</div>
			</AdminLayout>
		);
	}

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
					setCurrentPage={setCurrentPage}
					tableRow={categories ?? []}
					currentPage={currentPage}
					columns={columns}
				/>
			</div>
		</AdminLayout>
	);
};

export default AdminCategories;
