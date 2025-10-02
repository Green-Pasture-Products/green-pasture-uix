import React, { useState } from "react";

import { useAppDispatch } from "@/_redux/store";
import { Product } from "@/types";
import Modal from ".";

const AddProduct: React.FC<{
	product?: Product;
	children: React.ReactNode;
	className: string;
	title: string;
}> = ({ product, children, className, title }) => {
	const [isOpen, setIsOpen] = useState(false);
	const dispatch = useAppDispatch();

	const [formData, setFormData] = useState({
		id: product?.id || Date.now().toString(),
		name: product?.name || "",
		price: product?.price || 0,
		originalPrice: product?.originalPrice || "",
		image: product?.image || "",
		category: product?.category || "Fruits",
		description: product?.description || "",
		inStock: product?.inStock ?? true,
		// organic: product?.organic ?? true,
		rating: product?.rating || 0,
		reviews: product?.reviews || 0,
		quantity: 1,
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		// if (product) {
		// 	dispatch(updateProduct(product));
		// } else {
		// 	dispatch(addProduct(product));
		// }
		setIsOpen(false);
	};

	const handleClick = () => {
		setIsOpen(true);
	};

	const onClose = () => {
		setIsOpen(false);
	};

	return (
		<>
			<button title={title} onClick={handleClick} className={className}>
				{children}
			</button>

			<Modal
				isOpen={isOpen}
				onClose={() => setIsOpen(false)}
				title={product ? "Edit Product" : "Add New Product"}
				size="md"
			>
				<form onSubmit={handleSubmit} className="space-y-4">
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Name
						</label>
						<input
							type="text"
							required
							value={formData.name}
							onChange={(e) =>
								setFormData({ ...formData, name: e.target.value })
							}
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
						/>
					</div>
					<div className="grid grid-cols-2 gap-4">
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Price
							</label>
							<input
								type="number"
								step="0.01"
								required
								value={formData.price}
								onChange={(e) =>
									setFormData({
										...formData,
										price: parseFloat(e.target.value),
									})
								}
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
							/>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Original Price
							</label>
							<input
								type="number"
								step="0.01"
								value={formData.originalPrice}
								onChange={(e) =>
									setFormData({
										...formData,
										originalPrice: e.target.value
											? parseFloat(e.target.value)
											: 0,
									})
								}
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
							/>
						</div>
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Category
						</label>
						<select
							value={formData.category}
							onChange={(e) =>
								setFormData({
									...formData,
									category: e.target.value,
								})
							}
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
						>
							<option value="Fruits">Fruits</option>
							<option value="Vegetables">Vegetables</option>
							<option value="Grains">Grains</option>
							<option value="Pantry">Pantry</option>
						</select>
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Image URL
						</label>
						<input
							type="url"
							value={formData.image}
							onChange={(e) =>
								setFormData({ ...formData, image: e.target.value })
							}
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
						/>
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Description
						</label>
						<textarea
							rows={3}
							value={formData.description}
							onChange={(e) =>
								setFormData({
									...formData,
									description: e.target.value,
								})
							}
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
						/>
					</div>
					<div className="flex items-center space-x-6">
						<label className="flex items-center">
							<input
								type="checkbox"
								checked={!!formData.inStock}
								onChange={(e) =>
									setFormData({
										...formData,
										inStock: e.target.checked,
									})
								}
								className="mr-2"
							/>
							In Stock
						</label>
						{/* <label className="flex items-center">
							<input
								type="checkbox"
								checked={formData.organic}
								onChange={(e) =>
									setFormData({
										...formData,
										organic: e.target.checked,
									})
								}
								className="mr-2"
							/>
							Organic
						</label> */}
					</div>
					<div className="flex justify-end space-x-3 pt-4">
						<button
							type="button"
							onClick={onClose}
							className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
						>
							Cancel
						</button>
						<button
							type="submit"
							className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
						>
							{product ? "Update" : "Create"}
						</button>
					</div>
				</form>
			</Modal>
		</>
	);
};

export default AddProduct;
