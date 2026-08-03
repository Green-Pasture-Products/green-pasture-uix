import { createContext, useContext, useState, useEffect, useCallback } from "react";
import React from "react";
import { appConstants } from "@/_redux/constants";
import { isPlausiblePriceFactor } from "@/_utils/priceFactor";

interface CurrencyConfig {
	code: string;       // "NGN" or "USD"
	symbol: string;     // "₦" or "$"
	priceFactor: number; // 1 for NGN, conversion rate for others
	country: string;    // "NG", "US", etc.
}

interface CurrencyContextValue {
	currency: CurrencyConfig;
	isNigeria: boolean;
	formatPrice: (priceInNaira: number) => string;
	loading: boolean;
}

const DEFAULT_CURRENCY: CurrencyConfig = {
	code: "NGN",
	symbol: "₦",
	priceFactor: 1,
	country: "NG",
};

const CurrencyContext = createContext<CurrencyContextValue>({
	currency: DEFAULT_CURRENCY,
	isNigeria: true,
	formatPrice: (price) => `₦${price.toLocaleString()}`,
	loading: true,
});

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
	const [currency, setCurrency] = useState<CurrencyConfig>(DEFAULT_CURRENCY);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const detectCurrency = async () => {
			try {
				// 1. Determine country: cached, else IPInfo
				let countryCode = sessionStorage.getItem("gp-user-country");
				if (!countryCode) {
					const response = await fetch(
						`https://ipinfo.io/json?token=${appConstants.IPINFO_TOKEN}`
					);
					if (!response.ok) throw new Error("IPInfo failed");
					const data = await response.json();
					countryCode = (data?.country as string) || "NG";
					sessionStorage.setItem("gp-user-country", countryCode);
				}

				if (countryCode === "NG") {
					setCurrency(DEFAULT_CURRENCY);
					return;
				}

				// 2. Non-NG visitor: the real priceFactor must come from the backend.
				// No hardcoded guess here — a failure or bad value falls back to NGN,
				// never a silently wrong conversion.
				try {
					const axiosInstance = (await import("@/_utils/axiosInstance")).default;
					const countryRes = await axiosInstance.get(`country`);
					const countries = countryRes.data?.data?.items || [];
					const match = countries.find(
						(c: any) => c.code?.toUpperCase() === countryCode!.toUpperCase()
					);
					const factor = Number(match?.priceFactor);

					if (match?.currencyCode && isPlausiblePriceFactor(factor)) {
						setCurrency({
							code: match.currencyCode,
							symbol: getCurrencySymbol(match.currencyCode),
							priceFactor: factor,
							country: countryCode,
						});
					} else {
						console.warn(
							`[useCurrency] Rejected priceFactor for "${countryCode}" (value: ${match?.priceFactor}) — showing NGN`
						);
						setCurrency(DEFAULT_CURRENCY);
					}
				} catch (err) {
					console.warn("[useCurrency] Failed to fetch country pricing — showing NGN", err);
					setCurrency(DEFAULT_CURRENCY);
				}
			} catch {
				// IPInfo/location detection failed — default to Nigeria
				setCurrency(DEFAULT_CURRENCY);
			} finally {
				setLoading(false);
			}
		};

		detectCurrency();
	}, []);

	const formatPrice = useCallback(
		(priceInNaira: number) => {
			if (currency.code === "NGN") {
				return `₦${priceInNaira.toLocaleString()}`;
			}
			const converted = Math.round(priceInNaira * currency.priceFactor * 100) / 100;
			return `${currency.symbol}${converted.toLocaleString(undefined, {
				minimumFractionDigits: 2,
				maximumFractionDigits: 2,
			})}`;
		},
		[currency]
	);

	const isNigeria = currency.country === "NG";

	return React.createElement(
		CurrencyContext.Provider,
		{ value: { currency, isNigeria, formatPrice, loading } },
		children
	);
}

function getCurrencySymbol(code: string): string {
	const symbols: Record<string, string> = {
		NGN: "₦",
		USD: "$",
		EUR: "€",
		GBP: "£",
		GHS: "₵",
		ZAR: "R",
		KES: "KSh",
	};
	return symbols[code] || code + " ";
}

export function useCurrency() {
	return useContext(CurrencyContext);
}
