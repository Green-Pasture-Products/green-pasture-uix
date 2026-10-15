import { test } from "node:test";
import assert from "node:assert/strict";
import { changeLines, changeSummary, formatChangeValue } from "./productChanges.ts";

test("prices are formatted as naira, tags by name", () => {
	assert.equal(formatChangeValue("price", 12500), "₦12,500");
	assert.equal(formatChangeValue("tagIds", ["a", "b"], (id) => ({ a: "Kids", b: "Adults" })[id]!), "Kids, Adults");
	assert.equal(formatChangeValue("originalPrice", null), "—");
	assert.equal(formatChangeValue("description", "<p>Hello&nbsp;<b>you</b></p>"), "Hello you");
});

test("an update shows only the changed fields, before -> after", () => {
	const lines = changeLines({ kind: "UPDATE", payload: { price: 2000, name: "Same" }, previous: { price: 1500, name: "Same" }, diff: undefined, categoryName: null });
	assert.deepEqual(lines, [{ field: "price", label: "Selling price", before: "₦1,500", after: "₦2,000" }]);
});

test("a create has no 'before' and uses the category name; server diff wins when present", () => {
	const c = { kind: "CREATE" as const, payload: { productId: "9", name: "Moringa", variants: [{}, {}] }, previous: null, categoryName: "Herbs" };
	const lines = changeLines({ ...c, diff: undefined });
	assert.deepEqual(lines.map((l) => [l.label, l.before, l.after]), [["Category", null, "Herbs"], ["Name", null, "Moringa"]]);
	const withDiff = changeLines({ ...c, kind: "UPDATE", diff: [{ field: "unit", label: "Stock", before: 3, after: 8 }] });
	assert.deepEqual(withDiff, [{ field: "unit", label: "Stock", before: "3", after: "8" }]);
	assert.equal(changeSummary({ ...c, productName: "Moringa", diff: undefined }, "Approve"), 'Approve creating "Moringa" (2 pack sizes)');
});

test("a new pack size reads as an addition, with no 'before'", () => {
	const c = { kind: "ADD_PACK_SIZE", productName: "Moringa 100g", payload: { newName: "Moringa 200g" }, previous: null, diff: [{ field: "name", label: "New pack size", before: null, after: "Moringa 200g" }] } as any;
	assert.equal(changeSummary(c, "Approve"), 'Approve adding the pack size "Moringa 200g" to "Moringa 100g"');
	assert.deepEqual(changeLines(c)[0], { field: "name", label: "New pack size", before: null, after: "Moringa 200g" });
});
