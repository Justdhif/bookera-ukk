"use client";

import { BorrowRequest } from "@/types/borrow-request";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { 
  BookOpen, 
  Calendar, 
  Clock, 
  User, 
  Building2, 
  Tag, 
  Hash, 
  Trash, 
  Loader2,
  XCircle,
  AlertCircle
} from "lucide-react";
import { format } from "date-fns";
import { useTranslations } from "next-intl";
import Image from "next/image";

interface BorrowRequestCardProps {
  request: BorrowRequest;
  onDelete?: (id: number) => void;
  isDeleting?: boolean;
}

export function BorrowRequestCard({
  request,
  onDelete,
  isDeleting,
}: BorrowRequestCardProps) {
  const t = useTranslations("public");
  const tCommon = useTranslations("common");

  const approvalStatusConfig: Record<
    string,
    { label: string; className: string; icon: any }
  > = {
    processing: {
      label: t("awaitingProcessing"),
      className: "text-violet-700 bg-violet-100 hover:bg-violet-100 dark:bg-violet-950/40 dark:text-violet-300 border-violet-200",
      icon: Clock,
    },
    approved: {
      label: t("statusApproved"),
      className: "text-green-700 bg-green-100 hover:bg-green-100 dark:bg-green-950/40 dark:text-green-300 border-green-200",
      icon: BookOpen,
    },
    rejected: {
      label: t("statusRejected"),
      className: "text-red-700 bg-red-100 hover:bg-red-100 dark:bg-red-950/40 dark:text-red-300 border-red-200",
      icon: XCircle,
    },
    canceled: {
      label: t("statusCanceled"),
      className: "text-gray-600 bg-gray-100 hover:bg-gray-100 dark:bg-gray-800/60 dark:text-gray-300 border-gray-200",
      icon: XCircle,
    },
  };

  const status = approvalStatusConfig[request.approval_status] || approvalStatusConfig.processing;
  const StatusIcon = status.icon;

  return (
    <Card className="group relative overflow-hidden hover:shadow-premium transition-all duration-300 border-2">
      <CardHeader className="pb-4 border-b border-border/50 bg-muted/30">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3 flex-wrap">
              <CardTitle className="text-xl font-bold tracking-tight">
                {t("requestHash")}{request.id}
              </CardTitle>
              <Badge variant="secondary" className={`${status.className} px-3 py-1 flex items-center gap-1.5 font-bold uppercase tracking-wider text-[10px]`}>
                <StatusIcon className="h-3 w-3" />
                {status.label}
              </Badge>
              <span className="text-[10px] font-mono text-muted-foreground bg-muted/50 px-2 py-0.5 rounded border border-dashed">
                {format(new Date(request.created_at), "dd/MM/yyyy HH:mm")}
              </span>
            </div>
            <CardDescription className="flex items-center gap-4 text-xs font-medium">
              <div className="flex items-center gap-1.5 text-foreground/80">
                <Calendar className="h-3.5 w-3.5 text-primary" />
                <span>
                  {format(new Date(request.borrow_date), "dd MMM yyyy")}
                  <span className="mx-2 text-muted-foreground">→</span>
                  {format(new Date(request.return_date), "dd MMM yyyy")}
                </span>
              </div>
            </CardDescription>
          </div>
          <div className="flex gap-2 items-center self-end md:self-center">
            {request.approval_status === "processing" && onDelete && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => onDelete(request.id)}
                disabled={isDeleting}
                className="rounded-full px-4 h-9 shadow-sm"
              >
                {isDeleting ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Trash className="h-4 w-4 mr-2" />
                )}
                {t("detail.editDialog.cancel")}
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground/70 flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-primary" />
              {t("requestedBooks")} <span className="text-primary truncate max-w-[150px]">
                ({request.borrow_request_details?.length || 0})
              </span>
            </h4>
          </div>

          <div className="grid gap-4">
            {request.borrow_request_details.map((detail) => {
              const book = detail.book;
              const authors = book?.authors?.map(a => a.name).join(", ") || book?.author || tCommon("noData");
              
              return (
                <div
                  key={detail.id}
                  className="group/item flex flex-col sm:flex-row items-center sm:items-start gap-4 rounded-xl border border-border/50 bg-card p-4 hover:border-primary/30 hover:shadow-md transition-all duration-300 overflow-hidden relative"
                >
                  <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover/item:opacity-100 transition-opacity" />
                  
                  <div className="relative w-24 h-32 sm:w-20 sm:h-28 shrink-0 shadow-lg group-hover/item:scale-105 transition-transform duration-300 z-10">
                    <Image
                      src={book?.cover_image || "/placeholder.png"}
                      alt={book?.title || "Book"}
                      fill
                      className="object-cover rounded-lg"
                      unoptimized
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0 space-y-2 z-10 w-full">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-base sm:text-lg tracking-tight truncate group-hover/item:text-primary transition-colors">
                          {book?.title || tCommon("noData")}
                        </p>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-[10px] font-bold uppercase text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            <span className="truncate max-w-[120px]">{authors}</span>
                          </div>
                          {book?.publishers && book.publishers.length > 0 && (
                            <div className="flex items-center gap-1">
                              <Building2 className="h-3 w-3" />
                              <span className="truncate max-w-[120px]">{book.publishers[0].name}</span>
                            </div>
                          )}
                          {book?.isbn && (
                            <div className="flex items-center gap-1">
                              <Hash className="h-3 w-3" />
                              <span className="truncate max-w-[100px]">{book.isbn}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="shrink-0">
                        <Badge variant="outline" className="text-[10px] h-6 px-3 bg-amber-500/10 text-amber-500 border-amber-500/20 font-bold">
                          {tCommon("waiting")}
                        </Badge>
                      </div>
                    </div>
                    
                    {book?.categories && book.categories.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {book.categories.slice(0, 3).map((cat) => (
                          <Badge 
                            key={cat.id} 
                            variant="outline" 
                            className="bg-primary/5 text-[10px] py-0 px-2.5 h-6 border-primary/20 text-primary/80 font-medium"
                          >
                            <Tag className="h-3 w-3 mr-1.5" />
                            {cat.name}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {request.approval_status === "rejected" && request.reject_reason && (
            <div className="mt-4 flex items-start gap-4 rounded-xl bg-red-50 dark:bg-red-950/20 border-2 border-red-100 dark:border-red-900/30 p-4 transition-all hover:bg-red-100/50 dark:hover:bg-red-950/30">
              <div className="p-2.5 rounded-full bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400">
                <AlertCircle className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <span className="font-black text-[11px] uppercase tracking-widest text-red-600 dark:text-red-400">
                  {t("rejectionReason")}
                </span>
                <p className="text-sm font-medium text-red-800 dark:text-red-300 leading-relaxed italic">
                  "{request.reject_reason}"
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
      <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-primary/5 rounded-full blur-3xl -z-10 group-hover:bg-primary/20 transition-colors" />
    </Card>
  );
}
