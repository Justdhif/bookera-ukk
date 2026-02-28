"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Activity, Calendar, CalendarDays, TrendingUp, Sparkles, Clock, BarChart3 } from "lucide-react";
interface ActivityStatisticsProps {
  statistics: {
    today: number;
    this_week: number;
    this_month: number;
    total: number;
  };
}

export default function ActivityStatistics({ statistics }: ActivityStatisticsProps) {
  const stats = [
    {
      label: "Today",
      value: statistics.today,
      icon: Activity,
      gradient: "from-blue-500 to-cyan-500",
      bgGradient: "from-blue-50/40 to-cyan-50/40 dark:from-blue-950/20 dark:to-cyan-950/20",
      borderColor: "border-blue-200/50 dark:border-blue-800/50",
      hoverBorderColor: "group-hover:border-blue-300 dark:group-hover:border-blue-700",
      iconBg: "bg-linear-to-br from-blue-500 to-cyan-500",
      statIcon: Sparkles,
      statText: "Today's Activity",
      updatedText: "Real-time data",
    },
    {
      label: "This Week",
      value: statistics.this_week,
      icon: Calendar,
      gradient: "from-emerald-500 to-teal-500",
      bgGradient: "from-emerald-50/40 to-teal-50/40 dark:from-emerald-950/20 dark:to-teal-950/20",
      borderColor: "border-emerald-200/50 dark:border-emerald-800/50",
      hoverBorderColor: "group-hover:border-emerald-300 dark:group-hover:border-emerald-700",
      iconBg: "bg-linear-to-br from-emerald-500 to-teal-500",
      statIcon: Calendar,
      statText: "This Week",
      updatedText: "Last 7 days",
    },
    {
      label: "This Month",
      value: statistics.this_month,
      icon: CalendarDays,
      gradient: "from-purple-500 to-pink-500",
      bgGradient: "from-purple-50/40 to-pink-50/40 dark:from-purple-950/20 dark:to-pink-950/20",
      borderColor: "border-purple-200/50 dark:border-purple-800/50",
      hoverBorderColor: "group-hover:border-purple-300 dark:group-hover:border-purple-700",
      iconBg: "bg-linear-to-br from-purple-500 to-pink-500",
      statIcon: CalendarDays,
      statText: "Monthly Stats",
      updatedText: "Current month",
    },
    {
      label: "Total Activities",
      value: statistics.total,
      icon: TrendingUp,
      gradient: "from-orange-500 to-amber-500",
      bgGradient: "from-orange-50/40 to-amber-50/40 dark:from-orange-950/20 dark:to-amber-950/20",
      borderColor: "border-orange-200/50 dark:border-orange-800/50",
      hoverBorderColor: "group-hover:border-orange-300 dark:group-hover:border-orange-700",
      iconBg: "bg-linear-to-br from-orange-500 to-amber-500",
      statIcon: TrendingUp,
      statText: "All Activities",
      updatedText: "Total records",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((item, index) => {
        const Icon = item.icon;
        return (
          <Card
            key={index}
            className={`group relative overflow-hidden border ${item.borderColor} ${item.hoverBorderColor} transition-all duration-300 hover:shadow-lg dark:hover:shadow-slate-900/30 bg-linear-to-br ${item.bgGradient} backdrop-blur-sm`}
          >
            
            <div className="absolute inset-0 bg-linear-to-br from-transparent via-transparent to-transparent group-hover:via-white/10 dark:group-hover:via-white/5 transition-all duration-500 pointer-events-none" />

            
            <div className={`absolute top-0 right-0 w-16 h-16 bg-linear-to-br ${item.gradient} opacity-5 dark:opacity-10 rounded-bl-full transition-opacity group-hover:opacity-10 dark:group-hover:opacity-15`} />

            
            <div className={`absolute top-3 right-3 h-2 w-2 rounded-full bg-linear-to-br ${item.gradient} animate-pulse ring-2 ring-background`} />

            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`relative p-2.5 rounded-xl ${item.iconBg} text-white shadow-lg ring-1 ring-white/20 group-hover:shadow-xl group-hover:scale-105 transition-all duration-300`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground/80">
                      {item.label}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <item.statIcon className="h-3 w-3 text-muted-foreground/60" />
                      <span className="text-xs font-medium text-muted-foreground/70">
                        {item.statText}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-0">
              <div className="flex flex-col">
                <div className="flex items-end justify-between">
                  <div className="flex items-baseline gap-2">
                    <p className="text-3xl font-bold tracking-tight bg-linear-to-br from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
                      {item.value.toLocaleString()}
                    </p>
                    <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-linear-to-r from-white/50 to-white/30 dark:from-slate-800/50 dark:to-slate-900/50 backdrop-blur-sm border border-slate-200/30 dark:border-slate-700/30">
                      <BarChart3 className="h-3 w-3 text-slate-600 dark:text-slate-400" />
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-linear-to-br from-slate-700 to-slate-900 dark:from-slate-300 dark:to-slate-100 bg-clip-text text-transparent">
                          {"Stats"}
                      </span>
                    </div>
                  </div>
                </div>

                
                <div className="mt-4 relative">
                  <div className="absolute left-0 right-0 h-px bg-linear-to-r from-transparent via-slate-300/30 dark:via-slate-600/30 to-transparent" />
                  <div
                    className={`relative h-px bg-linear-to-r ${item.gradient} opacity-60 transition-all duration-700 group-hover:opacity-80`}
                    style={{ width: "60%" }}
                  />
                </div>

                
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className={`h-2 w-2 rounded-full bg-linear-to-br ${item.gradient} animate-pulse`} />
                    <span className="text-xs text-muted-foreground/60 font-medium">
                      {item.updatedText}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground/60 font-medium">
                    <Clock className="h-3 w-3" />
                    <span>{"Now"}</span>
                  </div>
                </div>
              </div>
            </CardContent>

            
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
              <div className={`absolute inset-0 bg-linear-to-br ${item.gradient} opacity-[0.03] dark:opacity-[0.05]`} />
            </div>
          </Card>
        );
      })}
    </div>
  );
}
