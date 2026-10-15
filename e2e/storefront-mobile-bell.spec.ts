import { test, expect } from "@playwright/test";
import { signInAsCustomer } from "./_helpers";

/**
 * A customer's payment-notification bell must be on the top bar at every phone and small-tablet width,
 * not only from the md breakpoint up (it used to be hidden below 768px, so phones never saw it).
 */
const ok = (data: unknown) => ({ status: 200, contentType: "application/json", body: JSON.stringify({ message: "ok", data }) });
const WIDTHS = [280, 320, 360, 375, 390, 412, 430, 480, 540, 600, 640, 700, 767];

test.beforeEach(async ({ context, baseURL, page }) => {
	await signInAsCustomer(context, baseURL!);
	await page.route("**/api/v1/**", (route) => {
		const url = route.request().url();
		if (url.includes("order/my-orders") && !url.includes("/cancel")) {
			return route.fulfill(ok({ items: [{ id: "o1", orderReference: "O-NG-1", totalAmount: 12000, orderStatus: "PENDING", paymentStatus: "AWAITING_PAYMENT", createdAt: new Date().toISOString() }, { id: "o2", orderReference: "O-NG-2", totalAmount: 8000, orderStatus: "PENDING", paymentStatus: "AWAITING_PAYMENT", createdAt: new Date().toISOString() }], meta: {} }));
		}
		return route.fulfill(ok([]));
	});
});

for (const width of WIDTHS) {
	test(`${width}px: the bell shows with its count, fits beside the menu button, and opens a full-screen drawer`, async ({ page }) => {
		await page.setViewportSize({ width, height: 800 });
		await page.goto("/products");
		const bell = page.getByRole("button", { name: "Payment notifications" });
		await expect(bell).toBeVisible();
		await expect(bell).toContainText("2"); // two orders awaiting payment

		const box = (await bell.boundingBox())!;
		const menu = (await page.getByRole("button", { name: "Toggle mobile menu" }).boundingBox())!;
		expect(box.x).toBeGreaterThanOrEqual(0);
		expect(box.x + box.width).toBeLessThanOrEqual(width);
		expect(box.x + box.width, "bell must not overlap the menu button").toBeLessThanOrEqual(menu.x + 1);
		const tappable = await bell.evaluate((b) => {
			const r = b.getBoundingClientRect();
			const top = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
			return top === b || b.contains(top);
		});
		expect(tappable, "something covers the bell").toBe(true);

		await bell.click();
		const drawer = page.getByRole("heading", { name: "Awaiting Payment" }).locator("xpath=ancestor::div[contains(@class,'fixed')][1]");
		await expect(drawer).toBeVisible();
		const d = (await drawer.boundingBox())!;
		expect(d.width, "drawer fills the screen width on a phone").toBeGreaterThanOrEqual(width - 1);
		expect(d.height, "drawer fills the screen height on a phone").toBeGreaterThanOrEqual(700);
		await expect(page.getByText("Order #O-NG-1")).toBeVisible();

		await drawer.getByRole("button").first().click(); // the close (X) button
		await expect(drawer).toBeHidden();
	});
}

test("desktop keeps the dropdown: anchored under the bell, not full-screen", async ({ page }) => {
	await page.setViewportSize({ width: 1280, height: 800 });
	await page.goto("/products");
	await page.getByRole("button", { name: "Payment notifications" }).click();
	const drawer = page.getByRole("heading", { name: "Awaiting Payment" }).locator("xpath=ancestor::div[contains(@class,'absolute')][1]");
	await expect(drawer).toBeVisible();
	const d = (await drawer.boundingBox())!;
	expect(d.width).toBeLessThan(500);
	expect(d.height).toBeLessThan(700);
});

test("a tap inside the phone drawer does not close it (it lives outside the header, so outside-click must ignore it)", async ({ page }) => {
	await page.setViewportSize({ width: 390, height: 800 });
	await page.goto("/products");
	await page.getByRole("button", { name: "Payment notifications" }).click();
	await expect(page.getByText("Order #O-NG-1")).toBeVisible();
	await page.getByText("Order #O-NG-1").click();
	await page.getByRole("heading", { name: "Awaiting Payment" }).click();
	await expect(page.getByText("Order #O-NG-2")).toBeVisible();
	await page.screenshot({ path: "test-results/storefront-bell-drawer-390.png" });
});
