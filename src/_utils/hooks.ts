import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useAppDispatch } from "@/_redux/store";
import toast from "react-hot-toast";
import { logoutAsync } from "@/_redux/actions/auth.action";

// Create a custom hook for multi-tab sync
export function useMultiTabLogoutSync() {
	const dispatch = useAppDispatch();
	const router = useRouter();

	useEffect(() => {
		// ✅ Method 1: BroadcastChannel (Modern browsers)
		if (typeof BroadcastChannel !== "undefined") {
			const authChannel = new BroadcastChannel("auth");

			authChannel.onmessage = (event) => {
				if (event.data.type === "LOGOUT") {
					// Sync logout across tabs
					dispatch(logoutAsync()); // Synchronous Redux action
					router.push("/login");
				}
			};

			// Cleanup
			return () => {
				authChannel.close();
			};
		} else {
			// ✅ Method 2: localStorage events (Fallback for older browsers)
			const handleStorageChange = (e: StorageEvent) => {
				if (e.key === "logout-trigger") {
					dispatch(logoutAsync());
					router.push("/login");
				}
			};

			window.addEventListener("storage", handleStorageChange);
			return () =>
				window.removeEventListener("storage", handleStorageChange);
		}
	}, [dispatch, router]);
}

export function useLogout() {
	const dispatch = useAppDispatch();
	const router = useRouter();
	const [isLoggingOut, setIsLoggingOut] = useState(false);

	const handleLogout = async () => {
		if (isLoggingOut) return; // Prevent double-click

		setIsLoggingOut(true);

		try {
			// Call backend to clear cookies
			await dispatch(logoutAsync()).unwrap();

			// ✅ Notify other tabs (Method 1: BroadcastChannel)
			if (typeof BroadcastChannel !== "undefined") {
				const authChannel = new BroadcastChannel("auth");
				authChannel.postMessage({ type: "LOGOUT" });
				authChannel.close();
			} else {
				// ✅ Notify other tabs (Method 2: localStorage)
				localStorage.setItem("logout-trigger", Date.now().toString());
				// Remove immediately (triggers storage event in other tabs)
				localStorage.removeItem("logout-trigger");
			}

			toast.success("Logged out successfully");
			router.push("/login");
		} catch (error) {
			console.error("Logout error:", error);
			toast.error("Logout failed. Please try again.");
		} finally {
			setIsLoggingOut(false);
		}
	};

	return { handleLogout, isLoggingOut };
}
