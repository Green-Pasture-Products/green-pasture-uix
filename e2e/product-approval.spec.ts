import { test, expect, type Page } from "@playwright/test";
import { signInAsAdmin, offendingElements, overflowsHorizontally } from "./_helpers";

const NOW = new Date().toISOString();
const body = (status: number, data: unknown) => ({ status, contentType: "application/json", body: JSON.stringify({ message: "ok", data }) });

const change = (id: string, requestedById: string, over: Record<string, unknown> = {}) => ({
	id, kind: "UPDATE", changeStatus: "PENDING", itemId: "item1", productName: "Brain Super Food",
	payload: { price: 2000, unit: 8 }, previous: { price: 1500, unit: 3 }, note: "Price went up with the supplier",
	requestedById, requestedByName: requestedById === "1" ? "E2e Admin" : "Ada Obi", requestedAt: NOW,
	decidedById: null, decidedByName: null, decidedAt: null, decisionNote: null, appliedItemIds: null, ...over,
});
const NEW_PRODUCT = change("c3", "99", {
	kind: "CREATE", itemId: null, productName: "Moringa Blend", categoryName: "Herbs", note: null, previous: null,
	payload: { productId: "cat1", name: "Moringa Blend", description: "<p>Green</p>", tagIds: [], images: [{ url: "data:image/gif;base64,R0lGODlhAQABAAAAACw=" }], variants: [{ price: 5000, originalPrice: 6000, unit: 10, weightValue: 250, weightUnit: "g" }] },
});
const OTHERS = change("c1", "99");
const MINE = change("c2", "1", { productName: "Mine Product" });
const DECIDED = change("c4", "99", { changeStatus: "APPROVED", productName: "Old Product", decidedByName: "E2e Admin", decidedAt: NOW });

const ITEM = {
	id: "item1", name: "Brain Super Food", price: 1500, unit: 3, status: "A", published: true, product: { id: "cat1", name: "Herbs" },
	photos: [], reviews: [], tags: [], ratingStats: { average: 0, count: 0 }, description: "", weightValue: null, weightUnit: null,
};

