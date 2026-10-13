import { useEffect, useRef } from "react";
import { onLive } from "@/_utils/liveSocket";

/** Run `handler` whenever the server pushes `event`. Always calls the latest handler without resubscribing. */
export function useLiveEvent<T = any>(event: string, handler: (payload: T) => void, enabled = true) {
	const ref = useRef(handler);
	ref.current = handler;
	useEffect(() => {
		if (!enabled) return;
		return onLive(event, (payload: T) => ref.current(payload));
	}, [event, enabled]);
}
