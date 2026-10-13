import { Eye, Pencil } from "lucide-react";
import type { ActionMenuItem } from "../action-dropdown";
import type { RowMenuConfig } from "./types";

/**
 * Every table's row menu has the same shape (falcon-uix style): View, then Edit, then the table's own
 * actions after a divider. Edit is left out when the table has no edit screen or `canEdit` says no.
 */
export function buildRowMenu<T>(item: T, { onView, onEdit, canEdit = true, rowActions }: RowMenuConfig<T>): ActionMenuItem[] {
  const editable = onEdit && (typeof canEdit === "function" ? canEdit(item) : canEdit);
  const standard: ActionMenuItem[] = [
    ...(onView ? [{ label: "View", icon: <Eye className="size-3.5" />, variant: "brand" as const, onClick: () => onView(item) }] : []),
    ...(editable ? [{ label: "Edit", icon: <Pencil className="size-3.5" />, onClick: () => onEdit(item) }] : []),
  ];
  const extras = (rowActions?.(item) ?? []).filter((a) => !a.hidden);
  if (standard.length && extras.length) extras[0] = { ...extras[0], separatorAbove: true };
  return [...standard, ...extras];
}

export function hasRowMenu<T>({ onView, onEdit, rowActions }: RowMenuConfig<T>): boolean {
  return Boolean(onView || onEdit || rowActions);
}
