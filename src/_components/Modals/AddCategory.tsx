import React, { useState } from "react";

import { useAppDispatch, useAppSelector } from "@/_redux/store";
import { Category, Product } from "@/types";
import Modal from ".";
import { createCategoryAsync } from "@/_redux/actions/category.action";

const AddCategory: React.FC<{
	category?: Product;
	children: React.ReactNode;
	className: string;
	title: string;
}> = ({ category, children, className, title }) => {
	const [isOpen, setIsOpen] = useState(false);
	const dispatch = useAppDispatch();
	const categories = useAppSelector((state) => state.category.categories);
	const [searchTerm, setSearchTerm] = useState("");
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [editingCategory, setEditingCategory] = useState<Category | null>(
		null
	);
	const [formData, setFormData] = useState({
		name: "",
		description: "",
		// slug: "",
		// image: "",
		// parentId: null as string | null,
		// isActive: true,
		// productCount: 0,
	});

	const handleCloseModal = () => {
		setIsModalOpen(false);
		setEditingCategory(null);
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		// if (editingCategory) {
		// 	dispatch(
		// 		updateCategory({
		// 			...editingCategory,
		// 			...formData,
		// 		})
		// 	);
		// } else {
		dispatch(createCategoryAsync(formData));
		// }

		handleCloseModal();
	};

	const handleClick = () => {
		setIsOpen(true);
	};

	// const handleDelete = (id: string) => {
	// 	if (window.confirm("Are you sure you want to delete this category?")) {
	// 		dispatch(deleteCategory(id));
	// 	}
	// };

	return (
		<>
			<button title={title} onClick={handleClick} className={className}>
				{children}
			</button>

			<Modal
				isOpen={isOpen}
				onClose={() => setIsOpen(false)}
				title={category ? "Edit Category" : "Add New Category"}
				size="md"
			>
				<form onSubmit={handleSubmit} className="space-y-4">
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Category Name *
						</label>
						<input
							type="text"
							required
							name="name"
							value={formData.name}
							onChange={(e) => {
								setFormData({
									...formData,
									name: e.target.value,
									// slug: generateSlug(e.target.value),
								});
							}}
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
						/>
					</div>

					{/* <div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Slug *
						</label>
						<input
							type="text"
							required
							value={formData.slug}
							onChange={(e) =>
								setFormData({ ...formData, slug: e.target.value })
							}
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
						/>
					</div> */}

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Description *
						</label>
						<textarea
							required
							value={formData.description}
							name="description"
							onChange={(e) =>
								setFormData({
									...formData,
									description: e.target.value,
								})
							}
							rows={3}
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
						/>
					</div>

					{/* <div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Image URL
						</label>
						<input
							type="text"
							value={formData.image}
							onChange={(e) =>
								setFormData({ ...formData, image: e.target.value })
							}
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
						/>
					</div> */}

					{/* <div className="flex items-center">
						<input
							type="checkbox"
							id="isActive"
							checked={formData.isActive}
							onChange={(e) =>
								setFormData({ ...formData, isActive: e.target.checked })
							}
							className="mr-2"
						/>
						<label htmlFor="isActive" className="text-sm text-gray-700">
							Active
						</label>
					</div> */}

					<div className="flex space-x-3 pt-4">
						<button
							type="button"
							onClick={handleCloseModal}
							className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
						>
							Cancel
						</button>
						<button
							type="submit"
							className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
						>
							{editingCategory ? "Update" : "Create"}
						</button>
					</div>
				</form>
			</Modal>
		</>
	);
};

export default AddCategory;
