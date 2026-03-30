import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import withAdminAuth from "@/_components/withAdminAuth";
import AdminLayout from "@/_components/AdminLayout";
import { BackButton, DetailHeader, DetailSection, DetailRow } from "@/_UI/DetailField";
import Badge from "@/_UI/Badge";
import Button from "@/_UI/Button";
import { DataTable, Column } from "@/_UI/DataTable";
import { formatCurrency, formatNumber } from "@/_UI/FormatValue";
import PageLoader from "@/_UI/PageLoader";
import toast from "react-hot-toast";
import axiosInstance from "@/_utils/axiosInstance";
import { BackendItem, BackendReview } from "@/types";
import { Pencil, X, Trash2 } from "lucide-react";
import { FormInput, FormTextarea } from "@/_UI/FormField";
import CurrencyInput from "@/_UI/CurrencyInput";
import NumberInput from "@/_UI/NumberInput";

const ProductDetail: React.FC = () => {
	const router = useRouter();
	const { id } = router.query;
	const [item, setItem] = useState<BackendItem | null>(null);
	const [loading, setLoading] = useState(true);
	const [editing, setEditing] = useState(false);
	const [saving, setSaving] = useState(false);
	const [deletingImageId, setDeletingImageId] = useState<number | null>(null);

	// Edit form state
	const [editForm, setEditForm] = useState({
		name: "",
		description: "",
		price: "",
		unit: "",
	});

	const fetchItem = () => {
		if (!id) return;
		setLoading(true);
		axiosInstance
			.get(`items/${id}`)
			.then((res) => {
				const data = res.data?.data ?? res.data;
				setItem(data);
				if (data) {
					setEditForm({
						name: data.name || "",
						description: data.description || "",
						price: String(data.price || ""),
						unit: String(data.unit ?? data.availableQuantity ?? ""),
					});
				}
			})
			.catch(() => {
				setItem(null);
				toast.error("Failed to load product");
			})
			.finally(() => setLoading(false));
	};

	useEffect(() => {
		if (!router.isReady || !id) return;
		fetchItem();
	}, [id, router.isReady]);

	const handleSave = async () => {
		if (!id) return;
		setSaving(true);
		try {
			await axiosInstance.patch(`items/${id}`, {
				name: editForm.name,
				description: editForm.description,
				price: Number(editForm.price),
				unit: Number(editForm.unit),
			});
			toast.success("Product updated");
			setEditing(false);
			fetchItem();
		} catch (err: any) {
			toast.error(err?.response?.data?.message || "Failed to update");
		} finally {
			setSaving(false);
		}
	};

	const handleDeleteImage = async (imageId: number) => {
		if (!id) return;
		setDeletingImageId(imageId);
		try {
			await axiosInstance.delete(`items/${id}/images/${imageId}`);
			toast.success("Image deleted");
			fetchItem();
		} catch (err: any) {
			toast.error(err?.response?.data?.message || "Failed to delete image");
		} finally {
			setDeletingImageId(null);
		}
	};

	const handleCancelEdit = () => {
		setEditing(false);
		if (item) {
			setEditForm({
				name: item.name || "",
				description: item.description || "",
				price: String(item.price || ""),
				unit: String(item.unit ?? (item as any).availableQuantity ?? ""),
			});
		}
	};

	const reviewColumns: Column<BackendReview>[] = [
		{
			key: "rating",
			header: "Rating",
			render: (value: any) => (
				<span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
					{value} / 5
				</span>
			),
		},
		{
			key: "comment",
			header: "Comment",
			render: (value: any) => (
				<span className="text-sm" style={{ color: "var(--text-primary)" }}>
					{value ?? "\u2014"}
				</span>
			),
		},
		{
			key: "createdAt",
			header: "Date",
			render: (value: any) => (
				<span className="text-sm" style={{ color: "var(--text-hint)" }}>
					{new Date(value).toLocaleDateString()}
				</span>
			),
		},
	];

	const inputStyle = {
		border: "1px solid var(--border-light)",
		color: "var(--text-primary)",
		background: "var(--surface-paper)",
	};

	if (loading) {
		return (
			<AdminLayout>
				<PageLoader fullScreen={false} message="Loading product details..." />
			</AdminLayout>
		);
	}

	if (!item) {
		return (
			<AdminLayout>
				<div className="max-w-4xl mx-auto space-y-5 animate-page-enter">
					<BackButton />
					<div
						className="rounded-xl px-6 py-16 text-center"
						style={{ background: "var(--surface-paper)", border: "1px solid var(--border-light)" }}
					>
						<p className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
							Product not found
						</p>
					</div>
				</div>
			</AdminLayout>
		);
	}

	const available = item.unit ?? 0;
	const avgRating = item.ratingStats?.average ?? 0;
	const reviewCount = item.ratingStats?.count ?? 0;

	return (
		<AdminLayout>
			<div className="max-w-4xl mx-auto space-y-5 animate-page-enter">
				<div className="flex items-center justify-between">
					<BackButton />
					{!editing ? (
						<Button variant="outlined" size="sm" onClick={() => setEditing(true)}>
							<Pencil className="w-4 h-4 mr-1.5" />
							Edit
						</Button>
					) : (
						<Button variant="outlined" size="sm" onClick={handleCancelEdit}>
							<X className="w-4 h-4 mr-1.5" />
							Cancel
						</Button>
					)}
				</div>

				<DetailHeader
					title={item.name}
					subtitle={item.product?.name ?? "\u2014"}
					metrics={[
						{ label: "Price (\u20A6)", value: formatCurrency(item.price) },
						{ label: "Available Stock", value: formatNumber(available) },
						{ label: "Avg Rating", value: avgRating > 0 ? `${avgRating.toFixed(1)} (${reviewCount})` : "\u2014" },
					]}
				/>

				{editing ? (
					<DetailSection title="Edit Product">
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5">
							<FormInput
								label="Name"
								required
								value={editForm.name}
								onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
							/>
							<CurrencyInput
								label="Price"
								required
								value={editForm.price}
								onChange={(val) => setEditForm((f) => ({ ...f, price: val }))}
								showWords
							/>
							<NumberInput
								label="Available Units"
								required
								value={editForm.unit}
								onChange={(val) => setEditForm((f) => ({ ...f, unit: val }))}
								prefix="Qty"
								min={0}
							/>
							<div className="sm:col-span-2">
								<FormTextarea
									label="Description"
									value={editForm.description}
									onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
									rows={3}
								/>
							</div>
							<div className="sm:col-span-2 flex justify-end">
								<Button variant="filled" size="md" onClick={handleSave} loading={saving} disabled={saving}>
									Save Changes
								</Button>
							</div>
						</div>
					</DetailSection>
				) : (
					<DetailSection title="Product Information">
						<DetailRow label="Name" value={item.name} />
						<DetailRow label="Description" value={item.description ?? "\u2014"} />
						<DetailRow label="Category" value={item.product?.name ?? "\u2014"} />
						<DetailRow label="Price" value={formatCurrency(item.price)} />
						<DetailRow label="Available" value={formatNumber(available)} />
						<DetailRow
							label="Status"
							value={
								<Badge variant={item.status === "ACTIVE" ? "success" : "neutral"} dot>
									{item.status}
								</Badge>
							}
						/>
					</DetailSection>
				)}

				{item.photos && item.photos.length > 0 && (
					<DetailSection title="Images">
						<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 p-5">
							{item.photos.map((photo) => (
								<div
									key={photo.id}
									className="relative group aspect-square rounded-lg overflow-hidden"
									style={{ border: "1px solid var(--border-light)" }}
								>
									<img src={photo.url} alt={item.name} className="w-full h-full object-cover" />
									{editing && (
										<button
											onClick={() => handleDeleteImage(photo.id)}
											disabled={deletingImageId === photo.id}
											className="absolute top-2 right-2 p-1.5 rounded-full bg-red-600 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700 disabled:opacity-50"
										>
											<Trash2 className="w-3.5 h-3.5" />
										</button>
									)}
								</div>
							))}
						</div>
					</DetailSection>
				)}

				{item.reviews && item.reviews.length > 0 && (
					<DetailSection title="Reviews">
						<DataTable columns={reviewColumns} data={item.reviews} emptyMessage="No reviews yet" />
					</DetailSection>
				)}
			</div>
		</AdminLayout>
	);
};

export default withAdminAuth(ProductDetail);
