import { test, expect, type Page } from "@playwright/test";
import { signInAsAdmin, overflowsHorizontally } from "./_helpers";

const ok = (data: unknown, status = 200) => ({ status, contentType: "application/json", body: JSON.stringify({ message: "ok", data }) });
const NOW = new Date().toISOString();
const PID = "0192a3b4-c5d6-7e8f-9a0b-1c2d3e4f5c01";

const payment = (over: Record<string, unknown> = {}) => ({
	id: PID, orderId: "o1", amount: 86000, currency: "NGN", paymentMethod: "MANUAL_TRANSFER", paymentStatus: "AWAITING_VERIFICATION", customerPhone: "0700",
	receiptUrl: "https://example.com/r.png", adminNote: "", submittedAt: NOW, verifiedAt: "", declinedAt: "", createdAt: NOW, receipts: [],
	order: { id: "o1", orderReference: "O-NG-1", totalAmount: 86000, items: [], customer: { id: "c1", profile: { firstName: "Ada", lastName: "Obi", email: "ada@example.com" } } }, ...over,
});
const decision = (id: string, requestedById: string, over: Record<string, unknown> = {}) => ({
	id, paymentId: PID, orderId: "o1", orderReference: "O-NG-1", customerName: "Ada Obi", amount: 86000, currency: "NGN", decision: "DECLINE", changeStatus: "PENDING",
	payload: { reason: "AMOUNT_MISMATCH", explanation: "Short by 500" }, requestedById, requestedByName: requestedById === "1" ? "E2e Admin" : "Bola Ade", requestedAt: NOW,
	decidedById: null, decidedByName: null, decidedAt: null, decisionNote: null, ...over,
});

