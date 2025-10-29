import { Leaf, Truck, Shield, Award } from "lucide-react";
import React, { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

import { useAppDispatch, useAppSelector } from "@/_redux/store";
// import { fetchAllProducts } from "@/_redux/actions";
import Products from "@/_components/Products";
import Layout from "@/_components/Layout";
import { logger } from "@/_utils";
import { mockProducts } from "@/_redux/mockData";

const featuredSection = [
	{
		icon: <Leaf className="h-8 w-8 text-green-600" />,
		title: "100% Organic",
		desc: "Certified organic products with no harmful chemicals or pesticides.",
	},
	{
		icon: <Truck className="h-8 w-8 text-green-600" />,
		title: "Fast Delivery",
		desc: "Fresh products delivered to your door within 24-48 hours.",
	},
	{
		icon: <Shield className="h-8 w-8 text-green-600" />,
		title: "Quality Guarantee",
		desc: "100% satisfaction guaranteed or your money back.",
	},
	{
		icon: <Award className="h-8 w-8 text-green-600" />,
		title: "Premium Quality",
		desc: "Hand-picked products from trusted organic farms.",
	},
];

const HomePage: React.FC = () => {
	// const dispatch = useAppDispatch();
	// const { products } = useAppSelector((state) => state.product);
	const featuredProducts = mockProducts?.slice(0, 4);

	// logger.log({ fetchAllProducts });

	useEffect(() => {
		// dispatch(fetchAllProducts());
	}, []);

	return (
		<Layout pageTitle={"Home"}>
			<section id="welcome" className="bg-green-50 pb-12">
				<div className="container page-wrapper mx-auto px-4">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
						{/* <!-- Left Column --> */}
						<div className="order-2 md:order-1 flex items-center">
							<div className="flex w-full aspect-square items-center">
								<div className="w-1/2 h-full overflow-hidden lg:p-3 pr-2 2xl:mr-3">
									<Image
										height={100}
										width={100}
										priority
										quality={100}
										src="/images/Green_vegggies_1.jpeg"
										alt="Fresh green vegetables"
										className="w-full h-full object-cover rounded-l-xl shadow-lg"
									/>
								</div>
								<div className="w-1/2 h-full overflow-hidden lg:p-3 pl-2 mt-16 md:mt-24">
									<Image
										height={100}
										width={100}
										src="/images/strawberries-on-plant.jpg"
										alt="Strawberries on the plant"
										className="w-full h-full object-cover rounded-r-xl shadow-lg"
									/>
								</div>
							</div>
						</div>

						{/* <!-- Right Column --> */}
						<div className="order-1 md:order-2 flex flex-col justify-center h-full lg:pr-5 pt-8 md:pt-12 lg:pt-0">
							<p className="uppercase font-medium text-[#80b500] text-[0.8rem]">
								Welcome to Green Pastures
							</p>

							<h1
								id="welcome-heading"
								className="font-bold pb-2 md:pb-3 pt-2 text-left uppercase text-xl md:text-3xl lg:text-4xl md:leading-11 tracking-[-0.02rem]"
							>
								Your Source for Natural Health and Wellness
							</h1>

							<i className="italic md:mb-2 py-1 pl-3 md:pl-5 text-sm md:text-md border-l-2 border-[#80b500]">
								Elevating Immunity and Fertility with the Power of
								Nature
							</i>

							<p className="pt-4 lg:pe-10 text-sm md:text-md text-gray-700 leading-relaxed">
								At Green Pastures, we believe in nurturing your body
								from the inside out. Our organic supplements are crafted
								with care to naturally support a strong immune system
								and enhance fertility for both men and women. Discover
								the power of fruits, vegetables, and herbs to support
								your health journey.
							</p>
						</div>
					</div>
				</div>
			</section>

			{/* Hero Section */}
			<section className="relative bg-gradient-to-r from-green-600 to-green-700 text-white py-12 md:py-24">
				<div className="container page-wrapper mx-auto px-4">
					<div className="max-w-3xl">
						<h1 className="text-3xl md:text-5xl font-bold mb-6">
							Fresh Organic Products for a Healthier Life
						</h1>
						<p className="text-md md:text-xl mb-8 text-green-100">
							Discover our premium selection of certified organic fruits,
							vegetables, and pantry essentials. Farm-fresh quality
							delivered to your doorstep.
						</p>
						<div className="flex flex-wrap gap-4">
							<Link
								href="/products"
								className="bg-white text-green-600 px-8 py-3 rounded-md font-semibold hover:bg-green-50 transition-colors"
							>
								Shop Now
							</Link>
							<Link
								href="/about"
								className="border-2 border-white text-white px-8 py-3 rounded-md font-semibold hover:bg-white hover:text-green-600 transition-colors"
							>
								Learn More
							</Link>
						</div>
					</div>
				</div>
			</section>

			{/* Features Section */}
			<section className="py-10 md:py-16 bg-white">
				<div className="container page-wrapper mx-auto px-4">
					<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
						{featuredSection?.map((feature) => (
							<div className="text-center">
								<div className="bg-green-100 rounded-full p-6 w-20 h-20 flex items-center justify-center mx-auto mb-4">
									{feature.icon}
								</div>
								<h3 className="font-semibold text-lg mb-2">
									{feature.title}
								</h3>
								<p className="text-gray-600">{feature.desc}</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* Featured Products */}
			<section className="py-10 md:py-16 bg-green-50">
				<div className="container page-wrapper mx-auto px-4">
					<div className="text-center mb-8 lg:mb-12">
						<h2 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-2 lg:mb-4">
							Featured Products
						</h2>
						<p className="text-gray-600 max-w-2xl mx-auto text-sm lg:text-md">
							Discover our most popular organic products, carefully
							selected for their exceptional quality and nutritional
							value.
						</p>
					</div>

					{featuredProducts?.length > 0 ? (
						<Products products={featuredProducts} />
					) : (
						<div className="flex items-center justify-center">
							no products available at this time
						</div>
					)}

					{mockProducts?.length > 4 && (
						<div className="text-center">
							<Link
								href="/products"
								className="bg-green-600 text-white px-8 py-3 rounded-md font-semibold hover:bg-green-700 transition-colors inline-block"
							>
								View All Products
							</Link>
						</div>
					)}
				</div>
			</section>

			{/* Newsletter Section */}
			<section className="py-16 bg-green-800 text-white">
				<div className="container page-wrapper mx-auto px-4 text-center">
					<h2 className="text-3xl font-bold mb-4">Stay Updated</h2>
					<p className="text-green-200 mb-8 max-w-2xl mx-auto">
						Subscribe to our newsletter for the latest organic products,
						health tips, and exclusive offers.
					</p>
					<div className="flex flex-col sm:flex-row max-w-md mx-auto gap-4">
						<input
							type="email"
							placeholder="Enter your email"
							className="flex-1 px-4 py-3 rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-400"
						/>
						<button className="bg-green-600 text-white px-6 py-3 rounded-md font-semibold hover:bg-green-500 transition-colors">
							Subscribe
						</button>
					</div>
				</div>
			</section>
		</Layout>
	);
};

export default HomePage;
