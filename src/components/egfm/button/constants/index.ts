import { cva } from "class-variance-authority";

export const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent text-sm font-medium whitespace-nowrap transition-all duration-150 ease-out outline-none select-none cursor-pointer focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.98] pointer-coarse:min-h-12 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-brand text-ink font-semibold hover:bg-brand-hover shadow-sm",
        /** The app's own primary colour (--primary), e.g. navy on light and green on dark in the portal. */
        primary: "bg-primary text-primary-foreground font-semibold hover:bg-primary/90 shadow-xs",
        ink: "bg-ink text-white hover:bg-ink-2 dark:bg-ink-2 dark:hover:bg-ink-3 dark:text-white dark:border dark:border-white/10 shadow-sm",
        outline: "border-border bg-background hover:bg-muted hover:text-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-muted hover:text-foreground",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm",
        /** A destructive trigger that isn't the view's primary action; the filled one lives in the confirm dialog. */
        "destructive-outline": "border-destructive/40 bg-background text-destructive hover:bg-destructive/10 hover:text-destructive",
        link: "text-brand underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-3.5 py-2 gap-2",
        xs: "h-6 px-2 text-xs rounded-md gap-1",
        sm: "h-8 px-2.5 text-xs rounded-md gap-1.5",
        lg: "h-10 px-4 text-base rounded-lg gap-2",
        /** The view's one primary action: 48px (Fitts). */
        cta: "h-12 px-5 text-[15px] font-semibold rounded-lg gap-2",
        icon: "size-9 rounded-lg pointer-coarse:min-w-12",
        "icon-sm": "size-7 rounded-md pointer-coarse:min-w-12",
        "icon-xs": "size-7 rounded-md pointer-coarse:min-w-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);
