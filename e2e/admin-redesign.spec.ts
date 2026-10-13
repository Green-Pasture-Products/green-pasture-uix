import { test, expect, type Page } from "@playwright/test";
import { PHONE, signInAsAdmin } from "./_helpers";

/**
 * The admin redesign and its new features, backend-free: the API is mocked at the
 * network layer (one handler, dispatched on path). Sockets simply never connect,
 * which is fine — these tests cover rendering and REST behaviour.
 */

const ORDER_ID = "0192a3b4-c5d6-7e8f-9a0b-1c2d3e4f5a6b";
const ok = (data: unknown) => ({ status: 200, contentType: "application/json", body: JSON.stringify({ message: "ok", data }) });

const event = (n: number, extra: Record<string, unknown> = {}) => ({
	id: `evt-${n}`,
	occurredAt: new Date(Date.now() - n * 60_000).toISOString(),
	action: "UPDATE",
	actorId: "u1",
	actorName: "Ada Obi",
	entityType: "Order",
	entityId: ORDER_ID,
	summary: `Ada Obi updated order O-NG-REF1 (${n})`,
	changes: { orderStatus: ["PENDING", "PROCESSING"] },
	...extra,
});

const note = (id: string, title: string, over: Record<string, unknown> = {}) => ({
	id,
	title,
	message: `${title} message`,
	type: "ORDER_PLACED",
	isRead: false,
	metadata: null,
	createdAt: new Date().toISOString(),
	...over,
});

interface Calls {
	patches: string[];
	announcementPages: number[];
}

