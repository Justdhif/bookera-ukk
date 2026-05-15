"use client";

import { LostBook } from "@/types/lost-book";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { AlertCircle, BookOpen, Building2, Calendar, Hash, Mail, Phone, Tag, User } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { useTranslations } from "next-intl";
import { ScaleIn } from "@/components/custom-ui/motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import DetailButton from "@/components/custom-ui/button/DetailButton";
import BorrowStatusBadge from "@/components/custom-ui/badge/BorrowStatusBadge";

interface LostBookCardProps {
  borrow: LostBook["borrow"];
  items: LostBook[];
  index?: number;
}

type LostEntry = {
  key: string;
  lost_date?: string;
  notes?: string;
  bookTitle?: string;
  authors: string;
  publishers: string[];
  categories: Array<{ id: number; name: string }>;
  isbn?: string;
  publicationYear?: number;
  coverImage?: string;
  copyCode?: string;
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

export function LostBookCard({ borrow, items, index = 0 }: LostBookCardProps) {
  const t = useTranslations("lost-books");
  const tCommon = useTranslations("common");

  const borrowId = items[0]?.borrow_id;
  const detailLink = borrow?.borrow_code
    ? `/admin/borrows/${borrow.borrow_code}`
    : borrowId
      ? `/admin/borrows/${borrowId}`
      : null;

  const lostEntries: LostEntry[] = items.map((item) => {
    const book = item.book_copy?.book;

    return {
      key: `${item.id}`,
      lost_date: item.lost_date,
      notes: item.notes,
      bookTitle: book?.title,
      authors:
        book?.authors?.map((author: any) => author.name).join(", ") ||
        book?.author ||
        tCommon("noData"),
      publishers: book?.publishers?.map((publisher: any) => publisher.name) || [],
      categories: book?.categories ?? [],
      isbn: book?.isbn,
      publicationYear: book?.publication_year,
      coverImage: book?.cover_image,
      copyCode: item.book_copy?.copy_code,
    };
  });

  const profile = borrow?.user?.profile;
  const borrowerName = profile?.full_name || borrow?.user?.email || "-";

  return (
    <ScaleIn delay={index * 0.06}>
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem
          value={`lost-${borrowId}-${index}`}
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
                      #{borrow?.borrow_code || borrowId}
                    </span>
                    {borrow?.status && (
                        <BorrowStatusBadge
                            status={borrow.status}
                            className="h-5 px-2 text-[9px] font-black uppercase tracking-wider"
                        />
                    )}
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row sm:items-center gap-x-4 gap-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5 shrink-0" />
                    <span>
                      {t("borrowDateLabel")}:{" "}
                      <span className="text-foreground font-medium">
                        {borrow?.borrow_date ? format(new Date(borrow.borrow_date), "dd MMM yyyy") : "-"}
                      </span>
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5 shrink-0" />
                    <span>
                      {t("dueDateLabel")}:{" "}
                      <span className="text-foreground font-medium">
                        {borrow?.return_date ? format(new Date(borrow.return_date), "dd MMM yyyy") : "-"}
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
                 {borrow?.user?.email && (
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

              {/* Section 2: Lost Books */}
              <div className="space-y-3">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 px-1">
                  {t("lostBooksSection")}
                </h4>
                <div className="rounded-xl border border-border/60 overflow-hidden divide-y divide-border/40">
                  {lostEntries.map((entry) => (
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
                              className="h-4 px-1.5 text-[8px] font-black uppercase tracking-tighter bg-destructive/10 text-destructive border-destructive/20"
                           >
                              {t("lost") || "LOST"}
                           </Badge>
                           <span className="text-[10px] text-muted-foreground font-medium">
                              {entry.lost_date ? format(new Date(entry.lost_date), "dd MMM yyyy") : "-"}
                           </span>
                        </div>
                        {entry.notes && (
                            <p className="mt-2 border-l-2 border-destructive/30 pl-2 text-xs italic text-muted-foreground">
                                {entry.notes}
                            </p>
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
                <AlertCircle className="h-4 w-4 text-destructive" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  {t("lostBooksCount")}
                </span>
              </div>
              <p className="text-2xl font-black tracking-tight text-destructive">
                {t("bookUnit", { count: lostEntries.length })}
              </p>
            </div>

            {detailLink && (
               <Link href={detailLink}>
                  <DetailButton />
               </Link>
            )}
          </div>
        </AccordionItem>
      </Accordion>
    </ScaleIn>
  );
}
