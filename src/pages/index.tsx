import { Leaf, Truck, Shield, Award, Mail, ArrowRight, Sprout, FlaskConical, PackageCheck, Home } from "lucide-react";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

import { useAppDispatch, useAppSelector } from "@/_redux/store";
import AnimatedSection from "@/_UI/AnimatedSection";
import { productsAction } from "@/_redux/actions";
import ProductCard from "@/_components/ProductCard";
import Layout from "@/_components/Layout";
import Testimonials from "@/_components/Testimonials";
import Button from "@/_UI/Button";
import EmptyState from "@/_UI/EmptyState";
import EmptyShelfIllustration from "@/_UI/illustrations/EmptyShelfIllustration";
import BotanicalHero from "@/_components/BotanicalHero";
import Timeline, { TimelineItem } from "@/_UI/Timeline";
import SectionHeading from "@/_UI/SectionHeading";
import { groupByCategory } from "@/_utils/groupByCategory";

const features = [
	{ icon: Leaf, title: "Certified organic", desc: "No synthetic pesticides, no growth agents, no fillers — verified at the farm gate." },
	{ icon: Truck, title: "Picked to dispatch in 48h", desc: "Short chains keep potency high. Nothing sits in a warehouse losing its value." },
	{ icon: Shield, title: "Batch-tested potency", desc: "Every batch is assayed before it ships, and the results travel with the jar." },
	{ icon: Award, title: "Traceable to the row", desc: "Scan any label to see the farm, the harvest week, and the hands that grew it." },
];

/** The supply chain, told as the journey a single root actually takes. */
const journey: TimelineItem[] = [
	{
		label: "Stage 01",
		title: "Sown in Northern Nigerian soil",
		description:
			"We partner with twelve smallholder farms across Kano and Kaduna, chosen for mineral-dense soil and generations of dry-season growing knowledge.",
		icon: Sprout,
		meta: "12 partner farms",
	},
	{
		label: "Stage 02",
		title: "Harvested at peak potency",
		description:
			"Roots and leaves come up on a harvest window measured in days, not weeks — timed to when active compounds actually peak rather than when it suits logistics.",
		icon: Leaf,
	},
	{
		label: "Stage 03",
		title: "Assayed, then pressed",
		description:
			"Each batch is tested for potency and contaminants before processing. Anything that misses the mark never reaches a jar, and the certificate follows the batch.",
		icon: FlaskConical,
		meta: "Batch certificate on every label",
	},
	{
		label: "Stage 04",
		title: "Sealed within 48 hours",
		description:
			"Cold-pressed, sealed and boxed inside two days of harvest, so what reaches you is closer to the field than to a shelf.",
		icon: PackageCheck,
	},
	{
		label: "Stage 05",
		title: "At your door",
		description:
			"Delivered nationwide with the batch record attached — you can trace the jar in your hand back to the row it grew in.",
		icon: Home,
	},
];

/** Max cards per category row before "See all items" takes over. */
const PER_SHELF = 10;

