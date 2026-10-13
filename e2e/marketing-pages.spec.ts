import { test, expect } from "@playwright/test";

/**
 * Regression cover for the home / about / contact revamp.
 *
 * These assert structure and reachability rather than pixels — the point is
 * that the hero, timeline and cards actually render and stay reachable, not
 * that they look identical forever.
 */

test.describe("home", () => {
	test.beforeEach(async ({ page }) => await page.goto("/"));

	test("leads with the botanical hero and its headline", async ({ page }) => {
		await expect(page.getByRole("heading", { level: 1 })).toContainText("Wellness that");
		await expect(page.getByRole("img", { name: /family sharing an Exotic Green Smoothie/i })).toBeVisible();
	});

	test("shows the provenance figures", async ({ page }) => {
		for (const label of ["Certified organic", "Partner farms", "Farm to dispatch"]) {
			await expect(page.getByText(label, { exact: true }).first()).toBeVisible();
		}
	});

	// The "Soil to shelf" timeline section is commented out in pages/index.tsx; restore this with it.
	test.fixme("renders the full soil-to-shelf timeline", async ({ page }) => {
		const stages = page.getByText(/^Stage 0\d$/);
		await expect(stages).toHaveCount(5);

		await page.getByText("At your door").scrollIntoViewIfNeeded();
		await expect(page.getByText("At your door")).toBeVisible();
	});

	test("the hero call to action opens the catalogue", async ({ page }) => {
		const cta = page.getByRole("link", { name: /view our catalogue/i }).first();
		await expect(cta).toHaveAttribute("href", "/products");
		await cta.click();
		await expect(page).toHaveURL(/\/products$/);
	});
});

test.describe("about", () => {
	test.beforeEach(async ({ page }) => await page.goto("/about"));

	test("states the positioning in the headline", async ({ page }) => {
		await expect(page.getByRole("heading", { level: 1 })).toContainText("traceable");
	});

	test("lists the three values", async ({ page }) => {
		for (const v of ["Sustainability", "Wellness", "Integrity"]) {
			await expect(page.getByRole("heading", { name: v })).toBeVisible();
		}
	});

	test("walks the story timeline to the present", async ({ page }) => {
		await expect(page.locator("ol").getByText("2019")).toBeVisible();

		const today = page.getByText("Thousands of health journeys");
		await today.scrollIntoViewIfNeeded();
		await expect(today).toBeVisible();
	});
});

test.describe("contact", () => {
	test.beforeEach(async ({ page }) => await page.goto("/contact"));

	test("keeps the enquiry form intact and submittable", async ({ page }) => {
		await page.getByPlaceholder("Type your full name").fill("Ada Obi");
		await page.getByPlaceholder("your@email.com").fill("ada@example.com");
		await page.getByPlaceholder("What is this about?").fill("Dosage question");
		await page.getByPlaceholder("Tell us more…").fill("Which preparation suits immunity support?");

		const submit = page.getByRole("button", { name: /send message/i });
		await expect(submit).toBeEnabled();
		await submit.click();
		// Client-side handler only — the form must survive submit, not navigate away.
		await expect(page).toHaveURL(/\/contact$/);
	});

	test("surfaces every contact channel", async ({ page }) => {
		for (const label of ["Phone", "Email", "Office"]) {
			await expect(page.getByText(label, { exact: true }).first()).toBeVisible();
		}
	});

	test("answers the three common questions", async ({ page }) => {
		await expect(page.getByRole("heading", { name: /where is my order/i })).toBeVisible();
		await expect(page.getByRole("heading", { name: /which product is right/i })).toBeVisible();
		await expect(page.getByRole("heading", { name: /how fresh is it/i })).toBeVisible();
	});
});

test.describe("accessibility basics", () => {
	for (const path of ["/", "/about", "/contact"]) {
		test(`${path} has exactly one h1 and no horizontal overflow`, async ({ page }) => {
			await page.goto(path);
			await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);

			const overflows = await page.evaluate(
				() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
			);
			expect(overflows).toBe(false);
		});
	}
});
