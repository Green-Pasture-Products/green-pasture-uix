import { lastModified, modifiedBy } from "../audit-helpers";
import type { AdvancedFilterField } from "../../advanced-filter";
import type { AuditFields, Column } from "../types";

export const NAV_BUTTON = "h-7 w-7 border-border/70 bg-card text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-40";

export const AUDIT_COLUMNS: Column<AuditFields>[] = [
  { header: "Created By", cell: (r) => r.createdBy || "—", className: "whitespace-nowrap text-muted-foreground" },
  { header: "Last Modified", cell: (r) => lastModified(r.updatedAt), className: "whitespace-nowrap text-muted-foreground" },
  { header: "Modified By", cell: (r) => modifiedBy(r), className: "whitespace-nowrap text-muted-foreground" },
];

/** Every table that shows the audit columns can be filtered by when rows were last modified. */
export const LAST_MODIFIED_FILTER: AdvancedFilterField<AuditFields> = {
  key: "lastModified",
  label: "Last modified",
  type: "dateRange",
  getDate: (r) => r.updatedAt,
};
