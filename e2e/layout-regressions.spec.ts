import { test, expect } from "@playwright/test";
import { signInAsAdmin } from "./_helpers";

const ok = (data: unknown) => ({ status: 200, contentType: "application/json", body: JSON.stringify({ message: "ok", data }) });
const now = new Date().toISOString();
const FLAG_ID = "0192a3b4-c5d6-7e8f-9a0b-1c2d3e4f5d01";
const cfg = { name: "Guest checkout", description: "Shoppers can check out without an account.", module: "checkout", enabled: true, rolloutPercentage: 100, targetRoles: [], targetAccountIds: [] };

/**
 * The Activity panel is `position: fixed`. A CSS transform on ANY ancestor (animate-page-enter has one) makes it position
 * against that ancestor instead of the screen, so it floats over the page content. Every record page must dock it.
 */
test("record pages dock the Activity panel to the right edge, flush under the top bar", async ({ page, context, baseURL }) => {
	await page.route("**/api/v1/**", (route) => {
		const path = new URL(route.request().url()).pathname.replace(/^.*\/api\/v1\//, "");
		if (path === `feature-flags/admin/${FLAG_ID}`) return route.fulfill(ok({ id: FLAG_ID, key: "checkout.guest", system: true, createdAt: now, updatedAt: now, effective: true, pendingChange: null, history: [], ...cfg }));
		if (path === "items/item1") return route.fulfill(ok({ id: "item1", name: "Brain Super Food", price: 1500, unit: 3, status: "A", product: { id: "c", name: "Herbs" }, photos: [], reviews: [], tags: [], ratingStats: { average: 0, count: 0 } }));
		if (path.startsWith("notifications/summary")) return route.fulfill(ok({ primaryUnread: 0, otherUnread: 0, unreadCount: 0, cleared: 0 }));
		return route.fulfill(ok({ items: [], meta: { page: 1, limit: 10, total: 0, totalPages: 1 } }));
	});
	await signInAsAdmin(context, baseURL!);
	await page.setViewportSize({ width: 1440, height: 900 });
	await page.goto(`/admin/feature-flag/${FLAG_ID}`);
	const panel = page.getByTestId("record-activity-panel");
	await expect(panel).toBeVisible();
	// Let the page's entrance animation finish: a stray transform would still be holding the panel in the wrong place after it.
	const edges = async () => {
		const box = (await panel.boundingBox())!;
		return { right: Math.round(box.x + box.width), bottom: Math.round(box.y + box.height) };
	};
	await expect.poll(edges, { timeout: 3000, message: "the panel docks to the right and bottom edges of the screen" }).toEqual({ right: 1440, bottom: 900 });
	// Same rule for the product page, which renders the panel next to a form.
	await page.goto("/admin/product/item1");
	await expect(page.getByRole("heading", { name: "Brain Super Food" })).toBeVisible();
	await expect.poll(edges, { timeout: 3000 }).toEqual({ right: 1440, bottom: 900 });
});
