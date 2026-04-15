import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { dashboardService } from "@/services/dashboard.service";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Area,
  AreaChart,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoginRegisterTrend } from "@/types/dashboard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, UserCheck } from "lucide-react";
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
      <div className="p-4 rounded-xl shadow-xl border-2 bg-popover/95 backdrop-blur-md text-popover-foreground min-w-[180px]">
        <p className="font-semibold mb-3 text-sm border-b pb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center justify-between gap-4 mt-1.5">
            <div className="flex items-center gap-2">
              <div
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-xs text-muted-foreground">{entry.name}</span>
            </div>
            <span className="text-sm font-bold">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function LoginRegisterTrendChart() {
  const t = useTranslations("dashboard");
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [data, setData] = useState<LoginRegisterTrend[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async (y: number) => {
    setLoading(true);
    try {
      const response = await dashboardService.getLoginRegisterTrendChart(y);
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
      [t("loginCount")]: existing ? existing.login_count : 0,
      [t("registerCount")]: existing ? existing.register_count : 0,
    };
  });

  const hasData = data && data.length > 0;

  return (
    <Card className="overflow-hidden border-none shadow-premium bg-card/50 backdrop-blur-sm">
      <CardHeader className="border-b border-border/50 pb-4 bg-muted/20">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-500">
              <UserCheck className="h-5 w-5" />
            </div>
            {t("authTrendTitle", { year })}
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
      <CardContent className="pt-6 min-h-[400px] flex items-center justify-center">
        {loading ? (
          <DataLoading className="border-none bg-transparent shadow-none min-h-0 py-0" />
        ) : hasData ? (
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="areaLoginGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="areaRegisterGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ec4899" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#ec4899" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#e5e7eb"
                vertical={false}
                className="dark:stroke-gray-800"
              />
              <XAxis
                dataKey="month"
                tick={{ fill: "#6b7280", fontSize: 12 }}
                axisLine={{ stroke: "#d1d5db" }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "#6b7280", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip content={(props) => <CustomTooltip {...props} />} />
              <Legend
                verticalAlign="top"
                height={36}
                iconType="circle"
                wrapperStyle={{ paddingBottom: "20px" }}
                formatter={(value) => (
                  <span className="text-sm font-medium text-muted-foreground mr-4">
                    {value}
                  </span>
                )}
              />
              <Area
                type="monotone"
                dataKey={t("loginCount")}
                stroke="#6366f1"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#areaLoginGradient)"
                animationDuration={1500}
              />
              <Area
                type="monotone"
                dataKey={t("registerCount")}
                stroke="#ec4899"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#areaRegisterGradient)"
                animationDuration={1500}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex flex-col items-center justify-center text-muted-foreground gap-2">
            <UserCheck className="h-12 w-12 opacity-10" />
            <p className="text-sm font-medium">{t("noData")}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
