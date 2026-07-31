// Run: pnpm test          (or: node --test src/_utils/idempotencyKey.test.ts)
import { test } from "node:test";
import assert from "node:assert/strict";
import { resolveIdempotencyKey } from "./idempotencyKey.ts";

test("mints a key on the first attempt", () => {
	const state = resolveIdempotencyKey({ key: undefined, signature: undefined }, "sig-a", () => "key-1");
	assert.equal(state.key, "key-1");
	assert.equal(state.signature, "sig-a");
});

test("reuses the key on a retry of the same attempt (double-click, dismiss-and-resubmit)", () => {
	const first = resolveIdempotencyKey({ key: undefined, signature: undefined }, "sig-a", () => "key-1");
	// Same attempt signature the second time around — must not mint a new key,
	// or the backend's double-submit protection never engages.
	const second = resolveIdempotencyKey(first, "sig-a", () => "key-2");
	assert.equal(second.key, "key-1");
	assert.equal(second.signature, "sig-a");
});

test("mints a fresh key when the attempt-defining fields change", () => {
	const first = resolveIdempotencyKey({ key: undefined, signature: undefined }, "sig-a", () => "key-1");
	// Customer edited the shipping address or coupon — different signature —
	// reusing key-1 here would hit the backend's 422 with no way to clear it.
	const second = resolveIdempotencyKey(first, "sig-b", () => "key-2");
	assert.equal(second.key, "key-2");
	assert.equal(second.signature, "sig-b");
});

test("a key changed by an edit does not revert on a further retry of the new attempt", () => {
	const first = resolveIdempotencyKey({ key: undefined, signature: undefined }, "sig-a", () => "key-1");
	const edited = resolveIdempotencyKey(first, "sig-b", () => "key-2");
	const retryOfEdited = resolveIdempotencyKey(edited, "sig-b", () => "key-3");
	assert.equal(retryOfEdited.key, "key-2");
});
