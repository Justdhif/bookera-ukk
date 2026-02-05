"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { LatestLoan } from "@/types/dashboard";
import { BookOpen, Calendar, User } from "lucide-react";

interface LatestLoansTableProps {
  data: LatestLoan[];
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
};

const statusColorMap: Record<string, string> = {
  pending: "bg-gray-500/10 text-gray-700 dark:text-gray-400 border border-gray-500/20",
  waiting: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border border-yellow-500/20",
  borrowed: "bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border border-cyan-500/20",
  returned: "bg-teal-500/10 text-teal-700 dark:text-teal-400 border border-teal-500/20",
  rejected: "bg-red-500/10 text-red-700 dark:text-red-400 border border-red-500/20",
  late: "bg-orange-500/10 text-orange-700 dark:text-orange-400 border border-orange-500/20",
};

export default function LatestLoansTable({ data }: LatestLoansTableProps) {
  const hasData = data && data.length > 0;

  return (
    <Card className="border-0 shadow-lg bg-white dark:bg-gray-900">
      <CardHeader className="border-b border-gray-100 dark:border-gray-800 pb-4">
        <CardTitle className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <div className="w-1 h-6 bg-linear-to-b from-purple-500 to-pink-500 rounded-full" />
          Peminjaman Terbaru
        </CardTitle>
      </CardHeader>
      <CardContent>
        {hasData ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-gray-100 dark:border-gray-800">
                  <TableHead className="font-semibold text-gray-700 dark:text-gray-300">
                    Peminjam
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700 dark:text-gray-300">
                    Buku
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700 dark:text-gray-300">
                    Tanggal Pinjam
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700 dark:text-gray-300">
                    Status
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((loan) => (
                  <TableRow
                    key={loan.id}
                    className="border-gray-100 dark:border-gray-800 hover:bg-gray-50/50 dark:hover:bg-gray-800/50"
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-linear-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                          <User className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {loan.user?.profile?.full_name || loan.user?.email}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {loan.user?.email}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-emerald-500" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {loan.loan_details?.[0]?.book_copy?.book?.title ||
                            `${loan.loan_details?.length || 0} buku`}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-blue-500" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {formatDate(loan.loan_date)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={`capitalize ${
                          statusColorMap[loan.status] || ""
                        }`}
                      >
                        {loan.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="flex items-center justify-center h-75 text-muted-foreground">
            Tidak ada data peminjaman
          </div>
        )}
      </CardContent>
    </Card>
  );
}
