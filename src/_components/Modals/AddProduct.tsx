import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";

import { useAppDispatch, useAppSelector } from "@/_redux/store";
import { productsAction } from "@/_redux/actions/products.action";
import { categoryAction } from "@/_redux/actions/category.action";
import Modal from "@/_UI/Modal";
import { FormInput, FormTextarea, FormFileUpload, FormActions } from "@/_UI/FormField";
import FormSelectDropdown from "@/_UI/FormSelect";
import CurrencyInput from "@/_UI/CurrencyInput";

const schema = z.object({
	productId: z.coerce.number().positive("Category is required"),
	name: z.string().min(1, "Name is required"),
	description: z.string().optional(),
	price: z.coerce.number().positive("Price must be greater than 0"),
	unit: z.coerce.number().int().min(0, "Units must be 0 or more"),
});

type FormData = z.infer<typeof schema>;

const AddProduct: React.FC<{
	children: React.ReactNode;
	className?: string;
	title?: string;
}> = ({ children, className = "", title = "Add Product" }) => {
	const [isOpen, setIsOpen] = useState(false);
	const [images, setImages] = useState<File[]>([]);
	const [previews, setPreviews] = useState<string[]>([]);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const dispatch = useAppDispatch();
	const { productCategories } = useAppSelector((state) => state.category);

	const {
		register,
		handleSubmit,
		reset,
		control,
		formState: { errors },
	} = useForm<FormData>({
		resolver: zodResolver(schema),
		defaultValues: { unit: 0, price: 0 },
	});

	useEffect(() => {
		if (isOpen && productCategories.length === 0) {
			dispatch(categoryAction.fetchAllCategories());
		}
	}, [isOpen, productCategories.length, dispatch]);

	const handleImageSelect = (files: File[]) => {
		const valid = files.filter((f) => f.type.startsWith("image/"));
		if (valid.length + images.length > 5) {
			toast.error("Maximum 5 images allowed");
			return;
		}
		setImages((prev) => [...prev, ...valid]);
		valid.forEach((file) => {
			const reader = new FileReader();
			reader.onload = (ev) =>
				setPreviews((prev) => [...prev, ev.target?.result as string]);
			reader.readAsDataURL(file);
		});
	};

	const removeImage = (index: number) => {
		setImages((prev) => prev.filter((_, i) => i !== index));
		setPreviews((prev) => prev.filter((_, i) => i !== index));
	};

	const onSubmit = async (data: FormData) => {
		setIsSubmitting(true);
		try {
			const formData = new FormData();
			formData.append("productId", String(data.productId));
			formData.append("name", data.name);
			formData.append("price", String(data.price));
			formData.append("unit", String(data.unit));
			if (data.description) formData.append("description", data.description);
			images.forEach((file) => formData.append("images", file));

			await dispatch(productsAction.createItemAsync(formData)).unwrap();
			toast.success("Product created successfully");
			dispatch(productsAction.fetchAllProducts());
			handleClose();
		} catch (err: any) {
			toast.error(err || "Failed to create product");
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleClose = () => {
		setIsOpen(false);
		reset();
		setImages([]);
		setPreviews([]);
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
				title="Add New Product"
				subtitle="Fill in the details to create a new product listing"
				size="lg"
			>
				<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
					<FormInput
						label="Product Name"
						placeholder="e.g. Brain Super Food"
						required
						{...register("name")}
						error={errors.name?.message}
					/>

					<Controller
						name="productId"
						control={control}
						render={({ field }) => (
							<FormSelectDropdown
								label="Category"
								required
								placeholder="Select a category"
								searchable={productCategories.length > 5}
								options={productCategories.map((c) => ({
									value: c.id,
									label: c.name,
								}))}
								value={field.value}
								onChange={(val) => field.onChange(Number(val))}
								error={errors.productId?.message}
							/>
						)}
					/>

					<div className="grid grid-cols-2 gap-4">
						<Controller
							name="price"
							control={control}
							render={({ field }) => (
								<CurrencyInput
									label="Price"
									required
									placeholder="0.00"
									value={field.value || ""}
									onChange={(val) => field.onChange(parseFloat(val) || 0)}
									error={errors.price?.message}
									showWords
								/>
							)}
						/>
						<FormInput
							label="Available Units"
							type="number"
							placeholder="0"
							required
							{...register("unit")}
							error={errors.unit?.message}
						/>
					</div>

					<FormTextarea
						label="Description"
						rows={3}
						placeholder="Describe the product benefits, ingredients, etc."
						{...register("description")}
					/>

					<FormFileUpload
						label="Product Images"
						hint="max 5"
						previews={previews}
						onSelect={handleImageSelect}
						onRemove={removeImage}
						maxFiles={5}
					/>

					<FormActions
						onCancel={handleClose}
						submitLabel="Create Product"
						isSubmitting={isSubmitting}
					/>
				</form>
			</Modal>
		</>
	);
};

export default AddProduct;
