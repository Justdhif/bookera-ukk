"use client";

import { useEffect, useState } from "react";
import { borrowService } from "@/services/borrow.service";
import { Borrow } from "@/types/borrow";
import { useAuthStore } from "@/store/auth.store";
import {
  BookOpen,
  LogIn,
  CalendarDays,
  ArrowLeft,
  ArrowRight,
  Clock,
} from "lucide-react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { TimelineDayDialog } from "./DailyTimelineDialog";
import { DayBubble } from "./DayBubble";

export function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function diffDays(a: Date, b: Date) {
  return Math.round(
    (startOfDay(b).getTime() - startOfDay(a).getTime()) / (1000 * 60 * 60 * 24)
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
  const reqDetails = (borrow.borrow_request?.borrow_request_details as any[]) ?? [];
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

export type DayState = "today" | "past" | "future" | "has-event" | "deadline" | "start";

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
  const { isAuthenticated, initialLoading } = useAuthStore();
  const [borrows, setBorrows] = useState<Borrow[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [weekOffset, setWeekOffset] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [mounted, setMounted] = useState(false);

  const t = useTranslations("daily_timeline");
  const locale = useLocale();

  useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const today = startOfDay(new Date());
  const monday = new Date(getMonday(today).getTime() + weekOffset * 7 * 86400000);

  const days: Date[] = Array.from({ length: 7 }, (_, i) =>
    startOfDay(new Date(monday.getTime() + i * 86400000))
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

  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
    setDialogOpen(true);
  };

  const activeBorrows = borrows.filter((b) => b.status === "open");
  const totalEvents = days.reduce(
    (acc, d) => acc + getDayEvents(d, activeBorrows).length,
    0
  );

  const sunday = days[6];
  const weekLabel = (() => {
    const code = locale === "id" ? "id-ID" : "en-US";
    const monStr = monday.toLocaleDateString(code, { day: "numeric", month: "short" });
    const sunStr = sunday.toLocaleDateString(code, { day: "numeric", month: "short", year: "numeric" });
    return `${monStr} – ${sunStr}`;
  })();

  return (
    <>
      <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-linear-to-br dark:from-[#0f0f1a] dark:via-[#1a1a2e] dark:to-[#16213e] border border-gray-200 dark:border-white/6 shadow-sm dark:shadow-none transition-colors duration-300">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.06)_0%,transparent_70%)] dark:bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.10)_0%,transparent_70%)]" />
          <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(52,211,153,0.04)_0%,transparent_70%)] dark:bg-[radial-gradient(ellipse_at_center,rgba(52,211,153,0.06)_0%,transparent_70%)]" />
          <svg className="absolute top-0 right-0 w-24 h-12 opacity-20 dark:opacity-40" viewBox="0 0 96 48" fill="none">
            <line x1="20" y1="0" x2="96" y2="48" stroke="currentColor" className="text-emerald-500/10 dark:text-emerald-500/8" strokeWidth="16" />
            <line x1="50" y1="0" x2="96" y2="36" stroke="currentColor" className="text-emerald-500/10 dark:text-emerald-500/5" strokeWidth="8" />
          </svg>
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between px-5 pt-4 pb-3 border-b border-gray-100 dark:border-white/5 gap-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/20 shadow-xs">
              <CalendarDays size={16} className="text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <p className="text-[11px] font-black tracking-widest text-emerald-600 dark:text-emerald-400 uppercase">
                  {t("title")}
                </p>
                {mounted && (
                  <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400/80 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Clock size={10} />
                    {currentTime.toLocaleTimeString(locale === "id" ? "id-ID" : "en-US", { hour: '2-digit', minute: '2-digit' })}
                  </span>
                )}
              </div>
              <p className="text-[10px] font-medium text-gray-400 dark:text-white/40">{weekLabel}</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 self-end sm:self-auto">
            {!isAuthenticated && !initialLoading && (
              <Link
                href="/login"
                className="flex items-center gap-1.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400/80 hover:text-emerald-500 dark:hover:text-emerald-400 border border-emerald-500/20 px-3 py-1.5 rounded-xl bg-emerald-500/5 transition-all duration-200 mr-1"
              >
                <LogIn size={11} /> Login
              </Link>
            )}
            {isAuthenticated && (
              <Link
                href="/my-borrows"
                className="flex items-center gap-1.5 text-[10px] font-semibold text-gray-500 dark:text-white/40 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors duration-200 mr-2 bg-gray-100 dark:bg-white/5 px-2.5 py-1 rounded-lg"
              >
                <BookOpen size={11} /> {t("active_count", { count: activeBorrows.length })}
              </Link>
            )}
            <div className="flex items-center gap-1 bg-gray-100 dark:bg-white/5 p-1 rounded-xl border border-gray-200 dark:border-white/10">
              <button
                onClick={() => setWeekOffset((p) => p - 1)}
                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white dark:hover:bg-white/10 text-gray-400 dark:text-white/50 hover:text-emerald-600 dark:hover:text-white transition-all duration-200"
              >
                <ArrowLeft size={14} />
              </button>
              <button
                onClick={() => setWeekOffset(0)}
                className="text-[10px] font-bold px-3 py-1 rounded-lg text-gray-500 dark:text-white/50 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all duration-200 whitespace-nowrap"
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
              </button>
              <button
                onClick={() => setWeekOffset((p) => p + 1)}
                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white dark:hover:bg-white/10 text-gray-400 dark:text-white/50 hover:text-emerald-600 dark:hover:text-white transition-all duration-200"
              >
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>

        <div className="relative z-10 px-4 py-4">
          <div className="grid grid-cols-7 gap-3 sm:gap-4">
            {days.map((day, i) => (
              <DayBubble
                key={i}
                date={day}
                borrows={activeBorrows}
                onClick={() => handleDayClick(day)}
                isSelected={selectedDate ? isSameDay(day, selectedDate) : false}
                locale={locale}
                todayLabel={t("today_label")}
              />
            ))}
          </div>
        </div>

        <div className="relative z-10 px-5 pb-4">
          <div className="flex flex-wrap items-center gap-5 text-[10px] text-gray-400 dark:text-white/40 font-bold uppercase tracking-wider">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 shadow-sm" />
              <span>{t("start_borrow")}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500/80 shadow-sm" />
              <span>{t("deadline")}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500/80 shadow-sm" />
              <span>{t("in_progress")}</span>
            </div>
          </div>
        </div>
      </div>

      <TimelineDayDialog
        date={selectedDate}
        borrows={activeBorrows}
        isAuthenticated={isAuthenticated}
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
      />
    </>
  );
}
