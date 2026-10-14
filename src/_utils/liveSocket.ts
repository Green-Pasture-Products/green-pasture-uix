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
/** Records whose live history we follow ('Type:id' -> subscriber count); re-announced to the server on every (re)connect. */
const watched = new Map<string, number>();

const announce = (key: string) => {
	const [type, id] = key.split(":");
	socket?.emit("watch-record", { type, id });
};

const baseUrl = () => appConstants.API_BASE_URL.replace(/\/api\/v1\/?$/, "");

function connect() {
	if (socket) return;
	socket = io(`${baseUrl()}/notifications`, {
		auth: (cb) => cb({ token: authCookies.getTokens()?.accessToken ?? "" }),
		transports: ["websocket", "polling"],
		reconnectionDelayMax: 15000,
	});
	socket.on("connect", () => {
		watched.forEach((_, key) => announce(key));
		// Anything pushed while the socket was down is gone: tell the pages, so they reload what they show.
		listeners.get("socket-connected")?.forEach((fn) => fn());
	});
	socket.onAny((event, ...args) => listeners.get(event)?.forEach((fn) => fn(...args)));
	// The server drops sockets whose token it rejects and won't auto-retry those; try again later with whatever token exists by then.
	const scheduleRetry = () => {
		// No token means the session ended; reconnecting would only be refused again, every 10s.
		if (retry || refs === 0 || !authCookies.getTokens()?.accessToken) return;
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

/** Follow one record's history live; events arrive as "record-activity". Returns a stop function. */
export function watchRecord(type: string, id: string): () => void {
	const key = `${type}:${id}`;
	refs += 1;
	connect();
	watched.set(key, (watched.get(key) ?? 0) + 1);
	if (socket?.connected && watched.get(key) === 1) announce(key);
	return () => {
		const n = (watched.get(key) ?? 1) - 1;
		if (n <= 0) {
			watched.delete(key);
			socket?.emit("unwatch-record", { type, id });
		} else watched.set(key, n);
		release();
	};
}
