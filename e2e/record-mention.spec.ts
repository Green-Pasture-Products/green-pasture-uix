import { test, expect } from "@playwright/test";
import { signInAsAdmin } from "./_helpers";

const ok = (data: unknown) => ({ status: 200, contentType: "application/json", body: JSON.stringify({ message: "ok", data }) });
const NOW = new Date().toISOString();
const FLAG = {
	id: "f3", key: "auth.signup", name: "Signup", description: "", module: "auth", enabled: true, rolloutPercentage: 100, targetRoles: [], targetAccountIds: [],
	system: false, createdAt: NOW, updatedAt: NOW, pendingChange: null, effective: true, history: [],
};

test.describe("@mention in the record comment box", () => {
	test.beforeEach(async ({ context, baseURL, page }) => {
		await signInAsAdmin(context, baseURL!);
		await page.route("**/api/v1/**", (route) => {
			const path = new URL(route.request().url()).pathname.replace(/^.*\/api\/v1\//, "");
			if (path === "feature-flags/evaluate") return route.fulfill(ok({}));
			if (path === "feature-flags/admin/f3") return route.fulfill(ok(FLAG));
			if (path.endsWith("/mentionable")) return route.fulfill(ok([{ id: "u1", name: "Dimeji Daniel" }, { id: "u2", name: "Victor Chidi" }]));
			if (path.includes("activity")) return route.fulfill(ok({ items: [], meta: {} }));
			return route.fulfill(ok([]));
		});
		await page.setViewportSize({ width: 1600, height: 900 });
		await page.goto("/admin/feature-flag/f3");
	});

	test("typing @ lists people, and picking one inserts the name", async ({ page }) => {
		const box = page.getByPlaceholder("Comment, or type @ to mention someone");
		await box.click();
		await box.pressSequentially("Welcome onboard! @");
		const list = page.getByRole("listbox", { name: "People to mention" });
		await expect(list).toBeVisible();
		await expect(list.getByRole("option")).toHaveCount(2);
		await list.getByRole("option", { name: /Dimeji Daniel/ }).click();
		await expect(box).toHaveValue("Welcome onboard! @Dimeji Daniel ");
	});
});
