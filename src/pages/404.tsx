import React from "react";
import Link from "next/link";
import { Home, ArrowLeft, Search, Leaf } from "lucide-react";

const Custom404: React.FC = () => {
	return (
		<div className="min-h-screen bg-green-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
			<div className="max-w-lg w-full text-center">
				<div className="mb-8">
					<div className="flex justify-center mb-6">
						<Leaf className="h-20 w-20 text-green-600" />
					</div>

					<div className="text-9xl font-bold text-green-600 mb-4">404</div>

					<h1 className="text-4xl font-bold text-gray-800 mb-4">
						Oops! Page not found
					</h1>

					<p className="text-lg text-gray-600 mb-8">
						The page you're looking for seems to have wandered off into
						the organic gardens. Don't worry, we'll help you find your way
						back!
					</p>
				</div>

				<div className="space-y-4">
					<Link
						href="/"
						className="inline-flex items-center justify-center w-full max-w-xs mx-auto bg-green-600 text-white px-6 py-3 rounded-md font-semibold hover:bg-green-700 transition-colors"
					>
						<Home className="h-5 w-5 mr-2" />
						Go Home
					</Link>

					<Link
						href="/products"
						className="inline-flex items-center justify-center w-full max-w-xs mx-auto bg-white text-green-600 border border-green-600 px-6 py-3 rounded-md font-semibold hover:bg-green-50 transition-colors"
					>
						<Search className="h-5 w-5 mr-2" />
						Browse Products
					</Link>

					<button
						onClick={() => window.history.back()}
						className="inline-flex items-center justify-center w-full max-w-xs mx-auto bg-gray-100 text-gray-700 px-6 py-3 rounded-md font-semibold hover:bg-gray-200 transition-colors"
					>
						<ArrowLeft className="h-5 w-5 mr-2" />
						Go Back
					</button>
				</div>

				<div className="mt-12 p-6 bg-white rounded-lg shadow-sm border border-green-100">
					<h3 className="font-semibold text-lg text-gray-800 mb-3">
						Looking for something specific?
					</h3>
					<div className="grid grid-cols-2 gap-4 text-sm">
						<Link
							href="/products"
							className="text-green-600 hover:text-green-500"
						>
							• All Products
						</Link>
						<Link
							href="/products?category=Fruits"
							className="text-green-600 hover:text-green-500"
						>
							• Fresh Fruits
						</Link>
						<Link
							href="/products?category=Vegetables"
							className="text-green-600 hover:text-green-500"
						>
							• Vegetables
						</Link>
						<Link
							href="/products?category=Pantry"
							className="text-green-600 hover:text-green-500"
						>
							• Pantry Items
						</Link>
					</div>
				</div>

				<div className="mt-8 text-sm text-gray-500">
					<p>Still can't find what you're looking for?</p>
					<Link
						href="/contact"
						className="text-green-600 hover:text-green-500 font-medium"
					>
						Contact our support team
					</Link>
				</div>
			</div>
		</div>
	);
};

export default Custom404;
