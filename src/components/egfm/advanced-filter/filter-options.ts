import type { AdvancedFilterOption } from "./types";

const ACRONYMS = new Set(["ai", "api", "awb", "fcm", "gps", "id", "ip", "jwt", "kyc", "otp", "pdf", "qr", "sms", "ttl", "uld", "url", "usd"]);

/** "quote_issued" → "Quote issued", "otp_expiry" → "OTP expiry" (Sentence case, acronyms kept). */
export function humanize(value: string): string {
  const s = value.replace(/_/g, " ").replace(/[A-Za-z]+/g, (w) => (ACRONYMS.has(w.toLowerCase()) ? w.toUpperCase() : w));
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** Select options for a fixed list of values. */
export function toOptions(values: readonly string[], label: (value: string) => string = humanize): AdvancedFilterOption[] {
  return values.map((value) => ({ label: label(value), value }));
}

/** Select options from the distinct values the rows actually hold, sorted. */
export function distinctOptions<T>(
  rows: readonly T[],
  get: (row: T) => string | null | undefined,
  label: (value: string) => string = (v) => v,
): AdvancedFilterOption[] {
  return toOptions([...new Set(rows.map(get).filter((v): v is string => !!v))].sort(), label);
}
