"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { MonthlyChartData } from "@/types/activity-log";
const COLORS = [
  "#06b6d4",
  "#ec4899",
  "#8b5cf6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#3b82f6",
  "#6366f1",
];

interface ActivityChartsProps {
  charts: {
    monthly: MonthlyChartData[];
    modules: string[];
    current_year: number;
    available_years: number[];
  };
  onYearChange: (year: number) => void;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-900 p-4 rounded-xl shadow-xl border-2 border-gray-100 dark:border-gray-800">
        {label && <p className="font-semibold text-gray-900 dark:text-white mb-2">{label}</p>}
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {entry.name}:
            </span>
            <span className="text-sm font-bold text-gray-900 dark:text-white">
              {entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function ActivityCharts({ charts, onYearChange }: ActivityChartsProps) {
  const hasData = charts.monthly && charts.monthly.length > 0;
  
  const handlePrevYear = () => {
    onYearChange(charts.current_year - 1);
  };

  const handleNextYear = () => {
    onYearChange(charts.current_year + 1);
  };

  const handleYearSelect = (value: string) => {
    onYearChange(parseInt(value));
  };

  const currentYear = new Date().getFullYear();
  const allYears = Array.from(
    { length: 21 },
    (_, i) => currentYear - 10 + i
  );

  return (
    <Card className="border-0 shadow-lg bg-white dark:bg-gray-900">
      <CardHeader className="border-b border-gray-100 dark:border-gray-800 pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <div className="w-1 h-6 bg-linear-to-b from-cyan-500 to-pink-500 rounded-full" />
            {"Activity by Module"}
          </CardTitle>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handlePrevYear}
              className="h-8 w-8"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <Select value={charts.current_year.toString()} onValueChange={handleYearSelect}>
              <SelectTrigger className="w-24 h-8 border-2 border-gray-200 dark:border-gray-700 font-bold">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {allYears.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button
              variant="outline"
              size="icon"
              onClick={handleNextYear}
              className="h-8 w-8"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        {hasData ? (
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={charts.monthly}>
              <defs>
                {charts.modules.map((module, index) => (
                  <linearGradient key={module} id={`gradient${module}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS[index % COLORS.length]} stopOpacity={0.4} />
                    <stop offset="95%" stopColor={COLORS[index % COLORS.length]} stopOpacity={0.05} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="#e5e7eb" 
                className="dark:stroke-gray-800"
                vertical={false}
              />
              <XAxis
                dataKey="month"
                tick={{ fill: "#6b7280", fontSize: 12, fontWeight: 500 }}
                axisLine={{ stroke: "#e5e7eb" }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "#6b7280", fontSize: 12, fontWeight: 500 }}
                axisLine={{ stroke: "#e5e7eb" }}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="bottom"
                height={50}
                iconType="line"
                wrapperStyle={{ 
                  paddingTop: "24px",
                  fontSize: "14px",
                  fontWeight: 500
                }}
                formatter={(value) => (
                  <span className="text-gray-700 dark:text-gray-300 font-medium">
                    {value}
                  </span>
                )}
              />
              {charts.modules.map((module, index) => (
                <Area
                  key={module}
                  type="monotone"
                  dataKey={module}
                  stroke={COLORS[index % COLORS.length]}
                  strokeWidth={2.5}
                  fill={`url(#gradient${module})`}
                  fillOpacity={1}
                  dot={{ 
                    fill: COLORS[index % COLORS.length], 
                    r: 4.5, 
                    strokeWidth: 2.5, 
                    stroke: "#fff",
                    className: "drop-shadow-sm"
                  }}
                  activeDot={{ 
                    r: 6.5, 
                    strokeWidth: 3,
                    stroke: "#fff",
                    className: "drop-shadow-md" 
                  }}
                  animationBegin={0}
                  animationDuration={800}
                  animationEasing="ease-in-out"
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-100 text-muted-foreground">
            {"No data available"}
          </div>
        )}
      </CardContent>
    </Card>
  );
}