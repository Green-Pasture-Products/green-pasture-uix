import React, { useLayoutEffect, useState } from "react";

import { categoryConstants } from "@/_redux/constants/categories.constant";
import { createCategoryAsync } from "@/_redux/actions/category.action";
import { useAppDispatch, useAppSelector } from "@/_redux/store";
import { AppEmitter, logger } from "@/_utils";
import { Category, Product } from "@/types";
import CustomModal from ".";

const AddCategory: React.FC<{
	category?: Product;
	children: React.ReactNode;
	className: string;
	title: string;
}> = ({ category, children, className, title }) => {
	const [isOpen, setIsOpen] = useState(false);
	const dispatch = useAppDispatch();
	const { categories } = useAppSelector((state) => state.category);
	const [editingCategory, setEditingCategory] = useState<Category | null>(
		null
	);
	const [formData, setFormData] = useState({
		name: "",
		description: "",
	});

	const handleCloseModal = () => {
		setEditingCategory(null);
	};

	const handleSubmit = (e: any) => {
		e.preventDefault();
		logger.log({ e });

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
	};

	useLayoutEffect(() => {
		const listener = AppEmitter.addListener(
			categoryConstants.CREATE_CATEGORY_SUCCESS,
			(evt: Event) => {
				const newCategory = evt as CustomEvent;

				if (newCategory) {
					// setIsOpen(false);
				}
			}
		);

		return () => listener.remove();
	}, []);

	const handleClick = () => {
		setIsOpen(true);
	};

	return (
		<>
			<button title={title} onClick={handleClick} className={className}>
				{children}
			</button>

			<CustomModal
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

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Description
						</label>
						<textarea
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
			</CustomModal>
		</>
	);
};

export default AddCategory;
