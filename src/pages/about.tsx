import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Leaf, Heart, Shield, ArrowRight, Handshake, Map, Microscope, Users, Sprout } from "lucide-react";

import Layout from "@/_components/Layout";
import AnimatedSection from "@/_UI/AnimatedSection";
import SectionHeading from "@/_UI/SectionHeading";
import Timeline, { TimelineItem } from "@/_UI/Timeline";

const values = [
	{
		icon: Leaf,
		title: "Sustainability",
		desc: "We source exclusively from farms practising regenerative agriculture — rotation, cover cropping, and no synthetic inputs, so the soil is richer each season rather than poorer.",
	},
	{
		icon: Heart,
		title: "Wellness",
		desc: "Every product supports immunity or reproductive health through whole-plant preparations, not isolated compounds reassembled in a lab.",
	},
	{
		icon: Shield,
		title: "Integrity",
		desc: "Full transparency on sourcing, ingredients and processing. If a batch misses its potency threshold, it does not ship — and we say so.",
	},
];

const story: TimelineItem[] = [
	{
		label: "2019",
		title: "A question at a market stall",
		description:
			"Our founders kept meeting the same problem: potent Nigerian botanicals were being sold with no provenance, no dosage guidance, and no way to know what was actually in the bag.",
		icon: Map,
	},
	{
		label: "2020",
		title: "First three farms",
		description:
			"We partnered with three smallholder families in Kano, agreeing fixed prices above market rate in exchange for organic practice and harvest-window discipline.",
		icon: Handshake,
		meta: "Fixed pricing above market rate",
	},
	{
		label: "2022",
		title: "Our own assay process",
		description:
			"Rather than trust supplier claims, we began testing every batch for potency and contaminants — and publishing the certificate alongside the product.",
		icon: Microscope,
	},
	{
		label: "2024",
		title: "Twelve farms, one standard",
		description:
			"The network grew to twelve partner farms across Kano and Kaduna, all held to the same harvest, handling and testing standard regardless of size.",
		icon: Leaf,
		meta: "12 farms across 2 states",
	},
	{
		label: "Today",
		title: "Thousands of health journeys",
		description:
			"Green Pasture now serves customers nationwide seeking natural support for immunity and fertility — with the batch record still attached to every jar.",
		icon: Users,
	},
];

