"use client";

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
import { ContentLoadingScreen } from "@/components/ui/ContentLoadingScreen";
import EmptyState from "@/components/custom-ui/EmptyState";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { ActivityLog, ActivityLogFilters } from "@/types/activity-log";
import { formatDistanceToNow } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { Search, RotateCcw, Filter } from "lucide-react";

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
  loading?: boolean;
  filters: ActivityLogFilters;
  onFilterChange: (filters: ActivityLogFilters) => void;
}

export default function ActivityTable({
  logs,
  pagination,
  onRowClick,
  onPageChange,
  loading,
  filters,
  onFilterChange,
}: ActivityTableProps) {
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
    <Card className="overflow-hidden border-0 shadow-lg bg-white dark:bg-gray-900">
      <CardHeader className="border-b border-gray-100 dark:border-gray-800 pb-4 space-y-4">
        <CardTitle className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          Daftar Aktivitas
          <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">
            ({pagination.total} total)
          </span>
        </CardTitle>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-3">
          {/* Search Input - spans full width on mobile, 2 columns on md, 3 on lg */}
          <div className="relative md:col-span-2 lg:col-span-3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search description..."
              value={localFilters.search || ""}
              onChange={(e) =>
                setLocalFilters({ ...localFilters, search: e.target.value })
              }
              onKeyPress={handleKeyPress}
              className="pl-10"
            />
          </div>

          {/* Action and Module filters side by side on mobile */}
          <div className="grid grid-cols-2 gap-3 md:col-span-1 lg:col-span-2">
            <Select
              value={localFilters.action || "all"}
              onValueChange={(value) =>
                setLocalFilters({
                  ...localFilters,
                  action: value === "all" ? undefined : value,
                })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Filter by action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                <SelectItem value="login">Login</SelectItem>
                <SelectItem value="logout">Logout</SelectItem>
                <SelectItem value="create">Create</SelectItem>
                <SelectItem value="update">Update</SelectItem>
                <SelectItem value="delete">Delete</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={localFilters.module || "all"}
              onValueChange={(value) =>
                setLocalFilters({
                  ...localFilters,
                  module: value === "all" ? undefined : value,
                })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Filter by module" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Modules</SelectItem>
                <SelectItem value="auth">Auth</SelectItem>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="book">Book</SelectItem>
                <SelectItem value="loan">Loan</SelectItem>
                <SelectItem value="return">Return</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Apply and Reset buttons */}
          <div className="flex gap-2 md:col-span-1 lg:col-span-2">
            <Button
              onClick={handleApplyFilters}
              variant="brand"
              size="sm"
              className="flex-1"
            >
              <Filter className="h-3.5 w-3.5 mr-1.5" />
              Apply
            </Button>
            <Button
              onClick={handleReset}
              variant="outline"
              size="sm"
              className="px-3"
              title="Reset filters"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>No</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Module</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>IP Address</TableHead>
                <TableHead>Waktu</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-64 p-0 relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <ContentLoadingScreen />
                    </div>
                  </TableCell>
                </TableRow>
              ) : logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="p-0">
                    <EmptyState
                      title="No Activity Logs"
                      description="There are no activity logs to display at the moment."
                      icon={
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-16 w-16"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                          />
                        </svg>
                      }
                      className="h-[50vh]"
                    />
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log, index) => (
                  <TableRow
                    key={log.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => onRowClick(log.id)}
                  >
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">
                          {log.user?.profile?.full_name || "Unknown"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {log.user?.email}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={getActionBadge(log.action)}
                        className={getActionColor(log.action)}
                      >
                        {log.action}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{log.module}</Badge>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {log.description}
                    </TableCell>
                    <TableCell className="text-sm">{log.ip_address}</TableCell>
                    <TableCell className="text-sm">
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

        {/* Pagination */}
        {logs.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4">
            <p className="text-sm text-muted-foreground">
              Showing {pagination.from} - {pagination.to} of {pagination.total} results
            </p>
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => {
                      if (pagination.current_page > 1) {
                        onPageChange(pagination.current_page - 1);
                      }
                    }}
                    className={cn(
                      pagination.current_page === 1 && "pointer-events-none opacity-50",
                      "cursor-pointer"
                    )}
                  />
                </PaginationItem>

                {/* Page numbers */}
                {Array.from({ length: pagination.last_page }, (_, i) => i + 1)
                  .filter((page) => {
                    const current = pagination.current_page;
                    const last = pagination.last_page;
                    // Show first page, last page, current page, and pages around current
                    return (
                      page === 1 ||
                      page === last ||
                      (page >= current - 1 && page <= current + 1)
                    );
                  })
                  .map((page, index, array) => {
                    const prevPage = array[index - 1];
                    const showEllipsis = prevPage && page - prevPage > 1;

                    return (
                      <React.Fragment key={page}>
                        {showEllipsis && (
                          <PaginationItem>
                            <PaginationEllipsis />
                          </PaginationItem>
                        )}
                        <PaginationItem>
                          <PaginationLink
                            onClick={() => onPageChange(page)}
                            isActive={pagination.current_page === page}
                            className="cursor-pointer"
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      </React.Fragment>
                    );
                  })}

                <PaginationItem>
                  <PaginationNext
                    onClick={() => {
                      if (pagination.current_page < pagination.last_page) {
                        onPageChange(pagination.current_page + 1);
                      }
                    }}
                    className={cn(
                      pagination.current_page === pagination.last_page &&
                        "pointer-events-none opacity-50",
                      "cursor-pointer"
                    )}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
