"use client";

import * as React from "react";
import { formatDate, formatDateTime } from "../lib/format-date";
import { Calendar as CalendarIcon, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "../popover";
import { cn } from "../lib/utils";
import { CalendarGrid, CalendarHeader } from "./calendar-grid";
import { TimePicker } from "./time-picker";
import type { DatePickerProps } from "./types";

export type { DatePickerProps } from "./types";

export function DatePicker({
  value,
  onChange,
  placeholder = "Select date...",
  className,
  disabled = false,
  includeTime = false,
  minDate,
  id,
  "aria-label": ariaLabel,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);

  // Parse initial date
  const selectedDate = React.useMemo(() => {
    if (!value) return null;
    const d = typeof value === "string" ? new Date(value) : value;
    return isNaN(d.getTime()) ? null : d;
  }, [value]);

  const [viewDate, setViewDate] = React.useState<Date>(() => selectedDate || new Date());
  const [selectedHours, setSelectedHours] = React.useState<number>(() => selectedDate ? selectedDate.getHours() : 9);
  const [selectedMinutes, setSelectedMinutes] = React.useState<number>(() => selectedDate ? selectedDate.getMinutes() : 0);

  // Synchronize viewDate when value changes
  React.useEffect(() => {
    if (selectedDate) {
      setViewDate(selectedDate);
      setSelectedHours(selectedDate.getHours());
      setSelectedMinutes(selectedDate.getMinutes());
    }
  }, [selectedDate]);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const prevMonth = () => {
    setViewDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setViewDate(new Date(year, month + 1, 1));
  };

  const handleSelectDay = (day: number, isCurrentMonth: boolean) => {
    if (!isCurrentMonth) return;
    const newDate = new Date(year, month, day, selectedHours, selectedMinutes);
    onChange?.(newDate);
    if (!includeTime) {
      setOpen(false);
    }
  };

  const minDay = minDate ? new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate()) : undefined;

  const handleSetQuickDate = (offsetDays: number) => {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    if (minDay && d < minDay) return;
    d.setHours(selectedHours, selectedMinutes, 0, 0);
    setViewDate(d);
    onChange?.(d);
    if (!includeTime) setOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange?.(null);
  };

  const formattedDisplay = React.useMemo(
    () => (selectedDate ? (includeTime ? formatDateTime(selectedDate) : formatDate(selectedDate)) : null),
    [selectedDate, includeTime],
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          id={id}
          aria-label={ariaLabel}
          type="button"
          disabled={disabled}
          className={cn(
            "flex h-9 w-full items-center justify-between gap-2.5 rounded-lg border border-input bg-card px-3 py-2 text-xs font-medium text-foreground shadow-xs transition-all duration-200 cursor-pointer",
            "hover:border-brand/60 hover:bg-muted/30 active:scale-[0.99]",
            "focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring",
            !selectedDate && "text-muted-foreground",
            disabled && "opacity-50 cursor-not-allowed",
            className
          )}
        >
          <div className="flex items-center gap-2 truncate">
            <CalendarIcon className="size-3.5 text-brand shrink-0" />
            <span>{formattedDisplay || placeholder}</span>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {selectedDate && (
              <span
                role="button"
                tabIndex={0}
                onClick={handleClear}
                className="p-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                title="Clear date"
              >
                <X className="size-3" />
              </span>
            )}
          </div>
        </button>
      </PopoverTrigger>

      <PopoverContent className="w-[300px] p-4 bg-popover/98 backdrop-blur-md rounded-2xl border border-border/80 shadow-2xl space-y-3.5" align="start">
        {/* Header Month/Year Navigator */}
        <CalendarHeader year={year} month={month} prevMonth={prevMonth} nextMonth={nextMonth} />

        {/* Quick Presets */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1">
          <button
            type="button"
            onClick={() => handleSetQuickDate(0)}
            className="px-2.5 py-1 rounded-lg bg-secondary/60 hover:bg-brand/15 text-foreground hover:text-brand text-[11px] font-semibold border border-border/60 transition-colors cursor-pointer shrink-0"
          >
            Today
          </button>
          <button
            type="button"
            onClick={() => handleSetQuickDate(1)}
            className="px-2.5 py-1 rounded-lg bg-secondary/60 hover:bg-brand/15 text-foreground hover:text-brand text-[11px] font-semibold border border-border/60 transition-colors cursor-pointer shrink-0"
          >
            Tomorrow
          </button>
          <button
            type="button"
            onClick={() => handleSetQuickDate(7)}
            className="px-2.5 py-1 rounded-lg bg-secondary/60 hover:bg-brand/15 text-foreground hover:text-brand text-[11px] font-semibold border border-border/60 transition-colors cursor-pointer shrink-0"
          >
            In 1 Week
          </button>
        </div>

        {/* Days Grid */}
        <CalendarGrid year={year} month={month} selectedDate={selectedDate} minDate={minDay} handleSelectDay={handleSelectDay} />

        {/* Time Selector if Enabled */}
        {includeTime && (
          <TimePicker
            selectedDate={selectedDate}
            selectedHours={selectedHours}
            setSelectedHours={setSelectedHours}
            selectedMinutes={selectedMinutes}
            setSelectedMinutes={setSelectedMinutes}
            onChange={onChange}
          />
        )}
      </PopoverContent>
    </Popover>
  );
}

export default DatePicker;
