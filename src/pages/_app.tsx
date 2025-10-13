import { ErrorBoundary } from "@/_errorBoundaries/ErrorBoundary";
import { getCurrentUserAsync } from "@/_redux/actions/auth.action";
import { persistor, store, useAppDispatch } from "@/_redux/store";
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { useEffect } from "react";
import { Toaster } from "react-hot-toast";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";

// ✅ In _app.tsx
function AuthProvider({ children }: { children: React.ReactNode }) {
	const dispatch = useAppDispatch();

	useEffect(() => {
		// This restores auth state from HttpOnly cookie
		dispatch(getCurrentUserAsync());
	}, [dispatch]);

	return <>{children}</>;
}

export default function App({ Component, pageProps }: AppProps) {
	return (
		<ErrorBoundary>
			<Provider store={store}>
				<PersistGate loading={null} persistor={persistor}>
					<AuthProvider>
						<Component {...pageProps} />

						<Toaster
							position="top-right"
							toastOptions={{
								success: {
									style: {
										background: "#fff",
										color: "#10B981",
										fontWeight: "500",
									},
								},
								error: {
									style: {
										background: "#fff",
										color: "#EF4444",
										fontWeight: "500",
									},
								},
							}}
						/>
					</AuthProvider>
				</PersistGate>
			</Provider>
		</ErrorBoundary>
	);
}
