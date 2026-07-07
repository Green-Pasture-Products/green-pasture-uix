import React, { useState } from "react";
import { Phone, Mail, MapPin, Send } from "lucide-react";
import Layout from "@/_components/Layout";
import AnimatedSection from "@/_UI/AnimatedSection";
import Card from "@/_UI/Card";
import Input from "@/_UI/Input";
import Button from "@/_UI/Button";
import { appConstants } from "@/_redux/constants";

const contactInfo = [
	{
		icon: Phone,
		title: "Phone",
		detail: appConstants.CONTACT.PHONE,
		subtitle: "Mon-Fri, 9am-5pm WAT",
	},
	{
		icon: Mail,
		title: "Email",
		detail: appConstants.CONTACT.EMAIL,
		subtitle: "We reply within 24 hours",
	},
	{
		icon: MapPin,
		title: "Office",
		detail: appConstants.CONTACT.ADDRESS,
		subtitle: "Visit by appointment",
	},
];

const Contact = () => {
	const [formData, setFormData] = useState({
		name: "",
		email: "",
		phone: "",
		subject: "",
		message: "",
	});

	const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		// Handle form submission
	};

	return (
		<Layout pageTitle="Contact us">
			<div className="bg-mint-50 dark:bg-[#0a0f1a]">
				{/* Header */}
				<section className="py-16 md:py-24 bg-gradient-to-br from-mint-100 via-mint-50 to-lime-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
					<div className="container page-wrapper mx-auto px-4">
						<AnimatedSection>
							<div className="max-w-3xl mx-auto text-center">
								<p className="text-primary-600 dark:text-primary-400 uppercase tracking-widest text-xs font-semibold mb-3">
									GET IN TOUCH
								</p>
								<h1 className="text-3xl md:text-5xl font-bold text-on-surface dark:text-white mb-6">
									We'd Love to Hear From You
								</h1>
								<p className="text-lg text-on-surface-variant dark:text-gray-400">
									Have questions about our products or need assistance? Reach out and we'll get back to you as soon as possible.
								</p>
							</div>
						</AnimatedSection>
					</div>
				</section>

				{/* Content */}
				<section className="py-16 md:py-24">
					<div className="container page-wrapper mx-auto px-4">
						<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
							{/* Contact Form */}
							<AnimatedSection delay={0.1} className="lg:col-span-2">
								<Card elevation={1} padding="lg">
									<h2 className="text-2xl font-bold text-on-surface dark:text-white mb-6">
										Send us a message
									</h2>
									<form onSubmit={handleSubmit} className="space-y-5">
										<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
											<Input
												label="Full Name"
												name="name"
												placeholder="Type your full name"
												value={formData.name}
												onChange={handleChange}
												required
											/>
											<Input
												label="Email Address"
												name="email"
												type="email"
												placeholder="your@email.com"
												leftIcon={Mail}
												value={formData.email}
												onChange={handleChange}
												required
											/>
										</div>
										<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
											<Input
												label="Phone Number"
												name="phone"
												type="tel"
												placeholder="+234 800 000 0000"
												leftIcon={Phone}
												value={formData.phone}
												onChange={handleChange}
											/>
											<Input
												label="Subject"
												name="subject"
												placeholder="What is this about?"
												value={formData.subject}
												onChange={handleChange}
												required
											/>
										</div>
										<div>
											<label className="block text-xs md:text-sm font-semibold mb-1.5" style={{ color: "var(--text-secondary)" }}>
												Message
											</label>
											<textarea
												name="message"
												rows={5}
												placeholder="Tell us more..."
												value={formData.message}
												onChange={handleChange}
												required
												className="w-full px-3 py-2.5 rounded-radius-md bg-white dark:bg-white/[0.04] text-on-surface dark:text-white placeholder:text-on-surface/50 transition-colors outline-none focus:ring-2 focus:ring-primary-600/20 dark:focus:ring-primary-400/20 resize-none border"
												style={{ borderColor: "var(--border-medium)" }}
											/>
										</div>
										<div className="flex justify-center">
											<Button
												type="submit"
												variant="filled"
												size="lg"
												rightIcon={Send}
											>
												Send Message
											</Button>
										</div>
									</form>
								</Card>
							</AnimatedSection>

							{/* Contact Info */}
							<AnimatedSection delay={0.3} className="space-y-4">
								{contactInfo.map((info, index) => {
									const Icon = info.icon;
									return (
										<Card key={index} elevation={2} padding="md" hoverable className="border-outline dark:border-white/[0.12]">
											<div className="flex items-center space-x-4">
												<div className="bg-primary-100 dark:bg-primary-900/30 rounded-radius-lg p-3 shrink-0 flex items-center justify-center">
													<Icon className="h-6 w-6 text-primary-600 dark:text-primary-400" />
												</div>
												<div>
													<h3 className="font-semibold text-on-surface dark:text-white mb-1">
														{info.title}
													</h3>
													<p className="text-on-surface/80 dark:text-gray-300 font-medium">
														{info.detail}
													</p>
													<p className="text-sm text-on-surface-variant dark:text-gray-400 mt-0.5">
														{info.subtitle}
													</p>
												</div>
											</div>
										</Card>
									);
								})}
							</AnimatedSection>
						</div>
					</div>
				</section>
			</div>
		</Layout>
	);
};

export default Contact;
