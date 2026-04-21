"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { BarChart3, BookOpen, LayoutGrid } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DataLoading from "@/components/custom-ui/DataLoading";
import { dashboardService } from "@/services/dashboard.service";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TopBorrowedStat } from "@/types/dashboard";
import { toast } from "sonner";

const BAR_COLORS = ["#059669", "#0ea5e9", "#f97316", "#8b5cf6", "#ef4444"];
type ChartMode = "categories" | "books";

const CustomTooltip = ({ active, payload }: any) => {
  const t = useTranslations("dashboard");

  if (active && payload && payload.length) {
    const item = payload[0];

    return (
      <div className="rounded-xl border bg-popover px-4 py-3 shadow-xl">
        <p className="mb-2 font-semibold text-popover-foreground">
          {item.payload?.name}
        </p>
        <div className="flex items-center gap-2">
          <span
            className="h-3 w-3 rounded-full"
            style={{ backgroundColor: item.color ?? item.fill }}
          />
          <span className="text-sm text-muted-foreground">{t("borrowCount")}:</span>
          <span className="text-sm font-bold text-popover-foreground">{item.value}</span>
        </div>
      </div>
    );
  }

  return null;
};

export default function TopBorrowedCategoriesChart() {
  const t = useTranslations("dashboard");
  const [activeMode, setActiveMode] = useState<ChartMode>("categories");
  const [dataByMode, setDataByMode] = useState<Record<ChartMode, TopBorrowedStat[]>>({
    categories: [],
    books: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      setLoading(true);

      const [categoriesResult, booksResult] = await Promise.allSettled([
        dashboardService.getTopBorrowedCategories(5),
        dashboardService.getTopBorrowedBooks(5),
      ]);

      if (!isMounted) {
        return;
      }

      const nextData: Record<ChartMode, TopBorrowedStat[]> = {
        categories: [],
        books: [],
      };
      let hasError = false;

      if (categoriesResult.status === "fulfilled") {
        nextData.categories = categoriesResult.value.data.data ?? [];
      } else {
        hasError = true;
      }

      if (booksResult.status === "fulfilled") {
        nextData.books = booksResult.value.data.data ?? [];
      } else {
        hasError = true;
      }

      setDataByMode(nextData);
      setLoading(false);

      if (hasError) {
        toast.error(t("loadError"));
      }
    };

    void loadData();

    return () => {
      isMounted = false;
    };
  }, [t]);

  const activeData = dataByMode[activeMode];

  const chartData = activeData.map((item) => ({
    name: item.name,
    total_borrows: item.total_borrows,
  }));

  const hasData = chartData.length > 0;
  const titleKey =
    activeMode === "categories"
      ? "topBorrowedCategoriesTitle"
      : "topBorrowedBooksTitle";
  const descriptionKey =
    activeMode === "categories"
      ? "topBorrowedCategoriesDescription"
      : "topBorrowedBooksDescription";
  const yAxisWidth = activeMode === "books" ? 200 : 140;

  return (
    <Tabs
      value={activeMode}
      onValueChange={(value) => setActiveMode(value as ChartMode)}
      className="w-full gap-0"
    >
      <Card className="h-full w-full overflow-hidden border-none shadow-premium bg-card/50 backdrop-blur-sm">
        <CardHeader className="border-b border-border/50 bg-muted/20 pb-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-1.5">
              <CardTitle className="flex items-center gap-2 text-lg font-bold">
                <div className="rounded-lg bg-emerald-500/10 p-1.5 text-emerald-500">
                  <BarChart3 className="h-5 w-5" />
                </div>
                {t(titleKey)}
              </CardTitle>
              <p className="text-sm text-muted-foreground">{t(descriptionKey)}</p>
            </div>

            <TabsList className="grid w-full grid-cols-2 lg:w-65">
              <TabsTrigger value="categories" className="gap-2">
                <LayoutGrid className="size-4" />
                <span>{t("topCategories")}</span>
              </TabsTrigger>
              <TabsTrigger value="books" className="gap-2">
                <BookOpen className="size-4" />
                <span>{t("topBooks")}</span>
              </TabsTrigger>
            </TabsList>
          </div>
        </CardHeader>

        <CardContent className="flex min-h-105 items-center justify-center pt-6">
          {loading ? (
            <DataLoading
              variant="card"
              size="lg"
              className="w-full border-none bg-transparent shadow-none"
            />
          ) : hasData ? (
            <ResponsiveContainer width="100%" height={360}>
              <BarChart
                data={chartData}
                layout="vertical"
                margin={{ top: 8, right: 24, left: 8, bottom: 8 }}
                barCategoryGap="28%"
              >
                <defs>
                  <linearGradient id="borrowCategoryGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#059669" stopOpacity={1} />
                    <stop offset="100%" stopColor="#0ea5e9" stopOpacity={0.95} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#e5e7eb"
                  className="dark:stroke-gray-800"
                />
                <XAxis
                  type="number"
                  allowDecimals={false}
                  tick={{ fill: "#6b7280", fontSize: 12 }}
                  axisLine={{ stroke: "#d1d5db" }}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fill: "#6b7280", fontSize: 12 }}
                  axisLine={{ stroke: "#d1d5db" }}
                  tickLine={false}
                  width={yAxisWidth}
                />
                <Tooltip content={(props) => <CustomTooltip {...props} />} />
                <Bar
                  dataKey="total_borrows"
                  radius={[0, 999, 999, 0]}
                  fill="url(#borrowCategoryGradient)"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={entry.name} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
              <BarChart3 className="h-12 w-12 opacity-10" />
              <p className="text-sm font-medium">{t("noData")}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </Tabs>
  );
}