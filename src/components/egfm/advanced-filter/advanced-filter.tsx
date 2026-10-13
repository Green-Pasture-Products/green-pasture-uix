import * as React from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { Button } from "../button";
import { DatePicker } from "../date-picker";
import { Popover, PopoverContent, PopoverTrigger } from "../popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../select";
import {
  activeFilters,
  fromDay,
  fromKey,
  isRangeInvalid,
  toDay,
  toKey,
} from "./advanced-filter-helpers";
import { ANY } from "./constants";
import type { AdvancedFilterConfig, AdvancedFilterField, AdvancedFilterValues, FilterFieldProps } from "./types";

/** Fields are used as declared; Green Pasture passes its select options inline (no server enum lookup). */
function useResolvedFields<T>(fields: AdvancedFilterField<T>[]): AdvancedFilterField<T>[] {
  return fields;
}

/** MuiTable-style filter panel: edit several filters, apply them together, see each as a removable chip. */
export function AdvancedFilterButton<T>({ fields: declared, value, onApply }: AdvancedFilterConfig<T>) {
  const fields = useResolvedFields(declared);
  const [open, setOpen] = React.useState(false);
  const [draft, setDraft] = React.useState<AdvancedFilterValues>(value);
  const chips = activeFilters(fields, value);
  const invalid = isRangeInvalid(fields, draft);

  const set = (key: string, v: string | undefined) => setDraft((d) => ({ ...d, [key]: v }));

  return (
    <>
      <Popover
        open={open}
        onOpenChange={(o) => {
          if (o) setDraft(value);
          setOpen(o);
        }}
      >
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="h-9 gap-1.5 text-xs shadow-xs">
            <SlidersHorizontal className="size-3.5" />
            Filters
            {chips.length > 0 && (
              <span className="ml-0.5 rounded-full bg-brand px-1.5 text-[10px] font-bold text-ink">{chips.length}</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-[340px] p-4 space-y-3 rounded-xl">
          <p className="text-xs font-bold text-foreground">Advanced filters</p>
          {fields.map((f) => (
            <FilterField key={f.key} field={f} draft={draft} set={set} />
          ))}
          {invalid && <p className="text-[11px] text-destructive">"From" must be on or before "To".</p>}
          <div className="flex justify-between gap-2 border-t border-border pt-3">
            <Button variant="ghost" size="sm" onClick={() => setDraft({})}>
              Reset
            </Button>
            <Button
              size="sm"
              disabled={invalid}
              onClick={() => {
                onApply(draft);
                setOpen(false);
              }}
            >
              Apply filters
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      {chips.map((chip) => (
        <span key={chip.label} className="inline-flex items-center gap-1 rounded-full border border-brand/30 bg-brand/10 pl-2.5 pr-1 py-0.5 text-[11px] font-medium text-foreground">
          {chip.label}
          <button
            type="button"
            aria-label={`Remove filter ${chip.label}`}
            onClick={() => onApply({ ...value, ...Object.fromEntries(chip.keys.map((k) => [k, undefined])) })}
            className="rounded-full p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="size-3" />
          </button>
        </span>
      ))}
    </>
  );
}

function FilterField<T>({ field, draft, set }: FilterFieldProps<T>) {
  if (field.type === "select") {
    return (
      <div className="space-y-1">
        <label className="text-[11px] font-semibold text-muted-foreground">{field.label}</label>
        <Select value={draft[field.key] ?? ANY} onValueChange={(v) => set(field.key, v === ANY ? undefined : v)}>
          <SelectTrigger aria-label={field.label} className="h-9 w-full text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ANY}>Any</SelectItem>
            {(field.options ?? []).map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }

  const from = fromDay(draft[fromKey(field.key)]);
  const to = fromDay(draft[toKey(field.key)]);
  return (
    <div className="space-y-1">
      <label className="text-[11px] font-semibold text-muted-foreground">{field.label}</label>
      <div className="grid grid-cols-2 gap-2">
        <DatePicker placeholder="From" value={from ?? null} maxDate={to} onChange={(d) => set(fromKey(field.key), d ? toDay(d) : undefined)} />
        <DatePicker placeholder="To" value={to ?? null} minDate={from} onChange={(d) => set(toKey(field.key), d ? toDay(d) : undefined)} />
      </div>
    </div>
  );
}
