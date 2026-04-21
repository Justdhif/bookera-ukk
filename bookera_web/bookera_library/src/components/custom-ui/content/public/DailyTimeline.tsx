"use client";

import { useEffect, useState } from "react";
import { borrowService } from "@/services/borrow.service";
import { Borrow } from "@/types/borrow";
import { useAuthStore } from "@/store/auth.store";
import { Button } from "@/components/ui/button";
import { CalendarDays, ArrowLeft, ArrowRight, Clock } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { DayBubble } from "./DayBubble";
import { ActiveBorrowPanel } from "./ActiveBorrowPanel";
import { DailyTimelineReminderAlert } from "./DailyTimelineReminderAlert";

export function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function diffDays(a: Date, b: Date) {
  return Math.round(
    (startOfDay(b).getTime() - startOfDay(a).getTime()) / (1000 * 60 * 60 * 24),
  );
}

export function isSameDay(a: Date, b: Date) {
  return diffDays(a, b) === 0;
}

export function formatId(date: Date, locale: string) {
  const code = locale === "id" ? "id-ID" : "en-US";
  return date.toLocaleDateString(code, { day: "2-digit", month: "short" });
}

export function dayName(date: Date, locale: string) {
  const code = locale === "id" ? "id-ID" : "en-US";
  return date.toLocaleDateString(code, { weekday: "short" });
}

