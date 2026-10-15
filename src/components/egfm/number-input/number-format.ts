/** Digits and one decimal point; a leading minus survives only when allowNegative. */
export function cleanNumericString(str: string, allowDecimals: boolean, allowNegative = false): string {
  if (!str) return "";
  const negative = allowNegative && str.trim().startsWith("-");
  let cleaned = str.replace(/[^0-9.]/g, "");
  if (!allowDecimals) {
    cleaned = cleaned.replace(/\./g, "");
  } else {
    const parts = cleaned.split(".");
    if (parts.length > 2) {
      cleaned = parts[0] + "." + parts.slice(1).join("");
    }
  }
  return negative ? `-${cleaned}` : cleaned;
}

export function formatWithCommas(raw: string): string {
  if (!raw) return "";
  const parts = raw.split(".");
  const intPart = parts[0];
  // \B never matches right after "-", so negatives group correctly too.
  const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  if (parts.length > 1) {
    return `${formattedInt}.${parts[1]}`;
  }
  return formattedInt;
}
