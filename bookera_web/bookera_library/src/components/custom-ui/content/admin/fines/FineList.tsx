"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { Calendar, Receipt, User } from "lucide-react";
import FineStatusBadge from "@/components/custom-ui/badge/FineStatusBadge";
import DetailButton from "@/components/custom-ui/button/DetailButton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Fine } from "@/types/fine";
import EmptyState from "@/components/custom-ui/EmptyState";
import { format } from "date-fns";
import { StaggerContainer, ScaleIn } from "@/components/custom-ui/motion";
import { cn } from "@/lib/utils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

function groupFinesByBorrow(fines: Fine[]) {
  const map = new Map<number, { borrow: Fine["borrow"]; fines: Fine[] }>();
  for (const fine of fines) {
    const borrowId = fine.borrow_id;
    if (!map.has(borrowId)) {
      map.set(borrowId, { borrow: fine.borrow, fines: [] });
    }
    map.get(borrowId)!.fines.push(fine);
  }
  return Array.from(map.values());
}

function UserAvatar({ name, avatar }: { name: string; avatar?: string }) {
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
  return (
    <Avatar className="h-12 w-12 shrink-0 rounded-xl bg-brand-primary/10 text-brand-primary border-none">
      {avatar && <AvatarImage src={avatar} alt={name} />}
      <AvatarFallback className="font-semibold">
        {initials || <User className="h-6 w-6" />}
      </AvatarFallback>
    </Avatar>
  );
}

export default function FineList({
  data,
}: {
  data: Fine[];
}) {
  const t = useTranslations("fines");
  const tc = useTranslations("common");
  const tp = useTranslations("public");

  if (data.length === 0) {
    return (
      <EmptyState
        title={t("noFines")}
        description={t("noFinesDesc")}
        icon={<Receipt className="h-12 w-12" />}
      />
    );
  }

  const grouped = groupFinesByBorrow(data);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);

  return (
    <StaggerContainer className="space-y-1">
      <div className="w-full space-y-4">
        {grouped.map(({ borrow, fines }, index) => {
          const borrowId = borrow?.id;
          const borrowCode = borrow?.borrow_code;
          const borrowerName = borrow?.user?.profile?.full_name || "-";
          
          const totalAmount = fines.reduce((sum, f) => sum + Number(f.amount), 0);
          const hasUnpaid = fines.some((f) => f.status === "unpaid");
          const allPaid = fines.every((f) => f.status === "paid");

          return (
            <ScaleIn key={borrowId ?? index} delay={index * 0.06}>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem
                  value={`borrow-${borrowId}-${index}`}
                  className="rounded-2xl border bg-card shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md mb-4 px-0 border-b-0"
                >
                  <AccordionTrigger className="w-full text-left p-5 hover:no-underline [&>svg]:mr-0 [&>svg]:h-5 [&>svg]:w-5 cursor-pointer">
                    <div className="flex items-start gap-4 text-left">
                      <UserAvatar
                        name={borrowerName}
                        avatar={borrow?.user?.profile?.avatar}
                      />

                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-bold text-base text-foreground">
                            {borrowerName}
                          </p>
                          <div className="shrink-0 flex items-center gap-2">
                             <span className="text-xs text-muted-foreground font-medium px-2 py-0.5 bg-muted rounded-full">
                               #{borrowId}
                             </span>
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
                              {tp("borrowDateLabel") ?? "Dipinjam"}:{" "}
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
                              {tp("returnDateLabel") ?? "Jatuh tempo"}:{" "}
                              <span className={cn(
                                "font-medium",
                                hasUnpaid ? "text-destructive" : "text-foreground"
                              )}>
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
                      <div className="rounded-xl border border-border/60 overflow-hidden bg-muted/5">
                        <div className="grid grid-cols-[40px_1fr_140px_120px] bg-muted/40 px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground gap-2">
                          <span>No.</span>
                          <span>{tp("fineTypeLabel") ?? "Jenis Denda"}</span>
                          <span className="text-center">Tanggal Denda</span>
                          <span className="text-right">Harga Denda</span>
                        </div>

                        <div className="divide-y divide-border/40">
                          {fines.map((fine, idx) => (
                            <div key={fine.id} className="grid grid-cols-[40px_1fr_140px_120px] items-center px-4 py-3.5 gap-2 hover:bg-muted/20 transition-colors">
                              <span className="text-sm text-muted-foreground font-medium">
                                {idx + 1}
                              </span>
                              <div className="min-w-0 space-y-0.5">
                                <p className="text-sm font-medium text-foreground truncate">
                                  {fine.fine_type?.name || "-"}
                                </p>
                                {fine.fine_type?.description && (
                                  <p className="text-[11px] text-muted-foreground line-clamp-1">
                                    {fine.fine_type.description}
                                  </p>
                                )}
                                {fine.status !== (allPaid ? "paid" : "unpaid") && (
                                  <FineStatusBadge status={fine.status} className="mt-1 text-[10px] h-4 px-1.5" />
                                )}
                              </div>
                              <span className="text-sm text-center text-muted-foreground">
                                {format(new Date(fine.created_at), "dd MMM yyyy")}
                              </span>
                              <span className={cn(
                                "text-sm font-bold text-right",
                                fine.status === "unpaid" ? "text-destructive" : "text-brand-primary"
                              )}>
                                {formatCurrency(Number(fine.amount))}
                              </span>
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
                          Total {tp("fineAmountLabel") ?? "Denda"} #{borrowId}
                        </span>
                      </div>
                      <p className={cn(
                        "text-2xl font-black tracking-tight",
                        hasUnpaid ? "text-destructive dark:text-red-400" : "text-brand-primary"
                      )}>
                        {formatCurrency(totalAmount)}
                      </p>
                    </div>

                    <Link href={`/admin/borrows/${borrowCode ?? borrowId}`}>
                      <DetailButton label={tc("detail")} />
                    </Link>
                  </div>
                </AccordionItem>
              </Accordion>
            </ScaleIn>
          );
        })}
      </div>
    </StaggerContainer>
  );
}
