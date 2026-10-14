import { test } from "node:test";
import assert from "node:assert/strict";
import { decisionDetail, timeAgo, isPending } from "./paymentDecisions.ts";

test("decisionDetail", () => {
	assert.equal(decisionDetail({ decision: "APPROVE", payload: null }), "");
	assert.equal(decisionDetail({ decision: "DECLINE", payload: { reason: "AMOUNT_MISMATCH", explanation: "Short by 500" } }), "Amount does not match: Short by 500");
	assert.equal(decisionDetail({ decision: "DECLINE", payload: { reason: "CUSTOM" } }), "CUSTOM");
	assert.equal(decisionDetail({ decision: "INCOMPLETE", payload: { note: "Balance due" } }), "Balance due");
});

test("timeAgo", () => {
	const now = Date.parse("2026-01-10T12:00:00Z");
	assert.equal(timeAgo("2026-01-10T11:59:40Z", now), "just now");
	assert.equal(timeAgo("2026-01-10T11:30:00Z", now), "30 min ago");
	assert.equal(timeAgo("2026-01-10T09:00:00Z", now), "3 h ago");
	assert.equal(timeAgo("2026-01-05T12:00:00Z", now), "5 days ago");
});

test("isPending reads the 202 body", () => {
	assert.equal(isPending({ message: "x", data: { pending: true, decision: {} } }), true);
	assert.equal(isPending({ message: "x", data: { id: "p" } }), false);
	assert.equal(isPending(null), false);
});
