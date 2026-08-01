// Run: pnpm test          (or: node --test src/_utils/staffForm.test.ts)
import { test } from "node:test";
import assert from "node:assert/strict";
import { resolveRoleIdForPatch } from "./staffForm.ts";

test("role untouched: roleId is omitted from the patch body", () => {
	// Admin only edited the phone number — the role field was never touched,
	// so it must stay out of the PATCH body entirely, or the backend's
	// `if (data.roleId)` full-replace branch fires and drops any extra roles.
	assert.equal(resolveRoleIdForPatch("role-1", "role-1"), undefined);
});

test("role changed: roleId is included in the patch body", () => {
	const result = resolveRoleIdForPatch("role-2", "role-1");
	assert.equal(result, "role-2");
});

test("role cleared back to empty: roleId is omitted, not sent as an empty string", () => {
	assert.equal(resolveRoleIdForPatch("", ""), undefined);
});
