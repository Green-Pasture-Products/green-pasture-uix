import { AlertTriangle, RefreshCw } from "lucide-react";
import React from "react";

export class CartErrorBoundary extends React.Component<
	{ children: React.ReactNode; fallback?: React.ReactNode },
	{ hasError: boolean; error?: Error }
> {
	constructor(props: any) {
		super(props);
		this.state = { hasError: false };
	}

	static getDerivedStateFromError(error: Error) {
		return { hasError: true, error };
	}

	componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
		console.error("Cart Error:", error, errorInfo);
	}

	render() {
		if (this.state.hasError) {
			return (
				this.props.fallback || (
					<div className="container mx-auto px-4 py-16 text-center">
						<AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
						<h2 className="text-xl font-bold text-gray-800 mb-2">
							Something went wrong with your cart
						</h2>
						<p className="text-gray-600 mb-4">
							Please refresh the page or try again later.
						</p>
						<button
							onClick={() => window.location.reload()}
							className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 transition-colors"
						>
							<RefreshCw className="h-4 w-4 inline mr-2" />
							Refresh Page
						</button>
					</div>
				)
			);
		}

		return this.props.children;
	}
}
