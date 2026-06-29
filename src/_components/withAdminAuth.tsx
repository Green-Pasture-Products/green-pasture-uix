import { useRouter } from "next/router";
import { useEffect } from "react";
import { useAppSelector } from "@/_redux/store";
import PageLoader from "@/_UI/PageLoader";
import { appConstants } from "@/_redux/constants";

const ADMIN_ROLES: readonly string[] = appConstants.ADMIN_ROLES;

/**
 * Client-side admin guard. `middleware.ts` is the primary, server-side gate
 * (it runs before this component is ever sent to the browser); this HOC is
 * defense-in-depth and handles client-side navigation. Auth state is read
 * synchronously from the store — no rehydration timers — because PersistGate
 * blocks render until the persisted state is available.
 */
export default function withAdminAuth<P extends object>(
	WrappedComponent: React.ComponentType<P>
) {
	const WithAdminAuthComponent = (props: P) => {
		const router = useRouter();
		const { isAuthenticated, user } = useAppSelector((state) => state.auth);

		const userRole = user?.profileType?.toUpperCase();
		const authorized =
			isAuthenticated && !!userRole && ADMIN_ROLES.includes(userRole);

		useEffect(() => {
			if (!isAuthenticated) {
				router.replace(`/login?redirect=${router.asPath}`);
			} else if (!authorized) {
				router.replace("/");
			}
		}, [isAuthenticated, authorized, router]);

		if (!authorized) {
			return <PageLoader message="Verifying access..." />;
		}

		return <WrappedComponent {...props} />;
	};

	WithAdminAuthComponent.displayName = `withAdminAuth(${WrappedComponent.displayName || WrappedComponent.name || "Component"})`;

	return WithAdminAuthComponent;
}
