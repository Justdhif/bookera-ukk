import { cn } from "@/lib/utils";
import { Borrow } from "@/types/borrow";

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function diffDays(a: Date, b: Date) {
  return Math.round(
    (startOfDay(b).getTime() - startOfDay(a).getTime()) / (1000 * 60 * 60 * 24),
  );
}

function isSameDay(a: Date, b: Date) {
  return diffDays(a, b) === 0;
}

type BorrowEvent = {
  borrow: Borrow;
  type: "start" | "end" | "active";
};

type DayState =
  | "today"
  | "past"
  | "future"
  | "has-event"
  | "deadline"
  | "start";

function getDayEvents(date: Date, borrows: Borrow[]): BorrowEvent[] {
  const events: BorrowEvent[] = [];

  for (const borrow of borrows) {
    const start = startOfDay(new Date(borrow.borrow_date));
    const end = startOfDay(new Date(borrow.return_date));
    const current = startOfDay(date);

    if (isSameDay(current, start)) {
      events.push({ borrow, type: "start" });
    } else if (isSameDay(current, end)) {
      events.push({ borrow, type: "end" });
    } else if (current > start && current < end) {
      events.push({ borrow, type: "active" });
    }
  }

  return events;
}

function getDayState(date: Date, borrows: Borrow[]): DayState {
  const today = startOfDay(new Date());
  const current = startOfDay(date);
  const events = getDayEvents(current, borrows);

  const hasDeadline = events.some((event) => event.type === "end");
  const hasStart = events.some((event) => event.type === "start");
  const hasActive = events.some((event) => event.type === "active");

  if (isSameDay(current, today)) {
    return "today";
  }

  if (current < today) {
    if (hasDeadline) return "deadline";
    if (hasStart) return "start";
    if (hasActive) return "has-event";
    return "past";
  }

  if (hasDeadline) return "deadline";
  if (hasStart) return "start";
  if (hasActive) return "has-event";
  return "future";
}

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
  const events = getDayEvents(d, borrows);
  const total = events.length;

  const getDayStyles = () => {
    switch (state) {
      case "deadline":
        return "bg-red-50 text-red-600 border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/30";
      case "start":
        return "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-900/30";
      case "has-event":
        return "bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-900/30";
      case "past":
        return "bg-gray-50 text-gray-400 border-gray-100 dark:bg-white/5 dark:text-white/20 dark:border-white/10";
      default:
        return "bg-white text-gray-500 border-gray-100 dark:bg-white/5 dark:text-white/40 dark:border-white/10";
    }
  };

  const dotColor =
    state === "deadline"
      ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]"
      : state === "start"
      ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]"
      : state === "has-event"
      ? "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.3)]"
      : "bg-transparent";

  return (
    <div
      className={cn(
        "relative flex aspect-square min-h-10 md:min-h-20 flex-col items-end justify-start overflow-hidden rounded-lg md:rounded-2xl p-1.5 md:p-2.5 pt-1 md:pt-2 text-right outline-none transition-all",
        "border shadow-xs",
        getDayStyles(),
        isToday && "ring-2 ring-indigo-500/50 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-200 shadow-md ring-offset-background"
      )}
    >
      <span className="relative z-10 text-xs md:text-[14px] font-bold leading-none drop-shadow-xs">
        {date.getDate()}
      </span>

      {total > 0 && (
        <div className="mt-auto self-start">
          <div
            className={cn(
              "h-1.5 w-1.5 md:h-2 md:w-2 rounded-full",
              dotColor,
              state === "deadline" && "animate-pulse"
            )}
          />
        </div>
      )}
    </div>
  );
}
