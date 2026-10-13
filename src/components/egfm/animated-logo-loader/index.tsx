import * as React from "react";
import { cn } from "../lib/utils";
import type { AnimatedLogoLoaderProps } from "./types";

export function AnimatedLogoLoader({
  text = "Loading TradeWings Console...",
  subtext = "Syncing origin consignment & cold-chain telemetry",
  size = "md",
  fullScreen = false,
  className,
}: AnimatedLogoLoaderProps) {
  const sizeMap = {
    sm: { icon: "size-6", box: "size-12", text: "text-xs" },
    md: { icon: "size-9", box: "size-16", text: "text-sm" },
    lg: { icon: "size-12", box: "size-20", text: "text-base" },
  };

  const currentSize = sizeMap[size];

  const content = (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center p-6 space-y-4 select-none",
        className
      )}
    >
      {/* Animated Brand Logo Container */}
      <div className="relative flex items-center justify-center">
        {/* Ambient Expanding Glow Aura */}
        <div className="absolute inset-0 rounded-full bg-brand/30 blur-2xl animate-pulse scale-150" />
        <div className="absolute inset-0 rounded-full bg-ink/15 dark:bg-brand/10 blur-xl animate-ping opacity-30" />

        {/* Outer Rotating Orbital Ring */}
        <div className="absolute -inset-2 rounded-2xl border border-dashed border-brand/60 animate-spin [animation-duration:8s]" />

        {/* Center Iconmark Frame */}
        <div
          className={cn(
            "relative rounded-xl bg-card shadow-lg border border-border flex items-center justify-center p-2 transition-transform",
            currentSize.box
          )}
        >
          <img
            src="/brand/CW_Full_Colour_Iconmark.svg"
            alt="TradeWings"
            className={cn(currentSize.icon, "animate-pulse [animation-duration:2.5s]")}
          />
        </div>
      </div>

      {/* Text & Shimmer Bar */}
      <div className="space-y-1.5 max-w-xs">
        <div className={cn("font-bold text-foreground tracking-tight flex items-center justify-center gap-1.5", currentSize.text)}>
          <span>{text}</span>
          <span className="inline-block size-1.5 rounded-full bg-brand animate-ping" />
        </div>
        {subtext && (
          <p className="text-[11px] text-muted-foreground font-medium leading-relaxed">
            {subtext}
          </p>
        )}

        {/* Progress Shimmer Bar */}
        <div className="w-36 h-1 bg-muted rounded-full mx-auto mt-3 overflow-hidden relative">
          <div className="w-1/2 h-full bg-gradient-to-r from-transparent via-brand to-transparent rounded-full animate-pulse" />
        </div>
      </div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md animate-in fade-in duration-200">
        {content}
      </div>
    );
  }

  return (
    <div className="w-full py-12 flex items-center justify-center">
      {content}
    </div>
  );
}

export default AnimatedLogoLoader;
