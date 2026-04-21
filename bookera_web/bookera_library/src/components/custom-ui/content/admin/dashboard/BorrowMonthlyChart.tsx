import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { dashboardService } from "@/services/dashboard.service";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BorrowMonthly } from "@/types/dashboard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, BarChart as BarChartIcon } from "lucide-react";
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
      <div className="p-4 rounded-xl shadow-xl border-2 bg-popover text-popover-foreground min-w-37.5">
        <p className="font-semibold mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 mt-1">
            <div
              className="w-3 h-3 rounded-full shrink-0"
              style={{ backgroundColor: entry.fill }}
            />
            <span className="text-sm text-muted-foreground">{entry.name}:</span>
            <span className="text-sm font-bold">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function BorrowMonthlyChart() {
  const t = useTranslations("dashboard");
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [data, setData] = useState<BorrowMonthly[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async (y: number) => {
    setLoading(true);
    try {
      const response = await dashboardService.getLoanMonthlyChart(y);
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
  const chartData = allMonths.map((month) => {
    const existing = data.find((item) => item.month === month);
    return {
      month: getMonthNames(t)[month - 1],
      [t("openBorrows")]: existing ? existing.open_borrows : 0,
      [t("closeBorrows")]: existing ? existing.close_borrows : 0,
    };
  });

  const hasData = data && data.length > 0;

  return (
    <Card className="overflow-hidden border-none shadow-premium bg-card/50 backdrop-blur-sm">
      <CardHeader className="border-b border-border/50 pb-4 bg-muted/20">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-500">
              <BarChartIcon className="h-5 w-5" />
            </div>
            {t("monthlyBorrowsTitle", { year })}
          </CardTitle>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setYear(year - 1)}
              className="h-8 w-8 rounded-full"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <Select
              value={year.toString()}
              onValueChange={(val) => setYear(parseInt(val))}
            >
              <SelectTrigger className="w-24 h-8 text-xs font-bold rounded-lg border-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 11 }, (_, i) => now.getFullYear() - 5 + i).map((y) => (
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
              className="h-8 w-8 rounded-full"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6 min-h-100 flex items-center justify-center">
        {loading ? (
          <DataLoading className="border-none bg-transparent shadow-none min-h-0 py-0" />
        ) : hasData ? (
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={chartData} barGap={4} barCategoryGap="30%">
              <defs>
                <linearGradient id="openGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={1} />
                  <stop offset="100%" stopColor="#06b6d4" stopOpacity={0.8} />
                </linearGradient>
                <linearGradient id="closeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={1} />
                  <stop offset="100%" stopColor="#14b8a6" stopOpacity={0.8} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#e5e7eb"
                className="dark:stroke-gray-800"
              />
              <XAxis
                dataKey="month"
                tick={{ fill: "#6b7280", fontSize: 12 }}
                axisLine={{ stroke: "#d1d5db" }}
              />
              <YAxis
                tick={{ fill: "#6b7280", fontSize: 12 }}
                axisLine={{ stroke: "#d1d5db" }}
                allowDecimals={false}
              />
              <Tooltip content={(props) => <CustomTooltip {...props} />} />
              <Legend
                verticalAlign="top"
                height={36}
                iconType="circle"
                wrapperStyle={{ paddingBottom: "12px" }}
                formatter={(value) => (
                  <span className="text-sm font-medium text-muted-foreground">
                    {value}
                  </span>
                )}
              />
              <Bar
                dataKey={t("openBorrows")}
                fill="url(#openGradient)"
                radius={[6, 6, 0, 0]}
                animationBegin={0}
                animationDuration={800}
              />
              <Bar
                dataKey={t("closeBorrows")}
                fill="url(#closeGradient)"
                radius={[6, 6, 0, 0]}
                animationBegin={200}
                animationDuration={800}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex flex-col items-center justify-center text-muted-foreground gap-2">
            <BarChartIcon className="h-12 w-12 opacity-10" />
            <p className="text-sm font-medium">{t("noData")}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
