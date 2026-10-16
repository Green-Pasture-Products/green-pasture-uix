import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import axiosInstance from "@/_utils/axiosInstance";
import { useAppSelector } from "@/_redux/store";
import { FeatureContext, useFeature } from "@/_hooks/useFeature";
import { useLiveEvent } from "@/_hooks/useLiveEvent";
import { DEFAULTS, type FeatureKey } from "@/_utils/featureFlags";

const POLL_MS = 60_000;
const CACHE_KEY = "gp-features";

/** Last answer from the server, so a flag that is off never flashes on at page load. */
function cached(): Record<string, boolean> {
	try {
		const v = JSON.parse(sessionStorage.getItem(CACHE_KEY) ?? "null");
		return v && typeof v === "object" ? { ...DEFAULTS, ...v } : DEFAULTS;
	} catch {
		return DEFAULTS;
	}
}

/** A stable anonymous id so percentage rollouts bucket a visitor the same way on every request. */
function visitorId(): string {
	try {
		let id = localStorage.getItem("gp-visitor");
		if (!id) {
			id = crypto.randomUUID();
			localStorage.setItem("gp-visitor", id);
		}
		return id;
	} catch {
		return "anonymous";
	}
}

export const FeatureFlagProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const userId = useAppSelector((s) => s.auth.user?.id);
	const [flags, setFlags] = useState<Record<string, boolean>>(() => (typeof window === "undefined" ? DEFAULTS : cached()));
	const [ready, setReady] = useState(false);
	const alive = useRef(true);

	const refresh = useCallback(async () => {
		try {
			const res = await axiosInstance.get("feature-flags/evaluate", { headers: { "x-visitor-id": visitorId() } });
			const data = res.data?.data ?? res.data;
			// Known keys keep their default unless the server says otherwise.
			if (alive.current && data && typeof data === "object") {
				setFlags({ ...DEFAULTS, ...data });
				try {
					sessionStorage.setItem(CACHE_KEY, JSON.stringify(data));
				} catch {}
				setReady(true);
			}
		} catch {
			// ponytail: keep the last known map (defaults at first); the 60s poll retries.
		}
	}, []);

	useEffect(() => {
		alive.current = true;
		return () => {
			alive.current = false;
		};
	}, []);

	// On mount and whenever the signed-in user changes, then on focus and every minute.
	useEffect(() => {
		refresh();
	}, [refresh, userId]);
	useEffect(() => {
		const t = setInterval(refresh, POLL_MS);
		window.addEventListener("focus", refresh);
		window.addEventListener("gp:features-refresh", refresh);
		return () => {
			window.removeEventListener("gp:features-refresh", refresh);
			clearInterval(t);
			window.removeEventListener("focus", refresh);
		};
	}, [refresh]);

	// Admins flipping a flag reach signed-in customers at once; everyone else relies on the poll and focus refetch.
	const debounce = useRef<ReturnType<typeof setTimeout>>(undefined);
	useLiveEvent("features-changed", () => {
		clearTimeout(debounce.current);
		debounce.current = setTimeout(refresh, 300);
	}, !!userId);
	useEffect(() => () => clearTimeout(debounce.current), []);

	const value = useMemo(() => ({ flags, ready, refresh }), [flags, ready, refresh]);
	return <FeatureContext.Provider value={value}>{children}</FeatureContext.Provider>;
};

/**
 * Renders children when the flag is on, else `fallback`. Turning off fades the children out and collapses their space
 * before unmounting; turning on fades them in. Children keep their state across refreshes.
 */
export const Feature: React.FC<{ name: FeatureKey; fallback?: React.ReactNode; children: React.ReactNode }> = ({ name, fallback = null, children }) => {
	const on = useFeature(name);
	const [present, setPresent] = useState(on);
	const first = useRef(true);
	useEffect(() => {
		if (on) setPresent(true);
	}, [on]);
	const reduce = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
	useEffect(() => {
		first.current = false;
	}, []);
	if (!present) return <>{fallback}</>;
	if (reduce) return <>{on ? children : fallback}</>;
	return (
		<div
			className={on && !first.current ? "gp-feature-in" : undefined}
			style={{ display: "grid", gridTemplateRows: on ? "1fr" : "0fr", opacity: on ? 1 : 0, transition: "grid-template-rows 0.25s ease, opacity 0.2s ease" }}
			onTransitionEnd={(e) => {
				if (!on && e.target === e.currentTarget && e.propertyName === "grid-template-rows") setPresent(false);
			}}
		>
			{/* clip only while collapsed: a popup that opens above its content (the @ picker) must not be cut off */}
			<div style={{ overflow: on ? "visible" : "hidden", minHeight: 0 }}>{children}</div>
		</div>
	);
};
