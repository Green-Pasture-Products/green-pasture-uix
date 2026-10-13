"use client";

import { Clock } from "lucide-react";
import type { TimePickerProps } from "./types";

/** Hour / quarter-hour selects shown when the picker includes time. */
export function TimePicker({
  selectedDate,
  selectedHours,
  setSelectedHours,
  selectedMinutes,
  setSelectedMinutes,
  onChange,
}: TimePickerProps) {
  return (
    <div className="pt-2 border-t border-border/70 flex items-center justify-between text-xs">
      <div className="flex items-center gap-1.5 text-muted-foreground font-semibold">
        <Clock className="size-3.5 text-brand" />
        <span>Time</span>
      </div>
      <div className="flex items-center gap-1">
        <select
          value={selectedHours}
          onChange={(e) => {
            const h = parseInt(e.target.value, 10);
            setSelectedHours(h);
            if (selectedDate) {
              const updated = new Date(selectedDate);
              updated.setHours(h);
              onChange?.(updated);
            }
          }}
          className="h-8 rounded-lg border border-border bg-card px-2 text-xs font-mono font-bold text-foreground"
        >
          {Array.from({ length: 24 }).map((_, h) => (
            <option key={h} value={h}>
              {h.toString().padStart(2, "0")}
            </option>
          ))}
        </select>
        <span className="font-bold">:</span>
        <select
          value={selectedMinutes}
          onChange={(e) => {
            const m = parseInt(e.target.value, 10);
            setSelectedMinutes(m);
            if (selectedDate) {
              const updated = new Date(selectedDate);
              updated.setMinutes(m);
              onChange?.(updated);
            }
          }}
          className="h-8 rounded-lg border border-border bg-card px-2 text-xs font-mono font-bold text-foreground"
        >
          {[0, 15, 30, 45].map((m) => (
            <option key={m} value={m}>
              {m.toString().padStart(2, "0")}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
