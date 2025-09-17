import { persistor, store } from "@/_redux/store";
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { Toaster } from "react-hot-toast";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";

export default function App({ Component, pageProps }: AppProps) {
	return (
		<Provider store={store}>
			<PersistGate loading={null} persistor={persistor}>
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
			</PersistGate>
		</Provider>
	);
}
