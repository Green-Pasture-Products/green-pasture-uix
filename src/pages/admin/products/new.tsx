import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { Package } from "lucide-react";

import withAdminAuth from "@/_components/withAdminAuth";
import AdminLayout from "@/_components/AdminLayout";
import { BackButton } from "@/_UI/DetailField";
import { FormInput, FormFileUpload, FormActions } from "@/_UI/FormField";
import RichTextEditor from "@/_UI/RichTextEditor";
import TagPicker from "@/_UI/TagPicker";
import { WEIGHT_UNITS } from "@/_utils/formatWeight";
import FormSelectDropdown from "@/_UI/FormSelect";
import CurrencyInput from "@/_UI/CurrencyInput";
import NumberInput from "@/_UI/NumberInput";
import axiosInstance from "@/_utils/axiosInstance";
import { useAppDispatch, useAppSelector } from "@/_redux/store";
import { categoryAction } from "@/_redux/actions/category.action";

const schema = z
	.object({
		// Category ids are uuidv7 strings, not numbers — coercing to a number
		// yields NaN and the field can never validate.
		productId: z.string().min(1, "Category is required"),
		name: z.string().min(1, "Name is required"),
		description: z.string().optional(),
		price: z.coerce.number().positive("Selling price must be greater than 0"),
		originalPrice: z.preprocess(
			(val) => (val === "" || val === null || val === undefined ? undefined : Number(val)),
			z.number().positive("Original price must be greater than 0").optional(),
		),
		unit: z.coerce.number().int().min(0, "Units must be 0 or more"),
		weightValue: z.preprocess(
			(val) => (val === "" || val === null || val === undefined ? undefined : Number(val)),
			z.number().positive("Pack size must be greater than 0").optional(),
		),
		weightUnit: z.string().optional(),
	})
	.refine((data) => !data.originalPrice || data.originalPrice > data.price, {
		message: "Original price must be greater than selling price",
		path: ["originalPrice"],
	})
	// A bare number is meaningless on a shelf — "250" of what? Only enforced in
	// that direction: a unit with no amount is just an unfinished field.
	.refine((data) => !data.weightValue || !!data.weightUnit?.trim(), {
		message: "Pick a unit for the pack size",
		path: ["weightUnit"],
	});

type FormData = z.infer<typeof schema>;

