import React from "react";
import { SkeletonBox } from "@/_UI/Skeleton";
import { CartItemSkeleton } from "./CartItemSkeleton";

/**
 * Page-shaped placeholders for the customer screens. Each mirrors the real page's wrapper and grid, so the layout
 * doesn't jump when the data arrives. Wrap in <Layout> at the call site.
 */

const panel = "rounded-xl p-5 space-y-3";
const panelStyle = { background: "var(--surface-paper)", border: "1px solid var(--border-light)" };

const Panel: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => (
	<div className={`${panel} ${className}`} style={panelStyle}>
		{children}
	</div>
);

const Line: React.FC<{ w?: string; h?: string; className?: string }> = ({ w = "100%", h = "14px", className = "" }) => <SkeletonBox width={w} height={h} className={className} />;

/** A product card, as on the products grid and wishlist. */
export const ProductCardSkeleton: React.FC = () => (
	<div className="rounded-xl overflow-hidden" style={panelStyle}>
		<SkeletonBox className="aspect-square w-full !rounded-none" />
		<div className="p-3 space-y-2">
			<Line w="75%" />
			<Line w="40%" />
		</div>
	</div>
);

export const ProductDetailSkeleton: React.FC = () => (
	<div className="container page-wrapper mx-auto px-4 py-8" aria-busy="true" aria-label="Loading product">
		<Line w="220px" h="14px" className="mb-6" />
		<div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-16">
			<div className="space-y-4">
				<SkeletonBox className="aspect-square w-full !rounded-xl" />
				<div className="flex gap-3">
					{[0, 1, 2, 3].map((i) => (
						<SkeletonBox key={i} className="size-16 !rounded-lg" />
					))}
				</div>
			</div>
			<div className="space-y-5">
				<Line w="30%" h="12px" />
				<Line w="80%" h="32px" />
				<Line w="35%" h="28px" />
				<div className="space-y-2 pt-2">
					<Line />
					<Line />
					<Line w="70%" />
				</div>
				<div className="flex gap-3 pt-4">
					<Line w="120px" h="44px" />
					<Line w="220px" h="44px" />
				</div>
			</div>
		</div>
	</div>
);

export const CartSkeleton: React.FC = () => (
	<div className="container page-wrapper mx-auto px-4 py-8" aria-busy="true" aria-label="Loading your cart">
		<Line w="180px" h="30px" className="mb-8" />
		<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
			<div className="lg:col-span-2 rounded-xl overflow-hidden" style={panelStyle}>
				{[0, 1, 2].map((i) => (
					<CartItemSkeleton key={i} />
				))}
			</div>
			<Panel className="h-fit">
				<Line w="50%" h="20px" />
				<Line />
				<Line />
				<Line w="60%" />
				<Line h="44px" className="mt-4" />
			</Panel>
		</div>
	</div>
);

export const WishlistSkeleton: React.FC = () => (
	<div className="container page-wrapper mx-auto px-4 py-8" aria-busy="true" aria-label="Loading your wishlist">
		<div className="flex items-center justify-between mb-8">
			<Line w="200px" h="30px" />
			<Line w="140px" h="40px" />
		</div>
		<div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
			{Array.from({ length: 8 }).map((_, i) => (
				<ProductCardSkeleton key={i} />
			))}
		</div>
	</div>
);

export const OrdersListSkeleton: React.FC = () => (
	<div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8" aria-busy="true" aria-label="Loading your orders">
		<Line w="160px" h="28px" className="mb-2" />
		<Line w="260px" h="14px" className="mb-6" />
		<Line h="40px" className="mb-4" />
		<Panel className="!p-0 divide-y" >
			{Array.from({ length: 6 }).map((_, i) => (
				<div key={i} className="flex items-center justify-between gap-4 p-4">
					<div className="space-y-2 flex-1">
						<Line w="45%" />
						<Line w="25%" h="12px" />
					</div>
					<Line w="70px" h="22px" />
					<Line w="80px" />
				</div>
			))}
		</Panel>
	</div>
);

/** Order detail, order confirmation and payment instructions share this shape: a header, then stacked panels. */
export const OrderDetailSkeleton: React.FC<{ width?: string }> = ({ width = "max-w-4xl" }) => (
	<div className={`${width} mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-5`} aria-busy="true" aria-label="Loading order">
		<Line w="90px" h="16px" />
		<div className="flex items-center justify-between">
			<div className="space-y-2">
				<Line w="240px" h="26px" />
				<Line w="140px" h="12px" />
			</div>
			<Line w="90px" h="26px" />
		</div>
		<Panel>
			<Line w="30%" h="18px" />
			{[0, 1, 2].map((i) => (
				<div key={i} className="flex items-center gap-4 pt-2">
					<SkeletonBox className="size-14 !rounded-lg" />
					<div className="flex-1 space-y-2">
						<Line w="60%" />
						<Line w="30%" h="12px" />
					</div>
					<Line w="70px" />
				</div>
			))}
		</Panel>
		<Panel>
			<Line w="25%" h="18px" />
			<Line />
			<Line w="80%" />
			<Line w="55%" />
		</Panel>
	</div>
);

export const ProfileSkeleton: React.FC = () => (
	<div className="container page-wrapper mx-auto px-4 py-8 max-w-3xl" aria-busy="true" aria-label="Loading profile">
		<div className="flex items-center gap-4 mb-8">
			<SkeletonBox className="size-16 !rounded-full" />
			<div className="space-y-2">
				<Line w="180px" h="22px" />
				<Line w="220px" h="12px" />
			</div>
		</div>
		<Panel className="!p-6 !space-y-5">
			<Line w="35%" h="18px" />
			<div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
				{[0, 1, 2, 3].map((i) => (
					<div key={i} className="space-y-2">
						<Line w="30%" h="12px" />
						<Line h="40px" />
					</div>
				))}
			</div>
		</Panel>
	</div>
);
