"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Megaphone, X } from "lucide-react";
import { useAppSelector } from "@/_redux/store";
import axiosInstance from "@/_utils/axiosInstance";
import { useFeature } from "@/_hooks/useFeature";
import { useLiveEvent } from "@/_hooks/useLiveEvent";
import { SanitizedHtml } from "@/components/egfm/rich-text";
import type { Announcement } from "@/types/live";

const STORE_KEY = "gp-dismissed-announcements";
const MAX_SHOWN = 2;

const readDismissed = (): string[] => {
	try {
		return JSON.parse(localStorage.getItem(STORE_KEY) ?? "[]");
	} catch {
		return [];
	}
};

/** Active announcements for this visitor. Signed-in users also get them live; guests see the latest on load/focus. */
const AnnouncementBanner: React.FC = () => {
	const { isAuthenticated } = useAppSelector((s) => s.auth);
	const enabled = useFeature("storefront.announcements");
	const [items, setItems] = useState<Announcement[]>([]);
	const [dismissed, setDismissed] = useState<string[]>([]);

	useEffect(() => setDismissed(readDismissed()), []);

	const load = useCallback(async () => {
		try {
			const res = await axiosInstance.get(isAuthenticated ? "announcements/mine" : "announcements/public");
			setItems(res.data?.data ?? []);
		} catch {
			// A banner is never worth an error toast.
		}
	}, [isAuthenticated]);

	useEffect(() => {
		load();
		const onFocus = () => load();
		window.addEventListener("focus", onFocus);
		return () => window.removeEventListener("focus", onFocus);
	}, [load]);

	useLiveEvent("announcement-changed", () => void load(), isAuthenticated);

	const dismiss = (id: string) => {
		const next = [...dismissed, id];
		setDismissed(next);
		try {
			localStorage.setItem(STORE_KEY, JSON.stringify(next.slice(-50)));
		} catch {}
	};

	const visible = items.filter((a) => !dismissed.includes(a.id)).slice(0, MAX_SHOWN);
	if (!enabled || visible.length === 0) return null;

	return (
		<div className="space-y-px" role="region" aria-label="Announcements">
			{visible.map((a) => (
				<div key={a.id} role="status" aria-live="polite" className="bg-[#0c2b25] text-white">
					<div className="mx-auto flex max-w-6xl items-start gap-3 px-4 py-2.5 sm:items-center">
						<Megaphone className="mt-0.5 size-4 shrink-0 text-[#9aca3c] sm:mt-0" aria-hidden="true" />
						<div className="min-w-0 flex-1 text-xs sm:text-sm">
							<p className="font-semibold">{a.title}</p>
							<SanitizedHtml html={a.message} className="text-xs text-white/80 sm:text-sm [&_a]:text-[#9aca3c] [&_blockquote]:border-white/30 [&_blockquote]:text-white/70 [&_code]:bg-white/10 [&_strong]:text-white" />
						</div>
						<button type="button" onClick={() => dismiss(a.id)} aria-label={`Dismiss: ${a.title}`} className="shrink-0 rounded p-1 text-white/70 hover:bg-white/10 hover:text-white">
							<X className="size-4" />
						</button>
					</div>
				</div>
			))}
		</div>
	);
};

export default AnnouncementBanner;
