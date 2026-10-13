import { test, expect, type Page } from "@playwright/test";
import { signInAsAdmin } from "./_helpers";

/** Dashboard widget board, needs-attention tiles and the analytics heatmap, with the API mocked. */

const ok = (data: unknown) => ({ status: 200, contentType: "application/json", body: JSON.stringify({ message: "ok", data }) });
const day = (back: number) => new Date(Date.now() - back * 86_400_000).toISOString().slice(0, 10);

const ANALYTICS = {
	overview: { totalRevenue: 43000, totalOrders: 22, ordersToday: 3, totalCustomers: 2, totalItems: 3, averageOrderValue: 10800, totalProducts: 2 },
	orderStatusDistribution: [
		{ status: "PENDING", count: 4 },
		{ status: "DELIVERED", count: 2 },
	],
	paymentStatusDistribution: [
		{ status: "AWAITING_VERIFICATION", count: 2 },
		{ status: "INCOMPLETE_PAYMENT", count: 0 },
	],
	lowStockItems: [{ id: "i1", name: "Moringa", unit: 2 }],
	revenueTrend: [{ date: day(1), revenue: 12000 }],
	orderVolumeTrend: [{ date: day(1), count: 3 }],
	topSellingItems: [],
	recentOrders: [],
	recentCustomers: [],
	customerGrowth: [],
	revenueByCategory: [],
	ratingDistribution: [],
	stockLevels: [],
	orderHourlyDistribution: [],
	itemsPerOrderDistribution: [],
	stockMovementTrend: [],
	revenueByDayOfWeek: [],
	reviewStats: { averageRating: 0, totalReviews: 0 },
};

async function mock(page: Page) {
	const requests: string[] = [];
	await page.route("**/api/v1/**", (route) => {
		const path = new URL(route.request().url()).pathname.replace(/^.*\/api\/v1\//, "");
		requests.push(path);
		if (path === "analytics/dashboard") return route.fulfill(ok(ANALYTICS));
		if (path === "analytics/activity") return route.fulfill(ok([{ date: day(0), count: 5 }, { date: day(1), count: 2 }, { date: day(3), count: 9 }]));
		if (path === "notifications/summary") return route.fulfill(ok({ primaryUnread: 0, otherUnread: 0, unreadCount: 0, cleared: 0 }));
		if (path === "notifications") return route.fulfill(ok({ notifications: [], unreadCount: 0 }));
		return route.fulfill(ok([]));
	});
	return requests;
}

test.beforeEach(async ({ context, baseURL }) => {
	await signInAsAdmin(context, baseURL!);
});

test.describe("dashboard", () => {
	test("shows needs-attention tiles with live counts that open the right list", async ({ page }) => {
		await mock(page);
		await page.setViewportSize({ width: 1440, height: 900 });
		await page.goto("/admin/dashboard");
		const tiles = page.getByTestId("needs-attention");
		await expect(tiles).toBeVisible();
		await expect(tiles.getByTestId("attention-pending-orders")).toContainText("4");
		await expect(tiles.getByTestId("attention-verify-payments")).toContainText("2");
		await expect(tiles.getByTestId("attention-low-stock")).toContainText("1");
		await expect(tiles).toContainText("open"); // header chip, e.g. "7 open"

		await tiles.getByTestId("attention-pending-orders").click();
		await expect(page).toHaveURL(/\/admin\/orders\?status=PENDING/, { timeout: 30_000 });
	});

	test("cards sit on a board that can be customised and reset", async ({ page }) => {
		await mock(page);
		await page.setViewportSize({ width: 1440, height: 900 });
		await page.goto("/admin/dashboard");
		const board = page.getByTestId("widget-board");
		await expect(board).toBeVisible();
		await expect(board.getByText("Revenue Trend")).toBeVisible();
		await expect(board.getByText("Order Status")).toBeVisible();

		await page.getByTestId("customize-layout").click();
		await expect(page.getByText(/Drag a card to move it/)).toBeVisible();
		await page.getByRole("button", { name: "Reset layout" }).click();
		await page.getByRole("button", { name: "Done" }).click();
		await expect(page.getByTestId("customize-layout")).toBeVisible();
	});
});

test.describe("analytics", () => {
	test("renders the order-activity calendar heatmap from the API's daily counts", async ({ page }) => {
		const requests = await mock(page);
		await page.setViewportSize({ width: 1440, height: 900 });
		await page.goto("/admin/analytics");
		await expect(page.getByText("Order Activity")).toBeVisible();
		const calendar = page.getByRole("group", { name: /Calendar of orders per day/ });
		await expect(calendar).toBeVisible();
		await expect(calendar.locator('[title$=": 9"]').first()).toBeVisible(); // the busiest day is plotted
		await expect(page.getByText("More orders")).toBeVisible();
		expect(requests).toContain("analytics/activity");
	});
});
