import { Borrow } from "@/types/borrow";
import {
  startOfDay,
  isSameDay,
  getDayState,
  getDayEvents,
  dayName,
} from "./DailyTimeline";

export interface DayBubbleProps {
  date: Date;
  borrows: Borrow[];
  locale: string;
}

export function DayBubble({ date, borrows, locale }: DayBubbleProps) {
  const today = startOfDay(new Date());
  const d = startOfDay(date);
  const isToday = isSameDay(d, today);
  const state = getDayState(d, borrows);

  const dotColor =
    state === "deadline"
      ? "bg-red-500 dark:bg-red-400 shadow-[0_0_8px_rgba(239,68,68,0.4)] dark:shadow-[0_0_6px_rgba(239,68,68,0.8)]"
      : state === "start"
      ? "bg-emerald-500 dark:bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.4)] dark:shadow-[0_0_6px_rgba(16,185,129,0.8)]"
      : state === "has-event"
      ? "bg-blue-500 dark:bg-blue-400 shadow-[0_0_8px_rgba(59,130,246,0.3)] dark:shadow-[0_0_6px_rgba(96,165,250,0.6)]"
      : isToday
      ? "bg-gray-400 dark:bg-white/60"
      : state === "past"
      ? "bg-gray-200 dark:bg-white/15"
      : "bg-gray-300 dark:bg-white/25";

  const dayTextColor =
    state === "deadline"
      ? "text-red-600 dark:text-red-400"
      : state === "start"
      ? "text-emerald-600 dark:text-emerald-400"
      : state === "has-event"
      ? "text-blue-600 dark:text-blue-400"
      : isToday
      ? "text-gray-900 dark:text-white"
      : state === "past"
      ? "text-gray-400 dark:text-white/30"
      : "text-gray-500 dark:text-white/50";

  const dateTextColor =
    state === "deadline"
      ? "text-red-600 dark:text-red-300 font-black"
      : state === "start"
      ? "text-emerald-600 dark:text-emerald-300 font-black"
      : state === "has-event"
      ? "text-blue-600 dark:text-blue-300 font-bold"
      : isToday
      ? "text-gray-950 dark:text-white font-black"
      : state === "past"
      ? "text-gray-300 dark:text-white/25"
      : "text-gray-600 dark:text-white/60 font-bold";

  return (
    <div className="flex w-full flex-col items-center justify-center gap-2 py-2 text-center sm:gap-2.5 sm:py-2.5">
      <span className={`text-[9px] font-bold uppercase tracking-[0.12em] leading-none sm:text-[10px] ${dayTextColor}`}>
        {dayName(date, locale)}
      </span>

      <div className="relative flex items-center justify-center">
        {isToday && (
          <span className="absolute h-4 w-4 animate-pulse rounded-full bg-gray-200 dark:bg-white/10 sm:h-5 sm:w-5" />
        )}
        <div
          className={`h-2 w-2 rounded-full sm:h-3 sm:w-3 ${dotColor} ${
            state === "deadline" ? "animate-pulse" : ""
          }`}
        />
      </div>

      <span className={`text-[13px] tabular-nums leading-none sm:text-[14px] ${dateTextColor}`}>
        {date.getDate()}
      </span>
    </div>
  );
}
