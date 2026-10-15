import * as React from "react";
import Link from "next/link";
import { MoreHorizontal } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "../popover";
import { cn } from "../lib/utils";
import type { ActionDropdownProps } from "./types";

export type { ActionDropdownProps, ActionMenuItem } from "./types";

/**
 * The canonical per-row "⋯" menu for DataTable rows, matching
 * tradewings-portal's ActionDropdown (Popover-based, not DropdownMenu —
 * this app's DropdownMenu primitive needs one prior "warm-up" interaction
 * on the page before its trigger opens on the first real click, a
 * React 19 + Radix DropdownMenu quirk this component avoids by construction).
 */
export function ActionDropdown({ title = "Actions", items, align = "end", className }: ActionDropdownProps) {
  const [open, setOpen] = React.useState(false);
  const visible = items.filter((item) => !item.hidden);
  if (visible.length === 0) return null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          onClick={(e) => e.stopPropagation()}
          className={cn(
            "inline-flex items-center justify-center w-7 h-7 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer",
            open && "bg-secondary text-foreground",
            className
          )}
          aria-label="Open row actions"
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align={align}
        sideOffset={6}
        className="w-48 p-1.5 rounded-xl border border-border bg-popover/98 shadow-xl text-popover-foreground backdrop-blur-md z-[6100]"
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            {title}
          </div>
        )}
        <div className="space-y-0.5">
          {visible.map((item, index) => {
            const variantClasses = {
              default: "text-foreground hover:bg-secondary/80",
              brand: "text-foreground hover:bg-secondary hover:text-brand",
              success: "text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30",
              warning: "text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30",
              danger: "text-destructive hover:bg-destructive/10",
            }[item.variant || "default"];

            const content = (
              <>
                {item.icon && <span className="w-4 h-4 shrink-0 flex items-center justify-center">{item.icon}</span>}
                <span className="truncate">{item.label}</span>
              </>
            );

            return (
              <React.Fragment key={item.label}>
                {item.separatorAbove && index > 0 && <div className="h-px bg-border my-1" />}
                {item.href ? (
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer text-left",
                      variantClasses,
                      item.disabled && "opacity-50 pointer-events-none"
                    )}
                  >
                    {content}
                  </Link>
                ) : (
                  <button
                    type="button"
                    disabled={item.disabled}
                    onClick={() => {
                      item.onClick?.();
                      setOpen(false);
                    }}
                    className={cn(
                      "w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer text-left",
                      variantClasses,
                      item.disabled && "opacity-50 pointer-events-none"
                    )}
                  >
                    {content}
                  </button>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
