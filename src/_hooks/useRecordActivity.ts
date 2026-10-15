import { useCallback, useEffect, useState } from "react";
import axiosInstance from "@/_utils/axiosInstance";
import { watchRecord } from "@/_utils/liveSocket";
import { useLiveEvent } from "@/_hooks/useLiveEvent";
import type { ActivityEventRow, PageMeta } from "@/types/live";

const STEP = 30;

/** A record's full history, newest first, kept current by the live socket. */
export function useRecordActivity(type: string, id?: string | null) {
	const [items, setItems] = useState<ActivityEventRow[]>([]);
	const [meta, setMeta] = useState<PageMeta | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(false);
	const [live, setLive] = useState(0);

	const load = useCallback(
		async (page = 1) => {
			if (!id) return;
			setLoading(true);
			setError(false);
			try {
				const res = await axiosInstance.get(`activity/record/${type}/${id}`, { params: { page, limit: STEP } });
				const data = res.data?.data;
				setMeta(data?.meta ?? null);
				setItems((prev) => {
					const merged = page === 1 ? data.items : [...prev, ...data.items];
					return merged.filter((e: ActivityEventRow, i: number) => merged.findIndex((x: ActivityEventRow) => x.id === e.id) === i);
				});
			} catch {
				setError(true);
			} finally {
				setLoading(false);
			}
		},
		[type, id],
	);

	useEffect(() => {
		setItems([]);
		setMeta(null);
		load(1);
	}, [load]);

	useEffect(() => {
		if (!id) return;
		return watchRecord(type, id);
	}, [type, id]);

	useLiveEvent<ActivityEventRow>("record-activity", (event) => {
		setItems((prev) => (prev.some((e) => e.id === event.id) ? prev : [event, ...prev]));
		setMeta((m) => (m ? { ...m, total: m.total + 1 } : m));
		setLive((n) => n + 1);
	}, !!id);

	// A panel that was open while the socket dropped has missed events: reload the history whenever the socket (re)connects.
	useLiveEvent("socket-connected", () => load(1), !!id);

	const add = (event: ActivityEventRow) => {
		setItems((prev) => (prev.some((e) => e.id === event.id) ? prev : [event, ...prev]));
	}; // total is bumped by the socket echo

	const hasMore = !!meta && meta.page < meta.totalPages;
	return { items, total: meta?.total ?? items.length, loading, error, hasMore, loadMore: () => meta && load(meta.page + 1), refresh: () => load(1), live, add };
}
