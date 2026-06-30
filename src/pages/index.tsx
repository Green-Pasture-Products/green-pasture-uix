import { Leaf, Truck, Shield, Award, Mail, ArrowRight } from "lucide-react";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

import { useAppDispatch, useAppSelector } from "@/_redux/store";
import AnimatedSection from "@/_UI/AnimatedSection";
import { productsAction } from "@/_redux/actions";
import Products from "@/_components/Products";
import Layout from "@/_components/Layout";
import Button from "@/_UI/Button";
import Card from "@/_UI/Card";
import EmptyState from "@/_UI/EmptyState";
import EmptyShelfIllustration from "@/_UI/illustrations/EmptyShelfIllustration";

const features = [
	{
		icon: Leaf,
		title: "100% Organic",
		desc: "Certified organic products with no harmful chemicals or pesticides.",
	},
	{
		icon: Truck,
		title: "Fast Delivery",
		desc: "Fresh products delivered to your door within 24-48 hours.",
	},
	{
		icon: Shield,
		title: "Quality Guarantee",
		desc: "100% satisfaction guaranteed or your money back.",
	},
	{
		icon: Award,
		title: "Premium Quality",
		desc: "Hand-picked products from trusted organic farms.",
	},
];

const heroWords = ["Your", "Source", "for", "Natural", "Health", "and", "Wellness"];