async function mockApi(page: Page, opts: { pendingForItem?: boolean } = {}) {
	const posts: { path: string; body: unknown }[] = [];
	await page.route("**/api/v1/**", async (route) => {
		const req = route.request();
		const url = new URL(req.url());
		const path = url.pathname.replace(/^.*\/api\/v1\//, "");
		if (req.method() === "POST") {
			posts.push({ path, body: null });
			if (path === "items/bulk") return route.fulfill(body(202, { pending: true, change: NEW_PRODUCT }));
			return route.fulfill(body(200, {}));
		}
		if (req.method() === "PATCH" && path === "items/item1") {
			posts.push({ path, body: req.postDataJSON() });
			return route.fulfill(body(202, { pending: true, change: OTHERS }));
		}
		if (path === "feature-flags/evaluate") return route.fulfill(body(200, {}));
		if (path === "product-changes/summary") return route.fulfill(body(200, { pending: 3 }));
		if (path === "product-changes") {
			const status = url.searchParams.get("status");
			const itemId = url.searchParams.get("itemId");
			if (itemId) return route.fulfill(body(200, opts.pendingForItem ? [OTHERS] : []));
			return route.fulfill(body(200, status === "PENDING" ? [OTHERS, MINE, NEW_PRODUCT] : [OTHERS, MINE, NEW_PRODUCT, DECIDED]));
		}
		if (path === "items/item1") return route.fulfill(body(200, ITEM));
		if (path === "products") return route.fulfill(body(200, { items: [{ id: "cat1", name: "Herbs" }], meta: { page: 1, limit: 100, total: 1, totalPages: 1 } }));
		if (path.includes("activity") || path.startsWith("items") || path.startsWith("tags")) return route.fulfill(body(200, { items: [], meta: { page: 1, limit: 10, total: 0, totalPages: 1 } }));
		if (path.startsWith("notifications/summary")) return route.fulfill(body(200, { primaryUnread: 0, otherUnread: 0, unreadCount: 0, cleared: 0 }));
		return route.fulfill({ status: 404, contentType: "application/json", body: JSON.stringify({ message: "nope" }) });
	});
	return posts;
}

test.beforeEach(async ({ context, baseURL }) => {
	await signInAsAdmin(context, baseURL!);
});

test("submitting a new product is sent for approval and lands on the approvals page", async ({ page }) => {
	const posts = await mockApi(page);
	await page.goto("/admin/products/new");
	await page.getByPlaceholder("e.g. Brain Super Food").fill("Moringa Blend");
	await page.getByRole("combobox").first().click();
	await page.getByRole("option", { name: /Herbs/ }).click();
	await page.getByPlaceholder("0.00", { exact: true }).first().fill("5000");
	await page.getByRole("button", { name: "Submit for approval" }).click();
	await expect(page).toHaveURL(/products\/approvals/);
	expect(posts.map((p) => p.path)).toContain("items/bulk");
	await expect(page.getByText("Sent for approval").first()).toBeVisible();
});

test("a request from someone else can be approved or rejected (reject needs a note)", async ({ page }) => {
	const posts = await mockApi(page);
	await page.goto("/admin/products/approvals");
	await expect(page.getByRole("tab", { name: "Pending (3)" })).toBeVisible();
	const card = page.getByTestId("pending-change").filter({ hasText: "Brain Super Food" });
	await expect(card.getByText("₦1,500")).toBeVisible();
	await expect(card.getByText("₦2,000")).toBeVisible();
	await card.getByRole("button", { name: "Reject", exact: true }).click();
	await expect(page.getByTestId("decision-summary")).toContainText('Reject changing "Brain Super Food"');
	await expect(page.getByRole("button", { name: "Confirm rejection" })).toBeDisabled();
	await page.getByPlaceholder("Tell the requester why").fill("Price is wrong");
	await page.getByRole("button", { name: "Confirm rejection" }).click();
	await expect.poll(() => posts.map((p) => p.path)).toContain("product-changes/c1/reject");

	await card.getByRole("button", { name: "Approve", exact: true }).click();
	await page.getByRole("button", { name: "Confirm approval" }).click();
	await expect.poll(() => posts.map((p) => p.path)).toContain("product-changes/c1/approve");
});

test("your own request can only be cancelled; a new product shows its pack sizes", async ({ page }) => {
	const posts = await mockApi(page);
	await page.goto("/admin/products/approvals");
	const mine = page.getByTestId("pending-change").filter({ hasText: "Mine Product" });
	await expect(mine.getByText("Waiting for someone else to approve")).toBeVisible();
	await expect(mine.getByRole("button", { name: "Approve", exact: true })).toHaveCount(0);
	await mine.getByRole("button", { name: "Cancel request" }).click();
	await expect.poll(() => posts.map((p) => p.path)).toContain("product-changes/c2/cancel");

	const created = page.getByTestId("pending-change").filter({ hasText: "Moringa Blend" });
	await expect(created.getByText("New product")).toBeVisible();
	await expect(created.getByTestId("change-variant")).toContainText("250 g");
});

test("the decided tab lists past decisions", async ({ page }) => {
	await mockApi(page);
	await page.goto("/admin/products/approvals");
	await page.getByRole("tab", { name: /Decided/ }).click();
	await expect(page.getByText("Old Product")).toBeVisible();
	await expect(page.getByText("Approved", { exact: true })).toBeVisible();
});

test("the product page shows the pending banner and disables Edit", async ({ page }) => {
	await mockApi(page, { pendingForItem: true });
	await page.goto("/admin/product/item1");
	await expect(page.getByText("Pending approval").first()).toBeVisible();
	await expect(page.getByTestId("pending-change")).toBeVisible();
	const edit = page.getByRole("button", { name: "Edit", exact: true });
	await expect(edit).toBeDisabled();
	await expect(edit).toHaveAttribute("title", "A change is waiting for approval");
});

test("editing a product sends the note and handles the 202", async ({ page }) => {
	const posts = await mockApi(page);
	await page.goto("/admin/product/item1?edit=1");
	await page.getByPlaceholder("Why are you changing this?").fill("Supplier raised prices");
	await page.getByRole("button", { name: "Submit for approval" }).click();
	await expect.poll(() => posts.find((p) => p.path === "items/item1")?.body).toMatchObject({ note: "Supplier raised prices" });
	await expect(page.getByText("Sent for approval").first()).toBeVisible();
});

test("the approvals page does not scroll sideways on a phone", async ({ page }) => {
	await mockApi(page);
	await page.setViewportSize({ width: 390, height: 844 });
	await page.goto("/admin/products/approvals");
	await expect(page.getByTestId("pending-change").first()).toBeVisible();
	expect(await overflowsHorizontally(page)).toBe(false);
	expect(await offendingElements(page)).toEqual([]);
	await page.setViewportSize({ width: 820, height: 1000 });
	expect(await overflowsHorizontally(page)).toBe(false);
});
