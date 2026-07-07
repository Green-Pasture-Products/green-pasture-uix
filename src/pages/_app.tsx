import { ErrorBoundary } from "@/_errorBoundaries/ErrorBoundary";
import { persistor, store, useAppDispatch, useAppSelector } from "@/_redux/store";
import { ThemeProvider } from "@/_hooks/useTheme";
import { CurrencyProvider } from "@/_hooks/useCurrency";
import PageTransition from "@/_UI/PageTransition";
import { initAuth } from "@/_utils/authInit";
import { scheduleProactiveRefresh, stopAuthScheduler } from "@/_utils/tokenRefresh";
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { useRouter } from "next/router";
import { NuqsAdapter } from "nuqs/adapters/next/pages";
import { useEffect } from "react";
import { Toaster } from "react-hot-toast";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";

// Reconciles auth state against the cookie once persist has rehydrated, and
// owns the proactive-refresh timer for the lifetime of the session.
function AuthBootstrap({ children }: { children: React.ReactNode }) {
	const dispatch = useAppDispatch();
	const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

	useEffect(() => {
		initAuth(dispatch);
		return () => stopAuthScheduler();
	}, [dispatch]);

	// (Re)arm the silent-refresh timer whenever the user becomes authenticated
	// (login or boot success); cancel it on logout. Refreshes reschedule
	// themselves, so this only needs to react to auth state transitions.
	useEffect(() => {
		if (isAuthenticated) {
			scheduleProactiveRefresh();
		} else {
			stopAuthScheduler();
		}
	}, [isAuthenticated]);

	return <>{children}</>;
}

// Clean up old localStorage keys from previous persist versions
if (typeof window !== "undefined") {
	const OLD_KEYS = ["persist:Green_Pastures_GlObAl-StAtE"];
	OLD_KEYS.forEach((key) => {
		if (localStorage.getItem(key)) {
			localStorage.removeItem(key);
		}
	});
}

export default function App({ Component, pageProps }: AppProps) {
	const router = useRouter();
	// Dev-only: Next's dev-mode hydration leaves nuqs hooks stuck on their
	// defaults for deep-linked URLs (works fine in production builds).
	// Remounting the page once the router exposes the real query fixes the
	// initial read. Keep the key stable in production.
	const nuqsDevKey =
		process.env.NODE_ENV === "development"
			? String(router.isReady)
			: undefined;
	return (
		<ErrorBoundary>
			<Provider store={store}>
				<PersistGate loading={null} persistor={persistor}>
					<AuthBootstrap>
						<ThemeProvider>
							<CurrencyProvider>
								<NuqsAdapter>
									<PageTransition>
										<Component key={nuqsDevKey} {...pageProps} />
									</PageTransition>
								</NuqsAdapter>
							</CurrencyProvider>
						</ThemeProvider>
					</AuthBootstrap>

					<Toaster
						position="top-right"
						toastOptions={{
							duration: 4000,
							style: {
								borderRadius: "12px",
								padding: "12px 16px",
								fontSize: "14px",
								fontWeight: "500",
								fontFamily: '"DM Sans", sans-serif',
								boxShadow:
									"0 10px 15px -3px rgb(0 0 0 / 0.07), 0 4px 6px -4px rgb(0 0 0 / 0.05)",
							},
							success: {
								style: {
									background: "#f0fdf4",
									color: "#15803d",
									border: "1px solid #bbf7d0",
								},
								iconTheme: {
									primary: "#16a34a",
									secondary: "#f0fdf4",
								},
							},
							error: {
								style: {
									background: "#fef2f2",
									color: "#b91c1c",
									border: "1px solid #fee2e2",
								},
								iconTheme: {
									primary: "#dc2626",
									secondary: "#fef2f2",
								},
							},
						}}
					/>
				</PersistGate>
			</Provider>
		</ErrorBoundary>
	);
}
