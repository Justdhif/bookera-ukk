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
  onClick: () => void;
  isSelected: boolean;
  locale: string;
  todayLabel: string;
}

export function DayBubble({ date, borrows, onClick, isSelected, locale, todayLabel }: DayBubbleProps) {
  const today = startOfDay(new Date());
  const d = startOfDay(date);
  const isToday = isSameDay(d, today);
  const state = getDayState(d, borrows);
  const events = getDayEvents(d, borrows);

  const ringClass = isSelected
    ? "ring-2 ring-gray-400 dark:ring-white/60"
    : "";

  const outerClass =
    state === "deadline"
      ? "bg-red-50 dark:bg-red-500/15 border border-red-200 dark:border-red-500/40"
      : state === "start"
      ? "bg-emerald-50 dark:bg-emerald-500/15 border border-emerald-200 dark:border-emerald-500/40"
      : state === "has-event"
      ? "bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20"
      : isToday
      ? "bg-gray-100 dark:bg-white/10 border border-gray-300 dark:border-white/20"
      : state === "past"
      ? "bg-gray-50 dark:bg-white/3 border border-gray-100 dark:border-white/8"
      : "bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 shadow-xs";

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
    <button
      onClick={onClick}
      className={`relative flex flex-col justify-between items-center w-full aspect-square py-2.5 px-1 rounded-xl cursor-pointer transition-all duration-300 hover:shadow-md dark:hover:shadow-none active:scale-95 overflow-hidden ${outerClass} ${ringClass}`}
    >
      {isToday && (
        <div className="absolute left-[6px] sm:left-[8px] inset-y-0 w-0 flex items-center justify-center pointer-events-none">
          <span className="rotate-90 text-[8px] sm:text-[9px] font-black uppercase text-gray-400/20 dark:text-emerald-400/20 whitespace-nowrap tracking-[1em] select-none leading-none">
            {todayLabel}
          </span>
        </div>
      )}
      
      <span className={`text-[8px] sm:text-[10px] font-bold uppercase tracking-wider leading-none relative z-10 ${dayTextColor}`}>
        {dayName(date, locale)}
      </span>

      <div className="flex items-center justify-center absolute top-1.5 left-1.5 sm:relative sm:top-0 sm:left-0">
        {isToday && (
          <span className="absolute w-4 h-4 sm:w-6 sm:h-6 rounded-full bg-gray-200 dark:bg-white/10 animate-pulse" />
        )}
        <div className={`w-2 h-2 sm:w-3.5 sm:h-3.5 rounded-full ${dotColor} ${state === "deadline" ? "animate-pulse" : ""}`} />
      </div>

      <div className="flex flex-col items-center gap-px">
        <span className={`text-[12px] sm:text-[13px] tabular-nums leading-none ${dateTextColor}`}>
          {date.getDate()}
        </span>
        {events.length > 0 && (
          <div className="flex gap-0.5 mt-0.5">
            {events.slice(0, 3).map((_, i) => (
              <span
                key={i}
                className={`w-1 h-1 rounded-full ${
                  state === "deadline"
                    ? "bg-red-500 dark:bg-red-400"
                    : state === "start"
                    ? "bg-emerald-500 dark:bg-emerald-400"
                    : "bg-blue-500 dark:bg-blue-400"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </button>
  );
}
