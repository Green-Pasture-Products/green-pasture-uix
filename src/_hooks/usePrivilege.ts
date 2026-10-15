import { useAppSelector } from "@/_redux/store";
import { useFeatures } from "@/_hooks/useFeature";
import { resolveFeature } from "@/_utils/featureFlags";
import type { ModuleDef } from "@/_navigations/modules";

/** Permission names granted by every role the signed-in user holds. */
export function useAuthorities(): string[] {
	const user = useAppSelector((s) => s.auth.user);
	const names = (user?.roles ?? []).flatMap((r) => r.permissions ?? []).map((p) => p.name);
	return [...new Set(names)];
}

/**
 * The roles this user may hand out. Admin and Super Admin are a super admin's to give (the server refuses anyone else), so they are
 * not offered to anyone else, except a role the person being edited already holds, which stays visible.
 */
export function useGrantableRoles(): <T extends { id: string | number; name: string }>(roles: T[], held?: string[]) => T[] {
	const isSuperAdmin = useAuthorities().includes("SUPER_ADMIN");
	return (roles, held = []) => roles.filter((r) => isSuperAdmin || !["ADMIN", "SUPER_ADMIN"].includes(r.name) || held.includes(String(r.id)));
}

/** True when the user holds ANY of the given privileges (or SUPER_ADMIN). No privilege given = everyone. */
export function useHasPrivilege(): (name?: string | readonly string[]) => boolean {
	const authorities = useAuthorities();
	// SUPER_ADMIN is a wildcard sentinel — see authority.guard.ts on the backend.
	const isSuperAdmin = authorities.includes("SUPER_ADMIN");
	return (name) => {
		const needed = name === undefined ? [] : typeof name === "string" ? [name] : name;
		return needed.length === 0 || isSuperAdmin || needed.some((n) => authorities.includes(n));
	};
}

/** True when the user may open the module: holds its privilege AND its feature flag (if any) is on. */
export function useCanOpenModule(): (m: Pick<ModuleDef, "privilege" | "feature">) => boolean {
	const hasPrivilege = useHasPrivilege();
	const { flags } = useFeatures();
	return (m) => hasPrivilege(m.privilege) && (!m.feature || resolveFeature(flags, m.feature));
}
