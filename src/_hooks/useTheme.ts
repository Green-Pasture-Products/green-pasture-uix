import {
	createContext,
	useContext,
	useState,
	useEffect,
	useCallback,
	type ReactNode,
} from "react";
import React from "react";

type Theme = "light" | "dark";

interface ThemeContextValue {
	theme: Theme;
	isDark: boolean;
	toggleTheme: () => void;
	setTheme: (theme: Theme) => void;
	/** What the user chose: an explicit theme, or "system" to follow the OS. */
	preference: Theme | "system";
	setPreference: (p: Theme | "system") => void;
}

const ThemeContext = createContext<ThemeContextValue>({
	theme: "light",
	isDark: false,
	toggleTheme: () => {},
	setTheme: () => {},
	preference: "system",
	setPreference: () => {},
});

function getInitialTheme(): Theme {
	if (typeof window === "undefined") return "light";
	const stored = localStorage.getItem("gp-theme") as Theme | null;
	if (stored) return stored;
	return window.matchMedia("(prefers-color-scheme: dark)").matches
		? "dark"
		: "light";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
	const [theme, setThemeState] = useState<Theme>(getInitialTheme);

	useEffect(() => {
		const current = getInitialTheme();
		setThemeState(current);
		document.documentElement.classList.toggle("dark", current === "dark");

		const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
		const handleChange = (e: MediaQueryListEvent) => {
			if (!localStorage.getItem("gp-theme")) {
				const newTheme = e.matches ? "dark" : "light";
				setThemeState(newTheme);
				document.documentElement.classList.toggle(
					"dark",
					newTheme === "dark"
				);
			}
		};

		mediaQuery.addEventListener("change", handleChange);
		return () => mediaQuery.removeEventListener("change", handleChange);
	}, []);

	const setTheme = useCallback((newTheme: Theme) => {
		setThemeState(newTheme);
		localStorage.setItem("gp-theme", newTheme);
		document.documentElement.classList.toggle(
			"dark",
			newTheme === "dark"
		);
	}, []);

	const [preference, setPreferenceState] = useState<Theme | "system">("system");
	useEffect(() => {
		setPreferenceState((localStorage.getItem("gp-theme") as Theme | null) ?? "system");
	}, []);

	const setPreference = useCallback(
		(p: Theme | "system") => {
			setPreferenceState(p);
			if (p === "system") {
				localStorage.removeItem("gp-theme");
				const next: Theme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
				setThemeState(next);
				document.documentElement.classList.toggle("dark", next === "dark");
			} else setTheme(p);
		},
		[setTheme],
	);

	const toggleTheme = useCallback(() => {
		setThemeState((prev) => {
			const next = prev === "dark" ? "light" : "dark";
			localStorage.setItem("gp-theme", next);
			document.documentElement.classList.toggle("dark", next === "dark");
			return next;
		});
	}, []);

	return React.createElement(
		ThemeContext.Provider,
		{ value: { theme, isDark: theme === "dark", toggleTheme, setTheme, preference, setPreference } },
		children
	);
}

export function useTheme() {
	return useContext(ThemeContext);
}
