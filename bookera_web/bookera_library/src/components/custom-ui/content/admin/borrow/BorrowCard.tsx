"use client";

import { Borrow } from "@/types/borrow";
import BorrowStatusBadge from "@/components/custom-ui/badge/BorrowStatusBadge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import {
  BookOpen,
  Calendar,
  ChevronDown,
  Mail,
  Phone,
  User,
  Hash,
  ExternalLink,
} from "lucide-react";
import { format } from "date-fns";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

interface BorrowCardProps {
  borrow: Borrow;
}

const MAX_VISIBLE_BOOKS = 2;

export function BorrowCard({ borrow }: BorrowCardProps) {
  const t = useTranslations("borrow");
  const tCommon = useTranslations("common");
  const [showAll, setShowAll] = useState(false);

  const borrowDetails = borrow.borrow_details || [];
  const requestDetails = borrow.borrow_request?.borrow_request_details || [];
  const hasBorrowDetails = borrowDetails.length > 0;

  const books = hasBorrowDetails ? borrowDetails : requestDetails;
  const visibleBooks = showAll ? books : books.slice(0, MAX_VISIBLE_BOOKS);
  const hiddenCount = books.length - MAX_VISIBLE_BOOKS;

  const profile = borrow.user?.profile;
  const returnDate = new Date(borrow.return_date);
  const isOverdue = borrow.status === "open" && returnDate < new Date();

  return (
    <Card className="transition-all duration-200 overflow-hidden relative group border-border/40 p-0 shadow-sm hover:shadow-md">
      <CardContent className="p-0">
        <div className="flex flex-col md:flex-row md:items-stretch min-h-[160px]">
          {/* ── Col 1: INFO USER ── */}
          <div className="flex-1 p-5 space-y-4">
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground/60">
              {t("infoUser")}
            </p>
            <div className="flex items-start gap-5">
              {profile?.avatar ? (
                <div className="relative group/avatar shrink-0">
                  <Image
                    src={profile.avatar}
                    alt={profile.full_name ?? ""}
                    width={80}
                    height={80}
                    className="h-20 w-20 rounded-full object-cover ring-4 ring-primary/5 shadow-xl transition-transform duration-300 group-hover/avatar:scale-105"
                    unoptimized
                  />
                  <div className="absolute inset-0 rounded-full ring-1 ring-inset ring-black/5" />
                </div>
              ) : (
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-primary/5 ring-4 ring-primary/5 shadow-inner">
                  <User className="h-10 w-10 text-primary/30" />
                </div>
              )}

              <div className="min-w-0 space-y-2 flex-1">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-extrabold text-lg leading-tight text-foreground truncate group-hover:text-primary transition-colors">
                      {profile?.full_name || borrow.user?.email || "-"}
                    </p>
                  </div>

                  {profile?.identification_number && (
                    <div className="flex items-center gap-2 text-xs font-bold text-primary/80">
                      <div className="p-0.5 rounded bg-primary/10">
                        <Hash className="h-3 w-3 shrink-0" />
                      </div>
                      <span className="tracking-tight">
                        {t("nimLabel")} {profile.identification_number}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-1.5 pt-1">
                  {borrow.user?.email && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground/90 font-medium">
                      <Mail className="h-3.5 w-3.5 shrink-0 text-muted-foreground/40" />
                      <span className="truncate">{borrow.user.email}</span>
                    </div>
                  )}

                  {profile?.phone_number && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground/90 font-medium">
                      <Phone className="h-3.5 w-3.5 shrink-0 text-muted-foreground/40" />
                      <span>{profile.phone_number}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="hidden md:flex py-5">
            <Separator orientation="vertical" className="h-full bg-border/60" />
          </div>
          <Separator orientation="horizontal" className="md:hidden mx-5 w-auto" />

          {/* ── Col 2: BUKU YANG DIPINJAM ── */}
          <div className="flex-1 p-5 space-y-4">
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground/60">
              {t("booksBorrowed")}
            </p>

            {books.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-4 text-center">
                <BookOpen className="h-8 w-8 text-muted-foreground/20 mb-2" />
                <p className="text-xs text-muted-foreground italic font-medium">
                  {tCommon("noData")}
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  {visibleBooks.map((detail: any) => {
                    const book = hasBorrowDetails
                      ? detail.book_copy?.book
                      : detail.book;
                    return (
                      <div
                        key={detail.id}
                        className="flex items-start gap-3 group/book"
                      >
                        {book?.cover_image ? (
                          <div className="relative shrink-0 shadow-md group-hover/book:shadow-lg transition-all">
                            <Image
                              src={book.cover_image}
                              alt={book.title}
                              width={40}
                              height={56}
                              className="h-14 w-10 rounded-md object-cover transition-transform group-hover/book:scale-105"
                              unoptimized
                            />
                            <div className="absolute inset-0 rounded-md ring-1 ring-inset ring-black/5" />
                          </div>
                        ) : (
                          <div className="flex h-14 w-10 shrink-0 items-center justify-center rounded-md bg-muted/50 border border-border/50 shadow-sm">
                            <BookOpen className="h-5 w-5 text-muted-foreground/30" />
                          </div>
                        )}
                        <div className="min-w-0 space-y-0.5">
                          <p className="font-bold leading-tight text-sm text-foreground line-clamp-1 group-hover/book:text-primary transition-colors">
                            {book?.title || "-"}
                          </p>
                          <p className="text-[11px] font-bold text-muted-foreground/80 truncate uppercase tracking-tight">
                            {book?.author || "-"}
                          </p>
                          {book?.isbn && (
                            <p className="text-[10px] text-muted-foreground/50 font-mono tracking-tighter">
                              ISBN: {book.isbn}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {hiddenCount > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowAll((prev) => !prev)}
                    className="flex items-center gap-1.5 text-[11px] font-bold text-primary hover:text-primary/80 transition-colors mt-3 uppercase tracking-wider bg-primary/5 px-3 py-1.5 rounded-lg w-fit"
                  >
                    {showAll
                      ? t("showLess")
                      : t("viewAll", { count: books.length })}
                    <ChevronDown
                      className={cn(
                        "h-3.5 w-3.5 transition-transform duration-300",
                        showAll && "rotate-180"
                      )}
                    />
                  </button>
                )}
              </>
            )}
          </div>

          <div className="hidden md:flex py-5">
            <Separator orientation="vertical" className="h-full bg-border/60" />
          </div>
          <Separator orientation="horizontal" className="md:hidden mx-5 w-auto" />

          {/* ── Col 3: INFO PEMINJAMAN ── */}
          <div className="flex-1 p-5 space-y-4">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground/60">
                {t("borrowInfo")}
              </p>
              <div className="flex items-center gap-2 shrink-0">
                <BorrowStatusBadge
                  status={borrow.status}
                  className="h-6 px-2.5 text-[10px] font-black uppercase tracking-wider shadow-xs"
                />
                {borrow.borrow_code && (
                  <Link href={`/admin/borrows/${borrow.borrow_code}`}>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 px-3 text-[11px] font-bold border-border/60 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all gap-1.5"
                    >
                      <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                      {t("detail")}
                    </Button>
                  </Link>
                )}
              </div>
            </div>

            <div className="space-y-2.5 text-sm">
              <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-muted/20 border border-border/5">
                <div className="flex items-center gap-2 text-muted-foreground font-medium">
                  <div className="p-1 rounded-lg bg-background shadow-xs">
                    <Calendar className="h-3.5 w-3.5 shrink-0" />
                  </div>
                  <span className="text-[11px] uppercase tracking-wider">
                    {t("borrowDate")}
                  </span>
                </div>
                <span className="font-bold text-foreground tracking-tight">
                  {format(new Date(borrow.borrow_date), "dd MMM yyyy")}
                </span>
              </div>
              <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-muted/20 border border-border/5">
                <div className="flex items-center gap-2 text-muted-foreground font-medium">
                  <div className="p-1 rounded-lg bg-background shadow-xs">
                    <Calendar className="h-3.5 w-3.5 shrink-0" />
                  </div>
                  <span className="text-[11px] uppercase tracking-wider">
                    {t("returnDate")}
                  </span>
                </div>
                <span
                  className={cn(
                    "font-bold tracking-tight",
                    isOverdue ? "text-red-500 animate-pulse" : "text-foreground"
                  )}
                >
                  {format(returnDate, "dd MMM yyyy")}
                </span>
              </div>
            </div>

            <div className="mt-1 flex items-center gap-4 rounded-2xl bg-brand-primary/30 px-5 py-4 border-2 border-brand-primary shadow-lg shadow-brand-primary/10">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm shadow-inner ring-1 ring-white/30">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <div className="space-y-0.5">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60 leading-none">
                  {t("totalBooks")}
                </p>
                <div className="text-2xl font-black leading-none text-white flex items-baseline gap-1.5">
                  <span className="text-20 font-extrabold text-white uppercase tracking-wider">
                    {t("bookUnit", { count: books.length })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