export function fullDate(date: Date, locale: string) {
  const code = locale === "id" ? "id-ID" : "en-US";
  return date.toLocaleDateString(code, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export type BorrowEvent = {
  borrow: Borrow;
  type: "start" | "end" | "active";
};

export function getBookTitle(borrow: Borrow): string {
  if (borrow.borrow_details?.length > 0) {
    const titles = borrow.borrow_details
      .map((d) => d.book_copy?.book?.title)
      .filter(Boolean);
    if (titles.length > 0) return titles.join(", ");
  }
  const reqDetails =
    (borrow.borrow_request?.borrow_request_details as any[]) ?? [];
  const titles = reqDetails.map((d: any) => d.book?.title).filter(Boolean);
  return titles.length > 0 ? titles.join(", ") : `Kode ${borrow.borrow_code}`;
}

export function getDayEvents(date: Date, borrows: Borrow[]): BorrowEvent[] {
  const events: BorrowEvent[] = [];
  for (const borrow of borrows) {
    const start = startOfDay(new Date(borrow.borrow_date));
    const end = startOfDay(new Date(borrow.return_date));
    const d = startOfDay(date);
    if (isSameDay(d, start)) {
      events.push({ borrow, type: "start" });
    } else if (isSameDay(d, end)) {
      events.push({ borrow, type: "end" });
    } else if (d > start && d < end) {
      events.push({ borrow, type: "active" });
    }
  }
  return events;
}

export type DayState =
  | "today"
  | "past"
  | "future"
  | "has-event"
  | "deadline"
  | "start";

export function getDayState(date: Date, borrows: Borrow[]): DayState {
  const today = startOfDay(new Date());
  const d = startOfDay(date);
  const events = getDayEvents(d, borrows);

  const hasDeadline = events.some((e) => e.type === "end");
  const hasStart = events.some((e) => e.type === "start");
  const hasActive = events.some((e) => e.type === "active");

  if (hasDeadline) return "deadline";
  if (hasStart) return "start";
  if (hasActive) return "has-event";
  if (isSameDay(d, today)) return "today";
  if (d < today) return "past";
  return "future";
}

function getMonday(date: Date): Date {
  const d = startOfDay(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  return new Date(d.getTime() + diff * 86400000);
}

export default function DailyTimeline() {
  const { isAuthenticated } = useAuthStore();
  const [borrows, setBorrows] = useState<Borrow[]>([]);
  const [weekOffset, setWeekOffset] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [mounted, setMounted] = useState(false);

  const t = useTranslations("daily_timeline");
  const locale = useLocale();
  const userSlug = useAuthStore((state) => state.user?.slug);

  useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const today = startOfDay(new Date());
  const monday = new Date(
    getMonday(today).getTime() + weekOffset * 7 * 86400000,
  );

  const days: Date[] = Array.from({ length: 7 }, (_, i) =>
    startOfDay(new Date(monday.getTime() + i * 86400000)),
  );

  useEffect(() => {
    if (!isAuthenticated) {
      setBorrows([]);
      return;
    }

    borrowService
      .getByUser()
      .then((res) => setBorrows(res.data.data ?? []))
      .catch(() => setBorrows([]));
  }, [isAuthenticated]);

  const activeBorrows = borrows.filter((b) => b.status === "open");
  const activeBorrowsHref = userSlug
    ? `/${userSlug}/my-borrows`
    : "/my-borrows";
  const sunday = days[6];
  const weekLabel = (() => {
    const code = locale === "id" ? "id-ID" : "en-US";
    const monStr = monday.toLocaleDateString(code, {
      day: "numeric",
      month: "short",
    });
    const sunStr = sunday.toLocaleDateString(code, {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
    return `${monStr} – ${sunStr}`;
  })();

  return (
    <div className="grid items-stretch gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.95fr)]">
      <div className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-colors duration-300 dark:border-white/6 dark:bg-linear-to-br dark:from-[#0f0f1a] dark:via-[#1a1a2e] dark:to-[#16213e] dark:shadow-none">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.06)_0%,transparent_70%)] dark:bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.10)_0%,transparent_70%)]" />
          <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(52,211,153,0.04)_0%,transparent_70%)] dark:bg-[radial-gradient(ellipse_at_center,rgba(52,211,153,0.06)_0%,transparent_70%)]" />
          <svg
            className="absolute right-0 top-0 h-12 w-24 opacity-20 dark:opacity-40"
            viewBox="0 0 96 48"
            fill="none"
          >
            <line
              x1="20"
              y1="0"
              x2="96"
              y2="48"
              stroke="currentColor"
              className="text-emerald-500/10 dark:text-emerald-500/8"
              strokeWidth="16"
            />
            <line
              x1="50"
              y1="0"
              x2="96"
              y2="36"
              stroke="currentColor"
              className="text-emerald-500/10 dark:text-emerald-500/5"
              strokeWidth="8"
            />
          </svg>
        </div>

        <div className="relative z-10 flex flex-col gap-4 border-b border-gray-100 px-4 pb-3 pt-4 dark:border-white/5 sm:px-5 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10 shadow-xs dark:bg-emerald-500/15">
              <CalendarDays
                size={16}
                className="text-emerald-600 dark:text-emerald-400"
              />
            </div>
            <div className="flex flex-col">
              <div className="mb-0.5 flex flex-wrap items-center gap-2">
                <p className="text-[11px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                  {t("title")}
                </p>
                {mounted && (
                  <span className="flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 font-mono text-[10px] font-bold text-emerald-600 dark:text-emerald-400/80">
                    <Clock size={10} />
                    {currentTime.toLocaleTimeString(
                      locale === "id" ? "id-ID" : "en-US",
                      {
                        hour: "2-digit",
                        minute: "2-digit",
                      },
                    )}
                  </span>
                )}
              </div>
              <p className="text-[10px] font-medium text-gray-400 dark:text-white/40">
                {weekLabel}
              </p>
            </div>
          </div>

          <div className="flex w-full flex-wrap items-center justify-start gap-2 self-start sm:gap-3 md:ml-auto md:w-auto md:justify-end md:self-auto">
            <div className="flex items-center gap-1 rounded-xl border border-gray-200 bg-gray-100 p-1 dark:border-white/10 dark:bg-white/5 md:ml-auto">
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => setWeekOffset((p) => p - 1)}
                className="text-gray-400 hover:bg-white hover:text-emerald-600 dark:text-white/50 dark:hover:bg-white/10 dark:hover:text-white"
              >
                <ArrowLeft size={14} />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setWeekOffset(0)}
                className="rounded-lg px-3 py-1 text-[10px] font-bold whitespace-nowrap text-gray-500 transition-all duration-200 hover:text-emerald-600 dark:text-white/50 dark:hover:text-emerald-400"
              >
                {weekOffset === 0
                  ? t("this_week")
                  : weekOffset === 1
                    ? t("next_week")
                    : weekOffset === -1
                      ? t("last_week")
                      : weekOffset > 1
                        ? t("weeks_ahead", { count: weekOffset })
                        : t("weeks_ago", { count: Math.abs(weekOffset) })}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => setWeekOffset((p) => p + 1)}
                className="text-gray-400 hover:bg-white hover:text-emerald-600 dark:text-white/50 dark:hover:bg-white/10 dark:hover:text-white"
              >
                <ArrowRight size={14} />
              </Button>
            </div>
          </div>
        </div>

        <div className="relative z-10 overflow-x-hidden sm:overflow-x-auto scrollbar-hide">
          <div className="px-6 py-8 sm:min-w-125">
            <div className="space-y-2">
              <div className="grid grid-cols-7 gap-4 md:gap-5">
                {days.map((day, i) => (
                  <div
                    key={i}
                    className="py-1 text-center text-[10px] font-semibold tracking-[0.22em] text-muted-foreground uppercase"
                  >
                    {dayName(day, locale)}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-4">
                {days.map((day, i) => (
                  <DayBubble
                    key={i}
                    date={day}
                    borrows={activeBorrows}
                    locale={locale}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 px-5 pb-4">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-white/40">
            <div className="flex items-center gap-2.5">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80 shadow-[0_0_8px_rgba(16,185,129,0.3)]" />
              <span>{t("start_borrow")}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="h-2.5 w-2.5 rounded-full bg-red-500/80 shadow-[0_0_8px_rgba(239,68,68,0.3)]" />
              <span>{t("deadline")}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="h-2.5 w-2.5 rounded-full bg-blue-500/80 shadow-[0_0_8px_rgba(59,130,246,0.3)]" />
              <span>{t("in_progress")}</span>
            </div>
          </div>
        </div>

        <DailyTimelineReminderAlert
          activeBorrows={activeBorrows}
          isAuthenticated={isAuthenticated}
        />
      </div>

      <ActiveBorrowPanel
        borrows={activeBorrows}
        isAuthenticated={isAuthenticated}
        activeBorrowsHref={activeBorrowsHref}
      />
    </div>
  );
}
