'use client';

import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {format, startOfDay, startOfYear, endOfYear, eachDayOfInterval} from 'date-fns';

export const DEFAULT_COLOR_RAMP = ['#F8F1DF', '#EBD39A', '#D4A84B', '#B8912F', '#7A5F1E'];
/** Narrowest a square gets before older weeks are left off. */
const MIN_CELL = 9;
/** Widest a square gets, so the calendar stays short enough for its card. */
const MAX_CELL = 18;
const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const SHOWN_DAY_LABELS: Record<number, string> = {1: 'Mon', 3: 'Wed', 5: 'Fri'};

interface CalendarHeatmapProps {
   data: Array<{date: string; count: number}>;
   cellSize?: number;
   gap?: number;
   className?: string;
   colorRamp?: string[];
   onCellClick?: (date: string, count: number) => void;
   /** What a square counts, in the plural, for the legend and captions. */
   unit?: string;
}

function getQuintileColor(count: number, quintiles: number[], ramp: string[]): string {
   if (count === 0) return 'var(--muted)';
   for (let i = 0; i < quintiles.length; i++) {
      if (count <= quintiles[i]) return ramp[i] ?? ramp[ramp.length - 1];
   }
   return ramp[ramp.length - 1];
}

const CalendarHeatmap: React.FC<CalendarHeatmapProps> = ({
   data,
   cellSize: cellSizeProp = 16,
   gap: gapProp = 4,
   className,
   colorRamp = DEFAULT_COLOR_RAMP,
   onCellClick,
   unit = 'requests',
}) => {
   const containerRef = useRef<HTMLDivElement>(null);
   const [containerWidth, setContainerWidth] = useState(0);
   const [tooltip, setTooltip] = useState<{date: string; count: number; x: number; y: number} | null>(null);

   const measureWidth = useCallback(() => {
      if (containerRef.current) setContainerWidth(containerRef.current.offsetWidth);
   }, []);

   useEffect(() => {
      measureWidth();
      window.addEventListener('resize', measureWidth);
      return () => window.removeEventListener('resize', measureWidth);
   }, [measureWidth]);

   // Build a date->count lookup
   const countMap = useMemo(() => {
      const m: Record<string, number> = {};
      for (const d of data) {
         m[d.date] = d.count;
      }
      return m;
   }, [data]);

   // The whole calendar year (future days empty), so the grid keeps ~53 weeks and cells stay a steady size.
   const today = startOfDay(new Date());
   const startDate = startOfYear(today);
   const endDate = endOfYear(today);
   const allDays = eachDayOfInterval({start: startDate, end: endDate});

   // Compute quintile thresholds from non-zero values
   const quintiles = useMemo(() => {
      const nonZero = allDays
         .map((d) => countMap[format(d, 'yyyy-MM-dd')] ?? 0)
         .filter((v) => v > 0)
         .sort((a, b) => a - b);
      if (nonZero.length === 0) return [0, 0, 0, 0, 0];
      const q = (p: number) => nonZero[Math.floor(p * (nonZero.length - 1))];
      return [q(0.2), q(0.4), q(0.6), q(0.8), q(1.0)];
   }, [allDays, countMap]);

   // One column per week, padded so each starts on Sunday.
   const firstDayOfWeek = allDays[0].getDay(); // 0=Sun
   const paddedDays: (Date | null)[] = [...Array(firstDayOfWeek).fill(null), ...allDays];
   const yearWeeks = Math.ceil(paddedDays.length / 7);
   const allWeeks: (Date | null)[][] = [];
   for (let w = 0; w < yearWeeks; w++) {
      allWeeks.push(paddedDays.slice(w * 7, w * 7 + 7));
   }
   // A narrow card shows the latest weeks that fit at a readable size rather than scrolling.
   const fitWeeks = containerWidth > 0 ? Math.max(8, Math.floor((containerWidth - 34) / (MIN_CELL + gapProp))) : yearWeeks;
   const thisWeek = allWeeks.findIndex((week) => week.some((d) => d && format(d, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')));
   const lastWeek = thisWeek >= 0 ? thisWeek : yearWeeks - 1;
   const weeks = fitWeeks >= yearWeeks ? allWeeks : allWeeks.slice(Math.max(0, lastWeek - fitWeeks + 1), lastWeek + 1);
   const numWeeks = weeks.length;

   // Month labels: find the first week that contains each month's first occurrence
   const monthLabels: {weekIdx: number; label: string}[] = [];
   let lastMonth = -1;
   weeks.forEach((week, wi) => {
      for (const day of week) {
         if (!day) continue;
         const m = day.getMonth();
         if (m !== lastMonth) {
            monthLabels.push({weekIdx: wi, label: format(day, 'MMM')});
            lastMonth = m;
         }
         break;
      }
   });

   const dayLabelWidth = 30;
   const monthLabelHeight = 20;

   // Auto-size cells to stretch across the full container (like GitLab's activity graph).
   const cellSize = containerWidth > 0 ? Math.min(MAX_CELL, Math.floor((containerWidth - dayLabelWidth - 4) / numWeeks - gapProp)) : cellSizeProp;
   const gap = gapProp;

   const totalWidth = numWeeks * (cellSize + gap) - gap;

   return (
      <div
         ref={containerRef}
         role="group"
         aria-label={`Calendar of ${unit} per day: columns are weeks labelled by month, rows are weekdays, darker squares mean more ${unit}`}
         className={className}
         style={{width: '100%', position: 'relative', userSelect: 'none'}}
      >
         <p style={{marginLeft: dayLabelWidth, fontSize: 11, color: 'var(--muted-foreground)'}}>Month</p>
         {/* Month labels */}
         <div
            style={{
               marginLeft: dayLabelWidth,
               height: monthLabelHeight,
               position: 'relative',
               width: totalWidth,
            }}
         >
            {monthLabels.map(({weekIdx, label}) => (
               <span
                  key={label + weekIdx}
                  style={{
                     position: 'absolute',
                     left: weekIdx * (cellSize + gap),
                     fontSize: 11,
                     color: 'var(--muted-foreground)',
                     whiteSpace: 'nowrap',
                  }}
               >
                  {label}
               </span>
            ))}
         </div>

         <div style={{display: 'flex', gap: 0}}>
            {/* Day-of-week labels */}
            <div
               style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap,
                  width: dayLabelWidth,
                  flexShrink: 0,
               }}
            >
               {DAY_LABELS.map((_, i) => (
                  <div
                     key={i}
                     style={{
                        height: cellSize,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        paddingRight: 5,
                        fontSize: 11,
                        color: 'var(--muted-foreground)',
                     }}
                  >
                     {SHOWN_DAY_LABELS[i] ?? ''}
                  </div>
               ))}
            </div>

            {/* Grid */}
            <div style={{display: 'flex', gap, position: 'relative'}}>
               {weeks.map((week, wi) => (
                  <div key={wi} style={{display: 'flex', flexDirection: 'column', gap}}>
                     {Array.from({length: 7}).map((_, di) => {
                        const day = week[di] ?? null;
                        if (!day) {
                           return <div key={di} style={{width: cellSize, height: cellSize, opacity: 0}} />;
                        }
                        const dateStr = format(day, 'yyyy-MM-dd');
                        const count = countMap[dateStr] ?? 0;
                        const bg = getQuintileColor(count, quintiles, colorRamp);

                        return (
                           <div
                              key={di}
                              title={`${dateStr}: ${count}`}
                              onClick={() => onCellClick?.(dateStr, count)}
                              onMouseEnter={(e) => {
                                 const rect = (e.target as HTMLElement).getBoundingClientRect();
                                 setTooltip({date: dateStr, count, x: rect.left, y: rect.bottom});
                              }}
                              onMouseLeave={() => setTooltip(null)}
                              style={{
                                 width: cellSize,
                                 height: cellSize,
                                 borderRadius: 3,
                                 background: bg,
                                 cursor: onCellClick ? 'pointer' : 'default',
                                 flexShrink: 0,
                              }}
                           />
                        );
                     })}
                  </div>
               ))}
            </div>
         </div>

         {/* Tooltip */}
         {tooltip && (
            <div
               style={{
                  position: 'fixed',
                  top: tooltip.y + 4,
                  left: tooltip.x,
                  background: 'var(--popover)',
                  border: '1px solid var(--border)',
                  borderRadius: 6,
                  padding: '5px 10px',
                  fontSize: 12,
                  color: 'var(--foreground)',
                  pointerEvents: 'none',
                  zIndex: 9999,
                  boxShadow: 'var(--shadow-sm)',
                  whiteSpace: 'nowrap',
               }}
            >
               <strong>{tooltip.date}</strong>: {tooltip.count.toLocaleString()} {unit}
            </div>
         )}

         {/* Legend */}
         <div
            style={{
               marginTop: 8,
               marginLeft: dayLabelWidth,
               display: 'flex',
               alignItems: 'center',
               gap: 6,
               fontSize: 11,
               color: 'var(--muted-foreground)',
            }}
         >
            <span>Weekday on the left.</span>
            <span style={{marginLeft: 'auto'}}>Fewer</span>
            {['var(--muted)', ...colorRamp].map((c, i) => (
               <span key={i} aria-hidden style={{width: 12, height: 12, borderRadius: 3, background: c}} />
            ))}
            <span>More {unit}</span>
         </div>
      </div>
   );
};

export default CalendarHeatmap;
