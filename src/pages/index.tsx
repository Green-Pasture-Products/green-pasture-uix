import { Leaf, Truck, Shield, Award, Mail, ArrowRight, Sprout, FlaskConical, PackageCheck, Home } from "lucide-react";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

import { useAppDispatch, useAppSelector } from "@/_redux/store";
import AnimatedSection from "@/_UI/AnimatedSection";
import { productsAction } from "@/_redux/actions";
import ProductStack from "@/_components/ProductStack";
import Layout from "@/_components/Layout";
import { CircularTestimonials } from "@/components/ui/circular-testimonials";
import Button from "@/_UI/Button";
import EmptyState from "@/_UI/EmptyState";
import EmptyShelfIllustration from "@/_UI/illustrations/EmptyShelfIllustration";
import BotanicalHero from "@/_components/BotanicalHero";
import Timeline, { TimelineItem } from "@/_UI/Timeline";
import SectionHeading from "@/_UI/SectionHeading";

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

/** ponytail: hard-coded until a reviews endpoint exists. Photos are Unsplash stock. */
const testimonials = [
	{
		quote:
			"I started the immunity blend after a rough harmattan season and I have not had a single cold since. It tastes like something that actually came out of the ground.",
		name: "Amina Bello",
		designation: "Customer since 2023 · Abuja",
		src: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=800&auto=format&fit=crop",
	},
	{
		quote:
			"What sold me was the batch certificate on the label. I could look up the farm and the harvest week. Nobody else in this market shows you that.",
		name: "Chidi Okafor",
		designation: "Nutritionist · Lagos",
		src: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800&auto=format&fit=crop",
	},
	{
		quote:
			"My whole family is on the green smoothie now, children included. It arrives quickly and it tastes fresh, which says a lot about how fast they move it.",
		name: "Ngozi Adeyemi",
		designation: "Repeat customer · Port Harcourt",
		src: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=800&auto=format&fit=crop",
	},
];

const HomePage: React.FC = () => {
	const dispatch = useAppDispatch();
	const { products } = useAppSelector((state) => state.product);
	const featuredProducts = products?.slice(0, 6);
	const [email, setEmail] = useState("");

	useEffect(() => {
		dispatch(productsAction.fetchAllProducts({ activeOnly: true }));
	}, []);

	return (
		<Layout pageTitle={"Home"}>
			<BotanicalHero />

			{/* ── Featured products ────────────────────────────────── */}
			<section className="py-20 md:py-28" style={{ background: "var(--surface-low)" }}>
				<div className="page-wrapper">
					<AnimatedSection>
						<div className="mb-12 flex flex-wrap items-end justify-between gap-6">
							<SectionHeading eyebrow="The range" title="Small catalogue," accent="deliberately." />
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

					<AnimatedSection delay={0.15}>
						{featuredProducts?.length > 0 ? (
							<ProductStack products={featuredProducts} />
						) : (
							<EmptyState
								illustration={<EmptyShelfIllustration className="w-40 h-40" />}
								title="No products yet"
								description="We're stocking up on fresh organic goodness. Check back soon!"
							/>
						)}
					</AnimatedSection>

					{products?.length > 6 && (
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

			{/* ── Testimonials ─────────────────────────────────────── */}
			<section className="py-20 md:py-28" style={{ background: "var(--surface-low)" }}>
				<div className="page-wrapper">
					<AnimatedSection>
						<SectionHeading eyebrow="In their words" title="People who" accent="kept reordering." centered />
					</AnimatedSection>
					<AnimatedSection delay={0.15}>
						<div className="mt-12 flex justify-center">
							<CircularTestimonials
								testimonials={testimonials}
								autoplay
								colors={{
									name: "var(--text-primary)",
									designation: "var(--text-hint)",
									testimony: "var(--text-secondary)",
									arrowBackground: "var(--color-primary)",
									arrowForeground: "#f4f8e8",
									arrowHoverBackground: "#9aca3c",
								}}
								fontSizes={{ name: "26px", designation: "15px", quote: "18px" }}
							/>
						</div>
					</AnimatedSection>
				</div>
			</section>

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

export default HomePage;
