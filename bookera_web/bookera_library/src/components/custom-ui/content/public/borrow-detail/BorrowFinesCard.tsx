"use client";

import { Fine } from "@/types/fine";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreditCard, AlertCircle, Loader2, Banknote, QrCode, ReceiptText, ExternalLink } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { StaggerContainer, SlideIn } from "@/components/custom-ui/motion";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface BorrowFinesCardProps {
  fines: Fine[];
}

export function BorrowFinesCard({ fines }: BorrowFinesCardProps) {
  const router = useRouter();
  const t = useTranslations("borrow");
  const tPublic = useTranslations("public");
  const [loadingId, setLoadingId] = useState<number | null>(null);

  const handlePayment = (fineId: number) => {
    setLoadingId(fineId);
    router.push(`/payment?type=fine&id=${fineId}`);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const unpaidFines = fines.filter((fine) => fine.status === "unpaid");
  const paidFines = fines.filter((fine) => fine.status === "paid");

  if (fines.length === 0) return null;

  return (
    <Card className="border-amber-500/20 bg-amber-500/5 overflow-hidden relative">
      <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
        <CreditCard className="h-24 w-24 text-amber-500" />
      </div>
      <CardHeader className="pb-4 border-b border-amber-500/10 relative">
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-black uppercase tracking-wider text-sm">
              <CreditCard className="h-4 w-4" />
              {t("finesTitle")}
            </CardTitle>
            <CardDescription className="font-medium">
              {t("finesDesc")}
            </CardDescription>
          </div>

          {paidFines.length > 0 && (
            <Link href={`/payment/success?type=fine&id=${paidFines[0].id}`}>
              <Button
                size="sm"
                variant="outline"
                className="h-10 px-6 font-black gap-2 border-brand-primary/20 text-brand-primary hover:bg-brand-primary/5 transition-all shrink-0 shadow-sm"
              >
                <ReceiptText className="h-4 w-4" />
                Invoice
              </Button>
            </Link>
          )}
        </div>
      </CardHeader>
      <CardContent className="relative pt-6">
        <StaggerContainer className="grid gap-4">
          {fines.map((fine) => (
            <SlideIn
              key={fine.id}
              direction="up"
              distance={20}
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 bg-background/50 backdrop-blur-sm rounded-2xl border border-border/50 shadow-sm group hover:border-amber-500/30 transition-all duration-300 gap-4"
            >
              <div className="flex items-start sm:items-center gap-5 flex-1 min-w-0">
                <div className="p-3.5 bg-amber-500/10 dark:bg-amber-500/20 rounded-2xl text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform shrink-0">
                  <AlertCircle className="h-6 w-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-1">
                    {fine.fine_type?.name || t("fine")}
                  </p>
                  <div className="flex flex-col gap-1">
                    <div className="flex flex-wrap items-baseline gap-2.5">
                      <p className="text-2xl font-black tracking-tight text-foreground">
                        {formatCurrency(Number(fine.amount))}
                      </p>
                      {fine.original_amount && Number(fine.original_amount) > Number(fine.amount) && (
                        <p className="text-xs font-bold text-muted-foreground line-through decoration-rose-500 decoration-2">
                          {formatCurrency(Number(fine.original_amount))}
                        </p>
                      )}
                    </div>
                    {fine.original_amount && Number(fine.original_amount) > Number(fine.amount) && (
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <Badge 
                          variant="outline" 
                          className="h-5 px-2 text-[9px] font-black uppercase bg-emerald-500/10 text-emerald-600 border-emerald-500/20 tracking-wide flex items-center gap-1"
                        >
                          <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                          Member Discount -{fine.discount_percentage}%
                        </Badge>
                        <span className="text-[10px] font-bold text-emerald-600/80 italic">
                          (Saved {formatCurrency(Number(fine.original_amount) - Number(fine.amount))})
                        </span>
                      </div>
                    )}
                  </div>
                  {fine.fine_type?.description && (
                    <p className="text-[11px] font-medium text-muted-foreground/80 mt-1.5 max-w-md leading-relaxed line-clamp-2">
                      {fine.fine_type.description}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-4 w-full sm:w-auto border-t sm:border-t-0 pt-4 sm:pt-0">
                <div className="flex flex-col items-end gap-2">
                  <Badge
                    className={cn(
                      "px-3 py-1 font-bold",
                      fine.status === "paid"
                        ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                        : fine.status === "waived"
                          ? "bg-sky-500/10 text-sky-600 border-sky-500/20"
                          : "bg-rose-500/10 text-rose-600 border-rose-500/20 animate-pulse"
                    )}
                    variant="outline"
                  >
                    {tPublic(`fineStatus.${fine.status}`)}
                  </Badge>
                  {fine.payment_method && (
                    <span className="text-[10px] font-bold uppercase text-muted-foreground flex items-center gap-1">
                      {fine.payment_method === 'cash' ? <Banknote className="h-2.5 w-2.5" /> : <QrCode className="h-2.5 w-2.5" />}
                      Via {fine.payment_method}
                    </span>
                  )}
                </div>

                {fine.status === "unpaid" && (
                  <Button
                    size="sm"
                    className="h-9 px-4 font-black uppercase text-[10px] tracking-widest gap-2 bg-brand-primary hover:bg-brand-primary/90 shadow-lg shadow-brand-primary/20"
                    onClick={() => handlePayment(fine.id)}
                    disabled={loadingId === fine.id}
                  >
                    {loadingId === fine.id ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <>
                        <CreditCard className="h-3.5 w-3.5" />
                        Pay Now
                      </>
                    )}
                  </Button>
                )}
              </div>
            </SlideIn>
          ))}
        </StaggerContainer>
      </CardContent>
    </Card>
  );
}
