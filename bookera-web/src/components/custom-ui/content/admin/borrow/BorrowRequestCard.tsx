"use client";

import { BorrowRequest } from "@/types/borrow-request";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, Calendar, User, Eye, Trash } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";

interface BorrowRequestCardProps {
  req: BorrowRequest;
  onDelete: (id: number) => void;
}

const approvalStatusConfig: Record<
  string,
  { label: string; className: string }
> = {
  processing: {
    label: "Awaiting Processing",
    className: "text-violet-700 bg-violet-100 hover:bg-violet-100",
  },
  approved: {
    label: "Approved",
    className: "text-green-700 bg-green-100 hover:bg-green-100",
  },
  rejected: {
    label: "Rejected",
    className: "text-red-700 bg-red-100 hover:bg-red-100",
  },
  canceled: {
    label: "Canceled",
    className: "text-gray-600 bg-gray-100 hover:bg-gray-100",
  },
};

export function BorrowRequestCard({ req, onDelete }: BorrowRequestCardProps) {
  const cfg =
    approvalStatusConfig[req.approval_status] ??
    approvalStatusConfig["processing"];

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-5">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-base">Request #{req.id}</span>
              <Badge variant="secondary" className={`${cfg.className} w-fit`}>
                {cfg.label}
              </Badge>
            </div>

            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <User className="h-3.5 w-3.5" />
              <span>{req.user?.profile?.full_name || req.user?.email}</span>
            </div>

            <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
              <div className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                <span>
                  {format(new Date(req.borrow_date), "dd MMM yyyy")} &rarr;{" "}
                  {format(new Date(req.return_date), "dd MMM yyyy")}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-1.5 text-sm">
              <BookOpen className="h-3.5 w-3.5 mt-0.5 text-muted-foreground shrink-0" />
              <span className="text-muted-foreground">
                {req.borrow_request_details
                  ?.map((d) => d.book?.title)
                  .join(", ") || "-"}
              </span>
            </div>
          </div>

          <div className="flex gap-2 shrink-0">
            <Button
              size="sm"
              variant="destructive"
              onClick={() => onDelete(req.id)}
            >
              <Trash className="h-4 w-4" />
            </Button>
            <Link href={`/admin/borrow-requests/${req.id}`}>
              <Button size="sm" variant="outline" className="h-8 gap-1">
                <Eye className="h-3.5 w-3.5" />
                Detail
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
