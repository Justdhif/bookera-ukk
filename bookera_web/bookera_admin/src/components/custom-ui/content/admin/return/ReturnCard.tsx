"use client";

import { Borrow } from "@/types/borrow";
import BorrowStatusBadge from "@/components/custom-ui/badge/BorrowStatusBadge";
import FineStatusBadge from "@/components/custom-ui/badge/FineStatusBadge";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { BookOpen, Building2, Calendar, DollarSign, Hash, Mail, Phone, Receipt, Tag, User } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { useTranslations } from "next-intl";
import { ScaleIn, StaggerContainer, SlideIn } from "@/components/custom-ui/motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import DetailButton from "@/components/custom-ui/button/DetailButton";
import { cn } from "@/lib/utils";

interface ReturnCardProps {
  borrow: Borrow;
  index?: number;
}

type ReturnEntry = {
  key: string;
  return_date: string;
  bookTitle?: string;
  authors: string;
  publishers: string[];
  categories: Array<{ id: number; name: string }>;
  isbn?: string;
  publicationYear?: number;
  coverImage?: string;
  copyCode?: string;
  condition?: "good" | "damaged";
};

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

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

export function ReturnCard({ borrow, index = 0 }: ReturnCardProps) {
  const t = useTranslations("return");
  const tCommon = useTranslations("common");
  const tp = useTranslations("public");

  const returnRecords = [...(borrow.book_returns ?? [])].sort(
    (left, right) =>
      new Date(right.return_date).getTime() - new Date(left.return_date).getTime(),
  );
  
  const returnEntries: ReturnEntry[] = returnRecords.map((bookReturn) => {
    const book = bookReturn.book_copy?.book;
    return {
      key: `${bookReturn.id}`,
      return_date: bookReturn.return_date,
      bookTitle: book?.title,
      authors:
        book?.authors?.map((author) => author.name).join(", ") ||
        book?.author ||
        tCommon("noData"),
      publishers: book?.publishers?.map((publisher) => publisher.name) || [],
      categories: book?.categories ?? [],
      isbn: book?.isbn,
      publicationYear: book?.publication_year,
      coverImage: book?.cover_image,
      copyCode: bookReturn.book_copy?.copy_code,
      condition: bookReturn.condition,
    };
  });

  const fines = borrow.fines ?? [];
  const totalFineAmount = fines.reduce((sum, fine) => sum + Number(fine.amount), 0);
  const outstandingFineAmount = fines
    .filter((fine) => fine.status === "unpaid")
    .reduce((sum, fine) => sum + Number(fine.amount), 0);

  const profile = borrow.user?.profile;
  const borrowerName = profile?.full_name || borrow.user?.email || "-";
  
  const detailLink = borrow.borrow_code
    ? `/admin/borrows/${borrow.borrow_code}`
    : borrow.id
      ? `/admin/borrows/${borrow.id}`
      : null;

  return (
    <ScaleIn delay={index * 0.06}>
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem
          value={`return-${borrow.id}-${index}`}
          className="rounded-2xl border bg-card shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md mb-4 px-0 border-b-0"
        >
          <AccordionTrigger className="w-full text-left p-5 hover:no-underline [&>svg]:mr-0 [&>svg]:h-5 [&>svg]:w-5 cursor-pointer">
            <div className="flex items-start gap-4 text-left">
              <UserAvatar
                name={borrowerName}
                avatar={profile?.avatar}
              />

              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-bold text-base text-foreground truncate">
                    {borrowerName}
                  </p>
                  <div className="shrink-0 flex items-center gap-2">
                    <span className="text-xs text-muted-foreground font-medium px-2 py-0.5 bg-muted rounded-full">
                      #{borrow.borrow_code}
                    </span>
                    <BorrowStatusBadge
                      status={borrow.status}
                      className="h-5 px-2 text-[9px] font-black uppercase tracking-wider"
                    />
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row sm:items-center gap-x-4 gap-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5 shrink-0" />
                    <span>
                      {t("borrowDateLabel")}:{" "}
                      <span className="text-foreground font-medium">
                        {borrow.borrow_date ? format(new Date(borrow.borrow_date), "dd MMM yyyy") : "-"}
                      </span>
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5 shrink-0" />
                    <span>
                      {t("dueDateLabel")}:{" "}
                      <span className="text-foreground font-medium">
                        {borrow.return_date ? format(new Date(borrow.return_date), "dd MMM yyyy") : "-"}
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </AccordionTrigger>

          <AccordionContent className="p-0">
            <div className="mx-5 h-px bg-border/60" />
            <div className="p-5 space-y-6">
              {/* Section 1: User Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                 {borrow.user?.email && (
                    <div className="p-3 rounded-xl bg-muted/20 border border-border/50 flex flex-col gap-0.5">
                       <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Email</span>
                       <div className="flex items-center gap-2 text-sm font-medium">
                          <Mail className="h-3.5 w-3.5 text-brand-primary" />
                          <span className="truncate">{borrow.user.email}</span>
                       </div>
                    </div>
                 )}
                 {profile?.phone_number && (
                    <div className="p-3 rounded-xl bg-muted/20 border border-border/50 flex flex-col gap-0.5">
                       <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Phone</span>
                       <div className="flex items-center gap-2 text-sm font-medium">
                          <Phone className="h-3.5 w-3.5 text-brand-primary" />
                          <span>{profile.phone_number}</span>
                       </div>
                    </div>
                 )}
                 {profile?.identification_number && (
                    <div className="p-3 rounded-xl bg-muted/20 border border-border/50 flex flex-col gap-0.5">
                       <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">ID Number</span>
                       <div className="flex items-center gap-2 text-sm font-medium">
                          <Hash className="h-3.5 w-3.5 text-brand-primary" />
                          <span>{profile.identification_number}</span>
                       </div>
                    </div>
                 )}
              </div>

              {/* Section 2: Returned Books */}
              <div className="space-y-3">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 px-1">
                  {t("returnedBooks")}
                </h4>
                <div className="rounded-xl border border-border/60 overflow-hidden divide-y divide-border/40">
                  {returnEntries.map((entry) => (
                    <div
                      key={entry.key}
                      className="flex items-center gap-4 p-3 hover:bg-muted/20 transition-colors"
                    >
                      {entry.coverImage ? (
                        <div className="relative shrink-0 shadow-sm">
                          <Image
                            src={entry.coverImage}
                            alt={entry.bookTitle || "Book"}
                            width={40}
                            height={56}
                            className="h-14 w-10 rounded-md object-cover"
                            unoptimized
                          />
                        </div>
                      ) : (
                        <div className="flex h-14 w-10 shrink-0 items-center justify-center rounded-md bg-muted/50 border border-border/50">
                          <BookOpen className="h-5 w-5 text-muted-foreground/30" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                           <p className="font-bold text-sm text-foreground line-clamp-1">
                              {entry.bookTitle || "-"}
                           </p>
                           <Badge
                              variant="outline"
                              className="h-5 px-1.5 text-[9px] font-mono border-dashed"
                           >
                              {entry.copyCode}
                           </Badge>
                        </div>
                        <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-tight truncate">
                          {entry.authors}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                           <Badge
                              className={cn(
                                "h-4 px-1.5 text-[8px] font-black uppercase tracking-tighter",
                                entry.condition === "damaged"
                                  ? "bg-destructive/10 text-destructive border-destructive/20"
                                  : "bg-brand-primary/10 text-brand-primary border-brand-primary/20"
                              )}
                           >
                              {entry.condition || "-"}
                           </Badge>
                           <span className="text-[10px] text-muted-foreground font-medium">
                              {format(new Date(entry.return_date), "dd MMM yyyy")}
                           </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 3: Fines */}
              {fines.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 px-1">
                    {t("finesTitle")}
                  </h4>
                  <div className="grid gap-3">
                    {fines.map((fine) => (
                      <div
                        key={fine.id}
                        className="flex items-center justify-between p-3 rounded-xl border border-border/50 bg-muted/10"
                      >
                        <div className="space-y-0.5">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                            {fine.fine_type?.name || t("fine")}
                          </p>
                          <p className="text-sm font-bold text-foreground">
                            {formatCurrency(Number(fine.amount))}
                          </p>
                        </div>
                        <FineStatusBadge status={fine.status} className="h-5 text-[9px]" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </AccordionContent>

          <div className="mx-5 h-px bg-border/60" />

          <div className="flex items-center justify-between gap-4 px-5 py-4">
            <div className="flex items-center gap-8">
               <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                     <BookOpen className="h-4 w-4 text-brand-primary" />
                     <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                        {t("totalBooks")}
                     </span>
                  </div>
                  <p className="text-2xl font-black tracking-tight text-brand-primary">
                     {t("bookUnit", { count: returnEntries.length })}
                  </p>
               </div>
               
               {totalFineAmount > 0 && (
                  <div className="space-y-0.5">
                     <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-amber-500" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                           {tCommon("totalFine") || "Total Fine"}
                        </span>
                     </div>
                     <p className={cn(
                        "text-2xl font-black tracking-tight",
                        outstandingFineAmount > 0 ? "text-destructive" : "text-amber-500"
                     )}>
                        {formatCurrency(totalFineAmount)}
                     </p>
                  </div>
               )}
            </div>

            {detailLink && (
               <Link href={detailLink}>
                  <DetailButton label={t("viewBtn")} />
               </Link>
            )}
          </div>
        </AccordionItem>
      </Accordion>
    </ScaleIn>
  );
}
