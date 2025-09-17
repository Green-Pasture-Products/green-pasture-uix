import { Facebook, Instagram, MessageCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";

import { appConstants } from "@/_redux/constants";

interface SocialLink {
	href: string | undefined;
	label: string;
	title: string;
	icon: React.ElementType;
}

const socialLinks: SocialLink[] = [
	{
		href: process.env.WHATSAPP_URL,
		label: "Visit WhatsApp",
		title: "Visit our WhatsApp",
		icon: MessageCircle,
	},
	{
		href: appConstants.FACEBOOK_URL,
		label: "Visit Facebook",
		title: "Visit our Facebook",
		icon: Facebook,
	},
	{
		href: appConstants.INSTAGRAM_URL,
		label: "Visit Instagram",
		title: "Visit our Instagram",
		icon: Instagram,
	},
];

const navLinks = [
	{ href: "/", label: "Home" },
	{ href: "/products", label: "Products" },
	{ href: "/search", label: "Search" },
	{ href: "/wishlist", label: "Wishlist" },
	{ href: "/about", label: "About" },
	{ href: "/contact", label: "Contact" },
];

const categories = ["fruits", "vegetables", "grains", "pantry"];

const Footer = () => {
	return (
		<footer className="bg-green-800 text-white mt-8 md:mt-16">
			<div className="container page-wrapper mx-auto px-4 py-12">
				<div className="grid grid-cols-1 md:grid-cols-4 gap-8">
					<div>
						<div className="mb-4">
							<Link href="/" className="flex items-center space-x-2">
								<div className="relative w-[2.2rem] aspect-square bg-transparent">
									<Image
										src="/images/GP Organic Logo (Primary).png"
										alt="Green Pastures Logo"
										height={100}
										width={100}
										priority
										sizes="(max-width: 768px) 2rem, (max-width: 1200px) 2.2rem, 3rem"
										className="object-contain"
									/>
								</div>
								<span className="text-md md:text-lg font-bold">
									Green Pastures Organics
								</span>
							</Link>
						</div>
						<p className="text-green-200">
							Your trusted source for premium organic products. Fresh,
							healthy, and sustainably grown.
						</p>
					</div>
					<div>
						<h3 className="font-semibold mb-4">Quick Links</h3>
						<ul className="space-y-2 text-green-200">
							{navLinks?.map(({ href, label }) => (
								<li key={href}>
									<Link
										href={href}
										className="hover:text-white transition-colors duration-200"
									>
										{label}
									</Link>
								</li>
							))}
						</ul>
					</div>
					<div>
						<h3 className="font-semibold mb-4">Categories</h3>
						<ul className="space-y-2 text-green-200">
							{categories?.map((category) => (
								<li key={category}>
									<Link
										href={`/products?category=${category}`}
										className="capitalize hover:text-white transition-colors duration-200"
									>
										{category}
									</Link>
								</li>
							))}
						</ul>
					</div>
					<div>
						<h3 className="font-semibold mb-4">Contact Info</h3>
						<ul className="space-y-2 text-green-200">
							<li>
								Phone:{" "}
								<Link href={`tel:+2347018845177`}>(234)7018845177</Link>
							</li>
							<li>
								Email:{" "}
								<Link href={`mailto:hello@gporganics.com`} className="">
									hello@gporganics.com
								</Link>
							</li>
						</ul>
						<ul className="flex justify-center md:justify-start gap-4 mt-4 md:mt-8">
							{socialLinks?.map(({ href, label, title, icon: Icon }) => (
								<li
									key={href}
									className="w-10 h-10 rounded-full border border-white flex items-center justify-center transition-all duration-200 hover:border-transparent hover:scale-110"
								>
									<a
										href={href}
										title={title}
										target="_blank"
										aria-label={label}
										rel="noopener noreferrer"
										className="flex items-center justify-center w-full h-full rounded-full transition-colors duration-200 hover:bg-white hover:text-green-900 text-white"
									>
										<Icon size={18} />
									</a>
								</li>
							))}
						</ul>
					</div>
				</div>
				<div className="border-t border-green-700 mt-8 pt-8 text-center text-green-200">
					<p>
						&copy; 2024 - {new Date().getFullYear()} Green Pastures
						Organics. All rights reserved.
					</p>
				</div>
			</div>
		</footer>
	);
};

export default Footer;
