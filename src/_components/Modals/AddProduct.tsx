import React, { useState } from "react";
import toast from "react-hot-toast";
import { addProduct, updateProduct } from "@/_redux/reducers/products.reducer";
import { useAppDispatch, useAppSelector } from "@/_redux/store";
import { productsAction } from "@/_redux/actions/products.action";
import { Product } from "@/types";
import { secureTokenStorage } from "@/_utils/secureStorage";
import Modal from ".";
import { useEffect } from "react";
import { useMemo } from "react";

const AddProduct: React.FC<{
	product?: Product;
	children: React.ReactNode;
	className: string;
	title: string;
}> = ({ product, children, className, title }) => {
	const [isOpen, setIsOpen] = useState(false);
	const dispatch = useAppDispatch();
	
	const rawCategoryProducts = useAppSelector(
  		(state) => state.product.categoryProducts
	);
	const categoryProducts = useMemo(
  		() => rawCategoryProducts ?? [],
  		[rawCategoryProducts]
	);
	const isFetching = useAppSelector((state) => state.product.isFetchingAllProducts);

	const [formData, setFormData] = useState({
		id: product?.id || Date.now().toString(),
		productId: (product as any)?.product?.id?.toString() || "",
		name: product?.name || "",
		price: product?.price || 0,
		image: product?.image || "",
		images: (product as any)?.photos?.map((p: any) => p.url) //use photos from backend
   			?? (product?.images && product.images.length > 0
      		? product.images
      		: product?.image ? [product.image] : []),
		description: product?.description || "",
		inStock: product?.inStock ?? true,
		quantity: product?.quantity || "",
		category: product?.category || "",
		unit: product?.unit || "",
	});

	const [uploading, setUploading] = useState(false);
	const [isSaving, setIsSaving] = useState(false);

	useEffect(() => {
  		if (isOpen) {
    	dispatch(productsAction.fetchAllCategories());
		console.log("product being edited:", product); // ← check the shape
    	console.log("formData.productId:", formData.productId); // ← check the value
  	}
	}, [isOpen]);

	const handleRemoveImage = (indexToRemove: number) => {
		const updatedImages = formData.images.filter((_: any, idx: number) => idx !== indexToRemove);
		setFormData({
			...formData,
			images: updatedImages,
			image: updatedImages[0] || ''
		});
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsSaving(true);

		try {
			// Get auth token
			const tokenData = secureTokenStorage.getTokens();
			const accessToken = tokenData?.accessToken;

			console.log("Token data:", tokenData);
			console.log("Access token:", accessToken);

			if (!accessToken) {
				console.warn(
					"Warning: No auth token found. Product may not be persisted to backend."
				);
				toast.error(
					"Please log in first before creating/editing products"
				);
				setIsSaving(false);
				return;
			}

			const method = product ? "PATCH" : "POST";
			const endpoint = product ? `/api/items/${product.id}` : "/api/items";
			console.log("endpoint:", endpoint);
			console.log("product.id:", product?.id);

			// Build payload matching backend /items schema (no originalPrice)
			const formPayload = new FormData();
			formPayload.append("productId", String(Number(formData.productId)));
			formPayload.append("name", formData.name);
			formPayload.append("price", String(parseFloat(String(formData.price)) || 0));
			formPayload.append("unit", String(parseInt(String(formData.quantity || "0"), 10) || 0));
			formPayload.append("description", formData.description || "");

			if (formData.images && formData.images.length > 0) {
  				formData.images.forEach((url: string) => {
    			formPayload.append("images", url); //send each Cloudinary URL
  				});
			}

			console.log("Creating/updating item - payload:", formPayload);

			const response = await fetch(endpoint, {
				method,
				headers: {
					"Authorization": `Bearer ${accessToken}`,
				},
				body: formPayload,
			});

			if (!response.ok) {
				const errorData = await response.json().catch(() => ({}));
				const errorMessage =
					errorData.error ||
					errorData.message ||
					`HTTP ${response.status}: ${response.statusText}`;
				console.error("Backend error response:", { status: response.status, error: errorData });
				throw new Error(errorMessage);
			}
			const savedProduct = await response.json();
			console.log("Saved product response:", savedProduct);

			// Update local Redux state
			if (product) {

			console.log("dispatching update with id:", savedProduct?.data?.id, product?.id);

			dispatch(updateProduct({
				...product,
				...savedProduct?.data,
				quantity: savedProduct?.data?.unit,           // map unit to quantity
				category: savedProduct?.data?.product?.name,  // map nested product name
				image: savedProduct?.data?.photos?.[0]?.url,  // map first photo
				images: savedProduct?.data?.photos?.map((p: any) => p.url), // map all photos
			} as unknown as Product));
			toast.success("Product updated successfully!");
			} else {
				dispatch(addProduct(savedProduct?.data as unknown as Product));
				toast.success("Product created successfully!");
			}

			setIsOpen(false);
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : "An error occurred";
			console.error("Product save error:", error);
			toast.error(errorMessage);
		} finally {
			setIsSaving(false);
		}
	};

	const uploadFile = async (file: File) => {
		const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
		const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
		if (!cloudName || !uploadPreset) {
			alert('Cloudinary is not configured. Set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET.');
			return null;
		}

		setUploading(true);
		try {
			const url = `https://api.cloudinary.com/v1_1/${cloudName}/upload`;
			const fd = new FormData();
			fd.append('file', file);
			fd.append('upload_preset', uploadPreset);

			const res = await fetch(url, {
				method: 'POST',
				body: fd,
			});
			const data = await res.json();
			if (data.secure_url) {
				setFormData((prev) => ({
					...prev,
					images: [...(prev.images || []), data.secure_url],
					image: prev.image || data.secure_url,
				}));
				return data.secure_url;
			}
			return null;
		} catch (err) {
			console.error('Upload error', err);
			return null;
		} finally {
			setUploading(false);
		}
	};

	const handleFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = e.target.files;
		if (!files || files.length === 0) return;
		for (let i = 0; i < files.length; i++) {
			const file = files[i];
			await uploadFile(file);
		}
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
				<form onSubmit={handleSubmit} className="flex flex-col max-h-[70vh]">
					<div className="flex-1 overflow-y-auto pr-4 space-y-4">
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
							<label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
							<select
								value={formData.productId}
								onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
								required
							>
								<option value="">Select category</option>
								{isFetching ? (
									<option>Loading...</option>
								) : (
									categoryProducts
									.filter((prod) => prod != null)
  									.map((prod) => (
    									<option key={prod.id} value={String(prod.id)}>
      									{prod.name}
    									</option>
  									))
								)}
							</select>
						</div>
						<div className="grid grid-cols-2 gap-4">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Price
								</label>
								<input
									type="number"
									placeholder="Enter price"
									required
									step="0.01"
									min="0"
									value={formData.price}
									onChange={(e) =>
										setFormData({
											...formData,
											price: parseFloat(e.target.value),
										})
									}
									className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
									style={{ MozAppearance: 'textfield' }}
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Unit
								</label>
								<input
									type="number"
									placeholder="Enter unit"
									required
									value={formData.quantity}
									onChange={(e) => {
										const quantity = parseInt(e.target.value) || 0;
										setFormData({
											...formData,
											quantity: e.target.value,
											inStock: quantity > 0,
										});
									}}
									className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
								/>
							</div>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-3">Upload Images</label>
							<div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50">
								<input
									type="file"
									accept="image/*"
									multiple
									onChange={handleFiles}
									className="w-full"
								/>
								{uploading && <p className="text-sm text-gray-500 mt-3">Uploading...</p>}
								{formData.images && formData.images.length > 0 && (
									<div className="mt-4 flex gap-2 overflow-x-auto">
										{formData.images.map((src: string, idx: number) => (
											<div key={idx} className="relative group">
												<img
													src={src}
													alt={`preview-${idx}`}
													className="w-20 h-20 object-cover rounded-md border"
												/>
												<button
													type="button"
													onClick={() => handleRemoveImage(idx)}
													className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
													title="Remove image"
												>
													✕
												</button>
											</div>
										))}
									</div>
								)}
							</div>
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
						{/*<div className="flex items-center space-x-6">
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
							</label> 
						</div>*/}
					</div>
					{/* Buttons outside scrollable area */}
					<div className="flex justify-end space-x-3 pt-6 mt-6 border-t border-gray-200">
						<button
							type="button"
							onClick={onClose}
							disabled={isSaving}
							className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors disabled:opacity-50"
						>
							Cancel
						</button>
						<button
							type="submit"
							disabled={isSaving || uploading}
							className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
						>
							{isSaving ? "Saving..." : product ? "Update" : "Create"}
						</button>
					</div>
				</form>
			</Modal>
		</>
	);
};

export default AddProduct;