"use client";
import { BorrowRequest } from "@/types/borrow-request";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { useTranslations } from "next-intl";
import Image from "next/image";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ScaleIn } from "@/components/custom-ui/motion";
import DeleteButton from "@/components/custom-ui/button/DeleteButton";
import { Clock, BookOpen, XCircle, Calendar, User, Building2, Hash, Tag, AlertCircle } from "lucide-react";

interface BorrowRequestCardProps {
  request: BorrowRequest;
  index?: number;
  onDelete?: (id: number) => void;
  isDeleting?: boolean;
}

export function BorrowRequestCard({
  request,
  index = 0,
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
    <ScaleIn delay={index * 0.06}>
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem
          value={`request-${request.id}-${index}`}
          className="rounded-2xl border bg-card shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md mb-4 px-0 border-b-0"
        >
          <AccordionTrigger className="w-full text-left p-5 hover:no-underline [&>svg]:mr-0 [&>svg]:h-5 [&>svg]:w-5 cursor-pointer">
            <div className="flex items-start gap-4 text-left">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary">
                <Clock className="h-6 w-6" />
              </div>

              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-bold text-base text-foreground">
                    {t("requestHash")}
                    {request.id}
                  </p>
                  <div className="shrink-0">
                    <Badge variant="secondary" className={`${status.className} h-5 px-2 text-[9px] font-black uppercase tracking-wider`}>
                      <StatusIcon className="h-2.5 w-2.5 mr-1" />
                      {status.label}
                    </Badge>
                  </div>
                  <span className="text-[10px] font-mono text-muted-foreground bg-muted/50 px-2 py-0.5 rounded border border-dashed ml-auto sm:ml-0">
                    {format(new Date(request.created_at), "dd/MM/yyyy HH:mm")}
                  </span>
                </div>
                
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5 shrink-0" />
                  <span>
                    {format(new Date(request.borrow_date), "dd MMM yyyy")}
                    <span className="mx-2 opacity-40">→</span>
                    {format(new Date(request.return_date), "dd MMM yyyy")}
                  </span>
                </div>
              </div>
            </div>
          </AccordionTrigger>

          <AccordionContent className="p-0">
            <div className="mx-5 h-px bg-border/60" />
            <div className="p-5 space-y-6">
              {/* Section 1: Requested Books */}
              <div className="space-y-3">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 px-1">
                  {t("requestedBooks")} ({request.borrow_request_details?.length || 0})
                </h4>
                <div className="rounded-xl border border-border/60 overflow-hidden divide-y divide-border/40">
                  {request.borrow_request_details.map((detail) => {
                    const book = detail.book;
                    const authors = book?.authors?.map(a => a.name).join(", ") || book?.author || tCommon("noData");
                    
                    return (
                      <div
                        key={detail.id}
                        className="flex items-center gap-4 p-3 hover:bg-muted/20 transition-colors"
                      >
                        <div className="relative w-10 h-14 shrink-0 shadow-sm">
                          <Image
                            src={book?.cover_image || "/placeholder.png"}
                            alt={book?.title || tCommon("bookCover")}
                            fill
                            className="object-cover rounded-md"
                            unoptimized
                          />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm text-foreground truncate">
                            {book?.title || tCommon("noData")}
                          </p>
                          <div className="flex flex-wrap items-center gap-x-2 text-[10px] text-muted-foreground font-medium uppercase tracking-tight">
                            <span className="truncate max-w-40">{authors}</span>
                            {book?.publishers && book.publishers.length > 0 && (
                              <>
                                <span className="opacity-40">•</span>
                                <span className="truncate max-w-40">{book.publishers[0].name}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Section 2: Rejection Reason */}
              {request.approval_status === "rejected" && request.reject_reason && (
                <div className="mt-4 flex items-start gap-4 rounded-xl bg-destructive/5 border border-destructive/10 p-4">
                  <div className="p-2 rounded-full bg-destructive/10 text-destructive">
                    <AlertCircle className="h-4 w-4" />
                  </div>
                  <div className="space-y-1">
                    <span className="font-black text-[10px] uppercase tracking-widest text-destructive">
                      {t("rejectionReason")}
                    </span>
                    <p className="text-sm font-medium text-destructive/80 italic leading-relaxed">
                      "{request.reject_reason}"
                    </p>
                  </div>
                </div>
              )}
            </div>
          </AccordionContent>

          <div className="mx-5 h-px bg-border/60" />

          <div className="flex items-center justify-between gap-4 px-5 py-4">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-brand-primary" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Total Buku
                </span>
              </div>
              <p className="text-2xl font-black tracking-tight text-brand-primary">
                {request.borrow_request_details?.length || 0}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {request.approval_status === "processing" && onDelete && (
                <DeleteButton
                  label={t("detail.editDialog.cancel")}
                  onClick={() => onDelete(request.id)}
                  disabled={isDeleting}
                />
              )}
            </div>
          </div>
        </AccordionItem>
      </Accordion>
    </ScaleIn>
  );
}
