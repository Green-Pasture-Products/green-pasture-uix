// _utils/authInit.ts - Boot-time auth reconciliation
//
// Runs once on app startup. The auth cookie is the single source of truth:
// `isAuthenticated` is recomputed from the token here, so a stale persisted
// flag can never linger. Also performs a one-time migration cleanup of the
// legacy encrypted-localStorage tokens.
import type { AppDispatch } from "@/_redux/store";
import { hydrateAuth } from "@/_redux/reducers/auth.reducer";
import { authCookies } from "./authCookies";

export const initAuth = (dispatch: AppDispatch) => {
	if (typeof window === "undefined") return;

	// One-time migration: drop tokens left behind by the old secureStorage.
	try {
		localStorage.removeItem("secure_auth");
		localStorage.removeItem("secure_auth_hash");
	} catch {
		/* ignore */
	}

	const tokens = authCookies.getTokens();
	dispatch(hydrateAuth({ isAuthenticated: !!tokens }));
};
