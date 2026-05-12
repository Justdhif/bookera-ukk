"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { BookOpen, Calendar, Receipt, CreditCard, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { ScaleIn } from "@/components/custom-ui/motion";
import FineStatusBadge from "@/components/custom-ui/badge/FineStatusBadge";
import { cn } from "@/lib/utils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { FineBorrowGroup } from "@/types/fine";
import DetailButton from "@/components/custom-ui/button/DetailButton";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { fineService } from "@/services/fine.service";
import { toast } from "sonner";

interface MyFineCardProps {
  group: FineBorrowGroup;
  index: number;
  onRefresh?: () => void;
}

export default function MyFineCard({ group, index, onRefresh }: MyFineCardProps) {
  const router = useRouter();
  const t = useTranslations("public");
  const borrow = group.borrow;
  const fines = group.fines || [];
  const borrowId = group.borrowId || (group as any).borrow_id;
  const [payingFineId, setPayingFineId] = useState<number | null>(null);

  const handleStartPayment = (fineId: number) => {
    router.push(`/payment?type=fine&id=${fineId}`);
  };

  const handlePayment = async (fineId: number) => {
    handleStartPayment(fineId);
  };

  const totalAmount = fines.reduce(
    (sum, f) => sum + Number(f.amount),
    0
  );

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);

  const hasUnpaid = fines.some((f) => f.status === "unpaid");
  const allPaid = fines.every((f) => f.status === "paid");

  return (
    <ScaleIn delay={index * 0.06}>
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem
          value={`borrow-${borrowId}-${index}`}
          className="rounded-2xl border bg-card shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md mb-4 px-0 border-b-0"
        >
          <AccordionTrigger className="w-full text-left p-5 hover:no-underline [&>svg]:mr-0 [&>svg]:h-5 [&>svg]:w-5 cursor-pointer">
            <div className="flex items-start gap-4 text-left">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary">
                <BookOpen className="h-6 w-6" />
              </div>

              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-bold text-base text-foreground">
                    {t("borrowHash")}
                    {borrow?.borrow_code || borrowId}
                  </p>
                  <div className="shrink-0">
                    {allPaid ? (
                      <FineStatusBadge status="paid" />
                    ) : hasUnpaid ? (
                      <FineStatusBadge status="unpaid" />
                    ) : (
                      <FineStatusBadge status="waived" />
                    )}
                  </div>
                </div>
                {borrow?.borrow_date && (
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5 shrink-0" />
                    <span>
                      {t("borrowDateLabel") ?? "Dipinjam"}:{" "}
                      <span className="text-foreground font-medium">
                        {format(new Date(borrow.borrow_date), "dd MMM yyyy")}
                      </span>
                    </span>
                  </div>
                )}
                {borrow?.return_date && (
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5 shrink-0" />
                    <span>
                      {t("returnDateLabel") ?? "Jatuh tempo"}:{" "}
                      <span
                        className={cn(
                          "font-medium",
                          hasUnpaid ? "text-destructive" : "text-foreground"
                        )}
                      >
                        {format(new Date(borrow.return_date), "dd MMM yyyy")}
                      </span>
                    </span>
                  </div>
                )}
              </div>
            </div>
          </AccordionTrigger>

          <AccordionContent className="p-0">
            <div className="mx-5 h-px bg-border/60" />
            <div className="p-5">
              <div className="rounded-xl border border-border/60 overflow-hidden">
                <div className="grid grid-cols-[40px_1fr_120px_100px_100px] bg-muted/40 px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground gap-2">
                  <span>No.</span>
                  <span>{t("fineTypeLabel") ?? "Jenis Denda"}</span>
                  <span className="text-center">Tanggal Denda</span>
                  <span className="text-right">Harga</span>
                  <span className="text-right">Aksi</span>
                </div>

                <div className="divide-y divide-border/40">
                  {fines.map((fine, idx) => (
                    <div
                      key={fine.id}
                      className="grid grid-cols-[40px_1fr_120px_100px_100px] items-center px-4 py-3.5 gap-2 hover:bg-muted/20 transition-colors"
                    >
                      <span className="text-sm text-muted-foreground font-medium">
                        {idx + 1}
                      </span>

                      <div className="min-w-0 space-y-0.5">
                        <p className="text-sm font-medium text-foreground truncate">
                          {fine.fine_type?.name ?? "-"}
                        </p>
                        {fine.fine_type?.description && (
                          <p className="text-[11px] text-muted-foreground line-clamp-1">
                            {fine.fine_type.description}
                          </p>
                        )}
                        {fine.status !== "unpaid" && (
                          <FineStatusBadge
                            status={fine.status}
                            className="mt-1 text-[10px] h-4 px-1.5"
                          />
                        )}
                      </div>

                      <span className="text-sm text-center text-muted-foreground">
                        {format(new Date(fine.created_at), "dd MMM yyyy")}
                      </span>

                      <div className="flex flex-col items-end">
                        <span
                          className={cn(
                            "text-sm font-bold",
                            fine.status === "unpaid"
                              ? "text-destructive dark:text-red-400"
                              : fine.status === "paid"
                              ? "text-brand-primary"
                              : "text-muted-foreground line-through"
                          )}
                        >
                          {formatCurrency(Number(fine.amount))}
                        </span>
                        {fine.original_amount && Number(fine.original_amount) > Number(fine.amount) && (
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[10px] text-muted-foreground line-through decoration-rose-500 decoration-2">
                              {formatCurrency(Number(fine.original_amount))}
                            </span>
                            <span className="text-[9px] font-black text-emerald-600 bg-emerald-500/10 px-1 rounded uppercase tracking-tighter">
                              -{fine.discount_percentage}%
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex justify-end">
                        {fine.status === "unpaid" && (
                          <Button
                            size="sm"
                            variant="brand"
                            className="h-7 px-2 text-[10px] font-bold uppercase"
                            onClick={() => handlePayment(fine.id)}
                            disabled={payingFineId === fine.id}
                          >
                            {payingFineId === fine.id ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <>
                                <CreditCard className="h-3 w-3 mr-1" />
                                Pay
                              </>
                            )}
                          </Button>
                        )}
                        {fine.status === "paid" && (
                          <Button
                             size="sm"
                             variant="outline"
                             className="h-7 px-2 text-[10px] font-bold uppercase border-brand-primary/20 text-brand-primary"
                             onClick={() => router.push(`/payment/success?type=fine&id=${fine.id}`)}
                          >
                             Invoice
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </AccordionContent>

          <div className="mx-5 h-px bg-border/60" />

          <div className="flex items-center justify-between gap-4 px-5 py-4">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Receipt className="h-4 w-4 text-brand-primary" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Total {t("fineAmountLabel")}
                </span>
              </div>
              <p
                className={cn(
                  "text-2xl font-black tracking-tight",
                  hasUnpaid
                    ? "text-destructive dark:text-red-400"
                    : "text-brand-primary"
                )}
              >
                {formatCurrency(totalAmount)}
              </p>
            </div>

            {borrow?.borrow_code && (
              <Link href={`/borrow/${borrow.borrow_code}`}>
                <DetailButton label={t("detailsBtn") || "Details"} />
              </Link>
            )}
          </div>
        </AccordionItem>
      </Accordion>
    </ScaleIn>
  );
}
