import * as React from "react";
import { Check, ChevronDown, Search } from "lucide-react";
import { cn } from "../lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "../popover";

export interface ComboboxOption {
  value: string;
  label: string;
  /** Shown at the right and searched too, e.g. a dial code. */
  hint?: string;
}

export interface ComboboxProps {
  value?: string;
  onValueChange?: (value: string) => void;
  options: ComboboxOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  id?: string;
  disabled?: boolean;
  className?: string;
  contentClassName?: string;
  "aria-label"?: string;
  "aria-invalid"?: boolean;
  "aria-describedby"?: string;
  /** Trigger content for the selected option; defaults to its label. */
  renderValue?: (option: ComboboxOption) => React.ReactNode;
  /** Fired ~250ms after typing settles; wire this to a server-side search. */
  onSearchChange?: (text: string) => void;
  /** false: `options` are already filtered by the caller, so no local filtering runs. Default true. */
  filter?: boolean;
  /** Shows a small "Searching…" row while a server search is in flight. */
  loading?: boolean;
  /** The selected option, shown even while `options` no longer contains it (e.g. mid-search). Falls back to looking it up in `options`. */
  selectedOption?: ComboboxOption;
}

/** "Côte d'Ivoire" → "cote d'ivoire". */
const fold = (s: string) => s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();

const SEARCH_DEBOUNCE_MS = 250;

/** A searchable single select: Select's value/onValueChange, with a filter box for long lists. */
export function Combobox({
  value, onValueChange, options, placeholder = "Choose one", searchPlaceholder = "Type to search", emptyText = "No matches",
  id, disabled, className, contentClassName, renderValue, onSearchChange, filter = true, loading, selectedOption, ...aria
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [active, setActive] = React.useState(0);
  const listId = React.useId();

  // Keeps the last option seen for `value`, so the label survives the parent swapping `options` mid-search.
  const [lastSelected, setLastSelected] = React.useState<ComboboxOption | undefined>(undefined);
  const foundSelected = options.find((o) => o.value === value);
  React.useEffect(() => {
    if (foundSelected) setLastSelected(foundSelected);
  }, [foundSelected]);
  const selected = selectedOption ?? foundSelected ?? (lastSelected?.value === value ? lastSelected : undefined);

  const shown = React.useMemo(() => {
    if (!filter) return options;
    const q = fold(query.trim());
    if (!q) return options;
    // Word starts only: "gha" finds Ghana, not Afghanistan.
    const re = new RegExp(`(^|[^\\p{L}\\p{N}])${q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`, "u");
    return options.filter((o) => re.test(fold(`${o.label} ${o.hint ?? ""}`)));
  }, [options, query, filter]);

  // Runs only while the popover is open, so reopening with the same (reset) query doesn't refire it.
  const openRef = React.useRef(open);
  openRef.current = open;
  React.useEffect(() => {
    if (!onSearchChange) return;
    const t = setTimeout(() => {
      if (openRef.current) onSearchChange(query);
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [query, onSearchChange]);

  const openChange = (next: boolean) => {
    setOpen(next);
    if (!next) return;
    setQuery("");
    setActive(Math.max(0, options.findIndex((o) => o.value === value)));
  };
  const pick = (o: ComboboxOption) => {
    onValueChange?.(o.value);
    setOpen(false);
  };
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.min(Math.max(i + (e.key === "ArrowDown" ? 1 : -1), 0), shown.length - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (shown[active]) pick(shown[active]);
    }
  };

  React.useEffect(() => {
    if (open) document.getElementById(`${listId}-${active}`)?.scrollIntoView({ block: "nearest" });
  }, [open, active, listId]);

  return (
    <Popover open={open} onOpenChange={openChange}>
      <PopoverTrigger asChild>
        <button
          type="button"
          role="combobox"
          aria-expanded={open}
          aria-haspopup="listbox"
          aria-controls={open ? listId : undefined}
          id={id}
          disabled={disabled}
          {...aria}
          className={cn(
            "flex h-9 pointer-coarse:min-h-12 w-full items-center justify-between gap-2 rounded-lg border border-input bg-card px-3 text-left text-xs font-medium text-foreground shadow-xs transition-all duration-200",
            "hover:border-brand/60 hover:bg-muted/30 focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring",
            "disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive",
            className,
          )}
        >
          <span className={cn("truncate", !selected && "text-muted-foreground")}>
            {selected ? (renderValue?.(selected) ?? selected.label) : placeholder}
          </span>
          <ChevronDown className={cn("size-3.5 shrink-0 text-muted-foreground transition-transform duration-200", open && "rotate-180")} />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className={cn("w-(--radix-popover-trigger-width) min-w-56 rounded-xl p-1.5", contentClassName)}>
        <div className="relative mb-1">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            aria-label={searchPlaceholder}
            placeholder={searchPlaceholder}
            autoComplete="off"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
            onKeyDown={onKeyDown}
            aria-controls={listId}
            aria-activedescendant={shown[active] ? `${listId}-${active}` : undefined}
            className="h-9 pointer-coarse:min-h-12 w-full rounded-lg border border-input bg-background pl-8 pr-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
        <ul id={listId} role="listbox" aria-label={aria["aria-label"]} className="max-h-64 space-y-0.5 overflow-y-auto">
          {loading && <li aria-disabled="true" className="px-3 py-2 text-center text-xs text-muted-foreground">Searching…</li>}
          {!loading && shown.length === 0 && <li className="px-3 py-6 text-center text-sm text-muted-foreground">{emptyText}</li>}
          {shown.map((o, i) => (
            <li
              key={o.value}
              id={`${listId}-${i}`}
              role="option"
              aria-selected={o.value === value}
              onClick={() => pick(o)}
              onMouseMove={() => setActive(i)}
              className={cn(
                "flex min-h-9 pointer-coarse:min-h-12 cursor-pointer select-none items-center gap-2 rounded-lg px-2 text-sm",
                i === active && "bg-brand/15",
                o.value === value && "font-semibold",
              )}
            >
              <Check className={cn("size-3.5 shrink-0 stroke-[2.5] text-brand", o.value !== value && "invisible")} />
              <span className="flex-1 truncate">{o.label}</span>
              {o.hint && <span className="shrink-0 font-mono text-xs text-muted-foreground">{o.hint}</span>}
            </li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  );
}
