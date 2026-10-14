import RecordActivity from "@/_components/RecordActivity";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import withAdminAuth from "@/_components/withAdminAuth";
import AdminLayout from "@/_components/AdminLayout";
import { BackButton, DetailHeader, DetailSection, DetailRow } from "@/_UI/DetailField";
import Badge from "@/_UI/Badge";
import Can from "@/_components/Can";
import { useHasPrivilege } from "@/_hooks/usePrivilege";
import Button from "@/_UI/Button";
import { DataTable } from "@/_components/DataTable";
import type { ColumnDef } from "@tanstack/react-table";
import { formatCurrency, formatNumber } from "@/_UI/FormatValue";
import PageLoader from "@/_UI/PageLoader";
import toast from "react-hot-toast";
import axiosInstance from "@/_utils/axiosInstance";
import { BackendItem, BackendReview } from "@/types";
import { Pencil, X, Trash2, Upload, Power, Star, Plus } from "lucide-react";
import { FormInput, FormTextarea, FormFileUpload } from "@/_UI/FormField";
import Modal from "@/_UI/Modal";
import FormSelectDropdown from "@/_UI/FormSelect";
import CategoryLookup from "@/_UI/CategoryLookup";
import { SettingsSaveBar, ToggleRow } from "@/_components/SettingsParts";
import CurrencyInput from "@/_UI/CurrencyInput";
import NumberInput from "@/_UI/NumberInput";
import { useAppDispatch, useAppSelector } from "@/_redux/store";
import { categoryAction } from "@/_redux/actions/category.action";
import RichTextEditor from "@/_UI/RichTextEditor";
import TagPicker from "@/_UI/TagPicker";
import { WEIGHT_UNITS, formatWeight } from "@/_utils/formatWeight";
import SanitizedHtml from "@/_UI/SanitizedHtml";
import { siblingAnchorId } from "@/_utils/siblingAnchorId";
import { variantGroupKey } from "@/_utils/groupVariants";
import { useFeature } from "@/_hooks/useFeature";
import { useLiveEvent } from "@/_hooks/useLiveEvent";
import { ProductChangeCard, fetchProductChanges } from "@/_components/ProductChangeParts";
import type { ProductChange } from "@/types/productChanges";

const EMPTY_NEW_SIZE = { weightValue: "", weightUnit: "", price: "", originalPrice: "", unit: "" };

