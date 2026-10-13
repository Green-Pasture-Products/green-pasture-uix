import { z } from "zod";
import { countryForDigits, type Country } from "../countries";

const E164 = /^\+[1-9]\d{7,14}$/;
// Italy and its enclaves keep the leading 0 in international form.
const KEEPS_ZERO = new Set(["IT", "SM", "VA"]);

/** National digits as stored: digits only, the trunk 0 dropped, capped at what E.164 allows. */
export function nationalDigits(raw: string, country: Country): string {
  let digits = raw.replace(/\D/g, "");
  if (!KEEPS_ZERO.has(country.code)) digits = digits.replace(/^0/, "");
  return digits.slice(0, 15 - (country.dial.length - 1));
}

/** "8031234567" → "803 123 4567". */
export const formatNational = (digits: string) =>
  digits.length <= 6 ? digits.replace(/^(\d{3})(?=\d)/, "$1 ") : `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;

/** "+233 24 123 4567" or "00233…" → Ghana + "241234567"; undefined unless it starts with a known dial code. */
export function parsePhone(value: string | null | undefined, preferred?: string): { country: Country; national: string } | undefined {
  const text = (value ?? "").trim().replace(/^00/, "+");
  if (!text.startsWith("+")) return undefined;
  const digits = text.replace(/\D/g, "");
  const country = countryForDigits(digits, preferred);
  return country && { country, national: nationalDigits(digits.slice(country.dial.length - 1), country) };
}

export const toE164 = (country: Country, national: string) => (national ? `${country.dial}${national}` : "");

/** Why a phone value (E.164) can't be sent, or null when it can. */
export function phoneProblem(value: string | null | undefined, preferred?: string): string | null {
  const parsed = parsePhone(value, preferred);
  if (!parsed?.national) return "Enter a valid phone number";
  const { country, national } = parsed;
  if (national.length < country.min || national.length > country.max) {
    const count = country.min === country.max ? country.min : `${country.min} to ${country.max}`;
    return `${country.name} numbers have ${count} digits after ${country.dial}`;
  }
  return E164.test(toE164(country, national)) ? null : "Enter a valid phone number";
}

/** Zod field for a PhoneInput value, checked with phoneProblem; "" passes when optional. */
export const phoneField = ({ optional = false } = {}) =>
  z.string().superRefine((value, ctx) => {
    const problem = value || !optional ? phoneProblem(value) : null;
    if (problem) ctx.addIssue({ code: "custom", message: problem });
  });