const HomePage: React.FC = () => {
	const dispatch = useAppDispatch();
	const { products } = useAppSelector((state) => state.product);
	const featuredProducts = products?.slice(0, 4);
	const [email, setEmail] = useState("");

	useEffect(() => {
		dispatch(productsAction.fetchAllProducts({ activeOnly: true }));
	}, []);

	return (
		<Layout pageTitle={"Home"}>
			{/* Hero Section */}
			<section className="relative min-h-[80vh] flex items-center py-16 md:py-24 bg-gradient-to-br from-primary-900 via-primary-700 to-primary-600 dark:from-primary-900 dark:via-[#0e0e1a] dark:to-[#0e0e1a] overflow-hidden">
				{/* Decorative blurred shapes */}
				<div className="absolute top-20 right-10 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
				<div className="absolute bottom-10 left-10 w-96 h-96 bg-lime-400/15 rounded-full blur-3xl" />

				<div className="page-wrapper relative z-10">
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
						<div className="order-2 lg:order-1">
							<motion.p
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.5 }}
								className="text-lime-300 dark:text-lime-300 uppercase tracking-widest text-sm font-medium mb-4"
							>
								Welcome to Green Pastures
							</motion.p>

							<h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
								{heroWords.map((word, i) => (
									<motion.span
										key={i}
										initial={{ opacity: 0, y: 30 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{ duration: 0.5, delay: 0.1 + i * 0.08 }}
										className="inline-block mr-3"
									>
										{word}
									</motion.span>
								))}
							</h1>

							<motion.p
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.5, delay: 0.7 }}
								className="text-lg md:text-xl text-primary-100 dark:text-white/70 mb-8 max-w-lg leading-relaxed"
							>
								Elevating immunity and fertility with the power of nature.
								Discover premium organic supplements crafted with care.
							</motion.p>

							<motion.div
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.5, delay: 0.9 }}
								className="flex flex-wrap gap-4"
							>
								<Link href="/products">
									<button
										className="group inline-flex items-center gap-2 px-6 py-3 text-base font-medium rounded-radius-md bg-white text-primary-700 hover:bg-gray-100 active:bg-gray-200 shadow-elevation-2 transition-all duration-200 hover:scale-[1.02] active:scale-[0.97] cursor-pointer"
									>
										Shop Now
										<ArrowRight className="h-5 w-5 text-lime-600 transition-transform duration-200 group-hover:translate-x-1" />
									</button>
								</Link>
								<Link href="/about">
									<button
										className="inline-flex items-center gap-2 px-6 py-3 text-base font-medium rounded-radius-md border border-white/50 text-white hover:bg-white/10 transition-all duration-200 hover:scale-[1.02] active:scale-[0.97] cursor-pointer"
									>
										Learn More
									</button>
								</Link>
							</motion.div>
						</div>

						<motion.div
							initial={{ opacity: 0, scale: 0.9 }}
							animate={{ opacity: 1, scale: 1 }}
							transition={{ duration: 0.8, delay: 0.3 }}
							className="order-1 lg:order-2 flex justify-center"
						>
							<div className="relative w-full max-w-md animate-float">
								<div className="aspect-square relative">
									<Image
										height={500}
										width={500}
										priority
										quality={100}
										src="/images/Green_vegggies_1.jpeg"
										alt="Fresh green vegetables"
										className="w-full h-full object-cover rounded-radius-xl shadow-elevation-4"
									/>
								</div>
							</div>
						</motion.div>
					</div>
				</div>
			</section>

			{/* Features Section */}
			<section className="py-16 md:py-24 bg-white dark:bg-[#0e0e1a]">
				<div className="page-wrapper">
					<AnimatedSection>
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
							{features.map((feature, index) => {
								const Icon = feature.icon;
								return (
									<Card
										key={index}
										elevation={1}
										hoverable
										padding="lg"
										className="text-center animate-card-enter"
									>
										<div className="bg-lime-100 dark:bg-lime-500/10 rounded-radius-lg p-4 w-16 h-16 flex items-center justify-center mx-auto mb-4">
											<Icon className="h-8 w-8 text-primary-700 dark:text-lime-400" />
										</div>
										<h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white/90">
											{feature.title}
										</h3>
										<p className="text-gray-600 dark:text-white/50 text-sm leading-relaxed">
											{feature.desc}
										</p>
									</Card>
								);
							})}
						</div>
					</AnimatedSection>
				</div>
			</section>

			{/* Featured Products */}
			<section className="py-16 md:py-24 bg-mint dark:bg-white/[0.02]">
				<div className="page-wrapper">
					<AnimatedSection>
						<div className="text-center mb-10 lg:mb-14">
							<p className="text-lime-600 dark:text-lime-400 uppercase tracking-widest text-xs font-semibold mb-3">
								OUR PRODUCTS
							</p>
							<h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white/90 mb-4">
								Featured Products
							</h2>
							<p className="text-gray-600 dark:text-white/50 max-w-2xl mx-auto">
								Discover our most popular organic products, carefully
								selected for their exceptional quality and nutritional
								value.
							</p>
						</div>
					</AnimatedSection>

					<AnimatedSection delay={0.2}>
						{featuredProducts?.length > 0 ? (
							<Products products={featuredProducts} />
						) : (
							<EmptyState
								illustration={<EmptyShelfIllustration className="w-40 h-40" />}
								title="No products yet"
								description="We're stocking up on fresh organic goodness. Check back soon!"
							/>
						)}
					</AnimatedSection>

					{products?.length > 4 && (
						<AnimatedSection delay={0.3}>
							<div className="text-center mt-8">
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

			{/* Newsletter Section */}
			<section className="py-16 md:py-24 bg-white dark:bg-[#0e0e1a]">
				<div className="page-wrapper">
					<AnimatedSection>
						<div className="bg-primary-800 dark:bg-primary-900 text-center max-w-3xl mx-auto rounded-radius-xl p-8">
							<h2 className="text-3xl font-bold mb-4 text-white">
								Stay Updated
							</h2>
							<p className="text-primary-100 dark:text-primary-200 mb-8 max-w-lg mx-auto">
								Subscribe to our newsletter for the latest organic products,
								health tips, and exclusive offers.
							</p>
							<div className="flex flex-col sm:flex-row max-w-md mx-auto gap-3">
								<div className="relative flex-1">
									<Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
									<input
										type="email"
										placeholder="Enter your email"
										value={email}
										onChange={(e) => setEmail(e.target.value)}
										className="w-full rounded-radius-md bg-white text-gray-900 placeholder-gray-400 pl-10 pr-3 py-2.5 text-sm border border-transparent outline-none focus:ring-2 focus:ring-lime-400/60 transition"
									/>
								</div>
								<button className="rounded-radius-md bg-white text-primary-700 font-medium px-5 py-2.5 text-sm hover:bg-primary-50 hover:shadow-[0_0_12px_rgba(154,202,60,0.5)] active:bg-gray-200 shrink-0 transition-all cursor-pointer">
									Subscribe
								</button>
							</div>
						</div>
					</AnimatedSection>
				</div>
			</section>
		</Layout>
	);
};

export default HomePage;
