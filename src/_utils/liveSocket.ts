import { io, Socket } from "socket.io-client";
import { appConstants } from "@/_redux/constants";
import { authCookies } from "./authCookies";

type Handler = (...args: any[]) => void;

/**
 * One authenticated socket shared by every component that wants live events.
 * Reference-counted: it connects with the first subscriber and closes with the
 * last. The access token is read fresh on every (re)connect attempt, so a
 * refreshed token is picked up automatically.
 */
let socket: Socket | null = null;
let refs = 0;
let retry: ReturnType<typeof setTimeout> | null = null;
const listeners = new Map<string, Set<Handler>>();

const baseUrl = () => appConstants.API_BASE_URL.replace(/\/api\/v1\/?$/, "");

function connect() {
	if (socket) return;
	socket = io(`${baseUrl()}/notifications`, {
		auth: (cb) => cb({ token: authCookies.getTokens()?.accessToken ?? "" }),
		transports: ["websocket", "polling"],
		reconnectionDelayMax: 15000,
	});
	socket.onAny((event, ...args) => listeners.get(event)?.forEach((fn) => fn(...args)));
	// The server drops sockets whose token it rejects and won't auto-retry those; try again later with whatever token exists by then.
	const scheduleRetry = () => {
		if (retry || refs === 0) return;
		retry = setTimeout(() => {
			retry = null;
			socket?.connect();
		}, 10000);
	};
	socket.on("unauthorized", scheduleRetry);
	socket.on("disconnect", (reason) => reason === "io server disconnect" && scheduleRetry());
}

function release() {
	refs = Math.max(0, refs - 1);
	if (refs === 0) {
		if (retry) clearTimeout(retry);
		retry = null;
		socket?.close();
		socket = null;
	}
}

/** Subscribe to a live event; returns an unsubscribe function. */
export function onLive(event: string, handler: Handler): () => void {
	refs += 1;
	connect();
	let set = listeners.get(event);
	if (!set) listeners.set(event, (set = new Set()));
	set.add(handler);
	return () => {
		set!.delete(handler);
		release();
	};
}