const HomePage: React.FC = () => {
	const dispatch = useAppDispatch();
	const { products, isFetchingAllProducts } = useAppSelector((state) => state.product);
	const shelves = groupByCategory(products);
	const [email, setEmail] = useState("");

	useEffect(() => {
		dispatch(productsAction.fetchAllProducts({ activeOnly: true }));
	}, []);

	return (
		<Layout pageTitle={"Home"}>
			<BotanicalHero />

			{/* ── Catalogue, one shelf per category ────────────────── */}
			<section className="py-14 md:py-24" style={{ background: "var(--surface-low)" }}>
				<div className="page-wrapper">
					<AnimatedSection>
						<div className="mb-8 flex flex-wrap items-end justify-between gap-6 md:mb-12">
							<SectionHeading eyebrow="The range" title="Shop the shelf." />
							<Link
								href="/products"
								className="group inline-flex items-center gap-2 text-sm font-medium"
								style={{ color: "var(--color-primary)" }}
							>
								Browse everything
								<ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
							</Link>
						</div>
					</AnimatedSection>

					{isFetchingAllProducts && !products?.length ? (
						<ShelfSkeleton />
					) : shelves.length > 0 ? (
						<div className="space-y-8 md:space-y-10">
							{shelves.map(([category, items], i) => (
								<AnimatedSection key={category} delay={Math.min(i, 3) * 0.08}>
									<div
										className="overflow-hidden rounded-2xl"
										style={{ background: "var(--surface-paper)", border: "1px solid var(--border-light)" }}
									>
										<div
											className="flex items-center justify-between gap-4 px-4 py-3 sm:px-6"
											style={{ background: "var(--color-primary)" }}
										>
											<h3 className="truncate font-display text-base text-white sm:text-lg" style={{ fontWeight: 600 }}>
												{category}
											</h3>
											<Link
												href={`/products?category=${encodeURIComponent(category)}`}
												className="group inline-flex shrink-0 items-center gap-1.5 text-xs font-medium text-white/90 hover:text-white sm:text-sm"
											>
												See all items
												<ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
											</Link>
										</div>

										{/* 6 cards on mobile, the rest of the shelf from sm up — CSS only,
										    so there is no breakpoint state to hydrate wrong. */}
										<div className="grid grid-cols-2 gap-3 p-3 sm:grid-cols-3 sm:gap-4 sm:p-4 lg:grid-cols-4 xl:grid-cols-5 [&>*:nth-child(n+7)]:hidden sm:[&>*:nth-child(n+7)]:block">
											{items.slice(0, PER_SHELF).map((product) => (
												<ProductCard key={product.id} product={product} />
											))}
										</div>
									</div>
								</AnimatedSection>
							))}
						</div>
					) : (
						<EmptyState
							illustration={<EmptyShelfIllustration className="w-40 h-40" />}
							title="No products yet"
							description="We're stocking up on fresh organic goodness. Check back soon!"
						/>
					)}

					{products?.length > 0 && (
						<AnimatedSection delay={0.25}>
							<div className="mt-10 text-center">
								<Link href="/products">
									<Button variant="filled" size="lg" rightIcon={ArrowRight}>
										View All Products
									</Button>
								</Link>
							</div>
						</AnimatedSection>
					)}
				</div>
			</section>

			{/* ── Why it's different ───────────────────────────────── */}
			<section className="py-20 md:py-28" style={{ background: "var(--background)" }}>
				<div className="page-wrapper">
					<AnimatedSection>
						<div className="grid gap-10 md:grid-cols-2 md:items-end">
							<SectionHeading
								eyebrow="Why Green Pasture"
								title="Potency is a supply-chain problem."
								accent="Most supplements lose it in transit."
							/>
							<p className="text-base leading-relaxed md:pb-2" style={{ color: "var(--text-secondary)" }}>
								A root harvested and left in a warehouse for six weeks is a different product to
								one sealed in two days. We built the chain backwards from that fact — fewer hands,
								shorter distances, and a test result attached to every batch.
							</p>
						</div>
					</AnimatedSection>

					<div className="mt-14 grid grid-cols-1 gap-px overflow-hidden rounded-2xl sm:grid-cols-2 lg:grid-cols-4"
						style={{ background: "var(--border-light)", border: "1px solid var(--border-light)" }}>
						{features.map((feature, index) => {
							const Icon = feature.icon;
							return (
								<motion.div
									key={feature.title}
									initial={{ opacity: 0, y: 20 }}
									whileInView={{ opacity: 1, y: 0 }}
									viewport={{ once: true, margin: "-60px" }}
									transition={{ duration: 0.55, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
									className="group relative p-7 transition-colors duration-300"
									style={{ background: "var(--surface-paper)" }}
								>
									<span
										className="absolute inset-x-0 top-0 h-px origin-left scale-x-0 transition-transform duration-500 group-hover:scale-x-100"
										style={{ background: "linear-gradient(to right,var(--color-primary),#9aca3c)" }}
									/>
									<Icon className="h-6 w-6" style={{ color: "var(--color-primary)" }} strokeWidth={1.5} />
									<h3 className="mt-5 font-display text-lg leading-snug" style={{ color: "var(--text-primary)", fontWeight: 500 }}>
										{feature.title}
									</h3>
									<p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
										{feature.desc}
									</p>
								</motion.div>
							);
						})}
					</div>
				</div>
			</section>

			{/* ── Journey timeline ─────────────────────────────────── */}
			<section className="py-20 md:py-28" style={{ background: "var(--surface-low)" }}>
				<div className="page-wrapper">
					<AnimatedSection>
						<SectionHeading
							eyebrow="Soil to shelf"
							title="Follow a root"
							accent="from the row to your door."
							centered
						/>
					</AnimatedSection>
					<div className="mx-auto mt-16 max-w-4xl">
						<Timeline items={journey} />
					</div>
				</div>
			</section>

			{/* ── Testimonials (real reviews, paged in) ────────────── */}
			<Testimonials featured />

			{/* ── Newsletter ───────────────────────────────────────── */}
			<section className="py-20 md:py-28" style={{ background: "var(--background)" }}>
				<div className="page-wrapper">
					<AnimatedSection>
						<div
							className="relative overflow-hidden rounded-3xl px-8 py-14 text-center md:px-16 md:py-20"
							style={{ background: "linear-gradient(150deg,#0c2b25,#164438 60%,#1f6554)" }}
						>
							<div
								aria-hidden
								className="pointer-events-none absolute -right-16 -top-16 h-72 w-72 rounded-full"
								style={{ background: "radial-gradient(circle,rgba(154,202,60,0.20),transparent 68%)" }}
							/>
							<div className="relative mx-auto max-w-xl">
								<h2 className="font-display text-3xl leading-tight text-[#f4f8e8] md:text-4xl" style={{ fontWeight: 300 }}>
									Harvest notes, <span className="italic" style={{ color: "#b9dd72", fontWeight: 500 }}>monthly</span>
								</h2>
								<p className="mx-auto mt-4 max-w-md text-sm leading-relaxed" style={{ color: "rgba(226,238,206,0.7)" }}>
									What came out of the ground this month, what it's good for, and the occasional
									note from the farms. No filler.
								</p>
								<form
									onSubmit={(e) => e.preventDefault()}
									className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row"
								>
									<div className="relative flex-1">
										<Mail
											className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2"
											style={{ color: "rgba(12,43,37,0.45)" }}
										/>
										<input
											type="email"
											placeholder="you@example.com"
											value={email}
											onChange={(e) => setEmail(e.target.value)}
											className="w-full rounded-full border border-transparent py-3 pl-11 pr-4 text-sm outline-none transition focus:ring-2"
											style={{ background: "#f4f8e8", color: "#0c2b25" }}
										/>
									</div>
									<button
										type="submit"
										className="shrink-0 rounded-full px-7 py-3 text-sm font-semibold transition-all duration-300 hover:shadow-[0_0_30px_rgba(154,202,60,0.5)]"
										style={{ background: "#9aca3c", color: "#0c2b25" }}
									>
										Subscribe
									</button>
								</form>
							</div>
						</div>
					</AnimatedSection>
				</div>
			</section>
		</Layout>
	);
};

/** Placeholder shelf so the first paint isn't the "No products yet" empty state. */
const ShelfSkeleton: React.FC = () => (
	<div className="overflow-hidden rounded-2xl" style={{ background: "var(--surface-paper)", border: "1px solid var(--border-light)" }}>
		<div className="h-12" style={{ background: "var(--color-primary)", opacity: 0.55 }} />
		<div className="grid grid-cols-2 gap-3 p-3 sm:grid-cols-3 sm:gap-4 sm:p-4 lg:grid-cols-4 xl:grid-cols-5">
			{[...Array(5)].map((_, i) => (
				<div key={i} className="animate-pulse rounded-2xl" style={{ border: "1px solid var(--border-light)" }}>
					<div className="aspect-square rounded-t-2xl" style={{ background: "var(--surface-medium)" }} />
					<div className="space-y-2.5 p-4">
						<div className="h-4 w-3/4 rounded-full" style={{ background: "var(--surface-medium)" }} />
						<div className="h-3 w-1/2 rounded-full" style={{ background: "var(--surface-medium)" }} />
						<div className="h-8 rounded-full" style={{ background: "var(--surface-medium)" }} />
					</div>
				</div>
			))}
		</div>
	</div>
);

export default HomePage;
