import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import withAdminAuth from "@/_components/withAdminAuth";
import AdminLayout from "@/_components/AdminLayout";
import { BackButton, DetailHeader, DetailSection, DetailRow } from "@/_UI/DetailField";
import Badge from "@/_UI/Badge";
import { DataTable, Column } from "@/_UI/DataTable";
import { formatCurrency, formatNumber } from "@/_UI/FormatValue";
import PageLoader from "@/_UI/PageLoader";
import axiosInstance from "@/_utils/axiosInstance";
import { BackendItem, BackendReview } from "@/types";

const ProductDetail: React.FC = () => {
	const router = useRouter();
	const { id } = router.query;
	const [item, setItem] = useState<BackendItem | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (!router.isReady || !id) return;
		setLoading(true);
		axiosInstance
			.get(`items/${id}`)
			.then((res) => {
				setItem(res.data?.data ?? res.data);
			})
			.catch(() => {
				setItem(null);
			})
			.finally(() => {
				setLoading(false);
			});
	}, [id, router.isReady]);

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
					{value ?? "—"}
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
				<BackButton />

				<DetailHeader
					title={item.name}
					subtitle={item.product?.name ?? "—"}
					metrics={[
						{ label: "Price (\u20A6)", value: formatCurrency(item.price) },
						{ label: "Available Stock", value: formatNumber(available) },
						{ label: "Avg Rating", value: avgRating > 0 ? `${avgRating.toFixed(1)} (${reviewCount})` : "—" },
					]}
				/>

				<DetailSection title="Product Information">
					<DetailRow label="Name" value={item.name} />
					<DetailRow label="Description" value={item.description ?? "—"} />
					<DetailRow label="Category" value={item.product?.name ?? "—"} />
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

				{item.photos && item.photos.length > 0 && (
					<DetailSection title="Images">
						<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 p-5">
							{item.photos.map((photo) => (
								<div
									key={photo.id}
									className="aspect-square rounded-lg overflow-hidden"
									style={{ border: "1px solid var(--border-light)" }}
								>
									<img
										src={photo.url}
										alt={item.name}
										className="w-full h-full object-cover"
									/>
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
