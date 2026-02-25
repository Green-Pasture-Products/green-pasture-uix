import { ErrorBoundary } from "@/_errorBoundaries/ErrorBoundary";
import { persistor, store } from "@/_redux/store";
import { productsAction } from "@/_redux/actions";
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { useEffect } from "react";
import { Toaster } from "react-hot-toast";
import { Provider, useDispatch } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";

// Inner component that has access to store
function AppContent({ Component, pageProps }: AppProps) {
	const dispatch = useDispatch();

	useEffect(() => {
		// Fetch products on app initialization
		dispatch(productsAction.fetchAllProducts() as any);
	}, [dispatch]);

	return (
		<>
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
		</>
	);
}

export default function App(props: AppProps) {
	return (
		<ErrorBoundary>
			<Provider store={store}>
				<PersistGate loading={null} persistor={persistor}>
					<AppContent {...props} />
				</PersistGate>
			</Provider>
		</ErrorBoundary>
	);
}
