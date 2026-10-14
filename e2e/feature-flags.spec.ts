import { test, expect, type Page } from "@playwright/test";
import { signInAsAdmin } from "./_helpers";

const ok = (data: unknown) => ({ status: 200, contentType: "application/json", body: JSON.stringify({ message: "ok", data }) });
const NOW = new Date().toISOString();

const cfg = (key: string, over: Record<string, unknown> = {}) => ({
	name: key, description: "", module: key.split(".")[0], enabled: true, rolloutPercentage: 100, targetRoles: [], targetAccountIds: [], ...over,
});
const flag = (id: string, key: string, over: Record<string, unknown> = {}) => ({
	id, key, ...cfg(key), system: false, createdAt: NOW, updatedAt: NOW, pendingChange: null, effective: true, ...over,
});
const change = (id: string, flagId: string, key: string, requestedById: string, over: Record<string, unknown> = {}) => ({
	id, flagId, flagKey: key, kind: "UPDATE", changeStatus: "PENDING", emergency: false, reason: "Roll out to a quarter of shoppers",
	previous: { key, ...cfg(key) }, proposed: { key, ...cfg(key, { rolloutPercentage: 25 }) },
	requestedById, requestedByName: requestedById === "1" ? "E2e Admin" : "Ada Obi", requestedAt: NOW,
	decidedById: null, decidedByName: null, decidedAt: null, decisionNote: null, ...over,
});

const OTHERS = change("c1", "f1", "checkout.coupons", "99");
const MINE = change("c2", "f2", "storefront.reviews", "1");

const FLAGS = [
	flag("f1", "checkout.coupons", { name: "Coupons", rolloutPercentage: 25, pendingChange: OTHERS }),
	flag("f2", "storefront.reviews", { name: "Reviews", pendingChange: MINE }),
	flag("f3", "auth.signup", { name: "Signup", enabled: false }),
	flag("f4", "admin.analytics", { name: "Analytics", targetRoles: ["MANAGER"], system: true }),
];

async function mockApi(page: Page) {
	const posts: string[] = [];
	await page.route("**/api/v1/**", async (route) => {
		const req = route.request();
		const path = new URL(req.url()).pathname.replace(/^.*\/api\/v1\//, "");
		if (req.method() === "POST") {
			posts.push(path);
			return route.fulfill(ok(change("new", "f1", "x", "1")));
		}
		if (path === "feature-flags/evaluate") return route.fulfill(ok({}));
		if (path === "feature-flags/admin") return route.fulfill(ok(FLAGS));
		if (path === "feature-flags/admin/changes") return route.fulfill(ok([OTHERS, MINE]));
		const m = path.match(/^feature-flags\/admin\/(f\d)$/);
		if (m) return route.fulfill(ok({ ...FLAGS.find((f) => f.id === m[1]), history: [] }));
		if (path === "role/all") return route.fulfill(ok([{ id: "r1", name: "MANAGER" }]));
		if (path.startsWith("activity") || path.includes("activity")) return route.fulfill(ok({ items: [], meta: {} }));
		return route.fulfill({ status: 404, contentType: "application/json", body: JSON.stringify({ message: "nope" }) });
	});
	return posts;
}

test.beforeEach(async ({ context, baseURL }) => {
	await signInAsAdmin(context, baseURL!);
});

test("the list shows each flag's state and pending approvals", async ({ page }) => {
	await mockApi(page);
	await page.goto("/admin/feature-flags");
	await expect(page.getByText("Coupons", { exact: true })).toBeVisible();
	await expect(page.getByText("On · 25%")).toBeVisible();
	await expect(page.getByText("Off", { exact: true })).toBeVisible();
	await expect(page.getByText("Targeted", { exact: true })).toBeVisible();
	await expect(page.getByText("System", { exact: true })).toBeVisible();
	await expect(page.getByText("Pending approval").first()).toBeVisible();
	await expect(page.getByRole("tab", { name: /Approvals \(2 pending\)/ })).toBeVisible();
});

test("a request from someone else can be approved", async ({ page }) => {
	const posts = await mockApi(page);
	await page.goto("/admin/feature-flag/f1");
	await expect(page.getByTestId("pending-change")).toBeVisible();
	await page.getByRole("button", { name: "Approve", exact: true }).click();
	await page.getByRole("button", { name: "Confirm approval" }).click();
	await expect.poll(() => posts).toContain("feature-flags/admin/changes/c1/approve");
});

test("your own request can only be cancelled", async ({ page }) => {
	await mockApi(page);
	await page.goto("/admin/feature-flag/f2");
	await expect(page.getByText("Waiting for someone else to approve")).toBeVisible();
	await expect(page.getByRole("button", { name: "Approve", exact: true })).toHaveCount(0);
	await expect(page.getByRole("button", { name: "Cancel request" })).toBeVisible();
	await expect(page.getByRole("button", { name: "Request change" })).toBeDisabled();
});

test("the new-flag form needs a reason of 10+ characters", async ({ page }) => {
	const posts = await mockApi(page);
	await page.goto("/admin/feature-flags/new");
	await page.getByPlaceholder("checkout.coupons").fill("checkout.new_thing");
	await page.getByPlaceholder("Coupon codes").fill("New thing");
	await page.getByRole("combobox", { name: "Module" }).click();
	await page.getByLabel("Search modules").fill("checkout");
	await page.getByLabel("Search modules").press("Enter");
	await page.getByPlaceholder(/At least 10 characters/).fill("too short");
	await page.getByRole("button", { name: "Send for approval" }).click();
	await expect(page.getByText("Give a reason of at least 10 characters")).toBeVisible();
	expect(posts).toEqual([]);
	await page.getByPlaceholder(/At least 10 characters/).fill("Needed for the launch");
	await page.getByRole("button", { name: "Send for approval" }).click();
	await expect(page).toHaveURL(/feature-flags\/approvals/);
	expect(posts).toContain("feature-flags/admin");
});

test("system flags cannot be deleted", async ({ page }) => {
	await mockApi(page);
	await page.goto("/admin/feature-flag/f4");
	await expect(page.getByRole("heading", { name: "Analytics" })).toBeVisible();
	await expect(page.getByRole("button", { name: "Request deletion" })).toHaveCount(0);
	await page.goto("/admin/feature-flag/f3");
	await expect(page.getByRole("button", { name: "Request deletion" })).toBeVisible();
});
