import { test } from "node:test";
import assert from "node:assert/strict";
import { getPaginationRange } from "./paginationRange.ts";

test("lists every page when there are few", () => {
	assert.deepEqual(getPaginationRange(1, 5), [1, 2, 3, 4, 5]);
});

test("collapses the far end behind a gap while near the start", () => {
	assert.deepEqual(getPaginationRange(2, 20), [1, 2, 3, 4, 5, "...", 20]);
});

test("collapses the start behind a gap while near the end", () => {
	assert.deepEqual(getPaginationRange(19, 20), [1, "...", 16, 17, 18, 19, 20]);
});

test("shows a window with gaps on both sides in the middle", () => {
	assert.deepEqual(getPaginationRange(10, 20), [1, "...", 9, 10, 11, "...", 20]);
});
