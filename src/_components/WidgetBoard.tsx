"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { LayoutGrid } from "lucide-react";

import { DraggableWidgetGrid, type WidgetItem, type WidgetSize } from "@/components/egfm/widgets/draggable-widget-grid";
import { Button } from "@/components/ui/button";
import { useAppSelector } from "@/_redux/store";

/** Strips a card's own chrome, since the widget wrapper already draws the rounded card. */
export const BARE = "flex h-full min-h-0 flex-col overflow-hidden rounded-none border-0 !bg-transparent !shadow-none";

export interface BoardWidget {
	id: string;
	size: WidgetSize;
	label: string;
	node: ReactNode;
	/** Let tall content (tables) scroll inside its card instead of being clipped. */
	scroll?: boolean;
}

const storageKey = (page: string, userId: unknown) => `layout:${page}:${String(userId ?? "anon")}`;

function readOrder(key: string): string[] {
	try {
		const parsed = JSON.parse(localStorage.getItem(key) ?? "null");
		return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === "string") : [];
	} catch {
		return [];
	}
}

function writeOrder(key: string, ids: string[] | null) {
	try {
		if (ids) localStorage.setItem(key, JSON.stringify(ids));
		else localStorage.removeItem(key);
	} catch {
		// The layout simply isn't remembered.
	}
}

/** The saved order first (ids that no longer exist are dropped), then any widget the save doesn't know, in default order. */
export function applyOrder<T extends { id: string }>(saved: string[], widgets: T[]): T[] {
	const byId = new Map(widgets.map((w) => [w.id, w]));
	const known = saved.flatMap((id) => byId.get(id) ?? []);
	return [...known, ...widgets.filter((w) => !saved.includes(w.id))];
}

/** A page's cards as a grid the user can rearrange; only the order is remembered, per user and page, on this device. */
export function WidgetBoard({ page, widgets }: { page: string; widgets: BoardWidget[] }) {
	const userId = useAppSelector((s) => (s.auth.user as { id?: unknown } | null)?.id);
	const key = storageKey(page, userId);
	const [editing, setEditing] = useState(false);
	const [saved, setSaved] = useState<string[]>([]);
	const [loaded, setLoaded] = useState(false);
	const [resets, setResets] = useState(0);

	// Read after mount so server and client markup agree.
	useEffect(() => {
		setSaved(readOrder(key));
		setLoaded(true);
	}, [key]);

	const items: WidgetItem[] = useMemo(
		() => applyOrder(saved, widgets).map(({ id, size, label }) => ({ id, size, label })),
		// The grid reads its start order once per key, so later order changes need not rebuild it.
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[widgets.map((w) => w.id).join("|"), resets, loaded],
	);
	const byId = new Map(widgets.map((w) => [w.id, w]));

	const onChange = useCallback(
		(next: WidgetItem[]) => {
			const ids = next.map((i) => i.id);
			setSaved(ids);
			writeOrder(key, ids);
		},
		[key],
	);

	const reset = () => {
		writeOrder(key, null);
		setSaved([]);
		setResets((n) => n + 1);
	};

	return (
		<div className="space-y-3" data-testid="widget-board">
			<div className="flex flex-wrap items-center justify-between gap-2">
				{editing ? <p className="text-muted-foreground text-xs">Drag a card to move it. Your layout is kept on this device.</p> : <span />}
				<div className="flex gap-2">
					{editing ? (
						<>
							<Button variant="outline" size="sm" onClick={reset}>
								Reset layout
							</Button>
							<Button size="sm" onClick={() => setEditing(false)}>
								Done
							</Button>
						</>
					) : (
						<Button variant="outline" size="sm" className="gap-1.5 text-xs shadow-xs" onClick={() => setEditing(true)} data-testid="customize-layout">
							<LayoutGrid className="size-3.5" />
							Customize layout
						</Button>
					)}
				</div>
			</div>
			<DraggableWidgetGrid
				key={`${items.map((i) => i.id).join("|")}#${resets}`}
				items={items}
				editable={editing}
				rowRatio={0.6}
				minRow={176}
				maxColumns={4}
				onChange={onChange}
				renderItem={(item) => <div className={byId.get(item.id)?.scroll ? "h-full min-h-0 overflow-auto" : "h-full min-h-0 overflow-hidden"}>{byId.get(item.id)?.node}</div>}
			/>
		</div>
	);
}
