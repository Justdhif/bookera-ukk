"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Fine } from "@/types/fine";
import EmptyState from "@/components/custom-ui/EmptyState";
import {
  DollarSign,
  Trash2,
  CheckCircle,
  XCircle,
  MoreVertical,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
const statusColors = {
  unpaid: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  paid: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  waived:
    "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
};

export default function FineTable({
  data,
  onDelete,
  onMarkAsPaid,
}: {
  data: Fine[];
  onDelete: (id: number) => void;
  onMarkAsPaid: (id: number) => void;
}) {
  const statusLabels = {
    unpaid: "Unpaid",
    paid: "Paid",
    waived: "Waived",
  };

  if (data.length === 0) {
    return (
      <EmptyState
        title={"No fines yet"}
        description={"Fines will appear after being added to loans."}
        icon={<DollarSign className="h-10 w-10" />}
      />
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 hover:bg-muted/50">
            <TableHead className="w-16 text-center">#</TableHead>
            <TableHead className="font-semibold">{"Borrower"}</TableHead>
            <TableHead className="font-semibold">{"Loan ID"}</TableHead>
            <TableHead className="font-semibold">{"Fine Type"}</TableHead>
            <TableHead className="font-semibold">{"Amount"}</TableHead>
            <TableHead className="font-semibold">{"Status"}</TableHead>
            <TableHead className="font-semibold">{"Date"}</TableHead>
            <TableHead className="font-semibold text-right">{"Actions"}</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {data.map((item, index) => (
            <TableRow
              key={item.id}
              className="group hover:bg-primary/5 transition-colors border-b last:border-b-0"
            >
              <TableCell className="font-medium text-center text-muted-foreground">
                {index + 1}
              </TableCell>

              <TableCell>
                <div>
                  <div className="font-medium text-foreground">
                    {item.loan?.user?.profile?.full_name || "-"}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {item.loan?.user?.email || "-"}
                  </div>
                </div>
              </TableCell>

              <TableCell>
                <Badge variant="outline" className="font-mono">
                  #{item.loan_id}
                </Badge>
              </TableCell>

              <TableCell>
                <span className="font-medium text-foreground">
                  {item.fine_type?.name || "-"}
                </span>
              </TableCell>

              <TableCell>
                <span className="font-semibold text-foreground">
                  Rp {item.amount.toLocaleString("id-ID")}
                </span>
              </TableCell>

              <TableCell>
                <Badge className={statusColors[item.status]}>
                  {statusLabels[item.status]}
                </Badge>
              </TableCell>

              <TableCell>
                <div className="text-sm">
                  <div className="text-muted-foreground">
                    {format(new Date(item.created_at), "dd MMM yyyy", {
                      locale: localeId,
                    })}
                  </div>
                  {item.paid_at && (
                    <div className="text-xs text-green-600 dark:text-green-400">
                      {"Paid On"}:{" "}
                      {format(new Date(item.paid_at), "dd MMM yyyy", {
                        locale: localeId,
                      })}
                    </div>
                  )}
                </div>
              </TableCell>

              <TableCell>
                <div className="flex justify-end items-center gap-2">
                  {item.status === "unpaid" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onMarkAsPaid(item.id)}
                      className="h-8 gap-1 text-green-600 border-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
                    >
                      <CheckCircle className="h-3.5 w-3.5" />
                      <span className="hidden lg:inline">{"Complete"}</span>
                    </Button>
                  )}

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => onDelete(item.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        {"Delete"}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
