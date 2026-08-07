"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check, ShoppingCart } from "lucide-react";
import toast from "react-hot-toast";

import { CardStack, CardStackItem } from "@/components/ui/card-stack";
import { useAppDispatch, useAppSelector } from "@/_redux/store";
import { addToCart, removeFromCart } from "@/_redux/reducers/cart.reducer";
import { useCurrency } from "@/_hooks/useCurrency";
import { Product } from "@/types";

/** Card geometry, derived from the stage width so the fan never overflows. */
function useCardSize() {
	const ref = useRef<HTMLDivElement>(null);
	const [width, setWidth] = useState(520);

	useEffect(() => {
		const measure = () => {
			const w = ref.current?.offsetWidth ?? 0;
			// The fan spills sideways, so a card can only claim part of the stage.
			setWidth(Math.round(Math.max(280, Math.min(540, w * 0.62))));
		};
		measure();
		window.addEventListener("resize", measure);
		return () => window.removeEventListener("resize", measure);
	}, []);

	return { ref, width, height: Math.round(width * 0.66) };
}

type ProductStackItem = CardStackItem & { product: Product };

const ProductStack: React.FC<{ products: Product[] }> = ({ products }) => {
	const { ref, width, height } = useCardSize();

	const items: ProductStackItem[] = products.map((product) => {
		const p = product as any;
		return {
			id: product.id,
			title: product.name,
			description: product.description,
			imageSrc: p.photos?.[0]?.url || p.image || "",
			href: `/product/${product.id}`,
			tag: p.category?.name,
			product,
		};
	});

	return (
		<div ref={ref}>
			<CardStack
				items={items}
				cardWidth={width}
				cardHeight={height}
				overlap={0.55}
				spreadDeg={36}
				autoAdvance
				intervalMs={4500}
				pauseOnHover
				maxVisible={5}
				renderCard={(item, { active }) => <ProductFanCard item={item} active={active} />}
			/>
		</div>
	);
};

const ProductFanCard: React.FC<{ item: ProductStackItem; active: boolean }> = ({ item, active }) => {
	const dispatch = useAppDispatch();
	const { formatPrice } = useCurrency();
	const cartItems = useAppSelector((state) => state.cart.items);
	const isInCart = cartItems.some((i) => i.id === item.product.id);

	const p = item.product as any;
	const inStock = p.unit > 0 || p.inStock;
	const price = Number(p.price || 0);

	const toggleCart = (e: React.MouseEvent) => {
		e.stopPropagation();
		if (isInCart) {
			dispatch(removeFromCart(item.product.id));
			toast.error(`${item.title} removed from cart`);
		} else {
			dispatch(addToCart(item.product));
			toast.success(`${item.title} added to cart`);
		}
	};

	return (
		<div
			className="flex h-full w-full overflow-hidden"
			style={{ background: "var(--surface-paper)", border: "1px solid var(--border-light)" }}
		>
			{/* Product shot */}
			<div className="relative w-[42%] shrink-0" style={{ background: "var(--surface-medium)" }}>
				{item.imageSrc ? (
					<Image
						src={item.imageSrc}
						alt={item.title}
						fill
						sizes="240px"
						draggable={false}
						className="object-cover"
					/>
				) : (
					<div className="flex h-full w-full items-center justify-center font-display text-4xl" style={{ color: "var(--text-disabled)" }}>
						{item.title?.charAt(0)?.toUpperCase()}
					</div>
				)}
				{!inStock && (
					<span className="absolute bottom-3 left-3 rounded-full bg-black/70 px-2.5 py-1 text-[0.6rem] font-semibold text-white">
						Out of stock
					</span>
				)}
			</div>

			{/* Detail */}
			<div className="flex min-w-0 flex-1 flex-col justify-center p-5 sm:p-6">
				{item.tag && (
					<span className="mb-2 text-[0.6rem] font-medium uppercase tracking-[0.16em]" style={{ color: "var(--color-primary)" }}>
						{item.tag}
					</span>
				)}

				<Link href={item.href!} onClick={(e) => !active && e.preventDefault()} className="min-w-0">
					<h3 className="font-display text-lg leading-snug line-clamp-2 sm:text-xl" style={{ color: "var(--text-primary)", fontWeight: 500 }}>
						{item.title}
					</h3>
				</Link>

				<p className="mt-2 line-clamp-2 text-xs leading-relaxed" style={{ color: "var(--text-hint)" }}>
					{item.description}
				</p>

				<div className="mt-4 font-display text-2xl tabular-nums" style={{ color: "var(--color-primary)", fontWeight: 600 }}>
					{formatPrice(price)}
				</div>

				{/* Actions only on the card in focus — the fanned ones are pure surface */}
				<div
					className="mt-4 flex items-center gap-2 transition-opacity duration-300"
					style={{ opacity: active ? 1 : 0, pointerEvents: active ? "auto" : "none" }}
				>
					<button
						onClick={toggleCart}
						disabled={!inStock}
						className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-40"
						style={{ background: isInCart ? "rgba(154,202,60,0.16)" : "#9aca3c", color: isInCart ? "var(--color-primary)" : "#0c2b25" }}
					>
						{isInCart ? <Check className="h-3.5 w-3.5" /> : <ShoppingCart className="h-3.5 w-3.5" />}
						{isInCart ? "In cart" : inStock ? "Add to cart" : "Out of stock"}
					</button>
					<Link
						href={item.href!}
						onClick={(e) => e.stopPropagation()}
						className="group inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-medium"
						style={{ color: "var(--text-secondary)" }}
					>
						Details
						<ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
					</Link>
				</div>
			</div>
		</div>
	);
};

export default ProductStack;