async function mockApi(page: Page): Promise<Calls> {
	const calls: Calls = { patches: [], announcementPages: [] };
	await page.route("**/api/v1/**", async (route) => {
		const req = route.request();
		const url = new URL(req.url());
		const path = url.pathname.replace(/^.*\/api\/v1\//, "");
		const q = url.searchParams;

		if (req.method() === "PATCH") {
			calls.patches.push(path);
			return route.fulfill(ok(null));
		}
		if (path === "notifications/summary") return route.fulfill(ok({ primaryUnread: 2, otherUnread: 1, unreadCount: 3, cleared: 1 }));
		if (path === "notifications/inbox") {
			const view = q.get("view");
			const items =
				view === "primary" ? [note("n1", "New order placed"), note("n2", "Payment received", { type: "PAYMENT_SUCCESS" })] : view === "other" ? [note("n3", "Low stock: Moringa", { type: "LOW_STOCK" })] : [note("n4", "Old cleared alert", { isRead: true })];
			return route.fulfill(ok({ items, meta: { page: 1, limit: 30, total: items.length, totalPages: 1 } }));
		}
		if (path === "notifications") return route.fulfill(ok({ notifications: [], unreadCount: 0 }));
		if (path.startsWith("activity/record/")) return route.fulfill(ok({ items: [event(1), event(2, { entityType: "Payment", summary: "Ada Obi created payment PENDING", action: "CREATE", changes: null })], meta: { page: 1, limit: 30, total: 2, totalPages: 1 } }));
		if (path === "announcements") {
			const pageNo = Number(q.get("page") ?? 1);
			calls.announcementPages.push(pageNo);
			const size = Number(q.get("limit") ?? 10);
			const items = Array.from({ length: Math.min(size, 45 - (pageNo - 1) * size) }, (_, i) => ({
				id: `a${pageNo}-${i}`,
				title: `Announcement ${(pageNo - 1) * size + i + 1}`,
				message: "Body",
				audience: "ALL",
				isActive: true,
				expiresAt: null,
				createdByName: "Ada Obi",
				createdAt: new Date().toISOString(),
			}));
			return route.fulfill(ok({ items, meta: { page: pageNo, limit: size, total: 45, totalPages: Math.ceil(45 / size) } }));
		}
		if (/^products\/[0-9a-f-]{8,}$/.test(path))
			return route.fulfill(ok({ id: "cat-1", name: "Flours", description: "<p>Stone-ground flours</p>", status: "A", createdAt: new Date().toISOString(), createdBy: "Ada Obi", updatedAt: new Date().toISOString() }));
		if (/^tags\/[0-9a-f-]{8,}$/.test(path))
			return route.fulfill(ok({ id: "tag-1", name: "Children", slug: "children", description: "<p>Safe for children</p>", status: "A", createdAt: new Date().toISOString(), createdBy: "Ada Obi", updatedAt: new Date().toISOString() }));
		if (/^announcements\/[0-9a-f-]{8,}$/.test(path))
			return route.fulfill(ok({ id: "ann-1", title: "Harvest sale", message: "Fresh stock this weekend", audience: "CUSTOMERS", isActive: true, expiresAt: null, createdByName: "Ada Obi", createdAt: new Date().toISOString() }));
		if (path.startsWith("order/admin/ref/"))
			return route.fulfill(
				ok({
					id: ORDER_ID,
					orderReference: "O-NG-REF1",
					orderStatus: "PENDING",
					totalAmount: 10750,
					createdAt: new Date().toISOString(),
					customer: { profile: { firstName: "E2e", lastName: "Customer", email: "c@example.test" } },
					items: [],
					payments: [],
				}),
			);
		return route.fulfill(ok([]));
	});
	return calls;
}

test.beforeEach(async ({ context, baseURL }) => {
	await signInAsAdmin(context, baseURL!);
});

test.describe("shell", () => {
	test("the user menu shows who you are, switches theme and offers log out", async ({ page }) => {
		await mockApi(page);
		await page.goto("/admin/inbox");
		await page.getByRole("button", { name: /E2e Admin/i }).first().click();
		const menu = page.getByRole("menu", { name: "Account menu" });
		await expect(menu).toBeVisible();
		await expect(menu.getByText("e2e.admin@greenpasture.test")).toBeVisible();
		await expect(menu.getByRole("menuitem", { name: /Account Settings/ })).toBeVisible();
		await expect(menu.getByRole("menuitem", { name: /Password & Security/ })).toBeVisible();
		await expect(menu.getByRole("menuitem", { name: /Log out/ })).toBeVisible();

		await menu.getByRole("radio", { name: "Dark" }).click();
		await expect(page.locator("html")).toHaveClass(/dark/);
		await expect(menu.getByRole("radio", { name: "Dark" })).toHaveAttribute("aria-checked", "true");
		await menu.getByRole("radio", { name: "Light" }).click();
		await expect(page.locator("html")).not.toHaveClass(/dark/);
	});

	test("the admin look is scoped to the admin shell", async ({ page }) => {
		await mockApi(page);
		await page.goto("/admin/inbox");
		await expect(page.locator("html")).toHaveClass(/admin-ui/);
	});

	test("dark mode surfaces are neutral, not green-tinted", async ({ page, context }) => {
		await context.addInitScript(() => localStorage.setItem("gp-theme", "dark"));
		await mockApi(page);
		await page.goto("/admin/inbox");
		await expect(page.locator("html")).toHaveClass(/dark/);
		await expect(page.locator("html")).toHaveClass(/admin-ui/); // the admin tokens apply once the shell has mounted
		const channels = await page.evaluate(() => {
			const read = (el: Element) => (getComputedStyle(el).backgroundColor.match(/\d+(\.\d+)?/g) ?? []).slice(0, 3).map(Number);
			const probe = (cls: string) => {
				const el = document.createElement("div");
				el.className = cls;
				document.body.appendChild(el);
				const c = read(el);
				el.remove();
				return c;
			};
			return { page: probe("bg-background"), card: probe("bg-card"), muted: probe("bg-muted"), sidebar: probe("bg-sidebar") };
		});
		for (const [name, [r, g, b]] of Object.entries(channels)) {
			// A neutral grey has its channels within a few steps of each other; a green cast pushes g well above r and b.
			expect(Math.max(r, g, b) - Math.min(r, g, b), `${name} surface has a colour cast`).toBeLessThanOrEqual(6);
		}
	});

	test("Ctrl+K opens Jump to, filters by name and Enter opens the page", async ({ page }) => {
		await mockApi(page);
		await page.goto("/admin/inbox");
		await page.waitForLoadState("networkidle");
		await page.keyboard.press("Control+k");
		const dialog = page.getByRole("dialog", { name: "Jump to" });
		await expect(dialog).toBeVisible();
		await dialog.getByRole("textbox").fill("annou");
		await expect(dialog.getByRole("option")).toHaveCount(1);
		await page.keyboard.press("Enter");
		await expect(page).toHaveURL(/\/admin\/announcements/, { timeout: 30_000 });
	});

	test("the mobile bottom nav appears on a phone, with More opening the full menu", async ({ page }) => {
		await mockApi(page);
		await page.setViewportSize(PHONE);
		await page.goto("/admin/inbox");
		const nav = page.getByTestId("mobile-bottom-nav");
		await expect(nav).toBeVisible();
		await expect(nav.getByRole("link", { name: /Inbox/ })).toHaveAttribute("aria-current", "page");
		await nav.getByRole("button", { name: "More pages" }).click();
		await expect(page.locator('[data-sidebar="sidebar"][data-mobile="true"]')).toBeVisible();
	});

	test("the mobile bottom nav is hidden on desktop", async ({ page }) => {
		await mockApi(page);
		await page.setViewportSize({ width: 1280, height: 800 });
		await page.goto("/admin/inbox");
		await expect(page.getByTestId("mobile-bottom-nav")).toBeHidden();
	});
});

test.describe("inbox", () => {
	test("shows Primary, Other and Cleared tabs with unread counts", async ({ page }) => {
		await mockApi(page);
		await page.goto("/admin/inbox");
		const tabs = page.getByRole("tablist");
		await expect(tabs.getByRole("tab", { name: /Primary/ })).toContainText("2 unread");
		await expect(tabs.getByRole("tab", { name: /Other/ })).toContainText("1 unread");
		await expect(page.getByText("New order placed", { exact: true })).toBeVisible();

		await tabs.getByRole("tab", { name: /Other/ }).click();
		await expect(page.getByText("Low stock: Moringa", { exact: true })).toBeVisible();
		await expect(page.getByText("New order placed", { exact: true })).toHaveCount(0);

		await tabs.getByRole("tab", { name: /Cleared/ }).click();
		await expect(page.getByText("Old cleared alert", { exact: true })).toBeVisible();
	});

	test("clearing an item and restoring it call the API", async ({ page }) => {
		const calls = await mockApi(page);
		await page.goto("/admin/inbox");
		const row = page.getByRole("listitem").filter({ hasText: "New order placed" });
		await row.hover();
		await row.getByRole("button", { name: "Clear" }).click();
		await expect.poll(() => calls.patches).toContain("notifications/n1/clear");

		await page.getByRole("tab", { name: /Cleared/ }).click();
		const cleared = page.getByRole("listitem").filter({ hasText: "Old cleared alert" });
		await cleared.hover();
		await cleared.getByRole("button", { name: "Restore" }).click();
		await expect.poll(() => calls.patches).toContain("notifications/n4/restore");
	});
});

test.describe("data table", () => {
	test("has an in-card footer with entry counts, page numbers and server paging", async ({ page }) => {
		const calls = await mockApi(page);
		await page.goto("/admin/announcements?pageSize=10");
		await expect(page.getByText("Announcement 1", { exact: true })).toBeVisible();
		const footer = page.getByTestId("data-table-count");
		await expect(footer).toContainText("Showing 1 to 10 of 45 entries");
		await expect(page.getByRole("button", { name: "Page 1" })).toHaveAttribute("aria-current", "page");
		await page.getByRole("button", { name: "Page 3" }).click();
		await expect.poll(() => calls.announcementPages).toContain(3);
	});
});

test.describe("data table columns", () => {
	test("the Action column is always the last one, after the audit columns", async ({ page }) => {
		await page.route("**/api/v1/**", (route) => {
			const path = new URL(route.request().url()).pathname.replace(/^.*\/api\/v1\//, "");
			if (path === "products") return route.fulfill(ok({ items: [{ id: "0192a3b4-c5d6-7e8f-9a0b-1c2d3e4f5a01", name: "Flours", description: "x", status: "A", createdBy: "Ada", updatedAt: new Date().toISOString() }], meta: { totalItems: 1, itemCount: 1, itemsPerPage: 10, totalPages: 1, currentPage: 1 } }));
			return route.fulfill(ok([]));
		});
		await page.setViewportSize({ width: 1440, height: 900 });
		await page.goto("/admin/categories");
		await expect(page.getByText("Flours", { exact: true })).toBeVisible();
		const headers = await page.getByTestId("data-table").locator("thead th").allInnerTexts();
		expect(headers.at(-1)?.trim()).toBe("Action");
		expect(headers.some((h) => /Created By/.test(h))).toBe(true); // audit columns are present, and come before Action
		expect(headers.findIndex((h) => /Created By/.test(h))).toBeLessThan(headers.length - 1);
	});
});

test.describe("announcements form", () => {
	test("is a page, with rich text, and its date picker and select open", async ({ page }) => {
		await mockApi(page);
		await page.goto("/admin/announcements");
		await page.getByRole("button", { name: /new announcement/i }).click();
		// Forms are pages, not modals.
		await expect(page).toHaveURL(/\/admin\/announcements\/new$/);
		await expect(page.getByRole("dialog")).toHaveCount(0);
		const form = page.getByRole("form", { name: "New announcement" });
		// The message is rich text (toolbar + editable area), not a plain textarea.
		await expect(form.locator("textarea")).toHaveCount(0);
		await expect(form.locator('[contenteditable="true"]')).toBeVisible();
		await expect(form.getByRole("button", { name: /bold/i }).or(form.locator('button[title*="Bold" i]')).first()).toBeVisible();

		await page.getByLabel("Auto-hide after").click();
		const calendarTitle = page.getByText(/^(January|February|March|April|May|June|July|August|September|October|November|December)$/).first();
		await expect(calendarTitle).toBeVisible();
		// The calendar must be the topmost thing at its own position.
		const covered = await calendarTitle.evaluate((el) => {
			const r = el.getBoundingClientRect();
			const top = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
			return !(top === el || el.contains(top) || top?.contains(el));
		});
		expect(covered, "calendar is covered by another layer").toBe(false);
		await page.keyboard.press("Escape");

		await page.getByRole("combobox", { name: "Send to" }).click();
		const option = page.getByRole("option", { name: "Customers" });
		await expect(option).toBeVisible();
		const optionCovered = await option.evaluate((el) => {
			const r = el.getBoundingClientRect();
			const top = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
			return !(top === el || el.contains(top) || top?.contains(el));
		});
		expect(optionCovered, "select option is covered by another layer").toBe(false);
		await option.click();
		await expect(page.getByRole("combobox", { name: "Send to" })).toContainText("Customers");
	});
});

test.describe("record activity panel", () => {
	test("docks beside the content on desktop, collapses to a rail and remembers it", async ({ page }) => {
		await mockApi(page);
		await page.setViewportSize({ width: 1440, height: 900 });
		await page.goto("/admin/order/O-NG-REF1");
		const panel = page.getByTestId("record-activity-panel");
		await expect(panel).toBeVisible();
		await expect(panel.getByText(/updated order O-NG-REF1/)).toBeVisible();
		await expect(panel.getByText("Payment", { exact: true })).toBeVisible(); // child record is labelled
		const widthVar = () => page.evaluate(() => document.documentElement.style.getPropertyValue("--record-panel-w"));
		expect(await widthVar()).toBe("400px");

		await page.getByTestId("record-activity-collapse").click();
		await expect(page.getByTestId("record-activity-expand")).toBeVisible();
		expect(await widthVar()).toBe("48px");

		await page.reload();
		await expect(page.getByTestId("record-activity-expand")).toBeVisible();
		await page.getByTestId("record-activity-expand").click();
		await expect(panel.getByText(/updated order O-NG-REF1/)).toBeVisible();
	});

	test("is an overlay drawer on narrow screens", async ({ page }) => {
		await mockApi(page);
		await page.setViewportSize({ width: 820, height: 900 });
		await page.goto("/admin/order/O-NG-REF1");
		const toggle = page.getByTestId("record-activity-toggle");
		await expect(toggle).toBeVisible();
		await toggle.click();
		await expect(page.getByRole("complementary", { name: "Record activity" }).getByText(/updated order O-NG-REF1/)).toBeVisible();
		await page.keyboard.press("Escape");
	});
});

test.describe("native selects are gone from admin forms", () => {
	test("the order status control is the styled select", async ({ page }) => {
		await mockApi(page);
		await page.setViewportSize({ width: 1440, height: 900 });
		await page.goto("/admin/order/O-NG-REF1");
		await expect(page.locator("select")).toHaveCount(0);
		await page.getByRole("combobox", { name: "New order status" }).click();
		await page.getByRole("option", { name: "Processing" }).click();
		await expect(page.getByRole("combobox", { name: "New order status" })).toContainText("Processing");
	});
});

test.describe("navigation", () => {
	test("Activity is a panel on record pages, not a sidebar entry", async ({ page }) => {
		await mockApi(page);
		await page.goto("/admin/inbox");
		await expect(page.getByTestId("app-sidebar").getByRole("link", { name: "Activity" })).toHaveCount(0);
		await page.waitForLoadState("networkidle");
		await page.keyboard.press("Control+k");
		await page.getByRole("dialog", { name: "Jump to" }).getByRole("textbox").fill("activity");
		await expect(page.getByText("No matching pages")).toBeVisible();
	});
});

test.describe("record pages instead of modals", () => {
	test("a category opens as a page with details, status, actions and in-place edit", async ({ page }) => {
		await mockApi(page);
		await page.setViewportSize({ width: 1440, height: 900 });
		await page.goto("/admin/category/0192a3b4-c5d6-7e8f-9a0b-1c2d3e4f5a01");
		await expect(page.getByRole("heading", { level: 1, name: "Flours" })).toBeVisible();
		await expect(page.getByRole("dialog")).toHaveCount(0);
		await expect(page.getByText("Active", { exact: true })).toBeVisible();
		await expect(page.getByRole("group", { name: "Overview" })).toBeVisible();
		await expect(page.getByText("Stone-ground flours")).toBeVisible();
		await page.getByRole("button", { name: "Edit" }).click();
		await expect(page.getByRole("form", { name: "Edit category" })).toBeVisible();
		await expect(page.getByRole("button", { name: "Save changes" })).toBeDisabled(); // nothing changed yet
		await page.getByRole("button", { name: "Cancel" }).click();
		await expect(page.getByText("Stone-ground flours")).toBeVisible();
	});

	test("the categories list opens the record page, not a modal", async ({ page }) => {
		await page.route("**/api/v1/**", (route) => {
			const path = new URL(route.request().url()).pathname.replace(/^.*\/api\/v1\//, "");
			if (path === "products") return route.fulfill(ok({ items: [{ id: "0192a3b4-c5d6-7e8f-9a0b-1c2d3e4f5a01", name: "Flours", description: "x", status: "A" }], meta: { totalItems: 1, itemCount: 1, itemsPerPage: 10, totalPages: 1, currentPage: 1 } }));
			return route.fulfill(ok([]));
		});
		await page.goto("/admin/categories");
		await page.getByText("Flours", { exact: true }).click();
		await expect(page).toHaveURL(/\/admin\/category\/0192a3b4/);
		await expect(page.getByRole("dialog")).toHaveCount(0);
	});

	test("a tag opens as a page showing its slug", async ({ page }) => {
		await mockApi(page);
		await page.goto("/admin/tag/0192a3b4-c5d6-7e8f-9a0b-1c2d3e4f5a02");
		await expect(page.getByRole("heading", { level: 1, name: "Children" })).toBeVisible();
		await expect(page.getByText("children", { exact: true })).toBeVisible();
		await expect(page.getByRole("dialog")).toHaveCount(0);
	});

	test("an announcement opens as a page and edits in place", async ({ page }) => {
		await mockApi(page);
		await page.goto("/admin/announcement/0192a3b4-c5d6-7e8f-9a0b-1c2d3e4f5a03?edit=1");
		await expect(page.getByRole("heading", { level: 1, name: "Harvest sale" })).toBeVisible();
		await expect(page.getByRole("form", { name: "Edit announcement" })).toBeVisible(); // ?edit=1 deep link
		await expect(page.getByRole("dialog")).toHaveCount(0);
	});
});

test.describe("settings layout", () => {
	test("a header and flat panel nav sit beside the panel; My Profile has Appearance", async ({ page }) => {
		await mockApi(page);
		await page.goto("/admin/settings?tab=profile");
		await expect(page.locator("h1:not([data-testid=page-title])", { hasText: "Settings" })).toBeVisible();
		const nav = page.getByRole("navigation", { name: "Settings" });
		await expect(nav.getByRole("button", { name: "My Profile" })).toHaveAttribute("aria-current", "page");
		await expect(page.getByRole("heading", { name: "Appearance" })).toBeVisible();
		await page.getByRole("radio", { name: "Dark" }).click();
		await expect(page.locator("html")).toHaveClass(/dark/);
		await page.evaluate(() => document.querySelectorAll("*").forEach((e) => ((e as HTMLElement).scrollTop = 0)));
		await page.waitForTimeout(800);
		await page.screenshot({ path: "test-results/settings-layout.png" });
	});
});

test.describe("forms are pages, tables lead with View and Edit", () => {
	for (const [list, newPath, button] of [
		["/admin/categories", "/admin/categories/new", /add category/i],
		["/admin/tags", "/admin/tags/new", /add tag/i],
		["/admin/invitations", "/admin/invitations/new", /invite staff/i],
		["/admin/reviews", "/admin/reviews/new", /add testimonial/i],
	] as const) {
		test(`${list}: the create button opens ${newPath}, not a dialog`, async ({ page }) => {
			await mockApi(page);
			await page.goto(list);
			await page.getByRole("button", { name: button }).click();
			await expect(page).toHaveURL(new RegExp(`${newPath}$`));
			await expect(page.getByRole("dialog")).toHaveCount(0);
		});
	}

	test("the manual payments page is in the sidebar", async ({ page }) => {
		await mockApi(page);
		await page.goto("/admin/inbox");
		await expect(page.getByRole("link", { name: "Manual Payments" })).toBeVisible();
	});

	test("manual payment settings sits inside the Settings layout", async ({ page }) => {
		await mockApi(page);
		await page.goto("/admin/settings/manual-payments");
		await expect(page.locator("h1:not([data-testid=page-title])", { hasText: "Settings" })).toBeVisible();
		await expect(page.getByRole("navigation", { name: "Settings" }).getByRole("link", { name: "Manual Payment Settings" })).toHaveAttribute("aria-current", "page");
	});
});

test.describe("record activity comments", () => {
	test("Enter sends a comment, Shift+Enter adds a line", async ({ page }) => {
		const posted: string[] = [];
		await mockApi(page);
		await page.route("**/api/v1/activity/record/**/comments", async (route) => {
			posted.push(route.request().postDataJSON().body);
			await route.fulfill(ok({ id: "c1", action: "COMMENT", actorName: "E2e Admin", entityType: "Role", entityId: "x", summary: "E2e Admin commented", occurredAt: new Date().toISOString(), changes: null, metadata: { body: "first" } }));
		});
		await page.setViewportSize({ width: 1440, height: 900 });
		await page.goto("/admin/category/0192a3b4-c5d6-7e8f-9a0b-1c2d3e4f5a01");
		const box = page.getByTestId("record-comment-input");
		await box.fill("first");
		await box.press("Shift+Enter");
		await box.type("second");
		expect(posted).toHaveLength(0);
		await box.press("Enter");
		await expect.poll(() => posted.length).toBe(1);
		expect(posted[0]).toBe("first\nsecond");
	});
});
