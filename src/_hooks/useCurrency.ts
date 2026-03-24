import { createContext, useContext, useState, useEffect, useCallback } from "react";
import React from "react";
import { appConstants } from "@/_redux/constants";

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

const USD_CURRENCY: CurrencyConfig = {
	code: "USD",
	symbol: "$",
	priceFactor: 0.00062, // ~1 NGN = 0.00062 USD (adjustable, should come from backend)
	country: "",
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
				// 1. Check cached country
				const cached = sessionStorage.getItem("gp-user-country");
				if (cached) {
					applyCountry(cached);
					setLoading(false);
					return;
				}

				// 2. Fetch from IPInfo
				const response = await fetch(
					`https://ipinfo.io/json?token=${appConstants.IPINFO_TOKEN}`
				);
				if (!response.ok) throw new Error("IPInfo failed");
				const data = await response.json();
				const countryCode = data?.country || "NG";

				sessionStorage.setItem("gp-user-country", countryCode);
				applyCountry(countryCode);

				// 3. Try to get price factor from backend
				try {
					const axiosInstance = (await import("@/_utils/axiosInstance")).default;
					const countryRes = await axiosInstance.get(`country`);
					const countries = countryRes.data?.data?.items || [];
					const match = countries.find(
						(c: any) => c.code?.toUpperCase() === countryCode.toUpperCase()
					);
					if (match && match.priceFactor && match.currencyCode) {
						setCurrency((prev) => ({
							...prev,
							priceFactor: Number(match.priceFactor),
							code: match.currencyCode,
							symbol: getCurrencySymbol(match.currencyCode),
						}));
					}
				} catch {
					// Backend not available — use defaults
				}
			} catch {
				// IPInfo failed — default to Nigeria
				setCurrency(DEFAULT_CURRENCY);
			} finally {
				setLoading(false);
			}
		};

		detectCurrency();
	}, []);

	const applyCountry = (countryCode: string) => {
		if (countryCode === "NG") {
			setCurrency(DEFAULT_CURRENCY);
		} else {
			setCurrency({
				...USD_CURRENCY,
				country: countryCode,
			});
		}
	};

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
