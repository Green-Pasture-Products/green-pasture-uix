import {
	Facebook,
	Instagram,
	MessageCircle,
	Phone,
	Mail,
	MapPin,
} from "lucide-react";
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

const quickLinks = [
	{ href: "/", label: "Home" },
	{ href: "/products", label: "Products" },
	{ href: "/about", label: "About" },
	{ href: "/contact", label: "Contact" },
];

const customerServiceLinks = [
	{ href: "/cart", label: "Cart" },
	{ href: "/wishlist", label: "Wishlist" },
	{ href: "/profile", label: "Profile" },
	{ href: "/search", label: "Track Order" },
	{ href: "/terms", label: "Terms of Service" },
	{ href: "/privacy", label: "Privacy Policy" },
	{ href: "/refund-policy", label: "Return Policy" },
];

const Footer = () => {
	return (
		<footer className="bg-gray-900 dark:bg-black text-gray-300">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
					{/* Column 1: Brand */}
					<div className="sm:col-span-2 lg:col-span-1">
						<Link
							href="/"
							className="inline-flex items-center gap-2 mb-4"
						>
							<span className="text-xl font-bold text-white tracking-tight">
								Green Pastures
							</span>
						</Link>
						<p className="text-gray-400 text-sm leading-relaxed mb-6">
							Your trusted source for premium organic products.
							Fresh, healthy, and sustainably grown for a better
							life.
						</p>
						<div className="flex gap-3">
							{socialLinks?.map(
								({ href, label, title, icon: Icon }) => (
									<a
										key={href}
										href={href}
										title={title}
										target="_blank"
										aria-label={label}
										rel="noopener noreferrer"
										className="w-10 h-10 rounded-full border border-gray-700 flex items-center justify-center text-gray-400 hover:scale-110 hover:text-primary-400 hover:border-primary-400 transition-all duration-200"
									>
										<Icon size={18} />
									</a>
								)
							)}
						</div>
					</div>

					{/* Column 2: Quick Links */}
					<div>
						<h3 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">
							Quick Links
						</h3>
						<ul className="space-y-2.5">
							{quickLinks.map(({ href, label }) => (
								<li key={href}>
									<Link
										href={href}
										className="text-gray-400 hover:text-primary-400 transition-colors duration-200 text-sm"
									>
										{label}
									</Link>
								</li>
							))}
						</ul>
					</div>

					{/* Column 3: Customer Service */}
					<div>
						<h3 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">
							Customer Service
						</h3>
						<ul className="space-y-2.5">
							{customerServiceLinks.map(({ href, label }) => (
								<li key={href}>
									<Link
										href={href}
										className="text-gray-400 hover:text-primary-400 transition-colors duration-200 text-sm"
									>
										{label}
									</Link>
								</li>
							))}
						</ul>
					</div>

					{/* Column 4: Contact Info */}
					<div>
						<h3 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">
							Contact Info
						</h3>
						<ul className="space-y-3">
							<li className="flex items-start gap-3">
								<Phone className="h-4 w-4 text-primary-400 mt-0.5 flex-shrink-0" />
								<Link
									href="tel:+2347018845177"
									className="text-gray-400 hover:text-primary-400 transition-colors duration-200 text-sm"
								>
									(234) 701 884 5177
								</Link>
							</li>
							<li className="flex items-start gap-3">
								<Mail className="h-4 w-4 text-primary-400 mt-0.5 flex-shrink-0" />
								<Link
									href="mailto:hello@gporganics.com"
									className="text-gray-400 hover:text-primary-400 transition-colors duration-200 text-sm"
								>
									hello@gporganics.com
								</Link>
							</li>
							<li className="flex items-start gap-3">
								<MapPin className="h-4 w-4 text-primary-400 mt-0.5 flex-shrink-0" />
								<span className="text-gray-400 text-sm">
									Lagos, Nigeria
								</span>
							</li>
						</ul>
					</div>
				</div>

				{/* Bottom Bar */}
				<div className="border-t border-gray-800 mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-gray-500">
					<p>
						&copy; 2024 - {new Date().getFullYear()} Green Pastures
						Organics. All rights reserved.
					</p>
					<div className="flex items-center gap-4">
						<Link
							href="/privacy"
							className="hover:text-primary-400 transition-colors duration-200"
						>
							Privacy Policy
						</Link>
						<span className="text-gray-700">|</span>
						<Link
							href="/terms"
							className="hover:text-primary-400 transition-colors duration-200"
						>
							Terms of Service
						</Link>
					</div>
				</div>
			</div>
		</footer>
	);
};

export default Footer;
