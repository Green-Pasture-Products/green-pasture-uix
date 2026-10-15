import type { ColumnDef } from "@tanstack/react-table";
import Badge from "@/_UI/Badge";

/**
 * The entity's own on/off switch (`status`: "A" active, "I" inactive), the same on every admin list. Not to be confused
 * with a record's workflow state (an order's Pending/Delivered, a payment's Awaiting verification, ...).
 */
export function statusColumn<T>(header = "Status"): ColumnDef<T, any> {
	return {
		accessorKey: "status",
		header,
		meta: { width: "110px" },
		cell: ({ getValue }) => (
			<Badge variant={getValue() === "A" ? "success" : "error"} dot>
				{getValue() === "A" ? "Active" : "Inactive"}
			</Badge>
		),
	};
}
