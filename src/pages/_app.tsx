import { ErrorBoundary } from "@/_errorBoundaries/ErrorBoundary";
import { persistor, store } from "@/_redux/store";
import { ThemeProvider } from "@/_hooks/useTheme";
import { CurrencyProvider } from "@/_hooks/useCurrency";
import PageTransition from "@/_UI/PageTransition";
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { Toaster } from "react-hot-toast";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";

export default function App({ Component, pageProps }: AppProps) {
	return (
		<ErrorBoundary>
			<Provider store={store}>
				<PersistGate loading={null} persistor={persistor}>
					<ThemeProvider>
						<CurrencyProvider>
							<PageTransition>
								<Component {...pageProps} />
							</PageTransition>
						</CurrencyProvider>
					</ThemeProvider>

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
