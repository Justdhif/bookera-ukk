"use client";

import { Borrow } from "@/types/borrow";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  BookOpen,
  LogIn,
  CalendarDays,
  Clock,
  AlertTriangle,
  CheckCircle2,
  BookMarked,
  RotateCcw,
} from "lucide-react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import {
  startOfDay,
  diffDays,
  fullDate,
  getDayEvents,
  getBookTitle,
} from "./DailyTimeline";

export interface TimelineDayDialogProps {
  date: Date | null;
  borrows: Borrow[];
  isAuthenticated: boolean;
  open: boolean;
  onClose: () => void;
}

export function TimelineDayDialog({
  date,
  borrows,
  isAuthenticated,
  open,
  onClose,
}: TimelineDayDialogProps) {
  const t = useTranslations("daily_timeline");
  const locale = useLocale();

  if (!date) return null;

  const events = isAuthenticated ? getDayEvents(date, borrows) : [];
  const today = startOfDay(new Date());
  const daysLeft = diffDays(today, date);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-sm rounded-2xl border-gray-200 dark:border-white/10 bg-white dark:bg-linear-to-b dark:from-[#1a1a2e] dark:to-[#16213e] text-gray-900 dark:text-white p-0 overflow-hidden shadow-2xl">
        <div className="px-5 pt-5 pb-4 border-b border-gray-100 dark:border-white/8 space-y-1">
          <DialogHeader>
            <DialogTitle className="text-sm font-black text-gray-900 dark:text-white/90 leading-snug">
              {fullDate(date, locale)}
            </DialogTitle>
          </DialogHeader>
          <div className="flex items-center gap-2">
            {daysLeft === 0 ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/20 dark:border-emerald-500/25 px-2.5 py-0.5 rounded-full">
                <CalendarDays size={10} /> {t("today_label")}
              </span>
            ) : daysLeft > 0 ? (
              <span className="text-[10px] font-medium text-gray-400 dark:text-white/40">{t("due_in", { count: daysLeft }).replace('h', 'd')}</span>
            ) : (
              <span className="text-[10px] font-medium text-gray-400 dark:text-white/40">{t("due_in", { count: Math.abs(daysLeft) }).replace('lagi', 'lalu').replace('left', 'ago')}</span>
            )}
          </div>
        </div>

        <div className="px-5 py-4 space-y-3 min-h-[140px]">
          {!isAuthenticated ? (
            <div className="flex flex-col items-center justify-center gap-4 py-8 text-center">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/5 dark:bg-emerald-500/15 border border-emerald-500/10 dark:border-emerald-500/20 flex items-center justify-center shadow-xs">
                <LogIn size={24} className="text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-gray-800 dark:text-white/80">{t("login_prompt")}</p>
                <p className="text-[11px] font-medium text-gray-400 dark:text-white/40 max-w-[200px] mx-auto">
                  {t("login_desc")}
                </p>
              </div>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 dark:bg-emerald-50 dark:hover:bg-emerald-400 text-white px-6 py-2.5 rounded-xl transition-all duration-200 shadow-lg shadow-emerald-500/20 active:scale-95"
                onClick={onClose}
              >
                <LogIn size={13} /> {t("login_btn")}
              </Link>
            </div>
          ) : events.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
              <div className="p-3 rounded-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                <CalendarDays size={32} className="text-gray-300 dark:text-white/15" />
              </div>
              <p className="text-xs font-medium text-gray-400 dark:text-white/35">{t("empty_events")}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {events.map((event, i) => {
                const start = startOfDay(new Date(event.borrow.borrow_date));
                const end = startOfDay(new Date(event.borrow.return_date));
                const dl = diffDays(today, end);
                const isOverdue = dl < 0;
                const isUrgent = dl >= 0 && dl <= 2;

                const typeConfig = {
                  start: {
                    icon: <BookMarked size={14} className="text-emerald-600 dark:text-emerald-400" />,
                    label: t("type_start"),
                    color: "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/25",
                    badge: "text-emerald-600 dark:text-emerald-400",
                    iconContainer: "bg-emerald-100/50 dark:bg-white/5",
                  },
                  end: {
                    icon: <RotateCcw size={14} className="text-red-600 dark:text-red-400" />,
                    label: t("type_end"),
                    color: "bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/25",
                    badge: "text-red-600 dark:text-red-400",
                    iconContainer: "bg-red-100/50 dark:bg-white/5",
                  },
                  active: {
                    icon: <BookOpen size={14} className="text-blue-600 dark:text-blue-400" />,
                    label: t("type_active"),
                    color: "bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20",
                    badge: "text-blue-600 dark:text-blue-400",
                    iconContainer: "bg-blue-100/50 dark:bg-white/5",
                  },
                }[event.type];

                return (
                  <div
                    key={i}
                    className={`flex items-start gap-3.5 p-3.5 rounded-xl border transition-all hover:shadow-md dark:hover:shadow-none ${typeConfig.color}`}
                  >
                    <div className={`w-8 h-8 shrink-0 flex items-center justify-center rounded-xl ${typeConfig.iconContainer}`}>
                      {typeConfig.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className={`text-[9px] font-black uppercase tracking-widest ${typeConfig.badge}`}>
                          {typeConfig.label}
                        </span>
                        {event.type === "end" && (
                          isOverdue ? (
                            <span className="flex items-center gap-0.5 text-[9px] font-black text-red-600 dark:text-red-400">
                              <AlertTriangle size={9} /> {t("overdue", { count: Math.abs(dl)} )}
                            </span>
                          ) : isUrgent ? (
                            <span className="flex items-center gap-0.5 text-[9px] font-black text-amber-600 dark:text-amber-400">
                              <Clock size={9} /> {dl === 0 ? t("due_today") : t("due_in", { count: dl })}
                            </span>
                          ) : (
                            <span className="flex items-center gap-0.5 text-[9px] font-medium text-gray-400 dark:text-white/40">
                              <CheckCircle2 size={9} /> {t("due_in", { count: dl })}
                            </span>
                          )
                        )}
                      </div>
                      <p className="text-[12px] font-bold text-gray-800 dark:text-white/80 leading-tight">
                        {getBookTitle(event.borrow)}
                      </p>
                      <p className="text-[10px] font-medium text-gray-400 dark:text-white/35 mt-1 font-mono">
                        Kode {event.borrow.borrow_code}
                      </p>
                      <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-gray-100 dark:border-white/5 text-[10px] font-bold text-gray-400 dark:text-white/30 lowercase italic">
                        <span>{start.toLocaleDateString(locale === "id" ? "id-ID" : "en-US", { day: "2-digit", month: "short" })}</span>
                        <span className="not-italic text-[8px] opacity-50">→</span>
                        <span>{end.toLocaleDateString(locale === "id" ? "id-ID" : "en-US", { day: "2-digit", month: "short" })}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {isAuthenticated && events.length > 0 && (
          <div className="px-5 pb-5">
            <Link
              href="/my-borrows"
              onClick={onClose}
              className="flex items-center justify-center gap-2 w-full text-xs font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-600/20 dark:border-emerald-500/20 hover:bg-emerald-500/5 dark:hover:bg-emerald-500/10 py-3 rounded-xl transition-all duration-200 active:scale-95 shadow-sm"
            >
              <BookOpen size={13} /> {t("view_all")}
            </Link>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
