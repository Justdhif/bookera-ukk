"use client";

import { useTranslations } from "next-intl";
import { AlertTriangle, Clock, LogIn, Sparkles } from "lucide-react";
import { Borrow } from "@/types/borrow";

interface DailyTimelineReminderAlertProps {
  activeBorrows: Borrow[];
  isAuthenticated: boolean;
}

const returnReminderSoonDays = 3;

type ReturnReminder = {
  daysLeft: number;
  isOverdue: boolean;
};

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function diffDays(left: Date, right: Date) {
  return Math.round(
    (startOfDay(right).getTime() - startOfDay(left).getTime()) /
      (1000 * 60 * 60 * 24),
  );
}

function getReturnReminder(activeBorrows: Borrow[]): ReturnReminder | null {
  const today = startOfDay(new Date());

  const nearestBorrow = activeBorrows
    .map((borrow) => ({
      daysLeft: diffDays(today, startOfDay(new Date(borrow.return_date))),
    }))
    .sort((left, right) => left.daysLeft - right.daysLeft)[0];

  if (!nearestBorrow) {
    return null;
  }

  return {
    daysLeft: nearestBorrow.daysLeft,
    isOverdue: nearestBorrow.daysLeft < 0,
  };
}

export function DailyTimelineReminderAlert({
  activeBorrows,
  isAuthenticated,
}: DailyTimelineReminderAlertProps) {
  const t = useTranslations("daily_timeline");
  const returnReminder = getReturnReminder(activeBorrows);

  if (!isAuthenticated) {
    return (
      <div className="relative z-10 px-4 pb-4 sm:px-5 sm:pb-5">
        <div className="flex items-start gap-3 rounded-2xl border border-blue-200 bg-blue-50/90 px-4 py-3 shadow-sm dark:border-blue-500/20 dark:bg-blue-500/10">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300">
            <LogIn size={18} />
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-black uppercase tracking-[0.28em] text-blue-700 dark:text-blue-300">
              {t("login_prompt")}
            </p>
            <p className="mt-1 text-sm font-semibold leading-6 text-blue-900 dark:text-blue-100">
              {t("login_desc")}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (activeBorrows.length === 0) {
    return (
      <div className="relative z-10 px-4 pb-4 sm:px-5 sm:pb-5">
        <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/90 px-4 py-3 shadow-sm dark:border-emerald-500/20 dark:bg-emerald-500/10">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
            <Sparkles size={18} />
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-black uppercase tracking-[0.28em] text-emerald-700 dark:text-emerald-300">
              {t("welcome_title")}
            </p>
            <p className="mt-1 text-sm font-semibold leading-6 text-emerald-900 dark:text-emerald-100">
              {t("welcome_desc")}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!returnReminder) {
    return null;
  }

  const isUrgent = returnReminder.daysLeft <= returnReminderSoonDays;
  const toneClasses = returnReminder.isOverdue
    ? {
        shell: "border-red-200 bg-red-50/90 dark:border-red-500/20 dark:bg-red-500/10",
        icon: "bg-red-100 text-red-600 dark:bg-red-500/15 dark:text-red-300",
        label: "text-red-600 dark:text-red-300",
        text: "text-red-900 dark:text-red-100",
      }
    : isUrgent
      ? {
          shell:
            "border-amber-200 bg-amber-50/90 dark:border-amber-500/20 dark:bg-amber-500/10",
          icon: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
          label: "text-amber-700 dark:text-amber-300",
          text: "text-amber-900 dark:text-amber-100",
        }
      : {
          shell: "border-blue-200 bg-blue-50/90 dark:border-blue-500/20 dark:bg-blue-500/10",
          icon: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300",
          label: "text-blue-700 dark:text-blue-300",
          text: "text-blue-900 dark:text-blue-100",
        };

  return (
    <div className="relative z-10 px-4 pb-4 sm:px-5 sm:pb-5">
      <div className={`flex items-start gap-3 rounded-2xl border px-4 py-3 shadow-sm ${toneClasses.shell}`}>
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${toneClasses.icon}`}>
          {returnReminder.isOverdue ? <AlertTriangle size={18} /> : <Clock size={18} />}
        </div>

        <div className="min-w-0 flex-1">
          <p className={`text-[10px] font-black uppercase tracking-[0.28em] ${toneClasses.label}`}>
            {t("reminder_title")}
          </p>
          <p className={`mt-1 text-sm font-semibold leading-6 ${toneClasses.text}`}>
            {returnReminder.isOverdue
              ? t("reminder_overdue", { count: Math.abs(returnReminder.daysLeft) })
              : returnReminder.daysLeft === 0
                ? t("reminder_due_today")
                : t("reminder_due_soon", { count: returnReminder.daysLeft })}
          </p>
          {returnReminder.isOverdue && (
            <p className="mt-1 text-xs font-medium leading-5 text-red-700/80 dark:text-red-200/80">
              {t("reminder_fine_hint")}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}