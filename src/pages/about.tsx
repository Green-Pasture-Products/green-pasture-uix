import React from "react";
import { Leaf, Heart, Shield } from "lucide-react";
import Layout from "@/_components/Layout";
import AnimatedSection from "@/_UI/AnimatedSection";
import Card from "@/_UI/Card";

const values = [
	{
		icon: Leaf,
		title: "Sustainability",
		desc: "We source exclusively from certified organic farms that practice regenerative agriculture, ensuring the earth gives back as much as it provides.",
	},
	{
		icon: Heart,
		title: "Wellness",
		desc: "Every product we offer is designed to enhance your body's natural immune system and support reproductive health through the power of nature.",
	},
	{
		icon: Shield,
		title: "Integrity",
		desc: "We stand behind every product with full transparency on sourcing, ingredients, and processing. No fillers, no shortcuts, no compromises.",
	},
];

const About = () => {
	return (
		<Layout pageTitle="About">
			<div className="bg-mint-50 dark:bg-[#0a0f1a]">
				{/* Hero */}
				<section className="py-16 md:py-24 bg-gradient-to-br from-mint-100 via-mint-50 to-lime-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
					<div className="container page-wrapper mx-auto px-4">
						<AnimatedSection>
							<div className="max-w-3xl mx-auto text-center">
								<p className="text-primary-600 dark:text-primary-400 uppercase tracking-widest text-xs font-semibold mb-3">
									ABOUT US
								</p>
								<h1 className="text-3xl md:text-5xl font-bold text-on-surface dark:text-white mb-6 leading-tight">
									Nurturing Health Through Nature's Finest
								</h1>
								<p className="text-lg text-on-surface-variant dark:text-gray-400 leading-relaxed">
									Green Pastures Organics is a premium dietary supplement platform
									dedicated to elevating immunity and fertility with organically
									sourced products. We bridge the gap between nature's potent remedies
									and modern wellness needs.
								</p>
							</div>
						</AnimatedSection>
					</div>
				</section>

				{/* Mission / Values */}
				<section className="py-16 md:py-24 bg-white dark:bg-transparent">
					<div className="container page-wrapper mx-auto px-4">
						<AnimatedSection>
							<div className="text-center mb-12">
								<p className="text-primary-600 dark:text-primary-400 uppercase tracking-widest text-xs font-semibold mb-3">
									OUR VALUES
								</p>
								<h2 className="text-3xl font-bold text-on-surface dark:text-white">
									What We Stand For
								</h2>
							</div>
						</AnimatedSection>

						<AnimatedSection delay={0.2}>
							<div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
								{values.map((value, index) => {
									const Icon = value.icon;
									return (
										<Card
											key={index}
											elevation={2}
											hoverable
											padding="lg"
											className="text-center border-outline dark:border-white/[0.12]"
										>
											<div className="bg-primary-100 dark:bg-primary-900/30 rounded-radius-lg p-4 w-16 h-16 flex items-center justify-center mx-auto mb-5">
												<Icon className="h-8 w-8 text-primary-600 dark:text-primary-400" />
											</div>
											<h3 className="font-bold text-xl mb-3 text-on-surface dark:text-white">
												{value.title}
											</h3>
											<p className="text-on-surface-variant dark:text-gray-400 leading-relaxed">
												{value.desc}
											</p>
										</Card>
									);
								})}
							</div>
						</AnimatedSection>
					</div>
				</section>

				{/* Our Story */}
				<section className="py-16 md:py-24 bg-mint dark:bg-white/[0.04]">
					<div className="container page-wrapper mx-auto px-4">
						<AnimatedSection>
							<div className="max-w-3xl mx-auto">
								<p className="text-primary-600 dark:text-primary-400 uppercase tracking-widest text-xs font-semibold mb-3">
									OUR STORY
								</p>
								<h2 className="text-3xl font-bold text-on-surface dark:text-white mb-6">
									From Farm to Your Doorstep
								</h2>
								<div className="space-y-4 text-on-surface/80 dark:text-gray-300 leading-relaxed">
									<p>
										Green Pastures Organics was born from a simple belief: that nature
										provides everything we need to live healthier, more vibrant lives.
										Our founders, drawing from deep roots in Nigerian agricultural
										traditions, set out to create a platform that connects people
										directly with the healing power of organic fruits, vegetables, and
										herbs.
									</p>
									<p>
										We work with trusted organic farms across Northern Nigeria, where
										ideal growing conditions and generations of farming wisdom combine
										to produce products of exceptional quality. Every item in our
										catalogue has been carefully vetted for purity, potency, and
										sustainability.
									</p>
									<p>
										Today, Green Pastures serves thousands of customers seeking natural
										solutions for immune support, fertility enhancement, and overall
										wellness. We are proud to be a part of their health journeys and
										remain committed to making premium organic products accessible to all.
									</p>
								</div>
							</div>
						</AnimatedSection>
					</div>
				</section>
			</div>
		</Layout>
	);
};

export default About;
