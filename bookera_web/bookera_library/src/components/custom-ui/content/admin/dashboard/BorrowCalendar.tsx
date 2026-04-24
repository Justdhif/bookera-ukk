"use client";
import { useTranslations } from "next-intl";
import { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  BookOpen,
  CalendarDays,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarDay, DayDetail } from "@/types/dashboard";
import { dashboardService } from "@/services/dashboard.service";
import { cn } from "@/lib/utils";
import EmptyState from "@/components/custom-ui/EmptyState";
import DataLoading from "@/components/custom-ui/DataLoading";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const DAYS_OF_WEEK_KEYS = [
  "sun",
  "mon",
  "tue",
  "wed",
  "thu",
  "fri",
  "sat",
] as const;

type DayCell = {
  day: number;
  isCurrentMonth: boolean;
  data?: CalendarDay;
};

export default function BorrowCalendar() {
  const t = useTranslations("dashboard");
  const today = new Date();

  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth() + 1);
  const [calendarData, setCalendarData] = useState<CalendarDay[]>([]);
  const [loadingCalendar, setLoadingCalendar] = useState(false);

  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [dayDetail, setDayDetail] = useState<DayDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    setLoadingCalendar(true);
    dashboardService
      .getCalendar(currentYear, currentMonth)
      .then((res) => {
        setCalendarData(res.data.data);
        setSelectedDay(null);
        setDayDetail(null);
      })
      .finally(() => setLoadingCalendar(false));
  }, [currentYear, currentMonth]);

  useEffect(() => {
    if (selectedDay === null) return;
    setLoadingDetail(true);
    dashboardService
      .getDayDetail(currentYear, currentMonth, selectedDay)
      .then((res) => setDayDetail(res.data.data))
      .finally(() => setLoadingDetail(false));
  }, [selectedDay, currentYear, currentMonth]);

  const goToPrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentYear((y) => y - 1);
      setCurrentMonth(12);
    } else setCurrentMonth((m) => m - 1);
  };

  const goToNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentYear((y) => y + 1);
      setCurrentMonth(1);
    } else setCurrentMonth((m) => m + 1);
  };

  const getDaysInMonth = (y: number, m: number) => new Date(y, m, 0).getDate();
  const getFirstDayOfMonth = (y: number, m: number) =>
    new Date(y, m - 1, 1).getDay();

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

  const dayMap = new Map<number, CalendarDay>();
  calendarData.forEach((d) => dayMap.set(d.date, d));

  const fullMonthName =
    (t as any)(`fullMonthNames.${currentMonth}`) ?? `Month ${currentMonth}`;

  const isToday = (day: number, isCurrentMonth: boolean) =>
    isCurrentMonth &&
    day === today.getDate() &&
    currentMonth === today.getMonth() + 1 &&
    currentYear === today.getFullYear();

  const cells: DayCell[] = [];

  const prevMonthDays = getDaysInMonth(
    currentMonth === 1 ? currentYear - 1 : currentYear,
    currentMonth === 1 ? 12 : currentMonth - 1,
  );
  for (let i = firstDay - 1; i >= 0; i--) {
    cells.push({ day: prevMonthDays - i, isCurrentMonth: false });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, isCurrentMonth: true, data: dayMap.get(d) });
  }
  const remainder = cells.length % 7;
  const nextOverflow = remainder === 0 ? 0 : 7 - remainder;
  for (let d = 1; d <= nextOverflow; d++) {
    cells.push({ day: d, isCurrentMonth: false });
  }

  const getBorrowDayTone = (data?: CalendarDay, isCurrentMonth = true) => {
    if (!isCurrentMonth)
      return "bg-slate-100/80 text-slate-400/80 dark:bg-slate-800/40 dark:text-slate-500";
    if (!data) return "bg-brand-primary/5 text-brand-primary-dark/40";

    const total = Number(data.open_borrows) + Number(data.close_borrows);

    if (total === 0) return "bg-brand-primary/5 text-brand-primary-dark/40";
    if (total <= 2) return "bg-brand-primary/15 text-brand-primary-dark";
    if (total <= 5) return "bg-brand-primary/30 text-brand-primary-darker";
    if (total <= 10) return "bg-brand-primary/50 text-white";
    return "bg-brand-primary/75 text-white";
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            {t("borrowCalendarTitle")}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-lg"
              onClick={goToPrevMonth}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-semibold min-w-35 text-center">
              {fullMonthName} {currentYear}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-lg"
              onClick={goToNextMonth}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-5 flex flex-col lg:items-stretch lg:flex-row gap-6 min-h-fit lg:min-h-115">
        <div className="flex-1 min-w-0">
          {loadingCalendar ? (
            <div className="h-full flex items-center justify-center">
              <DataLoading variant="inline" size="lg" />
            </div>
          ) : (
            <div className="space-y-1">
              <div className="grid grid-cols-7 gap-1.5 md:gap-3">
                {DAYS_OF_WEEK_KEYS.map((key) => (
                  <div
                    key={key}
                    className="py-1 text-center text-[11px] font-semibold tracking-[0.22em] text-muted-foreground uppercase"
                  >
                    {t(key)}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1.5 md:gap-3">
                {cells.map((cell, idx) => {
                  const todayCell = isToday(cell.day, cell.isCurrentMonth);
                  const isSelected =
                    selectedDay === cell.day && cell.isCurrentMonth;

                  return (
                    <button
                      type="button"
                      key={idx}
                      disabled={!cell.isCurrentMonth}
                      onClick={() => {
                        if (!cell.isCurrentMonth) return;
                        setSelectedDay(cell.day);
                      }}
                      className={cn(
                        "relative flex min-h-[5rem] md:min-h-28 flex-col items-end justify-start overflow-hidden rounded-lg md:rounded-[1.15rem] p-1.5 md:p-3 pt-1 md:pt-2.5 text-right outline-none transition-all",
                        "border border-transparent shadow-sm focus-visible:ring-2 focus-visible:ring-brand-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                        "cursor-pointer disabled:cursor-default",

                        // Default intensity color
                        getBorrowDayTone(cell.data, cell.isCurrentMonth),

                        // Distinct Today styling
                        todayCell &&
                          "ring-2 ring-indigo-500/50 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-200 shadow-md",

                        // Distinct Selected styling
                        isSelected &&
                          "ring-2 ring-brand-primary shadow-lg bg-brand-primary text-white z-10 ring-offset-2 ring-offset-background",

                        // Not current month treatment
                        !cell.isCurrentMonth && "cursor-default",
                      )}
                    >
                      <span className="relative z-10 text-xs md:text-[15px] font-semibold leading-none drop-shadow-sm">
                        {cell.day}
                      </span>

                      {cell.data &&
                        Number(cell.data.open_borrows) +
                          Number(cell.data.close_borrows) >
                          0 && (
                          <div className="mt-auto self-start">
                            <span
                              className={cn(
                                "inline-flex items-center justify-center rounded-lg px-2 py-0.5 text-[10px] font-bold shadow-xs border transition-colors",
                                todayCell ||
                                  isSelected ||
                                  Number(cell.data.open_borrows) +
                                    Number(cell.data.close_borrows) >
                                    5
                                  ? "bg-white/20 text-white border-white/30 backdrop-blur-xs"
                                  : "bg-brand-primary/10 text-brand-primary-dark border-brand-primary/20 shadow-brand-primary/5",
                              )}
                            >
                              {Number(cell.data.open_borrows) +
                                Number(cell.data.close_borrows)}{" "}
                              <span className="hidden md:inline ml-0.5">
                                {t("total").toLowerCase()}
                              </span>
                            </span>
                          </div>
                        )}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-3 pt-3 flex-wrap">
                <span className="text-[11px] text-muted-foreground font-medium">
                  {t("intensity")}
                </span>
                {[
                  { label: "1–2", cls: "bg-brand-primary/15" },
                  { label: "3–5", cls: "bg-brand-primary/30" },
                  { label: "6–10", cls: "bg-brand-primary/50" },
                  { label: "10+", cls: "bg-brand-primary/75" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-1.5">
                    <div
                      className={cn(
                        "w-3.5 h-3.5 rounded-md border border-brand-primary/20 shadow-sm",
                        item.cls,
                      )}
                    />
                    <span className="text-[11px] text-muted-foreground">
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="w-full lg:w-75 shrink-0 border-t lg:border-t-0 lg:border-l pt-6 lg:pt-0 lg:pl-6 pb-2 flex flex-col">
          {selectedDay === null ? (
            <div className="flex-1 flex items-center justify-center">
              <EmptyState
                variant="compact"
                icon={<CalendarDays />}
                title={t("selectDate")}
                description={t("clickDateDesc")}
                className="border-none"
              />
            </div>
          ) : loadingDetail ? (
            <div className="flex-1 flex items-center justify-center">
              <DataLoading variant="inline" size="lg" />
            </div>
          ) : dayDetail ? (
            <div className="flex-1 flex flex-col space-y-5 animate-in fade-in-0 slide-in-from-right-2 duration-200">
              <div>
                <p className="text-xs text-muted-foreground font-medium mb-1">
                  {fullMonthName} {selectedDay}, {currentYear}
                </p>
                <p className="text-base font-bold text-foreground">
                  {t("borrowDetail")}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2 shrink-0">
                <div className="flex flex-col items-center rounded-xl bg-brand-primary/8 p-3 text-center">
                  <span className="text-2xl font-bold text-brand-primary-dark">
                    {dayDetail.total}
                  </span>
                  <span className="text-[11px] text-muted-foreground mt-0.5">
                    {t("total")}
                  </span>
                </div>
                <div className="flex flex-col items-center rounded-xl bg-brand-primary/12 p-3 text-center">
                  <span className="text-2xl font-bold text-brand-primary">
                    {dayDetail.open_borrows}
                  </span>
                  <span className="text-[11px] text-muted-foreground mt-0.5">
                    {t("open")}
                  </span>
                </div>
                <div className="flex flex-col items-center rounded-xl bg-brand-primary-dark/12 p-3 text-center">
                  <span className="text-2xl font-bold text-brand-primary-darker">
                    {dayDetail.close_borrows}
                  </span>
                  <span className="text-[11px] text-muted-foreground mt-0.5">
                    {t("closed")}
                  </span>
                </div>
              </div>

              <div className="flex-1 flex flex-col h-full">
                {dayDetail.borrows.length === 0 ? (
                  <div className="flex-1 flex items-center justify-center p-4">
                    <EmptyState
                      variant="compact"
                      icon={<BookOpen />}
                      title={t("noBorrowsOnDay")}
                      description={t("clickDateDesc")}
                      className="border-none"
                    />
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {dayDetail.borrows.map((borrow) => (
                      <div
                        key={borrow.id}
                        className="flex items-center gap-3 rounded-xl border border-border/50 bg-muted/30 p-3 transition-colors"
                      >
                        <Avatar className="h-9 w-9 bg-muted">
                          <AvatarImage
                            src={borrow.user.avatar ?? undefined}
                            alt={borrow.user.full_name}
                            className="object-cover"
                          />
                          <AvatarFallback className="text-xs font-medium bg-brand-primary/10 text-brand-primary-dark">
                            {borrow.user.full_name
                              .substring(0, 2)
                              .toUpperCase()}
                          </AvatarFallback>
                        </Avatar>

                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold truncate text-foreground leading-tight mb-1">
                            {borrow.user.full_name}
                          </p>
                          <p className="text-xs text-muted-foreground truncate leading-none">
                            {borrow.borrow_code}
                          </p>
                        </div>

                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[10px] px-2 py-0.5 whitespace-nowrap",
                            borrow.status === "open"
                              ? "border-brand-primary/40 text-brand-primary-dark bg-brand-primary/10"
                              : "border-brand-primary-dark/40 text-brand-primary-darker bg-brand-primary-dark/10",
                          )}
                        >
                          {borrow.status === "open" ? t("open") : t("closed")}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {dayDetail.total > 0 && (
                <div className="pt-2 mt-auto">
                  <Link href="/admin/borrows">
                    <Button
                      variant="outline"
                      className="w-full gap-2 h-10 text-sm border-brand-primary/40 text-brand-primary-dark hover:bg-transparent hover:text-brand-primary-dark hover:border-brand-primary/40"
                    >
                      <BookOpen className="h-4 w-4" />
                      {t("viewAll")} ({dayDetail.total})
                      <ExternalLink className="h-3.5 w-3.5 ml-auto" />
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
