// _utils/staffForm.ts
//
// The staff detail page lets an admin edit name/phone/role together. The
// backend does a full replace (`profile.roles = [role]`) whenever `roleId`
// is present in the PATCH body — so sending it unconditionally silently
// collapses a multi-role staff member down to one role even when the admin
// never touched the Role field. Only include roleId when it actually
// changed from what was loaded from the server.

export function resolveRoleIdForPatch(currentRoleId: string, initialRoleId: string): string | undefined {
	return currentRoleId !== initialRoleId ? currentRoleId || undefined : undefined;
}