const About = () => {
	return (
		<Layout pageTitle="About">
			{/* ── Editorial hero ───────────────────────────────────── */}
			<section className="overflow-hidden py-8 sm:py-12 lg:py-16" style={{ background: "var(--surface-low)" }}>
				<div className="page-wrapper grid items-center gap-8 lg:grid-cols-[0.92fr_1.08fr] lg:gap-14">
					<div className="order-2 py-2 sm:py-4 lg:order-1 lg:py-10">
						<motion.div
							initial={{ opacity: 0, y: 14 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.55 }}
							className="mb-5 inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.16em]"
							style={{ background: "rgba(154,202,60,0.14)", color: "var(--color-primary)" }}
						>
							<Sprout size={15} strokeWidth={1.8} />
							Rooted in Nigerian soil
						</motion.div>
						<motion.h1
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.7, delay: 0.06, ease: [0.22, 1, 0.36, 1] }}
							className="max-w-xl font-display text-[2.65rem] leading-[1.02] tracking-[-0.035em] sm:text-5xl lg:text-[3.7rem]"
							style={{ color: "var(--text-primary)", fontWeight: 300 }}
						>
							We did not invent these remedies.
							<span className="mt-1 block italic" style={{ color: "var(--color-primary)", fontWeight: 500 }}>
								We made them traceable.
							</span>
						</motion.h1>
						<motion.p
							initial={{ opacity: 0, y: 16 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.65, delay: 0.16 }}
							className="mt-6 max-w-lg text-base leading-relaxed sm:text-lg"
							style={{ color: "var(--text-secondary)" }}
						>
							Green Pasture Organics brings generations of Nigerian growing knowledge together
							with thoughtful testing and clear provenance — from the field to the jar.
						</motion.p>
						<motion.div
							initial={{ opacity: 0, y: 14 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6, delay: 0.24 }}
							className="mt-7 flex flex-wrap items-center gap-3"
						>
							<Link
								href="#our-story"
								className="group inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition-transform hover:-translate-y-0.5"
								style={{ background: "var(--color-primary)", color: "white" }}
							>
								Meet our story <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
							</Link>
							<Link
								href="/products"
								className="rounded-full px-5 py-3 text-sm font-medium transition-colors hover:bg-white/60"
								style={{ color: "var(--text-primary)", border: "1px solid var(--border-medium)" }}
							>
								Browse our range
							</Link>
						</motion.div>
						<motion.dl
							initial={{ opacity: 0, y: 12 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6, delay: 0.32 }}
							className="mt-9 grid max-w-md grid-cols-3 gap-4 border-t pt-5 sm:gap-6"
							style={{ borderColor: "var(--border-light)" }}
						>
							{[
								{ n: "12", l: "Partner farms" },
								{ n: "2", l: "States sourced" },
								{ n: "2019", l: "Growing since" },
							].map((stat) => (
								<div key={stat.l}>
									<dt className="font-display text-2xl tabular-nums sm:text-3xl" style={{ color: "var(--color-primary)", fontWeight: 500 }}>{stat.n}</dt>
									<dd className="mt-1 text-[0.62rem] font-medium uppercase tracking-[0.1em] sm:text-[0.68rem]" style={{ color: "var(--text-hint)" }}>{stat.l}</dd>
								</div>
							))}
						</motion.dl>
					</div>

					<motion.div
						initial={{ opacity: 0, scale: 0.985 }}
						animate={{ opacity: 1, scale: 1 }}
						transition={{ duration: 0.8, delay: 0.08 }}
						className="relative order-1 h-[260px] overflow-hidden rounded-[1.5rem] sm:h-[380px] sm:rounded-[2rem] lg:order-2 lg:h-[560px]"
						style={{ background: "var(--surface-medium)" }}
					>
						<Image
							src="/images/about_banner.png"
							alt="Green Pasture products gathered in a basket beside a sunlit field"
							fill
							priority
							quality={95}
							sizes="(max-width: 1024px) 100vw, 56vw"
							className="object-cover object-[72%_center]"
						/>
						<div className="absolute bottom-4 left-4 rounded-full border px-4 py-2 text-xs font-medium shadow-sm backdrop-blur-sm sm:bottom-6 sm:left-6 sm:px-5 sm:py-2.5" style={{ background: "rgba(250,248,239,0.9)", borderColor: "rgba(255,255,255,0.7)", color: "#284637" }}>
							Grown with care. Traced with honesty.
						</div>
					</motion.div>
				</div>
			</section>

			{/* ── Values ───────────────────────────────────────────── */}
			<section className="py-20 md:py-28" style={{ background: "var(--surface-low)" }}>
				<div className="page-wrapper">
					<AnimatedSection>
						<SectionHeading eyebrow="Our values" title="Three things we will not" accent="trade away." />
					</AnimatedSection>

					<div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
						{values.map((value, index) => {
							const Icon = value.icon;
							return (
								<motion.div
									key={value.title}
									initial={{ opacity: 0, y: 26 }}
									whileInView={{ opacity: 1, y: 0 }}
									viewport={{ once: true, margin: "-60px" }}
									transition={{ duration: 0.6, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
									className="group relative overflow-hidden rounded-2xl p-8"
									style={{ background: "var(--surface-paper)", border: "1px solid var(--border-light)" }}
								>
									<span
										aria-hidden
										className="absolute -right-8 -top-8 h-28 w-28 rounded-full opacity-0 transition-opacity duration-500 group-hover:opacity-100"
										style={{ background: "radial-gradient(circle,rgba(154,202,60,0.18),transparent 70%)" }}
									/>
									<span
										className="relative flex h-12 w-12 items-center justify-center rounded-xl"
										style={{ background: "rgba(154,202,60,0.12)" }}
									>
										<Icon className="h-5 w-5" style={{ color: "var(--color-primary)" }} strokeWidth={1.6} />
									</span>
									<h3
										className="relative mt-6 font-display text-2xl"
										style={{ color: "var(--text-primary)", fontWeight: 500 }}
									>
										{value.title}
									</h3>
									<p className="relative mt-3 text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
										{value.desc}
									</p>
								</motion.div>
							);
						})}
					</div>
				</div>
			</section>

			{/* ── Story timeline ───────────────────────────────────── */}
			<section id="our-story" className="scroll-mt-24 py-20 md:py-28" style={{ background: "var(--background)" }}>
				<div className="page-wrapper">
					<AnimatedSection>
						<SectionHeading eyebrow="Our story" title="How a market-stall question" accent="became a supply chain." centered />
					</AnimatedSection>
					<div className="mx-auto mt-16 max-w-4xl">
						<Timeline items={story} />
					</div>
				</div>
			</section>

			{/* ── Close ────────────────────────────────────────────── */}
			<section className="pb-24" style={{ background: "var(--background)" }}>
				<div className="page-wrapper">
					<AnimatedSection>
						<div
							className="relative overflow-hidden rounded-3xl px-8 py-14 text-center md:px-16"
							style={{ background: "linear-gradient(150deg,#0c2b25,#164438 60%,#1f6554)" }}
						>
							<h2 className="font-display text-3xl leading-tight text-[#f4f8e8] md:text-4xl" style={{ fontWeight: 300 }}>
								Come see what's <span className="italic" style={{ color: "#b9dd72", fontWeight: 500 }}>in season</span>
							</h2>
							<div className="mt-8 flex flex-wrap justify-center gap-3">
								<Link
									href="/products"
									className="group inline-flex items-center gap-2.5 rounded-full px-7 py-3.5 text-sm font-semibold transition-all duration-300 hover:shadow-[0_0_34px_rgba(154,202,60,0.45)]"
									style={{ background: "#9aca3c", color: "#0c2b25" }}
								>
									Browse the range
									<ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
								</Link>
								<Link
									href="/contact"
									className="rounded-full px-7 py-3.5 text-sm font-medium transition-colors duration-300"
									style={{ border: "1px solid rgba(226,238,206,0.28)", color: "rgba(226,238,206,0.9)" }}
								>
									Talk to us
								</Link>
							</div>
						</div>
					</AnimatedSection>
				</div>
			</section>
		</Layout>
	);
};

export default About;
