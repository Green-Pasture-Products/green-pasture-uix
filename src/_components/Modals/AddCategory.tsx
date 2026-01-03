import React, { useState,useEffect } from "react";
import toast from "react-hot-toast";
import { useAppDispatch,useAppSelector} from "@/_redux/store";
import { ProductCategory } from "@/types";
import Modal from ".";
import { categoryAction } from "../../_redux/actions/category.action";

const AddCategory: React.FC<{
	category?: ProductCategory;
	children: React.ReactNode;
	className: string;
	title: string;
}> = ({ category, children, className, title }) => {
	const [isOpen, setIsOpen] = useState(false);
	const dispatch = useAppDispatch();

const { isCreatingCategory, isUpdatingCategory } = useAppSelector(
        (state) => state.category
    );	

	const [formData, setFormData] = useState({
		id: category?.id,
		name: category?.name || "",
		description: category?.description || "",
		});

		useEffect(()=>{
			if(category){
				setFormData({
					id: category.id,
					name: category.name,
					description: category.description,
				})
			}
		},[category]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		try{
		if(category?.id){
			await dispatch(
					categoryAction.updateCategory({
						id: category.id,
						name: formData.name,
						description: formData.description,
					})
      		).unwrap();
	        toast.success("Category updated successfully");
		}
		else{
			const {...newCategoryData} = formData;
			await dispatch(categoryAction.createCategory(newCategoryData)).unwrap();
			toast.success("Category created successfully");

		}
		setIsOpen(false);
		if (!category) {
                setFormData({
                    id: 0,
                    name: "",
                    description: "",
                });
            }
		}
		catch (error: any) {
    	toast.error(error || "Something went wrong");
  		}
	};

	const handleClick = () => {
		setIsOpen(true);
	};

	const onClose = () => {
		setIsOpen(false);
		if (!category) {
            setFormData({
                id: 0,
                name: "",
                description: "",
            });
        }
	};

	return (
		<>
			<button title={title} onClick={handleClick} className={className}>
				{children}
			</button>

			<Modal
				isOpen={isOpen}
				onClose={() => setIsOpen(false)}
				title={category ? "Edit category" : "Add New Category"}
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
						{category ? "Update" : "Create"}
						</button>


					</div>
				</form>
			</Modal>
		</>
	);
};

export default AddCategory;