const AddProductPage: React.FC = () => {
	const router = useRouter();
	const dispatch = useAppDispatch();
	const { productCategories } = useAppSelector((state) => state.category);

	const [images, setImages] = useState<File[]>([]);
	const [previews, setPreviews] = useState<string[]>([]);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);

	const {
		register,
		handleSubmit,
		control,
		formState: { errors },
	} = useForm<FormData>({
		resolver: zodResolver(schema) as any,
		defaultValues: { unit: 0, price: 0 },
	});

	useEffect(() => {
		if (productCategories.length === 0) {
			dispatch(categoryAction.fetchAllCategories());
		}
	}, [dispatch, productCategories.length]);

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
			if (data.originalPrice) formData.append("originalPrice", String(data.originalPrice));
			formData.append("unit", String(data.unit));
			if (data.description) formData.append("description", data.description);
			if (data.weightValue) formData.append("weightValue", String(data.weightValue));
			if (data.weightUnit?.trim()) formData.append("weightUnit", data.weightUnit.trim());
			// Repeated field, which is how the DTO's transform expects it — a
			// single selection arrives as a bare string and is normalised there.
			selectedTagIds.forEach((id) => formData.append("tagIds", id));
			if (images.length > 0) {
				images.forEach((file) => formData.append("images", file));
			}
			await axiosInstance.post("items", formData, {
				headers: { "Content-Type": "multipart/form-data" },
			});
			toast.success("Product created successfully");
			router.push("/admin/products");
		} catch (err: any) {
			const message = err?.response?.data?.message ?? err?.message ?? "Failed to create product";
			toast.error(message);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<AdminLayout>
			<div className="animate-page-enter space-y-5">
				<BackButton />

				<div className="flex items-center gap-3">
					<div
						className="w-10 h-10 rounded-lg flex items-center justify-center"
						style={{ background: "rgba(22,163,74,0.08)" }}
					>
						<Package size={20} style={{ color: "var(--color-primary)" }} />
					</div>
					<div>
						<h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
							Add Product
						</h1>
						<p className="text-sm" style={{ color: "var(--text-hint)" }}>
							Fill in the details to create a new product listing
						</p>
					</div>
				</div>

				<div
					className="rounded-xl overflow-hidden"
					style={{
						background: "var(--surface-paper)",
						border: "1px solid var(--border-light)",
						boxShadow: "var(--shadow-sm)",
					}}
				>
					<div className="px-5 py-4" style={{ borderBottom: "1px solid var(--border-light)" }}>
						<h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
							Product Details
						</h3>
					</div>

					<form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-4">
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
									onChange={field.onChange}
									error={errors.productId?.message}
								/>
							)}
						/>

						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
							<Controller
								name="price"
								control={control}
								render={({ field }) => (
									<CurrencyInput
										label="Selling Price"
										required
										placeholder="0.00"
										value={field.value || ""}
										onChange={(val) => field.onChange(parseFloat(val) || 0)}
										error={errors.price?.message}
										showWords
									/>
								)}
							/>
							<Controller
								name="originalPrice"
								control={control}
								render={({ field }) => (
									<CurrencyInput
										label="Original Price"
										placeholder="0.00 (leave empty if not on sale)"
										value={field.value ?? ""}
										onChange={(val) => field.onChange(val === "" ? undefined : parseFloat(val))}
										error={(errors as any).originalPrice?.message}
									/>
								)}
							/>
						</div>

						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
							<Controller
								name="unit"
								control={control}
								render={({ field }) => (
									<NumberInput
										label="Available Units"
										placeholder="0"
										required
										prefix="Qty"
										value={field.value ?? ""}
										onChange={(val) => field.onChange(parseInt(val) || 0)}
										error={errors.unit?.message}
									/>
								)}
							/>
						</div>

						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
							<FormInput
								label="Pack Size"
								type="number"
								step="0.01"
								placeholder="e.g. 250"
								{...register("weightValue")}
								error={(errors as any).weightValue?.message}
							/>
							<Controller
								name="weightUnit"
								control={control}
								render={({ field }) => (
									<FormSelectDropdown
										label="Unit"
										value={field.value ?? ""}
										onChange={field.onChange}
										options={WEIGHT_UNITS.map((u) => ({ value: u, label: u }))}
										placeholder="Select a unit"
										error={(errors as any).weightUnit?.message}
										searchable={false}
									/>
								)}
							/>
						</div>

						<TagPicker value={selectedTagIds} onChange={setSelectedTagIds} />

						<div>
							<label className="mb-1.5 block text-sm font-medium" style={{ color: "var(--text-primary)" }}>
								Description
							</label>
							{/* Stored as HTML so pasted formatting survives; the storefront
							    renders it through SanitizedHtml. */}
							<Controller
								name="description"
								control={control}
								render={({ field }) => (
									<RichTextEditor
										value={field.value ?? ""}
										onChange={field.onChange}
										placeholder="Describe the product benefits, ingredients, etc."
										error={errors.description?.message}
									/>
								)}
							/>
						</div>

						<FormFileUpload
							label="Product Images"
							hint="max 5"
							previews={previews}
							onSelect={handleImageSelect}
							onRemove={removeImage}
							maxFiles={5}
						/>

						<FormActions
							onCancel={() => router.push("/admin/products")}
							submitLabel="Create Product"
							isSubmitting={isSubmitting}
						/>
					</form>
				</div>
			</div>
		</AdminLayout>
	);
};

export default withAdminAuth(AddProductPage);
