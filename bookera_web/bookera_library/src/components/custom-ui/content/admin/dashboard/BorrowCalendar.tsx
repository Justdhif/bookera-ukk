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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarDay, DayDetail } from "@/types/dashboard";
import { dashboardService } from "@/services/dashboard.service";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import EmptyState from "@/components/custom-ui/EmptyState";
import DataLoading from "@/components/custom-ui/DataLoading";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const DAYS_OF_WEEK_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;

type DayCell = {
  day: number;
  isCurrentMonth: boolean;
  data?: CalendarDay;
};

export default function BorrowCalendar() {
  const t = useTranslations("dashboard");
  const router = useRouter();
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
    if (currentMonth === 1) { setCurrentYear((y) => y - 1); setCurrentMonth(12); }
    else setCurrentMonth((m) => m - 1);
  };

  const goToNextMonth = () => {
    if (currentMonth === 12) { setCurrentYear((y) => y + 1); setCurrentMonth(1); }
    else setCurrentMonth((m) => m + 1);
  };

  const getDaysInMonth = (y: number, m: number) => new Date(y, m, 0).getDate();
  const getFirstDayOfMonth = (y: number, m: number) => new Date(y, m - 1, 1).getDay();

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
    currentMonth === 1 ? 12 : currentMonth - 1
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

  const getBorrowIntensityBg = (data?: CalendarDay) => {
    if (!data) return "";
    const total = data.open_borrows + data.close_borrows;
    if (total === 0) return "";
    if (total <= 2) return "bg-[#10b981]/15 dark:bg-[#10b981]/20";
    if (total <= 5) return "bg-[#10b981]/30 dark:bg-[#10b981]/35";
    if (total <= 10) return "bg-[#10b981]/50 dark:bg-[#10b981]/55";
    return "bg-[#10b981]/70 dark:bg-[#10b981]/75";
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            {t("borrowCalendarTitle")}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg" onClick={goToPrevMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-semibold min-w-[140px] text-center">
              {fullMonthName} {currentYear}
            </span>
            <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg" onClick={goToNextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-5 flex items-stretch gap-6 min-h-[460px]">
        <div className="flex-1 min-w-0">
          {loadingCalendar ? (
            <div className="h-full flex items-center justify-center">
              <DataLoading variant="inline" size="lg" />
            </div>
          ) : (
            <div className="space-y-1.5">
              <div className="grid grid-cols-7 gap-1.5">
                {DAYS_OF_WEEK_KEYS.map((key) => (
                  <div
                    key={key}
                    className="text-center text-xs font-semibold text-muted-foreground py-1 tracking-wide uppercase"
                  >
                    {t(key)}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1.5">
                {cells.map((cell, idx) => {
                  const todayCell = isToday(cell.day, cell.isCurrentMonth);
                  const total =
                    cell.isCurrentMonth && cell.data
                      ? cell.data.open_borrows + cell.data.close_borrows
                      : 0;
                  const isSelected = selectedDay === cell.day && cell.isCurrentMonth;

                  return (
                    <button
                      key={idx}
                      disabled={!cell.isCurrentMonth}
                      onClick={() => {
                        if (!cell.isCurrentMonth) return;
                        setSelectedDay(cell.day);
                      }}
                      className={cn(
                        "relative flex flex-col justify-start items-end rounded-xl p-2 aspect-square",
                        "transition-all duration-150 outline-none focus-visible:ring-2 focus-visible:ring-[#10b981]",
                        !cell.isCurrentMonth && "opacity-30 cursor-default",
                        cell.isCurrentMonth && "cursor-pointer",
                        todayCell
                          ? "bg-linear-to-br from-[#10b981] to-[#059669] shadow-lg shadow-[#10b981]/30"
                          : isSelected
                          ? "bg-[#10b981]/15 ring-2 ring-[#10b981]/60 dark:bg-[#10b981]/25"
                          : cell.isCurrentMonth
                          ? cn("bg-muted/60 dark:bg-muted/40 hover:bg-[#10b981]/10 dark:hover:bg-[#10b981]/15", getBorrowIntensityBg(cell.data))
                          : "bg-muted/30 dark:bg-muted/20"
                      )}
                    >
                      <span
                        className={cn(
                          "text-xs font-bold leading-none",
                          todayCell ? "text-white" : cell.isCurrentMonth ? "text-foreground" : "text-muted-foreground"
                        )}
                      >
                        {cell.day}
                      </span>
                      {cell.isCurrentMonth && total > 0 && (
                        <span
                          className={cn(
                            "absolute bottom-2 left-2 text-[10px] font-bold leading-none px-1.5 py-0.5 rounded-md",
                            todayCell
                              ? "bg-white/25 text-white"
                              : "bg-[#10b981]/20 text-[#059669] dark:text-[#34d399]"
                          )}
                        >
                          {total}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-3 pt-3 flex-wrap">
                <span className="text-[11px] text-muted-foreground font-medium">{t("intensity")}</span>
                {[
                  { label: "1–2", cls: "bg-[#10b981]/15" },
                  { label: "3–5", cls: "bg-[#10b981]/30" },
                  { label: "6–10", cls: "bg-[#10b981]/50" },
                  { label: "10+", cls: "bg-[#10b981]/70" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-1.5">
                    <div className={cn("w-3.5 h-3.5 rounded", item.cls)} />
                    <span className="text-[11px] text-muted-foreground">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="w-[300px] shrink-0 border-l pl-6 pb-2 flex flex-col">
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
                <p className="text-base font-bold text-foreground">{t("borrowDetail")}</p>
              </div>

              <div className="grid grid-cols-3 gap-2 shrink-0">
                <div className="flex flex-col items-center p-3 rounded-xl bg-muted/60 text-center">
                  <span className="text-2xl font-bold text-foreground">{dayDetail.total}</span>
                  <span className="text-[11px] text-muted-foreground mt-0.5">{t("total")}</span>
                </div>
                <div className="flex flex-col items-center p-3 rounded-xl bg-blue-500/10 dark:bg-blue-500/15 text-center">
                  <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">{dayDetail.open_borrows}</span>
                  <span className="text-[11px] text-muted-foreground mt-0.5">{t("open")}</span>
                </div>
                <div className="flex flex-col items-center p-3 rounded-xl bg-[#10b981]/10 dark:bg-[#10b981]/15 text-center">
                  <span className="text-2xl font-bold text-[#059669] dark:text-[#34d399]">{dayDetail.close_borrows}</span>
                  <span className="text-[11px] text-muted-foreground mt-0.5">{t("closed")}</span>
                </div>
              </div>

              <div className="flex-1 flex flex-col h-full">
                {dayDetail.borrows.length === 0 ? (
                  <div className="flex-1 flex items-center justify-center">
                    <p className="text-sm text-muted-foreground">{t("noBorrowsOnDay")}</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {dayDetail.borrows.map((borrow) => (
                      <div
                        key={borrow.id}
                        className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border border-border/50 hover:bg-muted/60 hover:border-border transition-all"
                      >
                        <Avatar className="h-9 w-9 bg-muted">
                          <AvatarImage
                            src={borrow.user.avatar ?? undefined}
                            alt={borrow.user.full_name}
                            className="object-cover"
                          />
                          <AvatarFallback className="text-xs font-medium bg-[#10b981]/10 text-[#059669] dark:text-[#34d399]">
                            {borrow.user.full_name.substring(0, 2).toUpperCase()}
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
                              ? "border-blue-400/50 text-blue-600 dark:text-blue-400 bg-blue-500/10"
                              : "border-[#10b981]/50 text-[#059669] dark:text-[#34d399] bg-[#10b981]/10"
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
                  <Button
                    variant="outline"
                    className="w-full gap-2 text-sm h-10 border-[#10b981]/40 text-[#059669] dark:text-[#34d399] hover:bg-[#10b981]/10 hover:border-[#10b981]/60"
                    onClick={() => router.push('/admin/borrows')}
                  >
                    <BookOpen className="h-4 w-4" />
                    {t("viewAll")} ({dayDetail.total})
                    <ExternalLink className="h-3.5 w-3.5 ml-auto" />
                  </Button>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
