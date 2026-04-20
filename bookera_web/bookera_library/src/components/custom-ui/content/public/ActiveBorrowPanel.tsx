"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { AlertTriangle, ArrowRight, BookOpen, Clock, LogIn } from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import EmptyState from "@/components/custom-ui/EmptyState";
import { Borrow } from "@/types/borrow";
import { diffDays, getBookTitle, startOfDay } from "./DailyTimeline";

interface ActiveBorrowPanelProps {
  borrows: Borrow[];
  isAuthenticated: boolean;
  activeBorrowsHref: string;
}

const dueSoonThresholdDays = 3;

export function ActiveBorrowPanel({
  borrows,
  isAuthenticated,
  activeBorrowsHref,
}: ActiveBorrowPanelProps) {
  const t = useTranslations("daily_timeline");
  const locale = useLocale();
  const userSlug = useAuthStore((state) => state.user?.slug);

  const today = startOfDay(new Date());
  const activeBorrowItems = [...borrows]
    .filter((borrow) => borrow.status === "open")
    .sort(
      (left, right) =>
        new Date(left.return_date).getTime() - new Date(right.return_date).getTime(),
    );

  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-colors duration-300 dark:border-white/6 dark:bg-linear-to-br dark:from-[#0f0f1a] dark:via-[#1a1a2e] dark:to-[#16213e] dark:shadow-none">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-10 -left-8 h-40 w-40 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.06)_0%,transparent_70%)] dark:bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.10)_0%,transparent_70%)]" />
        <div className="absolute -bottom-10 -right-10 h-32 w-32 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.05)_0%,transparent_70%)] dark:bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.08)_0%,transparent_70%)]" />
      </div>

      <div className="relative z-10 flex items-center justify-between gap-3 border-b border-gray-100 px-4 pb-3 pt-4 dark:border-white/5 sm:px-5">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-blue-500/20 bg-blue-500/10 dark:bg-blue-500/15">
            <BookOpen size={16} className="text-blue-600 dark:text-blue-400" />
          </div>
          <div className="min-w-0 flex flex-col">
            <div className="mb-0.5 flex flex-wrap items-center gap-2">
              <p className="text-[11px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400">
                {t("active_borrows_title")}
              </p>
              {isAuthenticated && activeBorrowItems.length > 0 && (
                <span className="rounded-full border border-blue-500/20 bg-blue-500/10 px-2 py-0.5 text-[10px] font-bold text-blue-600 dark:text-blue-400">
                  {t("active_count", { count: activeBorrowItems.length })}
                </span>
              )}
            </div>
            <p className="truncate text-[10px] font-medium text-gray-400 dark:text-white/40">
              {isAuthenticated ? t("active_borrows_desc") : t("login_desc")}
            </p>
          </div>
        </div>

        {isAuthenticated && activeBorrowItems.length > 0 && (
          <Link
            href={activeBorrowsHref}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-blue-500/20 bg-blue-500/5 px-3 py-2 text-[10px] font-semibold text-blue-600 transition-all duration-200 hover:border-blue-500/30 hover:bg-blue-500/10 dark:text-blue-400 dark:hover:text-blue-300"
          >
            {t("view_all")}
            <ArrowRight size={12} />
          </Link>
        )}
      </div>

      <div className="relative z-10 flex-1 min-h-0">
        {!isAuthenticated ? (
          <div className="flex items-center justify-center px-4 py-6 sm:px-6">
            <EmptyState
              variant="compact"
              icon={<LogIn className="text-emerald-600 dark:text-emerald-400" />}
              title={t("login_prompt")}
              description={t("login_desc")}
              linkLabel={t("login_btn")}
              linkHref="/login"
              className="w-full"
            />
          </div>
        ) : activeBorrowItems.length === 0 ? (
          <div className="flex items-center justify-center px-4 py-6 sm:px-6">
            <EmptyState
              variant="compact"
              icon={<BookOpen className="text-gray-500 dark:text-white/60" />}
              title={t("no_active_borrows")}
              description={t("no_active_borrows_desc")}
              linkLabel={t("view_all")}
              linkHref={activeBorrowsHref}
              className="w-full"
            />
          </div>
        ) : (
          <div className="flex h-full min-h-0 flex-col">
            <div className="flex-1 min-h-0 space-y-3 overflow-y-auto px-4 py-4 sm:px-5">
              {activeBorrowItems.map((borrow) => {
                const dueDate = startOfDay(new Date(borrow.return_date));
                const daysLeft = diffDays(today, dueDate);
                const isOverdue = daysLeft < 0;
                const isDueSoon = daysLeft <= dueSoonThresholdDays;
                const detailLink = userSlug
                  ? `/${userSlug}/my-borrows/${borrow.borrow_code}`
                  : `/my-borrows/${borrow.borrow_code}`;
                const dueLabel = isOverdue
                  ? t("overdue", { count: Math.abs(daysLeft) })
                  : daysLeft === 0
                  ? t("due_today")
                  : t("due_in", { count: daysLeft });
                const dueToneClass = isOverdue
                  ? "border-red-200 bg-red-50/90 text-red-600 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300"
                  : isDueSoon
                  ? "border-amber-200 bg-amber-50/90 text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300"
                  : "border-blue-200 bg-blue-50/90 text-blue-700 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-300";
                const iconToneClass = isOverdue
                  ? "bg-red-100 text-red-600 dark:bg-red-500/15 dark:text-red-300"
                  : isDueSoon
                  ? "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300"
                  : "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300";
                const itemShellClass = isOverdue
                  ? "border-red-200 bg-red-50/70 dark:border-red-500/20 dark:bg-red-500/8"
                  : isDueSoon
                  ? "border-amber-200 bg-amber-50/70 dark:border-amber-500/20 dark:bg-amber-500/8"
                  : "border-gray-200 bg-gray-50/80 dark:border-white/10 dark:bg-white/5";

                return (
                  <Link
                    key={borrow.id}
                    href={detailLink}
                    className={`group block rounded-2xl border px-4 py-3 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm ${itemShellClass}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconToneClass}`}>
                        {isOverdue ? <AlertTriangle size={16} /> : <BookOpen size={16} />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="line-clamp-2 text-sm font-bold leading-5 text-gray-900 transition-colors group-hover:text-emerald-600 dark:text-white/90 dark:group-hover:text-emerald-400">
                              {getBookTitle(borrow)}
                            </p>
                            <p className="mt-1 text-[10px] font-mono text-gray-400 dark:text-white/35">
                              Kode {borrow.borrow_code}
                            </p>
                          </div>
                          <ArrowRight size={14} className="mt-0.5 shrink-0 text-gray-300 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-emerald-500 dark:text-white/20 dark:group-hover:text-emerald-400" />
                        </div>
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.22em] ${dueToneClass}`}>
                            {isOverdue ? <AlertTriangle size={10} /> : <Clock size={10} />}
                            {dueLabel}
                          </span>
                          <span className="text-[10px] font-medium text-gray-400 dark:text-white/35">
                            {dueDate.toLocaleDateString(locale === "id" ? "id-ID" : "en-US", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}