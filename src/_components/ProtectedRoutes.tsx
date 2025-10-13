import { useRouter } from "next/router";
import { useEffect } from "react";
import { useAppSelector } from "@/_redux/store";

interface ProtectedRouteProps {
	children: React.ReactNode;
	allowedRoles?: string[]; // Optional role-based access
}

// ✅ Higher-order component for protected routes
export function ProtectedRoute({
	children,
	allowedRoles,
}: ProtectedRouteProps) {
	const router = useRouter();
	const { isAuthenticated, user, isLoading } = useAppSelector(
		(state) => state.auth
	);

	useEffect(() => {
		// Redirect to login if not authenticated
		if (!isLoading && !isAuthenticated) {
			router.push(`/login?redirect=${router.pathname}`);
			return;
		}
	}, [isAuthenticated, user, isLoading, router, allowedRoles]);

	// Show loading state while checking auth
	if (isLoading) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
			</div>
		);
	}

	// Don't render protected content until authenticated
	if (!isAuthenticated) return null;

	// Check role authorization
	if (allowedRoles && user && !allowedRoles.includes(user?.profileType)) {
		return null;
	}

	return <>{children}</>;
}
