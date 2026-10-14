// Run: pnpm test          (or: node --test src/_navigations/modules.test.ts)
import { test } from "node:test";
import assert from "node:assert/strict";
import { MODULES, NAV_GROUPS, findModule, findOwningModule } from "./modules.ts";

test("findModule resolves an exact path to its module", () => {
	assert.equal(findModule("/admin/products")?.title, "Products");
});

test("findModule returns undefined for a path that isn't a module", () => {
	assert.equal(findModule("/admin/products/abc"), undefined);
});

test("findOwningModule resolves a detail route to its parent via owns", () => {
	// '/admin/products' owns the singular '/admin/product' detail-route base —
	// a plain prefix match wouldn't catch this since the base paths differ.
	assert.equal(findOwningModule("/admin/product/abc")?.path, "/admin/products");
});

test("findOwningModule resolves a detail route to its parent via path prefix", () => {
	assert.equal(findOwningModule("/admin/roles/new")?.path, "/admin/roles");
});

test("findOwningModule returns undefined for an unknown path", () => {
	assert.equal(findOwningModule("/admin/nonexistent"), undefined);
});

test("NAV_GROUPS preserves first-seen group order", () => {
	const expectedOrder = [...new Set(MODULES.map((m) => m.group))];
	assert.deepEqual(
		NAV_GROUPS.map((g) => g.label),
		expectedOrder,
	);
});

test("every admin detail route resolves to the module its breadcrumb links back to", () => {
	// AdminLayout shows a breadcrumb only when findOwningModule resolves, so an
	// unowned detail route would silently render no trail.
	const detailRoutes: Array<[string, string]> = [
		["/admin/product/019f-abc", "Products"],
		["/admin/products/new", "Products"],
		["/admin/products/approvals", "Products"],
		["/admin/order/019f-abc", "Orders"],
		["/admin/customer/019f-abc", "Customers"],
		["/admin/staff/019f-abc", "Team & Role Access"],
		["/admin/role/019f-abc", "Roles & Permissions"],
		["/admin/roles/new", "Roles & Permissions"],
		["/admin/category/019f-abc", "Category"],
		["/admin/categories/new", "Category"],
		["/admin/tag/019f-abc", "Tags"],
		["/admin/tags/new", "Tags"],
		["/admin/announcement/019f-abc", "Announcements"],
		["/admin/announcements/new", "Announcements"],
		["/admin/country/019f-abc", "Countries"],
		["/admin/review/019f-abc", "Reviews"],
		["/admin/reviews/new", "Reviews"],
		["/admin/invitations/new", "Invitations"],
		["/admin/audit-log/019f-abc", "Audit Log"],
		["/admin/payments/019f-abc", "Manual Payments"],
		["/admin/payments/confirmations", "Manual Payments"],
		["/admin/product/019f-abc/sizes/new", "Products"],
		["/admin/feature-flag/019f-abc", "Feature Flags"],
		["/admin/feature-flags/new", "Feature Flags"],
		["/admin/feature-flags/approvals", "Feature Flags"],
	];
	for (const [route, expected] of detailRoutes) {
		assert.equal(findOwningModule(route)?.title, expected, route);
		assert.equal(findModule(route), undefined, `${route} must not be a module itself`);
	}
});

test("every module privilege is a permission the backend seeds", async () => {
	const { readFileSync } = await import("node:fs");
	const seed = readFileSync(new URL("../../../green-pasture-api/src/database/seeders/entities-seeder/data.ts", import.meta.url), "utf8");
	const seeded = new Set([...seed.matchAll(/name: '([A-Z_]+)'/g)].map((m) => m[1]));
	for (const m of MODULES) {
		for (const p of [m.privilege ?? []].flat()) assert.ok(seeded.has(p), `${m.title} needs ${p}, which is not seeded`);
	}
});
