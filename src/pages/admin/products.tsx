import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/router";
import withAdminAuth from "@/_components/withAdminAuth";
import { Plus, Star } from "lucide-react";
import toast from "react-hot-toast";

import { useAppDispatch, useAppSelector } from "@/_redux/store";
import AdminLayout from "@/_components/AdminLayout";
import AddProduct from "@/_components/Modals/AddProduct";
import { DataTable, Column } from "@/_UI/DataTable";
import ActionMenu from "@/_UI/ActionMenu";
import Badge from "@/_UI/Badge";
import Button from "@/_UI/Button";
import Modal from "@/_UI/Modal";
import PageLoader from "@/_UI/PageLoader";
import { Product } from "@/types";
import { productsAction } from "@/_redux/actions";
import { filterAndSortProducts } from "@/_utils";
import { formatCurrency } from "@/_UI/FormatValue";

const VIEW_ICON = (
	<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
);

const DELETE_ICON = (
	<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
);

const AdminProducts: React.FC = () => {
	const router = useRouter();
	const dispatch = useAppDispatch();
	const { products, isFetchingAllProducts } = useAppSelector((state) => state.product);
	const { query, filters } = useAppSelector((state) => state.search);
	const [searchTerm, setSearchTerm] = useState("");
	const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
	const [isDeleting, setIsDeleting] = useState(false);

	useEffect(() => {
		dispatch(productsAction.fetchAllProducts());
	}, []);

	const filteredProducts = products.filter((product: any) => {
  		const term = (query || searchTerm).toLowerCase().trim();
  		if (!term) return true;
  		return (
    		product.name?.toLowerCase().includes(term) ||
    		product.description?.toLowerCase().includes(term) ||
    		product.product?.name?.toLowerCase().includes(term)
  		);
	});

	const handleSearch = useCallback((searchQuery: string) => {
		setSearchTerm(searchQuery);
	}, []);

	const handleDeleteClick = (row: Product) => {
		setDeleteTarget(row);
	};

	const handleDelete = async () => {
		if (!deleteTarget) return;
		setIsDeleting(true);
		try {
			await dispatch(productsAction.deleteItemAsync(deleteTarget.id as string | number)).unwrap();
			toast.success("Product deleted successfully");
			await dispatch(productsAction.fetchAllProducts()).unwrap();
		} catch (error: any) {
			toast.error(error || "Failed to delete product");
		} finally {
			setIsDeleting(false);
			setDeleteTarget(null);
		}
	};

	const columns: Column<Product>[] = [
		{
			key: "name",
			header: "Product",
			maxWidth: "280px",
			truncate: true,
			render: (_value: any, row: any) => (
				<div className="flex items-center gap-3">
					{row.photos?.[0]?.url ? (
						<img
							className="h-10 w-10 rounded-radius-sm object-cover"
							style={{ border: "1px solid var(--border-light)" }}
							src={row.photos[0].url}
							alt={row.name}
						/>
					) : (
						<div
							className="h-10 w-10 rounded-radius-sm flex items-center justify-center text-xs font-bold"
							style={{ background: "var(--surface-medium)", color: "var(--text-hint)" }}
						>
							{row.name?.charAt(0)?.toUpperCase() || "?"}
						</div>
					)}
					<span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
						{row.name}
					</span>
				</div>
			),
		},
		{
			key: "product",
			header: "Category",
			render: (value: any) => (
				<span className="text-sm" style={{ color: "var(--text-secondary)" }}>
					{value?.name || "—"}
				</span>
			),
		},
		{
			key: "price",
			header: "Price",
			render: (value: any) => (
				<span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
					{formatCurrency(value)}
				</span>
			),
		},
		{
			key: "availableQuantity",
			header: "Stock",
			render: (value: any, row: any) => {
				const qty = Number(value ?? row.unit ?? 0);
				return (
					<Badge variant={qty > 0 ? "success" : qty === 0 ? "error" : "warning"} dot>
						{qty > 0 ? `${qty} units` : "Out of Stock"}
					</Badge>
				);
			},
		},
		{
			key: "ratingStats",
			header: "Rating",
			render: (value: any) => {
				const avg = value?.average ?? 0;
				const count = value?.count ?? 0;
				return (
					<div className="flex items-center gap-1.5">
						<Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
						<span className="text-sm" style={{ color: "var(--text-primary)" }}>
							{Number(avg).toFixed(1)}
						</span>
						<span className="text-xs" style={{ color: "var(--text-hint)" }}>({count})</span>
					</div>
				);
			},
		},
		{
			key: "status",
			header: "Status",
			render: (value: any) => (
				<Badge variant={value === "A" ? "success" : "error"} dot>
					{value === "A" ? "Active" : "Inactive"}
				</Badge>
			),
		},
		{
			key: "id",
			header: "",
			width: "50px",
			align: "center" as const,
			render: (_: any, row: any) => (
				<ActionMenu items={[
					{ label: "View", icon: VIEW_ICON, onClick: () => router.push(`/admin/product/${row.id}`) },
					{ label: "Delete", icon: DELETE_ICON, onClick: () => setDeleteTarget(row), variant: "danger" as const },
				]} />
			),
		},
	];

	if (isFetchingAllProducts && !products?.length) {
		return (
			<AdminLayout>
				<PageLoader fullScreen={false} message="Loading products..." />
			</AdminLayout>
		);
	}

	return (
		<AdminLayout>
			<div className="animate-page-enter space-y-6">
				{/* Products Table */}
				<DataTable
					columns={columns}
					data={filteredProducts}
					onSearch={handleSearch}
					searchPlaceholder="Search products..."
					onRowClick={(row) => router.push(`/admin/product/${row.id}`)}
					actions={
						<AddProduct
							title="add product"
							className="inline-flex"
						>
							<Button variant="filled" leftIcon={Plus}>
								Add Product
							</Button>
						</AddProduct>
					}
					emptyMessage="No products found"
				/>

				{/* Delete Confirmation Modal */}
				<Modal
					isOpen={!!deleteTarget}
					onClose={() => setDeleteTarget(null)}
					title="Delete Product"
					size="sm"
				>
					<div className="space-y-4">
						<p className="text-sm text-gray-600 dark:text-gray-300">
							Are you sure you want to delete{" "}
							<span className="font-semibold text-on-surface dark:text-white">{deleteTarget?.name}</span>?
							This action cannot be undone.
						</p>
						<div className="flex justify-end gap-3">
							<Button
								variant="outlined"
								color="secondary"
								size="sm"
								onClick={() => setDeleteTarget(null)}
							>
								Cancel
							</Button>
							<Button
								variant="filled"
								color="error"
								size="sm"
								loading={isDeleting}
								onClick={handleDelete}
							>
								Delete
							</Button>
						</div>
					</div>
				</Modal>
			</div>
		</AdminLayout>
	);
};

export default withAdminAuth(AdminProducts);
