"use client";

import { useTranslations } from "next-intl";
import React, { useState } from "react";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import EmptyState from "@/components/custom-ui/EmptyState";
import { ActivityLog, ActivityLogFilters } from "@/types/activity-log";
import { formatDistanceToNow } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { Search, RotateCcw, Filter, Activity } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ActivityTableProps {
  logs: ActivityLog[];
  pagination: {
    current_page: number;
    from: number;
    to: number;
    total: number;
    last_page: number;
  };
  onRowClick: (id: number) => void;
  onPageChange: (page: number) => void;
  filters: ActivityLogFilters;
  onFilterChange: (filters: ActivityLogFilters) => void;
}

export default function ActivityTable({
  logs,
  pagination,
  onRowClick,
  onPageChange,
  filters,
  onFilterChange,
}: ActivityTableProps) {
  const t = useTranslations("activity-log");
  const [localFilters, setLocalFilters] = useState(filters);

  const handleApplyFilters = () => {
    onFilterChange({ ...localFilters, page: 1 });
  };

  const handleReset = () => {
    const resetFilters: ActivityLogFilters = { page: 1, per_page: 15 };
    setLocalFilters(resetFilters);
    onFilterChange(resetFilters);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleApplyFilters();
    }
  };

  const getActionBadge = (action: string) => {
    const variants: Record<
      string,
      "default" | "secondary" | "destructive" | "outline"
    > = {
      login: "default",
      logout: "secondary",
      create: "default",
      update: "outline",
      delete: "destructive",
    };
    return variants[action] || "default";
  };

  const getActionColor = (action: string) => {
    const colors: Record<string, string> = {
      login: "bg-blue-100 text-blue-800 hover:bg-blue-200",
      logout: "bg-gray-100 text-gray-800 hover:bg-gray-200",
      create: "bg-green-100 text-green-800 hover:bg-green-200",
      update: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
      delete: "bg-red-100 text-red-800 hover:bg-red-200",
    };
    return colors[action] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="rounded-md border shadow-xs bg-white dark:bg-gray-900/50 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 hover:bg-muted/50 border-b">
            <TableHead className="w-16 text-center font-semibold">
              #
            </TableHead>
            <TableHead className="font-semibold">{t("user")}</TableHead>
            <TableHead className="font-semibold">{t("actionCol")}</TableHead>
            <TableHead className="font-semibold">{t("moduleCol")}</TableHead>
            <TableHead className="font-semibold">{t("descriptionCol")}</TableHead>
            <TableHead className="font-semibold">{t("ipAddress")}</TableHead>
            <TableHead className="font-semibold">{t("timeCol")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="p-0">
                <EmptyState
                  title={t("noActivityLogs")}
                  description="There are no activity logs to display at the moment."
                  icon={<Activity />}
                  className="h-[50vh]"
                />
              </TableCell>
            </TableRow>
          ) : (
            logs.map((log, index) => (
              <TableRow
                key={log.id}
                className="group cursor-pointer hover:bg-primary/5 transition-colors border-b last:border-b-0"
                onClick={() => onRowClick(log.id)}
              >
                <TableCell className="font-medium text-center text-muted-foreground py-4">
                  {index + 1}
                </TableCell>
                <TableCell className="py-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border shadow-xs">
                      <AvatarImage
                        src={log.user?.profile?.avatar}
                        alt={log.user?.profile?.full_name}
                        className="object-cover"
                      />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {log.user?.profile?.full_name?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-foreground leading-none mb-1">
                        {log.user?.profile?.full_name || "Unknown"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {log.user?.email}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="py-4">
                  <Badge
                    variant={getActionBadge(log.action)}
                    className={cn(
                      "font-medium capitalize px-2.5 py-0.5 rounded-full text-[11px]",
                      getActionColor(log.action)
                    )}
                  >
                    {log.action}
                  </Badge>
                </TableCell>
                <TableCell className="py-4">
                  <Badge
                    variant="outline"
                    className="capitalize font-normal text-[11px] bg-muted/30"
                  >
                    {log.module}
                  </Badge>
                </TableCell>
                <TableCell className="max-w-xs truncate text-foreground text-sm py-4">
                  {log.description}
                </TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground py-4">
                  {log.ip_address}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground whitespace-nowrap py-4">
                  {formatDistanceToNow(new Date(log.created_at), {
                    addSuffix: true,
                    locale: idLocale,
                  })}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
