"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { ChartData, DailyChartData } from "@/types/activity-log";

const COLORS = [
  "#3b82f6", // blue
  "#10b981", // emerald
  "#8b5cf6", // purple
  "#f59e0b", // amber
  "#ef4444", // red
  "#ec4899", // pink
  "#06b6d4", // cyan
  "#6366f1", // indigo
];

interface ActivityChartsProps {
  charts: {
    by_module: ChartData[];
    by_action: ChartData[];
    daily: DailyChartData[];
  };
}

// Custom Tooltip Component
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

// Custom Pie Label
const renderCustomLabel = (entry: any) => {
  const percent = entry.percent ? (entry.percent * 100).toFixed(0) : 0;
  return `${percent}%`;
};

export default function ActivityCharts({ charts }: ActivityChartsProps) {
  // Check if data exists and has items
  const hasModuleData = charts.by_module && charts.by_module.length > 0;
  const hasActionData = charts.by_action && charts.by_action.length > 0;
  const hasDailyData = charts.daily && charts.daily.length > 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Pie Chart - By Module */}
      <Card className="border-0 shadow-lg bg-white dark:bg-gray-900">
        <CardHeader className="border-b border-gray-100 dark:border-gray-800 pb-4">
          <CardTitle className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <div className="w-1 h-6 bg-linear-to-b from-blue-500 to-cyan-500 rounded-full" />
            Distribusi per Modul
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {hasModuleData ? (
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={charts.by_module}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomLabel}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                  animationBegin={0}
                  animationDuration={800}
                >
                  {charts.by_module.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                      className="hover:opacity-80 transition-opacity cursor-pointer"
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                  wrapperStyle={{ paddingTop: "20px" }}
                  formatter={(value) => <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[350px] text-muted-foreground">
              Tidak ada data
            </div>
          )}
        </CardContent>
      </Card>

      {/* Line Chart - Daily */}
      <Card className="border-0 shadow-lg bg-white dark:bg-gray-900">
        <CardHeader className="border-b border-gray-100 dark:border-gray-800 pb-4">
          <CardTitle className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <div className="w-1 h-6 bg-linear-to-b from-purple-500 to-pink-500 rounded-full" />
            Tren Aktivitas Harian
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {hasDailyData ? (
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={charts.daily}>
                <defs>
                  <linearGradient id="colorLine" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-800" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: "#6b7280", fontSize: 12 }}
                  axisLine={{ stroke: "#d1d5db" }}
                />
                <YAxis
                  tick={{ fill: "#6b7280", fontSize: 12 }}
                  axisLine={{ stroke: "#d1d5db" }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#8b5cf6"
                  strokeWidth={3}
                  fill="url(#colorLine)"
                  dot={{ fill: "#8b5cf6", r: 5, strokeWidth: 2, stroke: "#fff" }}
                  activeDot={{ r: 7, strokeWidth: 3 }}
                  animationBegin={0}
                  animationDuration={800}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[350px] text-muted-foreground">
              Tidak ada data
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}