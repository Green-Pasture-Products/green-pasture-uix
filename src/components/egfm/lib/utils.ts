import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** "$6,250.00": an amount in its own currency (a quote's, an order's), never the platform default. */
export function formatMoney(amount: string | number, currency: string): string {
  // ponytail: Number() keeps cents exact up to ~9×10^13; format the decimal string itself if amounts get that big.
  return new Intl.NumberFormat("en-US", { style: "currency", currency, minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(amount));
}
