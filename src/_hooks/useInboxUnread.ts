import { useCallback, useEffect, useState } from "react";
import axiosInstance from "@/_utils/axiosInstance";
import { useLiveEvent } from "@/_hooks/useLiveEvent";

export const INBOX_CHANGED = "gp-inbox-changed";
/** Tell every unread badge on the page that this tab changed the inbox (read/clear). */
export const notifyInboxChanged = () => window.dispatchEvent(new Event(INBOX_CHANGED));

/** Live unread count for the signed-in user's inbox. */
export function useInboxUnread(enabled = true) {
	const [count, setCount] = useState(0);

	const load = useCallback(async () => {
		try {
			const res = await axiosInstance.get("notifications/inbox", { params: { limit: 1 } });
			setCount(res.data?.data?.unreadCount ?? 0);
		} catch {
			// a badge is never worth an error
		}
	}, []);

	useEffect(() => {
		if (!enabled) return;
		load();
		window.addEventListener(INBOX_CHANGED, load);
		return () => window.removeEventListener(INBOX_CHANGED, load);
	}, [enabled, load]);

	useLiveEvent("new-notification", () => setCount((c) => c + 1), enabled);
	useLiveEvent("announcement-changed", () => void load(), enabled);

	return count;
}
