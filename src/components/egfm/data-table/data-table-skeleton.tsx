import * as React from "react";
import { Skeleton } from "../skeleton";
import type { DataTableSkeletonProps } from "./types";

export function DataTableSkeleton({
  rows = 5,
  columns = 6,
  showHeader = true,
  showToolbar = true,
}: DataTableSkeletonProps) {
  return (
    <div className="w-full space-y-3">
      {/* Search and Filters Skeleton */}
      {showToolbar && <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-2">
          <Skeleton className="h-9 w-64 rounded-lg" />
          <Skeleton className="h-9 w-28 rounded-lg" />
        </div>
        <Skeleton className="h-9 w-32 rounded-lg" />
      </div>}

      {/* Table Frame Skeleton */}
      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-xs">
        {showHeader && (
          <div className="flex items-center justify-between border-b border-border bg-muted/40 px-4 py-3">
            {Array.from({ length: columns }).map((_, i) => (
              <Skeleton
                key={i}
                className={`h-4 rounded ${
                  i === 0 ? "w-12" : i === 1 ? "w-32" : i === columns - 1 ? "w-20" : "w-24"
                }`}
              />
            ))}
          </div>
        )}

        <div className="divide-y divide-border/60">
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <div
              key={rowIndex}
              className="flex items-center justify-between px-4 py-3.5 gap-4"
            >
              {Array.from({ length: columns }).map((_, colIndex) => (
                <div key={colIndex} className="flex-1">
                  {colIndex === 0 ? (
                    <Skeleton className="h-4 w-8 rounded" />
                  ) : colIndex === 1 ? (
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-28 rounded" />
                      <Skeleton className="h-3 w-20 rounded" />
                    </div>
                  ) : colIndex === columns - 1 ? (
                    <div className="flex justify-end">
                      <Skeleton className="h-7 w-20 rounded-md" />
                    </div>
                  ) : (
                    <Skeleton className="h-4 w-24 rounded" />
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Footer Pagination Skeleton */}
        <div className="flex items-center justify-between border-t border-border bg-card px-4 py-3">
          <Skeleton className="h-4 w-36 rounded" />
          <div className="flex items-center gap-1.5">
            <Skeleton className="h-7 w-7 rounded-md" />
            <Skeleton className="h-7 w-7 rounded-md" />
            <Skeleton className="h-7 w-7 rounded-md" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default DataTableSkeleton;