const ProductDetail: React.FC = () => {
	const router = useRouter();
	const hasPrivilege = useHasPrivilege();
	const makerChecker = useFeature("products.maker_checker");
	const meId = String(useAppSelector((s) => s.auth.user?.id ?? ""));
	const [pendingChange, setPendingChange] = useState<ProductChange | null>(null);
	const [approverNote, setApproverNote] = useState("");
	const { id } = router.query;
	const [item, setItem] = useState<BackendItem | null>(null);
	const [loading, setLoading] = useState(true);
	const [refreshing, setRefreshing] = useState(false);
	const [editing, setEditing] = useState(false);
	useEffect(() => {
		if (router.isReady && router.query.edit === "1" && hasPrivilege("UPDATE_PRODUCT")) setEditing(true);
	}, [router.isReady, router.query.edit]);
	// ?edit=1 can open the form before the pending change has loaded; once it has, a change in flight blocks editing.
	useEffect(() => {
		if (pendingChange) setEditing(false);
	}, [pendingChange]);
	const [saving, setSaving] = useState(false);
	const [toggling, setToggling] = useState(false);
	const [statusModalOpen, setStatusModalOpen] = useState(false);
	const [deletingImageId, setDeletingImageId] = useState<string | null>(null);
	const [settingThumbnailId, setSettingThumbnailId] = useState<string | null>(null);
	const [settingDefaultId, setSettingDefaultId] = useState<string | null>(null);
	const [newImages, setNewImages] = useState<File[]>([]);
	const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);
	const [uploadingImages, setUploadingImages] = useState(false);

	const dispatch = useAppDispatch();
	const { productCategories } = useAppSelector((state) => state.category);

	useEffect(() => {
		dispatch(categoryAction.fetchAllCategories());
	}, [dispatch]);

	// Edit form state
	const [editForm, setEditForm] = useState({
		name: "",
		description: "",
		price: "",
		originalPrice: "",
		unit: "",
		category: "",
		status: "A",
		weightValue: "",
		weightUnit: "",
		variantOfItemId: "",
	});
	const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);

	// Deliberately not the shared state.product.products slice: the storefront
	// grids read that and expect published items only, while this picker needs
	// unpublished siblings too. Local state keeps the two from colliding.
	const [anchorCandidates, setAnchorCandidates] = useState<any[]>([]);

	useEffect(() => {
		let cancelled = false;
		axiosInstance
			.get("items?page=1&limit=100")
			.then((res) => {
				if (!cancelled) setAnchorCandidates(res.data?.data?.items ?? []);
			})
			.catch(() => {
				// A failed load leaves the picker empty rather than blocking the
				// rest of the edit form — grouping is not the main job here.
			});
		return () => {
			cancelled = true;
		};
	}, []);

	// Any other item can be the anchor, except this one — an item cannot be a
	// size variant of itself, and the API rejects it anyway.
	//
	// The leading empty option is what makes detaching possible at all.
	// FormSelectDropdown renders only the options it is handed and has no
	// clear control of its own — `placeholder` is just the text shown while
	// the value is already empty. Without a selectable "" entry, an item could
	// be grouped through this picker but never ungrouped.
	//
	// ponytail: first 100 items only. The catalogue is far short of that,
	// and the real fix when it isn't is a server-side search on this
	// endpoint, not a bigger number here.
	const anchorOptions = [
		{ value: "", label: "Not a size variant" },
		...anchorCandidates
			.filter((candidate: any) => String(candidate.id) !== String(id))
			.map((candidate: any) => ({ value: candidate.id, label: candidate.name })),
	];

	// Every pack size of this product, smallest first — the same order the
	// storefront chips use. Reuses anchorCandidates rather than fetching again:
	// the picker already loaded the list this filters over.
	const siblingSizes = item
		? anchorCandidates
				.filter((candidate: any) => variantGroupKey(candidate) === variantGroupKey(item))
				.sort((a: any, b: any) => Number(a.weightValue ?? 0) - Number(b.weightValue ?? 0))
		: [];

	// `silent` refreshes in place: the toolbar icon spins but the page keeps its
	// content, instead of collapsing back into the full-page loader.
	const fetchItem = (silent = false) => {
		if (!id) return Promise.resolve();
		silent ? setRefreshing(true) : setLoading(true);
		return axiosInstance
			.get(`items/${id}`)
			.then((res) => {
				const data = res.data?.data ?? res.data;
				setItem(data);
				if (data) {
					setEditForm({
						name: data.name || "",
						description: data.description || "",
						price: String(data.price || ""),
						originalPrice: data.originalPrice ? String(data.originalPrice) : "",
						unit: String(data.unit ?? data.availableQuantity ?? ""),
						category: String(data.product?.id ?? data.category ?? ""),
						status: data.status ?? "A",
						weightValue: data.weightValue ? String(data.weightValue) : "",
						weightUnit: data.weightUnit ?? "",
						variantOfItemId: siblingAnchorId(data, anchorCandidates),
					});
					setSelectedTagIds((data.tags ?? []).map((t: any) => t.id));
				}
			})
			.catch(() => {
				setItem(null);
				toast.error("Failed to load product");
			})
			.finally(() => {
				setLoading(false);
				setRefreshing(false);
			});
	};

	// The API allows one pending update per product, so the first (only) PENDING change is the one to show.
	const loadPending = () => {
		if (!id) return;
		fetchProductChanges({ itemId: String(id), status: "PENDING" })
			.then((list) => setPendingChange(list[0] ?? null))
			.catch(() => setPendingChange(null));
	};
	useEffect(() => {
		if (!router.isReady || !id) return;
		fetchItem();
		loadPending();
	}, [id, router.isReady]);
	// A decision may have applied the change: reload the product as well as the banner.
	useLiveEvent("product-changes-changed", () => {
		loadPending();
		fetchItem(true);
	}, !!id);

	// The candidate list is fetched in parallel with the item, so the hydration
	// above often runs before it lands and the picker shows nothing for a
	// grouped item. Fill it in when the list arrives, without a second fetch.
	useEffect(() => {
		if (!(item as any)?.variantGroupId) return;
		setEditForm((f) => (f.variantOfItemId ? f : { ...f, variantOfItemId: siblingAnchorId(item, anchorCandidates) }));
	}, [anchorCandidates, item]);

	const handleToggleStatus = async () => {
		if (!item) return;
		const isActive = item.status === "A";
		setToggling(true);
		try {
			await axiosInstance.patch(isActive ? "items/deactivate" : "items/activate", { ids: [id] });
			toast.success(isActive ? "Product deactivated successfully" : "Product activated successfully");
			setStatusModalOpen(false);
			fetchItem();
		} catch (err: any) {
			toast.error(err?.response?.data?.message || "Failed to update product status");
		} finally {
			setToggling(false);
		}
	};

	const handleSave = async () => {
		if (!id) return;
		setSaving(true);
		try {
			const payload: any = {
				name: editForm.name,
				description: editForm.description,
				price: Number(editForm.price),
				originalPrice: editForm.originalPrice !== "" ? Number(editForm.originalPrice) : null,
				weightValue: editForm.weightValue !== "" ? Number(editForm.weightValue) : null,
				weightUnit: editForm.weightUnit.trim() || null,
				// Always sent, so clearing every tag actually clears them. The
				// API treats an absent tagIds as "leave alone" and [] as "clear".
				tagIds: selectedTagIds,
			};

			// Only the picker can detach. If we could not resolve this item's
			// current grouping — the candidates fetch failed, or the sibling sits
			// past the limit — leave the grouping alone rather than asking the API
			// to dissolve it. Absent means "don't touch"; null means detach, and
			// for a group owner that now clears every sibling.
			const groupingResolved = !(item as any)?.variantGroupId || !!siblingAnchorId(item, anchorCandidates);
			if (editForm.variantOfItemId || groupingResolved) {
				payload.variantOfItemId = editForm.variantOfItemId || null;
			}

			if (editForm.category) {
				payload.productId = editForm.category;
			}

			// Only send stock when the admin changed it. The API sets it as an
			// absolute count, so re-sending the count this page loaded would undo
			// any sale made while the form was open.
			if (editForm.unit !== String(item?.unit ?? (item as any)?.availableQuantity ?? "")) {
				payload.unit = Number(editForm.unit);
			}

			if (makerChecker && approverNote.trim()) payload.note = approverNote.trim();

			const res = await axiosInstance.patch(`items/${id}`, payload);
			const sentForApproval = res.status === 202 || !!res.data?.data?.pending;

			if (editForm.status !== item?.status) {
				const endpoint = editForm.status === "A" ? "items/activate" : "items/deactivate";
				await axiosInstance.patch(endpoint, { ids: [id] });
			}

			if (sentForApproval) {
				toast.success("Sent for approval. Someone else needs to approve it before it goes live.");
				setApproverNote("");
				loadPending();
			} else {
				toast.success("Product updated");
			}

			// Upload new images if any
			if (newImages.length > 0) {
				await uploadNewImages();
			} else {
				// Only fetch if no images to upload (uploadNewImages calls fetch internally)
				await fetchItem();
			}

			setEditing(false);
		} catch (err: any) {
			toast.error(err?.response?.data?.message || "Failed to update");
		} finally {
			setSaving(false);
		}
	};

	const handleDeleteImage = async (imageId: string) => {
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

	// Promotes one of the already-uploaded images. Not an upload of its own —
	// the thumbnail is always one of the product's existing shots.
	const handleSetThumbnail = async (imageId: string) => {
		if (!id) return;
		setSettingThumbnailId(imageId);
		try {
			await axiosInstance.patch(`items/${id}/images/${imageId}/thumbnail`);
			toast.success("Thumbnail updated");
			await fetchItem(true);
		} catch (err: any) {
			toast.error(err?.response?.data?.message || "Failed to set thumbnail");
		} finally {
			setSettingThumbnailId(null);
		}
	};

	const handleSetDefault = async (itemId: string) => {
		setSettingDefaultId(itemId);
		try {
			await axiosInstance.patch(`items/${itemId}`, { isDefault: true });
			toast.success("Default size updated");
			const res = await axiosInstance.get("items?page=1&limit=100");
			setAnchorCandidates(res.data?.data?.items ?? []);
			if (String(itemId) === String(id)) await fetchItem(true);
		} catch (err: any) {
			toast.error(err?.response?.data?.message || "Failed to set default size");
		} finally {
			setSettingDefaultId(null);
		}
	};

	const handleNewImageSelect = (files: File[]) => {
		const valid = files.filter((f) => f.type.startsWith("image/"));
		const maxNewImages = 5 - (item?.photos?.length || 0);
		if (valid.length + newImages.length > maxNewImages) {
			toast.error(`Maximum ${maxNewImages} additional images allowed`);
			return;
		}
		setNewImages((prev) => [...prev, ...valid]);
		valid.forEach((file) => {
			const reader = new FileReader();
			reader.onload = (ev) =>
				setNewImagePreviews((prev) => [...prev, ev.target?.result as string]);
			reader.readAsDataURL(file);
		});
	};

	const removeNewImage = (index: number) => {
		setNewImages((prev) => prev.filter((_, i) => i !== index));
		setNewImagePreviews((prev) => prev.filter((_, i) => i !== index));
	};

	const uploadNewImages = async () => {
		if (newImages.length === 0 || !id) return;
		setUploadingImages(true);
		try {
			const formData = new FormData();
			newImages.forEach((file) => formData.append("images", file));
			await axiosInstance.post(`items/${id}/images`, formData, {
				headers: { "Content-Type": "multipart/form-data" },
			});
			toast.success("Images uploaded successfully");
			setNewImages([]);
			setNewImagePreviews([]);
			fetchItem();
		} catch (err: any) {
			toast.error(err?.response?.data?.message || "Failed to upload images");
		} finally {
			setUploadingImages(false);
		}
	};

	const handleCancelEdit = () => {
		setEditing(false);
		if (item) {
			setEditForm({
				name: item.name || "",
				description: item.description || "",
				price: String(item.price || ""),
				originalPrice: item.originalPrice ? String(item.originalPrice) : "",
				unit: String(item.unit ?? (item as any).availableQuantity ?? ""),
				category: String(item.product?.id ?? item.category ?? ""),
				status: item.status ?? "A",
				weightValue: (item as any).weightValue ? String((item as any).weightValue) : "",
				weightUnit: (item as any).weightUnit ?? "",
				variantOfItemId: siblingAnchorId(item, anchorCandidates),
			});
			setSelectedTagIds(((item as any).tags ?? []).map((t: any) => t.id));
		}
		setNewImages([]);
		setNewImagePreviews([]);
	};

	const reviewColumns: ColumnDef<BackendReview, any>[] = [
		{
			accessorKey: "rating",
			header: "Rating",
			cell: ({ getValue }) => (
				<span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
					{getValue() as number} / 5
				</span>
			),
		},
		{
			accessorKey: "comment",
			header: "Comment",
			cell: ({ getValue }) => (
				<span className="text-sm" style={{ color: "var(--text-primary)" }}>
					{(getValue() as string) ?? "\u2014"}
				</span>
			),
		},
		{
			accessorKey: "createdAt",
			header: "Date",
			cell: ({ getValue }) => (
				<span className="text-sm" style={{ color: "var(--text-hint)" }}>
					{new Date(getValue() as string).toLocaleDateString()}
				</span>
			),
		},
	];

	const inputStyle = {
		border: "1px solid var(--border-light)",
		color: "var(--text-primary)",
		background: "var(--surface-paper)",
	};

	const itemTitle = item?.name ?? 'Product Details';

	if (loading) {
		return (
			<AdminLayout pageTitle={itemTitle}>
				<PageLoader fullScreen={false} message="Loading product details..." />
			</AdminLayout>
		);
	}

	if (!item) {
		return (
			<AdminLayout pageTitle={itemTitle}>
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
	const active = item.status === "A";
	const packSize = formatWeight((item as any).weightValue, (item as any).weightUnit);
	const categoryName = item.product?.name ?? item.category ?? "";
	const photoSlots = 5 - (item.photos?.length || 0);
	const hasSize = !!((item as any).weightValue && (item as any).weightUnit);

	return (
		<AdminLayout pageTitle={itemTitle}>
			<form
				onSubmit={(e) => {
					e.preventDefault();
					if (editing) handleSave();
				}}
				className="@container animate-page-enter mx-auto w-full max-w-6xl space-y-5"
			>
				<BackButton />

				<DetailHeader
					title={item.name}
					subtitle={[categoryName, packSize].filter(Boolean).join(" · ") || undefined}
					status={
						<Badge variant={active ? "success" : "error"} dot>
							{active ? "Active" : "Inactive"}
						</Badge>
					}
					actions={
						<>
							<Can privilege="MANAGE_PRODUCTS">
								<Button type="button" variant="outlined" size="sm" color={active ? "error" : "primary"} onClick={() => setStatusModalOpen(true)} loading={toggling} disabled={toggling}>
									<Power className="mr-1.5 h-4 w-4" />
									{active ? "Deactivate" : "Activate"}
								</Button>
							</Can>
							<Can privilege="UPDATE_PRODUCT">
								<Button
									type="button"
									variant="outlined"
									size="sm"
									disabled={!editing && !!pendingChange}
									title={!editing && pendingChange ? "A change is waiting for approval" : undefined}
									onClick={() => (editing ? handleCancelEdit() : setEditing(true))}
								>
									{editing ? <X className="mr-1.5 h-4 w-4" /> : <Pencil className="mr-1.5 h-4 w-4" />}
									{editing ? "Cancel" : "Edit"}
								</Button>
							</Can>
						</>
					}
					metrics={[
						{ label: "Selling Price (\u20A6)", value: formatCurrency(item.price) },
						...(item.originalPrice ? [{ label: "Original Price (\u20A6)", value: formatCurrency(item.originalPrice) }] : []),
						{ label: "Available Stock", value: formatNumber(available) },
						{ label: "Avg Rating", value: avgRating > 0 ? `${avgRating.toFixed(1)} (${reviewCount})` : "\u2014" },
					]}
				/>

				<div className="grid grid-cols-1 gap-5 @2xl:grid-cols-[minmax(0,1fr)_340px] @2xl:items-start">
					<div className="min-w-0 space-y-5">
						{pendingChange && (
							<DetailSection title="Pending approval" description="Not live yet. It applies once someone else approves it.">
								<div className="py-3">
									<ProductChangeCard change={pendingChange} meId={meId} onDone={() => { loadPending(); fetchItem(true); }} />
								</div>
							</DetailSection>
						)}
						{editing ? (
							<>
								<DetailSection title="Basics" description="What it is and where it belongs in the shop.">
									<div className="space-y-4 py-4">
										<FormInput label="Name" required value={editForm.name} onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))} />
										<CategoryLookup value={editForm.category} onChange={(val) => setEditForm((f) => ({ ...f, category: val }))} />
										<div>
											<label className="mb-1.5 block text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>
												Description
											</label>
											<RichTextEditor value={editForm.description} onChange={(html) => setEditForm((f) => ({ ...f, description: html }))} placeholder="Describe the product benefits, ingredients, etc." />
										</div>
									</div>
								</DetailSection>

								<DetailSection title="Pricing & stock">
									<div className="grid grid-cols-1 gap-4 py-4 sm:grid-cols-2">
										<CurrencyInput label="Selling Price" required value={editForm.price} onChange={(val) => setEditForm((f) => ({ ...f, price: val }))} showWords />
										<CurrencyInput label="Original price" placeholder="Leave empty if not on sale" value={editForm.originalPrice} onChange={(val) => setEditForm((f) => ({ ...f, originalPrice: val }))} />
										<NumberInput label="Available Units" required value={editForm.unit} onChange={(val) => setEditForm((f) => ({ ...f, unit: val }))} prefix="Qty" min={0} />
									</div>
								</DetailSection>

								<DetailSection title="Pack size & grouping">
									<div className="grid grid-cols-1 gap-4 py-4 sm:grid-cols-2">
										<NumberInput label="Pack Size" value={editForm.weightValue} onChange={(val) => setEditForm((f) => ({ ...f, weightValue: val }))} prefix="Size" min={0} />
										<FormSelectDropdown label="Unit" value={editForm.weightUnit} onChange={(val) => setEditForm((f) => ({ ...f, weightUnit: val }))} options={WEIGHT_UNITS.map((u) => ({ value: u, label: u }))} placeholder="Select a unit" searchable={false} />
										<div className="sm:col-span-2">
											<FormSelectDropdown label="Same product as" placeholder="Not a size variant" searchable value={editForm.variantOfItemId} onChange={(val) => setEditForm((f) => ({ ...f, variantOfItemId: val }))} options={anchorOptions} />
											<p className="mt-1.5 text-xs" style={{ color: "var(--text-hint)" }}>
												Pick another listing to group this one with it as a pack size of the same product. They will share one card in the shop.
											</p>
										</div>
									</div>
								</DetailSection>

								<DetailSection title="Tags" description="Who is this product for? A product can carry several.">
									<div className="py-3">
										<TagPicker value={selectedTagIds} onChange={setSelectedTagIds} label="" hint="" />
									</div>
								</DetailSection>

								<DetailSection title="Visibility">
									<ToggleRow id="productActive" title="Active" description="Inactive products are hidden from the shop and cannot be ordered." checked={editForm.status === "A"} onChange={(next) => setEditForm((f) => ({ ...f, status: next ? "A" : "I" }))} />
								</DetailSection>
							</>
						) : (
							<DetailSection title="Details">
								<DetailRow
									label="Description"
									wide
									value={item.description ? <SanitizedHtml html={item.description} className="text-sm font-normal" /> : "\u2014"}
								/>
								<DetailRow label="Category" value={categoryName || "\u2014"} />
								<DetailRow label="Pack Size" value={packSize || "\u2014"} />
								<DetailRow
									label="Tags"
									value={
										(item as any).tags?.length ? (
											<div className="flex flex-wrap gap-1.5">
												{(item as any).tags.map((tag: any) => (
													<span key={tag.id} className="rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap" style={{ background: "rgba(154,202,60,0.16)", color: "var(--color-primary)" }}>
														{tag.name}
													</span>
												))}
											</div>
										) : (
											"\u2014"
										)
									}
								/>
								<DetailRow
									label="Shop"
									value={
										<Badge variant={(item as any).published ? "success" : "warning"} dot>
											{(item as any).published ? "Published" : "Draft"}
										</Badge>
									}
								/>
							</DetailSection>
						)}
					</div>

					<div className="min-w-0 space-y-5 @2xl:sticky @2xl:top-4">
						<DetailSection title="Images" description="The thumbnail is used wherever the product appears small: cards, listings, search, cart lines.">
							<div className="space-y-4 py-4">
								{item.photos && item.photos.length > 0 ? (
									<div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-2">
										{item.photos.map((photo) => (
											<div key={photo.id} className="group relative aspect-square overflow-hidden rounded-xl" style={{ border: photo.isThumbnail ? "2px solid var(--color-primary)" : "1px solid var(--border-light)" }}>
												<img src={photo.url} alt={item.name} className="h-full w-full object-cover" />
												{photo.isThumbnail ? (
													<span className="absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-full px-2 py-1 text-[0.6rem] font-semibold" style={{ background: "var(--color-primary)", color: "#fff" }}>
														<Star className="h-3 w-3 fill-current" />
														Thumbnail
													</span>
												) : (
													hasPrivilege("UPDATE_PRODUCT") && (
														<button type="button" onClick={() => handleSetThumbnail(photo.id)} disabled={settingThumbnailId === photo.id} className="absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-full px-2 py-1 text-[0.6rem] font-semibold whitespace-nowrap disabled:opacity-50" style={{ background: "rgba(255,255,255,0.92)", color: "var(--color-primary)" }}>
															<Star className="h-3 w-3" />
															{settingThumbnailId === photo.id ? "Setting…" : "Make thumbnail"}
														</button>
													)
												)}
												{editing && hasPrivilege("DELETE_PRODUCT") && (
													<button type="button" onClick={() => handleDeleteImage(photo.id)} disabled={deletingImageId === photo.id} aria-label="Delete image" className="absolute top-2 right-2 rounded-full bg-red-600 p-1.5 text-white hover:bg-red-700 disabled:opacity-50">
														<Trash2 className="h-3.5 w-3.5" />
													</button>
												)}
											</div>
										))}
										{editing &&
											newImagePreviews.map((preview, index) => (
												<div key={`new-${index}`} className="relative aspect-square overflow-hidden rounded-xl" style={{ border: "1px solid var(--border-light)" }}>
													<img src={preview} alt={`New image ${index + 1}`} className="h-full w-full object-cover" />
													<div className="absolute top-2 right-2 rounded-full bg-blue-600 p-1.5 text-white">
														<Upload className="h-3.5 w-3.5" />
													</div>
													<button type="button" onClick={() => removeNewImage(index)} aria-label="Remove new image" className="absolute top-2 left-2 rounded-full bg-red-600 p-1.5 text-white hover:bg-red-700">
														<Trash2 className="h-3.5 w-3.5" />
													</button>
												</div>
											))}
									</div>
								) : (
									<p className="text-sm" style={{ color: "var(--text-hint)" }}>
										No images yet.{editing ? "" : " Edit the product to add some."}
									</p>
								)}
								{editing && photoSlots > 0 && (
									<div>
										<p className="mb-2 text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>
											Add new images
										</p>
										<FormFileUpload hint={`max ${photoSlots} additional images`} previews={[]} onSelect={handleNewImageSelect} onRemove={removeNewImage} maxFiles={photoSlots} />
									</div>
								)}
							</div>
						</DetailSection>
					</div>
				</div>

				{/* The panel is always shown so a lone product can get its second size; the list itself only appears once there is more than one. */}
				<DetailSection
					title="Pack sizes"
					action={
						<Can privilege="CREATE_PRODUCT">
							<Button type="button" variant="tonal" size="sm" leftIcon={Plus} onClick={() => router.push(`/admin/product/${id}/sizes/new`)} disabled={!hasSize}>
								Add size
							</Button>
						</Can>
					}
				>
					{!hasSize && (
						<p className="pt-4 pb-1 text-xs" style={{ color: "var(--text-hint)" }}>
							Set a pack size on this product (Edit → Pack Size) before adding another size.
						</p>
					)}
					{siblingSizes.length <= 1 && hasSize && (
						<p className="py-4 text-xs" style={{ color: "var(--text-hint)" }}>
							Only one size so far. Add another and the sizes will share one card in the shop.
						</p>
					)}
					{siblingSizes.length > 1 && (
						<>
							<p className="pt-4 text-xs" style={{ color: "var(--text-hint)" }}>
								These sell as one product on the storefront — one card, with the size chosen on the product page. Each size keeps its own price and stock, and is edited on its own page.
							</p>
							<div className="space-y-2 py-4">
								{siblingSizes.map((size: any) => {
									const isCurrent = String(size.id) === String(id);
									return (
										<div
											key={size.id}
											role="button"
											tabIndex={isCurrent ? -1 : 0}
											onClick={() => !isCurrent && router.push(`/admin/product/${size.id}`)}
											onKeyDown={(e) => {
												if (e.target !== e.currentTarget) return;
												if (e.key === " ") e.preventDefault();
												if (!isCurrent && (e.key === "Enter" || e.key === " ")) router.push(`/admin/product/${size.id}`);
											}}
											className={`flex w-full flex-wrap items-center gap-x-4 gap-y-2 rounded-xl px-3.5 py-3 text-left transition-colors ${isCurrent ? "cursor-default" : "cursor-pointer hover:bg-muted/60"}`}
											style={{ background: isCurrent ? "rgba(154,202,60,0.12)" : "var(--surface-low)", border: `1px solid ${isCurrent ? "var(--color-primary)" : "var(--border-light)"}` }}
										>
											<span className="text-sm font-semibold whitespace-nowrap" style={{ color: "var(--text-primary)" }}>
												{formatWeight(size.weightValue, size.weightUnit) || "No size set"}
											</span>
											<span className="text-sm whitespace-nowrap tabular-nums" style={{ color: "var(--text-secondary)" }}>
												{formatCurrency(size.price)}
											</span>
											<span className="text-xs whitespace-nowrap tabular-nums" style={{ color: "var(--text-hint)" }}>
												{formatNumber(Number(size.availableQuantity ?? size.unit ?? 0))} in stock
											</span>
											<span className="ml-auto flex flex-wrap items-center gap-2">
												<Badge variant={size.published ? "success" : "warning"} dot>
													{size.published ? "Published" : "Draft"}
												</Badge>
												{size.isDefault ? (
													<span className="inline-flex items-center gap-1 text-[0.65rem] font-semibold tracking-[0.12em] whitespace-nowrap uppercase" style={{ color: "var(--color-primary)" }}>
														<Star className="h-3 w-3 fill-current" />
														Default
													</span>
												) : (
													hasPrivilege("UPDATE_PRODUCT") && (
														<button
															type="button"
															onClick={(e) => {
																e.stopPropagation();
																handleSetDefault(size.id);
															}}
															disabled={settingDefaultId === size.id}
															className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-[0.65rem] font-semibold whitespace-nowrap disabled:opacity-50"
															style={{ background: "var(--surface-base)", color: "var(--text-secondary)", border: "1px solid var(--border-light)" }}
														>
															<Star className="h-3 w-3" />
															{settingDefaultId === size.id ? "Setting…" : "Set default"}
														</button>
													)
												)}
												{isCurrent && (
													<span className="text-[0.65rem] font-semibold tracking-[0.12em] whitespace-nowrap uppercase" style={{ color: "var(--color-primary)" }}>
														Editing
													</span>
												)}
											</span>
										</div>
									);
								})}
							</div>
						</>
					)}
				</DetailSection>

				{item.reviews && item.reviews.length > 0 && (
					<DetailSection title="Reviews" flush>
						<DataTable columns={reviewColumns} data={item.reviews} manualPagination={false} onRefresh={() => fetchItem(true)} refreshing={refreshing} emptyMessage="No reviews yet" />
					</DetailSection>
				)}

				{editing && makerChecker && (
					<DetailSection title="Note for the approver" description="Optional. Shown with your request.">
						<div className="py-3">
							<FormTextarea label="Note" rows={2} value={approverNote} onChange={(e) => setApproverNote(e.target.value)} placeholder="Why are you changing this?" />
						</div>
					</DetailSection>
				)}

				{editing && (
					<SettingsSaveBar hint={makerChecker ? "Changes are sent to an approver and only go live once someone else approves them." : "Stock is only changed if you edit it here."} resetLabel="Cancel" onReset={handleCancelEdit} submitLabel={makerChecker ? "Submit for approval" : "Save changes"} saving={saving || uploadingImages} />
				)}
			</form>

			{/* Status Confirmation Modal */}
			<Modal
				isOpen={statusModalOpen}
				onClose={() => setStatusModalOpen(false)}
				title={`${item?.status === "A" ? "Deactivate" : "Activate"} Product`}
				size="sm"
			>
				<div className="space-y-4">
					<p className="text-sm text-gray-600 dark:text-gray-300">
						Are you sure you want to {item?.status === "A" ? "deactivate" : "activate"}{" "}
						<span className="font-semibold text-on-surface dark:text-white">{item?.name}</span>?
					</p>
					<div className="flex justify-end gap-3">
						<Button
							variant="outlined"
							color="secondary"
							size="sm"
							onClick={() => setStatusModalOpen(false)}
						>
							Cancel
						</Button>
						<Button
							variant="filled"
							color={item?.status === "A" ? "error" : "primary"}
							size="sm"
							loading={toggling}
							onClick={handleToggleStatus}
						>
							{item?.status === "A" ? "Deactivate" : "Activate"}
						</Button>
					</div>
				</div>
			</Modal>

			<RecordActivity type="Item" id={item?.id} />
		</AdminLayout>
	);
};

export default withAdminAuth(ProductDetail);
