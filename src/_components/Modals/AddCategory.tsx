import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";

import { useAppDispatch } from "@/_redux/store";
import { ProductCategory } from "@/types";
import { categoryAction } from "@/_redux/actions/category.action";
import Modal from "@/_UI/Modal";
import { FormInput, FormTextarea, FormActions } from "@/_UI/FormField";

const schema = z.object({
	name: z.string().min(1, "Name is required"),
	description: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

const AddCategory: React.FC<{
	category?: ProductCategory;
	children: React.ReactNode;
	className?: string;
	title?: string;
}> = ({ category, children, className = "", title = "Add Category" }) => {
	const [isOpen, setIsOpen] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const dispatch = useAppDispatch();

	const {
		register,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm<FormData>({
		resolver: zodResolver(schema),
		defaultValues: {
			name: category?.name || "",
			description: category?.description || "",
		},
	});

	useEffect(() => {
		if (category) {
			reset({
				name: category.name,
				description: category.description,
			});
		}
	}, [category, reset]);

	const onSubmit = async (data: FormData) => {
		setIsSubmitting(true);
		try {
			if (category?.id) {
				await dispatch(
					categoryAction.updateCategory({
						id: category.id,
						name: data.name,
						description: data.description || "",
					})
				).unwrap();
				toast.success("Category updated successfully");
			} else {
				await dispatch(
					categoryAction.createCategory({
						name: data.name,
						description: data.description || "",
					})
				).unwrap();
				toast.success("Category created successfully");
			}
			handleClose();
		} catch (error: any) {
			toast.error(error || "Something went wrong");
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleClose = () => {
		setIsOpen(false);
		if (!category) {
			reset({ name: "", description: "" });
		}
	};

	return (
		<>
			<button
				title={title}
				onClick={() => setIsOpen(true)}
				className={className}
			>
				{children}
			</button>

			<Modal
				isOpen={isOpen}
				onClose={handleClose}
				title={category ? "Edit Category" : "Add New Category"}
				subtitle={
					category
						? "Update the category details"
						: "Create a new product category"
				}
			>
				<form
					onSubmit={handleSubmit(onSubmit)}
					className="space-y-4"
				>
					<FormInput
						label="Category Name"
						placeholder="e.g. Supplements"
						required
						{...register("name")}
						error={errors.name?.message}
					/>

					<FormTextarea
						label="Description"
						rows={3}
						placeholder="Brief description of this category"
						{...register("description")}
						error={errors.description?.message}
					/>

					<FormActions
						onCancel={handleClose}
						submitLabel={
							category
								? "Update Category"
								: "Create Category"
						}
						isSubmitting={isSubmitting}
					/>
				</form>
			</Modal>
		</>
	);
};

export default AddCategory;
