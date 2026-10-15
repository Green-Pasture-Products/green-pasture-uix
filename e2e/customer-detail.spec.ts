import { test, expect, type Page } from "@playwright/test";
import { signInAsAdmin, overflowsHorizontally, offendingElements } from "./_helpers";

const ok = (data: unknown) => ({ status: 200, contentType: "application/json", body: JSON.stringify({ message: "ok", data }) });
const NOW = new Date().toISOString();
const ID = "0192a3b4-c5d6-7e8f-9a0b-1c2d3e4f5a01";

const CUSTOMER = {
	id: ID, referrerCode: "GP-DAGWOM", status: "A", createdAt: "2026-09-21T10:00:00Z", updatedAt: NOW, createdBy: "SYSTEM", updatedBy: "Ayorinde Omosehin",
	wallet: { balance: 12500, currency: "NGN" },
	profile: { id: "p1", firstName: "Dagwom", lastName: "Markus", email: "philo4dboiz@gmail.com", phoneNumber: "+2347069077530", gender: "DEFAULT", address: { street: "12 Ahmadu Bello Way", city: "Jos", state: "Plateau", country: "Nigeria", postalCode: "930001" } },
};
const ORDERS = Array.from({ length: 6 }, (_, i) => ({ id: `o${i}`, orderReference: `O-NG-26101${i}-ABCDEF${i}`, orderStatus: i % 2 ? "DELIVERED" : "PENDING", totalAmount: 8000 + i * 1000, createdAt: NOW }));

async function mockApi(page: Page, orders = ORDERS) {
	await page.route("**/api/v1/**", async (route) => {
		const path = new URL(route.request().url()).pathname.replace(/^.*\/api\/v1\//, "");
		if (path === `customers/${ID}`) return route.fulfill(ok(CUSTOMER));
		if (path === "order") return route.fulfill(ok({ items: orders, meta: { totalItems: orders.length === 6 ? 31 : orders.length, itemCount: orders.length, itemsPerPage: 20, totalPages: 2, currentPage: 1 } }));
		if (path === "feature-flags/evaluate") return route.fulfill(ok({}));
		if (path.includes("activity")) return route.fulfill(ok({ items: [], meta: { page: 1, limit: 30, total: 0, totalPages: 1 } }));
		if (path.startsWith("notifications/summary")) return route.fulfill(ok({ primaryUnread: 0, otherUnread: 0, unreadCount: 0, cleared: 0 }));
		return route.fulfill(ok([]));
	});
}

test.beforeEach(async ({ context, baseURL }) => {
	await signInAsAdmin(context, baseURL!);
});

test("the customer page opens on Overview with the profile, address and latest orders", async ({ page }) => {
	await mockApi(page);
	await page.goto(`/admin/customer/${ID}`);
	await expect(page.getByRole("tab", { name: /Overview/ })).toHaveAttribute("aria-selected", "true");
	await expect(page.getByText("+234 706 907 7530")).toBeVisible();
	await expect(page.getByText("12 Ahmadu Bello Way")).toBeVisible();
	await expect(page.getByText("Latest orders")).toBeVisible();
	await expect(page.getByRole("tab", { name: /Orders/ })).toContainText("31");
});

test("switching tabs changes the panel and the URL, and a link opens the right tab", async ({ page }) => {
	await mockApi(page);
	await page.goto(`/admin/customer/${ID}`);
	await page.getByRole("tab", { name: /Orders/ }).click();
	await expect(page).toHaveURL(/tab=orders/);
	await expect(page.getByRole("tabpanel")).toContainText("Showing the latest 6 of 31");
	await page.getByRole("tab", { name: /Account/ }).click();
	await expect(page).toHaveURL(/tab=account/);
	await expect(page.getByRole("tabpanel")).toContainText("GP-DAGWOM");
	await expect(page.getByRole("tabpanel")).toContainText("Ayorinde Omosehin");
	await page.getByRole("tab", { name: /Overview/ }).click();
	await expect(page).not.toHaveURL(/tab=/);

	await page.goto(`/admin/customer/${ID}?tab=orders`);
	await expect(page.getByRole("tab", { name: /Orders/ })).toHaveAttribute("aria-selected", "true");
});

test("arrow keys, Home and End move between tabs", async ({ page }) => {
	await mockApi(page);
	await page.goto(`/admin/customer/${ID}`);
	await page.getByRole("tab", { name: /Overview/ }).focus();
	await page.keyboard.press("ArrowRight");
	await expect(page.getByRole("tab", { name: /Orders/ })).toHaveAttribute("aria-selected", "true");
	await page.keyboard.press("End");
	await expect(page.getByRole("tab", { name: /Account/ })).toHaveAttribute("aria-selected", "true");
	await page.keyboard.press("Home");
	await expect(page.getByRole("tab", { name: /Overview/ })).toHaveAttribute("aria-selected", "true");
});

test("an empty order list says so on both tabs", async ({ page }) => {
	await mockApi(page, []);
	await page.goto(`/admin/customer/${ID}?tab=orders`);
	await expect(page.getByRole("tabpanel")).toContainText("No orders yet.");
});

for (const [name, size] of [["phone", { width: 390, height: 844 }], ["tablet", { width: 820, height: 1180 }]] as const) {
	test(`no sideways scroll on a ${name}, on any tab`, async ({ page }) => {
		await mockApi(page);
		await page.setViewportSize(size);
		for (const tab of ["", "?tab=orders", "?tab=account"]) {
			await page.goto(`/admin/customer/${ID}${tab}`);
			await expect(page.getByRole("tablist")).toBeVisible();
			await page.waitForTimeout(500);
			expect(await overflowsHorizontally(page), `${name} ${tab || "overview"}`).toBe(false);
			expect(await offendingElements(page), `${name} ${tab || "overview"} elements`).toEqual([]);
		}
	});
}
