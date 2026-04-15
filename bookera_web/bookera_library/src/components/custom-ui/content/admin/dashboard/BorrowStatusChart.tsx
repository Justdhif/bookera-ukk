import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { dashboardService } from "@/services/dashboard.service";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BorrowStatus } from "@/types/dashboard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, PieChart as PieChartIcon } from "lucide-react";
import DataLoading from "@/components/custom-ui/DataLoading";
import { toast } from "sonner";

const COLORS = [
  "#06b6d4",
  "#14b8a6",
  "#22c55e",
  "#84cc16",
  "#eab308",
  "#f97316",
];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-4 rounded-xl shadow-xl border-2 bg-popover text-popover-foreground">
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.payload.fill }}
            />
            <span className="text-sm text-muted-foreground">
              {entry.name}:
            </span>
            <span className="text-sm font-bold">
              {entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const renderCustomLabel = (entry: any) => {
  const percent = entry.percent ? (entry.percent * 100).toFixed(0) : 0;
  return `${percent}%`;
};

export default function BorrowStatusChart() {
  const t = useTranslations("dashboard");
  const tCommon = useTranslations("common");
  
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [data, setData] = useState<BorrowStatus[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStatus = async (y: number, m: number) => {
    setLoading(true);
    try {
      const response = await dashboardService.getLoanStatusChart(y, m);
      setData(response.data.data);
    } catch (error) {
      toast.error(t("loadError"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus(year, month);
  }, [year, month]);

  const hasData = data && data.length > 0;

  const chartData = data?.map((item) => {
    const statusKey = item.status?.toLowerCase() || "";
    
    let translated = item.status;
    if (statusKey === "open") {
      translated = t("openBorrows");
    } else if (statusKey === "close" || statusKey === "closed") {
      translated = t("closeBorrows");
    } else if (tCommon.has(statusKey as any)) {
      translated = tCommon(statusKey as any);
    }

    return {
      ...item,
      translatedStatus: translated,
    };
  }) || [];

  const handlePrevMonth = () => {
    if (month === 1) {
      setMonth(12);
      setYear(year - 1);
    } else {
      setMonth(month - 1);
    }
  };

  const handleNextMonth = () => {
    if (month === 12) {
      setMonth(1);
      setYear(year + 1);
    } else {
      setMonth(month + 1);
    }
  };

  return (
    <Card className="overflow-hidden border-none shadow-premium bg-card/50 backdrop-blur-sm">
      <CardHeader className="border-b border-border/50 pb-4 bg-muted/20">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-500">
              <PieChartIcon className="h-5 w-5" />
            </div>
            {t("borrowStatus")}
          </CardTitle>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handlePrevMonth}
              className="h-8 w-8 rounded-full"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <Select
              value={month.toString()}
              onValueChange={(val) => setMonth(parseInt(val))}
            >
              <SelectTrigger className="w-28 h-8 text-xs font-bold rounded-lg border-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <SelectItem key={m} value={m.toString()}>
                    {t(`monthNames.${m}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={year.toString()}
              onValueChange={(val) => setYear(parseInt(val))}
            >
              <SelectTrigger className="w-20 h-8 text-xs font-bold rounded-lg border-2">
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
              onClick={handleNextMonth}
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
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomLabel}
                outerRadius={120}
                fill="#8884d8"
                dataKey="total"
                nameKey="translatedStatus"
                animationBegin={0}
                animationDuration={800}
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                    className="hover:opacity-80 transition-opacity cursor-pointer"
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="top"
                height={36}
                iconType="circle"
                wrapperStyle={{ paddingBottom: "12px" }}
                formatter={(value) => (
                  <span className="text-sm font-medium text-muted-foreground capitalize">
                    {value}
                  </span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex flex-col items-center justify-center text-muted-foreground gap-2">
            <PieChartIcon className="h-12 w-12 opacity-10" />
            <p className="text-sm font-medium">{t("noData")}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