async function mockApi(page: Page, opts: { flag?: boolean; decisions?: unknown[]; paymentStatus?: number } = {}) {
	const posts: { path: string; body: any }[] = [];
	let decisions = opts.decisions ?? [];
	await page.route("**/api/v1/**", async (route) => {
		const req = route.request();
		const path = new URL(req.url()).pathname.replace(/^.*\/api\/v1\//, "");
		if (req.method() === "POST") {
			posts.push({ path, body: req.postDataJSON() });
			if (path.startsWith("payment/admin/")) {
				return opts.flag === false ? route.fulfill(ok(payment({ paymentStatus: "VERIFIED", verifiedAt: NOW }))) : route.fulfill(ok({ pending: true, decision: "APPROVE" }, 202));
			}
			decisions = [];
			return route.fulfill(ok({}));
		}
		if (path === "feature-flags/evaluate") return route.fulfill(ok({ "payments.maker_checker": opts.flag !== false }));
		if (path === "payment-decisions/summary") return route.fulfill(ok({ pending: decisions.length }));
		if (path === "payment-decisions") return route.fulfill(ok(decisions));
		if (path === `payment/admin/${PID}`) return route.fulfill(ok(payment()));
		if (path.includes("activity")) return route.fulfill(ok({ items: [], meta: {} }));
		return route.fulfill({ status: 404, contentType: "application/json", body: JSON.stringify({ message: "nope" }) });
	});
	return posts;
}

test.beforeEach(async ({ context, baseURL }) => {
	await signInAsAdmin(context, baseURL!);
});

test("proposing an approval shows the 202 message and changes nothing", async ({ page }) => {
	const posts = await mockApi(page);
	await page.goto(`/admin/payments/${PID}`);
	await page.getByRole("button", { name: "Propose approval" }).click();
	await expect(page.getByText("A second person must confirm this before it takes effect.")).toBeVisible();
	await page.getByRole("button", { name: "Confirm", exact: true }).click();
	await expect(page.getByText("Proposed. Waiting for someone else to confirm.")).toBeVisible();
	expect(posts.map((p) => p.path)).toEqual([`payment/admin/${PID}/approve`]);
	await expect(page.getByText("AWAITING VERIFICATION")).toBeVisible();
});

test("a pending decision by someone else can be confirmed", async ({ page }) => {
	const posts = await mockApi(page, { decisions: [decision("d1", "99")] });
	await page.goto(`/admin/payments/${PID}`);
	await expect(page.getByText("Waiting for confirmation", { exact: true })).toBeVisible();
	await expect(page.getByText("Amount does not match: Short by 500")).toBeVisible();
	await expect(page.getByText("Awaiting confirmation", { exact: true })).toBeVisible();
	await expect(page.getByRole("button", { name: /Propose/ })).toHaveCount(0);
	await page.getByRole("button", { name: "Confirm", exact: true }).click();
	await page.getByRole("button", { name: "Confirm decision" }).click();
	await expect.poll(() => posts.map((p) => p.path)).toContain("payment-decisions/d1/confirm");
});

test("reject needs a note", async ({ page }) => {
	const posts = await mockApi(page, { decisions: [decision("d1", "99")] });
	await page.goto(`/admin/payments/${PID}`);
	await page.getByRole("button", { name: "Reject", exact: true }).click();
	const submit = page.getByRole("button", { name: "Reject proposal" }).last();
	await expect(submit).toBeDisabled();
	await page.getByRole("dialog").getByRole("textbox").fill("Receipt is fine");
	await submit.click();
	await expect.poll(() => posts.find((p) => p.path === "payment-decisions/d1/reject")?.body).toEqual({ note: "Receipt is fine" });
});

test("your own proposal can only be cancelled", async ({ page }) => {
	const posts = await mockApi(page, { decisions: [decision("d2", "1")] });
	await page.goto(`/admin/payments/${PID}`);
	await expect(page.getByText("Waiting for someone else to confirm")).toBeVisible();
	await expect(page.getByRole("button", { name: "Confirm", exact: true })).toHaveCount(0);
	await expect(page.getByRole("button", { name: "Reject", exact: true })).toHaveCount(0);
	await page.getByRole("button", { name: "Cancel proposal" }).click();
	await expect.poll(() => posts.map((p) => p.path)).toContain("payment-decisions/d2/cancel");
});

test("with the flag off, approve is direct", async ({ page }) => {
	const posts = await mockApi(page, { flag: false });
	await page.goto(`/admin/payments/${PID}`);
	await expect(page.getByRole("button", { name: "Propose approval" })).toHaveCount(0);
	await page.getByRole("button", { name: "Approve payment" }).click();
	await page.getByRole("button", { name: "Confirm", exact: true }).click();
	await expect(page.getByText("Payment approved successfully")).toBeVisible();
	expect(posts.map((p) => p.path)).toEqual([`payment/admin/${PID}/approve`]);
});

test("confirmations page: tabs, empty state and no sideways scroll at 390px", async ({ page }) => {
	await page.setViewportSize({ width: 390, height: 844 });
	const decided = decision("d3", "99", { changeStatus: "CONFIRMED", decidedByName: "Chidi Eze", decidedAt: NOW });
	await mockApi(page, { decisions: [decision("d1", "99"), decision("d2", "1", { decision: "INCOMPLETE", payload: { note: "A very long note ".repeat(12) } }), decided] });
	// The mock returns the same list for every status filter; the page filters decided ones itself.
	await page.goto("/admin/payments/confirmations");
	await expect(page.getByRole("tab", { name: /Pending \(3\)/ })).toBeVisible();
	expect(await overflowsHorizontally(page)).toBe(false);
	await page.getByRole("tab", { name: "Decided" }).click();
	await expect(page.getByText("Chidi Eze confirmed", { exact: false })).toBeVisible();
	expect(await overflowsHorizontally(page)).toBe(false);
});

test("confirmations page shows an empty state", async ({ page }) => {
	await mockApi(page);
	await page.goto("/admin/payments/confirmations");
	await expect(page.getByText("Nothing is waiting for confirmation.")).toBeVisible();
	await page.getByRole("tab", { name: "Decided" }).click();
	await expect(page.getByText("No decisions yet.")).toBeVisible();
});

test("the payment page does not scroll sideways at 390px with a pending decision", async ({ page }) => {
	await page.setViewportSize({ width: 390, height: 844 });
	await mockApi(page, { decisions: [decision("d1", "99")] });
	await page.goto(`/admin/payments/${PID}`);
	await expect(page.getByText("Waiting for confirmation", { exact: true })).toBeVisible();
	expect(await overflowsHorizontally(page)).toBe(false);
});

test("manual payments header links to confirmations with a count", async ({ page }) => {
	await mockApi(page, { decisions: [decision("d1", "99")] });
	await page.route("**/api/v1/payment/admin?**", (r) => r.fulfill(ok({ items: [], meta: { totalItems: 0, totalPages: 1 } })));
	await page.goto("/admin/payments/manual");
	await expect(page.getByTestId("awaiting-count")).toHaveText("1");
});
