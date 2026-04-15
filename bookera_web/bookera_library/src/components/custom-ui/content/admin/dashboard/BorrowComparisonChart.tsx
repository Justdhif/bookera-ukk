"use client";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { dashboardService } from "@/services/dashboard.service";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LabelList,
  CartesianGrid,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BorrowComparison } from "@/types/dashboard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, BarChart3 } from "lucide-react";
import DataLoading from "@/components/custom-ui/DataLoading";
import { toast } from "sonner";

const getMonthNames = (t: any) => [
  t("monthNames.1"),
  t("monthNames.2"),
  t("monthNames.3"),
  t("monthNames.4"),
  t("monthNames.5"),
  t("monthNames.6"),
  t("monthNames.7"),
  t("monthNames.8"),
  t("monthNames.9"),
  t("monthNames.10"),
  t("monthNames.11"),
  t("monthNames.12"),
];

const CustomTooltip = ({ active, payload, label }: any) => {
  const t = useTranslations("dashboard");
  if (active && payload && payload.length) {
    return (
      <div className="p-4 rounded-xl shadow-xl border-2 bg-popover/95 backdrop-blur-md text-popover-foreground min-w-[200px]">
        <p className="font-bold mb-3 text-sm border-b border-border/50 pb-2 text-center uppercase tracking-wider">
          {label}
        </p>
        <div className="space-y-2">
          {payload.map((entry: any, index: number) => {
            const value = Math.abs(entry.value);
            return (
              <div
                key={index}
                className="flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-xs font-semibold text-muted-foreground uppercase">
                    {entry.name}
                  </span>
                </div>
                <span className="text-sm font-black">{value}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
  return null;
};

export default function BorrowComparisonChart() {
  const t = useTranslations("dashboard");
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [data, setData] = useState<BorrowComparison[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async (y: number) => {
    setLoading(true);
    try {
      const response = await dashboardService.getBorrowComparisonChart(y);
      setData(response.data.data);
    } catch (error) {
      toast.error(t("loadError"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(year);
  }, [year]);

  const allMonths = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  const chartData = allMonths.map((m) => {
    const existing = data.find((item) => item.month === m);
    return {
      month: getMonthNames(t)[m - 1],
      borrows: existing ? existing.total_borrows : 0,
      requests: existing ? existing.total_requests : 0,
    };
  });

  const displayData = [...chartData];

  const maxVal = Math.max(
    ...chartData.map((d) => Math.max(d.borrows, d.requests)),
    1,
  );

  const hasData =
    data && data.some((d) => d.total_borrows > 0 || d.total_requests > 0);

  return (
    <Card className="overflow-hidden border-none shadow-premium bg-card/50 backdrop-blur-sm">
      <CardHeader className="border-b border-border/50 pb-4 bg-muted/20">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-500">
              <BarChart3 className="h-5 w-5" />
            </div>
            {t("borrowComparisonTitle", { year })}
          </CardTitle>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setYear(year - 1)}
              className="h-8 w-8 rounded-full border-border/50 hover:bg-muted"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <Select
              value={year.toString()}
              onValueChange={(val) => setYear(parseInt(val))}
            >
              <SelectTrigger className="w-24 h-8 text-xs font-bold rounded-lg border-2 border-border/50 bg-background/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from(
                  { length: 11 },
                  (_, i) => now.getFullYear() - 5 + i,
                ).map((y) => (
                  <SelectItem key={y} value={y.toString()}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="icon"
              onClick={() => setYear(year + 1)}
              className="h-8 w-8 rounded-full border-border/50 hover:bg-muted"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-10 pb-6 min-h-[450px] flex items-center justify-center">
        {loading ? (
          <DataLoading className="border-none bg-transparent shadow-none min-h-0 py-0" />
        ) : hasData ? (
          <div className="w-full flex flex-col gap-8 px-2 sm:px-4">
            <div className="flex justify-center items-center gap-8">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500" />
                <span className="text-xs font-semibold text-rose-500">
                  {t("totalBorrows")}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-sky-500" />
                <span className="text-xs font-semibold text-sky-500">
                  {t("totalRequests")}
                </span>
              </div>
            </div>

            <div className="flex flex-row items-stretch min-h-[350px]">
              <div className="flex-1">
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart
                    layout="vertical"
                    data={displayData}
                    margin={{ top: 0, right: 35, left: 35, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient
                        id="borrowGradientButterfly"
                        x1="1"
                        y1="0"
                        x2="0"
                        y2="0"
                      >
                        <stop offset="0%" stopColor="#f43f5e" stopOpacity={1} />
                        <stop
                          offset="100%"
                          stopColor="#fb7185"
                          stopOpacity={0.6}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="rgba(255,255,255,0.08)"
                      horizontal={false}
                      vertical={true}
                    />
                    <XAxis type="number" hide domain={[0, maxVal]} reversed />
                    <YAxis type="category" dataKey="month" hide />
                    <Tooltip
                      content={<CustomTooltip />}
                      cursor={{ fill: "transparent" }}
                    />
                    <Bar
                      name={t("totalBorrows")}
                      dataKey="borrows"
                      fill="url(#borrowGradientButterfly)"
                      radius={[0, 4, 4, 0]}
                      barSize={18}
                      className="drop-shadow-[0_2px_4px_rgba(244,63,94,0.2)]"
                    >
                      <LabelList
                        dataKey="borrows"
                        position="left"
                        fill="#f43f5e"
                        fontSize={11}
                        fontWeight={900}
                        offset={15}
                        formatter={(val: any) => (val > 0 ? val : "")}
                      />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="flex flex-col justify-between py-1 px-3 min-w-[80px]">
                {displayData.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex-1 flex items-center justify-center"
                  >
                    <span className="text-[10px] sm:text-xs font-black uppercase text-muted-foreground/70 tracking-widest font-mono">
                      {item.month}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex-1">
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart
                    layout="vertical"
                    data={displayData}
                    margin={{ top: 0, right: 35, left: 35, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient
                        id="requestGradientButterfly"
                        x1="0"
                        y1="0"
                        x2="1"
                        y2="0"
                      >
                        <stop offset="0%" stopColor="#0ea5e9" stopOpacity={1} />
                        <stop
                          offset="100%"
                          stopColor="#38bdf8"
                          stopOpacity={0.6}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="rgba(255,255,255,0.08)"
                      horizontal={false}
                      vertical={true}
                    />
                    <XAxis type="number" hide domain={[0, maxVal]} />
                    <YAxis type="category" dataKey="month" hide />
                    <Tooltip
                      content={<CustomTooltip />}
                      cursor={{ fill: "transparent" }}
                    />
                    <Bar
                      name={t("totalRequests")}
                      dataKey="requests"
                      fill="url(#requestGradientButterfly)"
                      radius={[0, 4, 4, 0]}
                      barSize={18}
                      className="drop-shadow-[0_2px_4px_rgba(14,165,233,0.2)]"
                    >
                      <LabelList
                        dataKey="requests"
                        position="left"
                        fill="#0ea5e9"
                        fontSize={11}
                        fontWeight={900}
                        offset={15}
                        formatter={(val: any) => (val > 0 ? val : "")}
                      />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-muted-foreground gap-3">
            <div className="p-4 rounded-full bg-muted/50">
              <BarChart3 className="h-10 w-10 opacity-20" />
            </div>
            <p className="text-sm font-medium">{t("noData")}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
