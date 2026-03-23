import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useAppSelector } from "@/_redux/store";

const ADMIN_ROLES = ["STAFF", "ADMIN", "SUPER_ADMIN", "MANAGER"];

export default function withAdminAuth<P extends object>(
	WrappedComponent: React.ComponentType<P>
) {
	const WithAdminAuthComponent = (props: P) => {
		const router = useRouter();
		const { isAuthenticated, user } = useAppSelector((state) => state.auth);
		const [checked, setChecked] = useState(false);
		const [authorized, setAuthorized] = useState(false);

		useEffect(() => {
			// Wait for persist rehydration — isAuthenticated will be
			// false on first render if persist hasn't loaded yet.
			// We use a short delay to let PersistGate finish.
			const timer = setTimeout(() => {
				if (!isAuthenticated) {
					router.replace(`/login?redirect=${router.asPath}`);
					return;
				}

				const userRole = user?.profileType?.toUpperCase();
				if (!userRole || !ADMIN_ROLES.includes(userRole)) {
					router.replace("/");
					return;
				}

				setAuthorized(true);
				setChecked(true);
			}, 100);

			return () => clearTimeout(timer);
		}, [isAuthenticated, user, router]);

		// Already authorized on subsequent renders (client-side nav)
		useEffect(() => {
			if (checked) return;
			if (isAuthenticated) {
				const userRole = user?.profileType?.toUpperCase();
				if (userRole && ADMIN_ROLES.includes(userRole)) {
					setAuthorized(true);
					setChecked(true);
				}
			}
		}, [isAuthenticated, user, checked]);

		if (!authorized) {
			return (
				<div
					className="flex items-center justify-center min-h-screen"
					style={{ background: "var(--background)" }}
				>
					<div
						className="animate-spin rounded-full h-8 w-8 border-b-2"
						style={{ borderColor: "var(--color-primary)" }}
					/>
				</div>
			);
		}

		return <WrappedComponent {...props} />;
	};

	WithAdminAuthComponent.displayName = `withAdminAuth(${WrappedComponent.displayName || WrappedComponent.name || "Component"})`;

	return WithAdminAuthComponent;
}
