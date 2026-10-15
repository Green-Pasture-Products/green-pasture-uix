import { cva } from "class-variance-authority";

export const badgeVariants = cva(
  "inline-flex w-fit shrink-0 items-center whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-brand text-ink font-bold",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        outline: "text-foreground border-border",
        ink: "border-transparent bg-ink text-white dark:bg-ink-2 dark:text-foreground dark:border dark:border-border",
        success: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800",
        warning: "border-amber-200 bg-amber-50 text-amber-800 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-800",
        danger: "border-rose-200 bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400 dark:border-rose-800",
        destructive: "border-rose-200 bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400 dark:border-rose-800",
        info: "border-sky-200 bg-sky-50 text-sky-800 dark:bg-sky-950/50 dark:text-sky-400 dark:border-sky-800",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);
