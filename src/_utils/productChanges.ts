import type { ProductChange } from "../types/productChanges.ts";

const LABELS: Record<string, string> = {
	productId: "Category",
	name: "Name",
	description: "Description",
	price: "Selling price",
	originalPrice: "Original price",
	unit: "Stock",
	weightValue: "Pack size",
	weightUnit: "Pack unit",
	tagIds: "Tags",
	variantOfItemId: "Grouped with",
	status: "Status",
};
/** Fields rendered as their own blocks (cards / thumbnails), not as before -> after rows. */
const BLOCKS = new Set(["variants", "images"]);
const MONEY = new Set(["price", "originalPrice"]);
const CREATE_ORDER = ["productId", "name", "description", "tagIds"];

export const naira = (n: number) => `₦${n.toLocaleString("en-US")}`;

const stripHtml = (s: string) => s.replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();

/** A change value as the short text the diff shows. `tagName` resolves tag ids. */
export function formatChangeValue(field: string, v: unknown, tagName: (id: string) => string = String): string {
	if (v === null || v === undefined || v === "" || (Array.isArray(v) && !v.length)) return field === "tagIds" || field === "tags" ? "None" : "—";
	if (MONEY.has(field) && !isNaN(Number(v))) return naira(Number(v));
	if (field === "tagIds" || field === "tags") return (Array.isArray(v) ? v : [v]).map((x: any) => tagName(String(x?.id ?? x))).join(", ");
	if (field === "description") return stripHtml(String(v)) || "—";
	if (field === "status") return v === "A" || v === "ACTIVE" ? "Active" : "Inactive";
	if (typeof v === "boolean") return v ? "Yes" : "No";
	return String(v);
}

export interface DiffLine {
	field: string;
	label: string;
	/** null for a new product: there is nothing before. */
	before: string | null;
	after: string;
}

/**
 * Before -> after lines for a change. Prefers the server's `diff`; otherwise built from payload/previous.
 * A CREATE shows the headline fields (variants and images are drawn separately).
 */
export function changeLines(c: Pick<ProductChange, "kind" | "payload" | "previous" | "diff" | "categoryName">, tagName?: (id: string) => string): DiffLine[] {
	const fmt = (f: string, v: unknown) => formatChangeValue(f, v, tagName);
	if (c.diff?.length) {
		return c.diff
			.filter((d) => !BLOCKS.has(d.field))
			.map((d) => ({ field: d.field, label: d.label || LABELS[d.field] || d.field, before: c.kind !== "UPDATE" ? null : fmt(d.field, d.before), after: fmt(d.field, d.after) }));
	}
	const p = c.payload ?? {};
	const prev = c.previous ?? {};
	if (c.kind === "CREATE") {
		return CREATE_ORDER.filter((f) => p[f] !== undefined).map((f) => ({
			field: f,
			label: LABELS[f],
			before: null,
			after: f === "productId" && c.categoryName ? c.categoryName : fmt(f, p[f]),
		}));
	}
	return Object.keys(p)
		.filter((f) => !BLOCKS.has(f) && JSON.stringify(p[f]) !== JSON.stringify(prev[f]))
		.map((f) => ({ field: f, label: LABELS[f] ?? f, before: fmt(f, prev[f]), after: fmt(f, p[f]) }));
}

/** One line for a confirmation dialog: "Approve creating "X"" / "Approve changing "X" (price, stock)". */
export function changeSummary(c: Pick<ProductChange, "kind" | "productName" | "payload" | "previous" | "diff">, verb: "Approve" | "Reject"): string {
	if (c.kind === "ADD_PACK_SIZE") return `${verb} adding the pack size "${c.payload?.newName ?? ""}" to "${c.productName}"`;
	if (c.kind === "CREATE") {
		const n = c.payload?.variants?.length ?? 1;
		return `${verb} creating "${c.productName}" (${n} pack size${n === 1 ? "" : "s"})`;
	}
	const fields = changeLines({ ...c, categoryName: null }).map((l) => l.label.toLowerCase());
	return `${verb} changing "${c.productName}"${fields.length ? ` (${fields.join(", ")})` : ""}`;
}
