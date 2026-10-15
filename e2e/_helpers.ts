import { Page, BrowserContext } from "@playwright/test";

export const PHONE = { width: 375, height: 812 }; // iPhone X / 11 / 12 mini class
export const TABLET = { width: 768, height: 1024 };

/** True when the document itself scrolls sideways. */
export const overflowsHorizontally = (page: Page) =>
	page.evaluate(
		// +1 absorbs sub-pixel rounding, which is not a real overflow.
		() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
	);

/**
 * True when `selector` scrolls sideways inside itself.
 *
 * Needed because the admin shell's <main> is `overflow-y-auto`, and CSS
 * computes the other axis to `auto` when one axis is non-visible. An oversized
 * child therefore scrolls <main> horizontally instead of widening the document,
 * so a document-level check alone reports nothing — which made an earlier
 * version of the admin spec pass even with a deliberate 900px element on the
 * page. The user still sees a sideways scroll, so it still fails the intent.
 */
export const scrollsHorizontally = (page: Page, selector: string) =>
	page.evaluate((sel) => {
		const el = document.querySelector(sel);
		if (!el) return false;
		return el.scrollWidth > el.clientWidth + 1;
	}, selector);

/**
 * Elements wider than the viewport, reported by selector so a failure names the
 * culprit instead of just saying "something overflows".
 */
export const offendingElements = (page: Page) =>
	page.evaluate(() => {
		const limit = document.documentElement.clientWidth + 1;
		const culprits: string[] = [];

		// An oversized element only widens the page if nothing between it and the
		// root clips or scrolls its overflow. Decorative background blobs are
		// deliberately wider than the viewport and sit inside an overflow-hidden
		// ancestor, and admin tables scroll inside overflow-x-auto — both are
		// correct, so neither must be reported.
		const isClipped = (el: HTMLElement): boolean => {
			for (let a = el.parentElement; a; a = a.parentElement) {
				if (getComputedStyle(a).overflowX !== "visible") return true;
			}
			return false;
		};

		document.querySelectorAll<HTMLElement>("body *").forEach((el) => {
			if (el.getBoundingClientRect().width <= limit) return;
			if (getComputedStyle(el).overflowX !== "visible") return;
			if (isClipped(el)) return;
			culprits.push(
				`${el.tagName.toLowerCase()}${el.className ? `.${String(el.className).split(/\s+/).slice(0, 3).join(".")}` : ""} (${Math.round(el.getBoundingClientRect().width)}px)`,
			);
		});
		return culprits.slice(0, 5);
	});

/**
 * Signs in as an admin without a backend.
 *
 * Two gates have to be satisfied: `src/middleware.ts` reads the gp_at / gp_role
 * cookies server-side before the page is ever sent, and `withAdminAuth` reads
 * the persisted redux auth slice client-side. Setting only one leaves you on a
 * redirect or stuck on "Verifying access…".
 */
export async function signInAsAdmin(context: BrowserContext, baseURL: string) {
	return signIn(context, baseURL, "admin");
}

/** A signed-in customer: the storefront shows its signed-in controls (cart, wishlist, payment notifications). */
export async function signInAsCustomer(context: BrowserContext, baseURL: string) {
	return signIn(context, baseURL, "customer");
}

async function signIn(context: BrowserContext, baseURL: string, kind: "admin" | "customer") {
	const origin = new URL(baseURL).origin;
	// middleware.ts rejects tokens that aren't a decodable, unexpired JWT, so mint an
	// unsigned one (the API does the real verification; the gate only reads `exp`).
	const b64 = (o: object) => Buffer.from(JSON.stringify(o)).toString("base64url");
	const accessToken = `${b64({ alg: "none", typ: "JWT" })}.${b64({ sub: "e2e", exp: Math.floor(Date.now() / 1000) + 3600 })}.sig`;

	// Hermetic: whatever is (or isn't) listening on the real API port must not decide these tests. A real API
	// would 401 the fake token and sign the session out. Specs mock specific endpoints with page.route, which wins over this.
	await context.route("**/api/v1/**", (route) => route.fulfill({ status: 404, contentType: "application/json", body: JSON.stringify({ message: "Not mocked in this test" }) }));

	await context.addCookies([
		{ name: "gp_at", value: accessToken, url: origin },
		{ name: "gp_role", value: kind === "admin" ? "admin" : "client", url: origin },
	]);

	// redux-persist stores each slice as a JSON string inside a JSON object.
	const auth = JSON.stringify({
		isAuthenticated: true,
		user:
			kind === "admin"
				? {
						id: 1,
						firstName: "E2e",
						lastName: "Admin",
						email: "e2e.admin@greenpasture.test",
						profileType: "ADMIN",
						// Wildcard authority so privilege-gated pages and nav entries render.
						roles: [{ name: "SUPER_ADMIN", permissions: [{ name: "SUPER_ADMIN" }] }],
					}
				: { id: 2, firstName: "E2e", lastName: "Customer", email: "e2e.customer@greenpasture.test", profileType: "CLIENT", roles: [{ name: "CUSTOMER", permissions: [] }] },
		token: accessToken,
	});

	await context.addInitScript(
		([key, authSlice]) => {
			window.localStorage.setItem(
				key,
				JSON.stringify({
					auth: authSlice,
					_persist: JSON.stringify({ version: 1, rehydrated: true }),
				}),
			);
		},
		// redux-persist prefixes its storage key with "persist:" — see the
		// OLD_KEYS cleanup in _app.tsx. Without the prefix the slice is never
		// rehydrated, withAdminAuth sees an anonymous user, and every admin route
		// silently redirects to "/" — where the assertions then measure the public
		// home page instead of failing.
		["persist:Green_Pastures_GlObAl-StAtE_v2", auth] as const,
	);
}
