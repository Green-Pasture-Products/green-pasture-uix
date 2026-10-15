"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "../button";
import { cn } from "../lib/utils";
import { MONTHS, WEEKDAYS } from "./constants";
import type { CalendarGridProps, CalendarHeaderProps } from "./types";

/** Month/year label with previous/next month buttons. */
export function CalendarHeader({ year, month, prevMonth, nextMonth }: CalendarHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-baseline gap-1.5">
        <span className="font-bold text-sm text-foreground">{MONTHS[month]}</span>
        <span className="font-mono text-xs font-semibold text-brand">{year}</span>
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon-sm"
          onClick={prevMonth}
          className="size-7"
          title="Previous Month"
        >
          <ChevronLeft className="size-3.5" />
        </Button>
        <Button
          variant="outline"
          size="icon-sm"
          onClick={nextMonth}
          className="size-7"
          title="Next Month"
        >
          <ChevronRight className="size-3.5" />
        </Button>
      </div>
    </div>
  );
}

/** Weekday header plus the Monday-first day grid for the viewed month. */
export function CalendarGrid({ year, month, selectedDate, minDate, handleSelectDay }: CalendarGridProps) {
  // Calendar grid computation
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = (new Date(year, month, 1).getDay() + 6) % 7; // Monday = 0
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const isToday = (d: number) => {
    const today = new Date();
    return (
      today.getDate() === d &&
      today.getMonth() === month &&
      today.getFullYear() === year
    );
  };

  const isSelected = (d: number) => {
    if (!selectedDate) return false;
    return (
      selectedDate.getDate() === d &&
      selectedDate.getMonth() === month &&
      selectedDate.getFullYear() === year
    );
  };

  return (
    <div>
      <div className="grid grid-cols-7 mb-1 text-center">
        {WEEKDAYS.map((wd) => (
          <span key={wd} className="text-[10px] font-bold uppercase text-muted-foreground py-1">
            {wd}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {/* Previous Month Days */}
        {Array.from({ length: firstDayIndex }).map((_, i) => (
          <span
            key={`prev-${i}`}
            className="size-8 flex items-center justify-center text-[11px] text-muted-foreground/30 select-none mx-auto"
          >
            {daysInPrevMonth - firstDayIndex + i + 1}
          </span>
        ))}

        {/* Current Month Days */}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const active = isSelected(day);
          const current = isToday(day);
          const beforeMin = minDate !== undefined && new Date(year, month, day) < minDate;

          return (
            <button
              key={`cur-${day}`}
              type="button"
              disabled={beforeMin}
              onClick={() => handleSelectDay(day, true)}
              className={cn(
                "size-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-150 mx-auto cursor-pointer disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent",
                active
                  ? "bg-brand text-ink shadow-sm font-bold scale-105"
                  : current
                  ? "border border-brand text-brand bg-brand/10 hover:bg-brand/20"
                  : "text-foreground hover:bg-secondary hover:text-brand"
              )}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}
