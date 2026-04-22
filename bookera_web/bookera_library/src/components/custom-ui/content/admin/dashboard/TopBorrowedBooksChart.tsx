"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { BookOpen } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DataLoading from "@/components/custom-ui/DataLoading";
import { dashboardService } from "@/services/dashboard.service";
import { TopBorrowedStat } from "@/types/dashboard";
import { toast } from "sonner";

const COLORS = ["#0ea5e9", "#8b5cf6", "#f43f5e", "#f59e0b", "#10b981"];

const CustomTooltip = ({ active, payload }: any) => {
  const t = useTranslations("dashboard");

  if (active && payload && payload.length && payload[0]) {
    const item = payload[0];

    return (
      <div className="rounded-xl border bg-popover/90 px-4 py-3 shadow-xl backdrop-blur-md">
        <p className="mb-2 font-semibold text-popover-foreground max-w-64 truncate">
          {item.name}
        </p>
        <div className="flex items-center gap-2">
          <span
            className="h-3 w-3 rounded-full"
            style={{ backgroundColor: item.payload?.payload?.fill ?? item.payload?.fill ?? "#ccc" }}
          />
          <span className="text-sm text-muted-foreground">{t("borrowCount")}:</span>
          <span className="text-sm font-bold text-popover-foreground">{item.value}</span>
        </div>
      </div>
    );
  }

  return null;
};

const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
  index,
}: any) => {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  if (percent < 0.05) return null;

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
      className="text-[10px] font-bold"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export default function TopBorrowedBooksChart() {
  const t = useTranslations("dashboard");
  const [data, setData] = useState<TopBorrowedStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      setLoading(true);
      try {
        const result = await dashboardService.getTopBorrowedBooks(5);
        if (isMounted) {
          setData(result.data.data ?? []);
        }
      } catch (error) {
        if (isMounted) {
          toast.error(t("loadError"));
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void loadData();

    return () => {
      isMounted = false;
    };
  }, [t]);

  const chartData = data.map((item, index) => ({
    ...item,
    fill: COLORS[index % COLORS.length],
    gradId: `grad-book-${index % COLORS.length}`,
  }));

  const hasData = chartData.length > 0;

  return (
    <Card className="h-full w-full overflow-hidden border-none shadow-premium bg-card/50 backdrop-blur-sm">
      <CardHeader className="border-b border-border/50 bg-muted/20 pb-4">
        <div className="space-y-1.5">
          <CardTitle className="flex items-center gap-2 text-lg font-bold">
            <div className="rounded-lg bg-blue-500/10 p-1.5 text-blue-500">
              <BookOpen className="h-5 w-5" />
            </div>
            {t("topBorrowedBooksTitle")}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {t("topBorrowedBooksDescription")}
          </p>
        </div>
      </CardHeader>

      <CardContent className="flex min-h-105 items-center justify-center">
        {loading ? (
          <DataLoading
            variant="card"
            size="lg"
            className="w-full border-none bg-transparent shadow-none"
          />
        ) : hasData ? (
          <ResponsiveContainer width="100%" height={360}>
            <PieChart>
              <defs>
                {COLORS.map((color, index) => (
                  <linearGradient key={`grad-book-${index}`} id={`grad-book-${index}`} x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity={0.8} />
                    <stop offset="100%" stopColor={color} stopOpacity={1} />
                  </linearGradient>
                ))}
              </defs>
              <Pie
                data={chartData}
                dataKey="total_borrows"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={80}
                outerRadius={120}
                paddingAngle={5}
                labelLine={false}
                label={renderCustomizedLabel}
                animationBegin={0}
                animationDuration={1500}
              >
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={`url(#${entry.gradId})`}
                    stroke="transparent"
                    className="hover:opacity-80 transition-opacity cursor-pointer outline-none"
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                verticalAlign="bottom" 
                height={36}
                content={({ payload }) => (
                  <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mt-4">
                    {payload?.map((entry: any, index: number) => {
                      const color = entry.payload?.fill || COLORS[index % COLORS.length];
                      return (
                        <div key={`legend-${index}`} className="flex items-center gap-2">
                          <div 
                            className="size-2.5 rounded-full" 
                            style={{ backgroundColor: color }}
                          />
                          <span className="text-xs font-medium text-muted-foreground truncate max-w-40">
                            {entry.value}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
            <BookOpen className="h-12 w-12 opacity-10" />
            <p className="text-sm font-medium">{t("noData")}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

