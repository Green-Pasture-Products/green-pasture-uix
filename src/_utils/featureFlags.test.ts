import { test } from "node:test";
import assert from "node:assert/strict";
import { FEATURE_KEYS, resolveFeature, validateFlagForm, parseIds } from "./featureFlags.ts";

test("17 known keys; unknown key off, known key defaults on", () => {
	assert.equal(FEATURE_KEYS.length, 18);
	assert.equal(resolveFeature({}, "checkout.guest"), true);
	assert.equal(resolveFeature(null, "made.up"), false);
});

test("server value wins over the default", () => {
	assert.equal(resolveFeature({ "checkout.guest": false }, "checkout.guest"), false);
	assert.equal(resolveFeature({ "made.up": true }, "made.up"), true);
});

const ok = { key: "a.b", name: "N", description: "", module: "a", enabled: true, rolloutPercentage: 100, targetRoles: [], targetAccountIds: [], reason: "long enough reason" };

test("validateFlagForm", () => {
	assert.deepEqual(validateFlagForm(ok, true), {});
	assert.ok(validateFlagForm({ ...ok, key: "Bad Key" }, true).key);
	assert.equal(validateFlagForm({ ...ok, key: "Bad Key" }, false).key, undefined);
	assert.ok(validateFlagForm({ ...ok, reason: "short" }, true).reason);
	assert.ok(validateFlagForm({ ...ok, rolloutPercentage: 101 }, true).rolloutPercentage);
});

test("parseIds splits and dedupes", () => {
	assert.deepEqual(parseIds("a, b\nc a"), ["a", "b", "c"]);
});
