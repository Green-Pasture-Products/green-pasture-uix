import { formatDateTime } from "../lib/format-date";

export function lastModified(value: string | null | undefined): string {
  if (!value) return "—";
  // ponytail: mock records still hold display strings ("Today, 10:15 AM"); show those as-is.
  return Number.isNaN(Date.parse(value)) ? value : formatDateTime(value);
}

/** A record is modified once `updatedAt` exists and is more than a second after `createdAt`; the API stamps updatedBy at insert. */
export function wasModified(r: { createdAt?: string | null; updatedAt?: string | null }): boolean {
  if (!r.updatedAt) return false;
  const gap = Date.parse(r.updatedAt) - Date.parse(r.createdAt ?? "");
  return !(gap < 1000);
}

/** Who last modified the record, or `empty` while it is still as created. */
export function modifiedBy(
  r: { createdAt?: string | null; updatedAt?: string | null; updatedBy?: string | null },
  empty: string | null = "—",
): string | null {
  return wasModified(r) && r.updatedBy ? r.updatedBy : empty;
}
