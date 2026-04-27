"use client";

import { Borrow } from "@/types/borrow";
import BorrowStatusBadge from "@/components/custom-ui/badge/BorrowStatusBadge";
import BorrowDetailStatusBadge from "@/components/custom-ui/badge/BorrowDetailStatusBadge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Calendar, User, Eye, Building2, Tag, Hash, MessageCircle, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import { useTranslations } from "next-intl";
import { useAuthStore } from "@/store/auth.store";
import { AddBookReviewDialog } from "./AddBookReviewDialog";

interface BorrowCardProps {
  borrow: Borrow;
}

export function BorrowCard({ borrow }: BorrowCardProps) {
  const t = useTranslations("public");
  const tCommon = useTranslations("common");
  const userSlug = useAuthStore((state) => state.user?.slug);
  
  const detailLink = `/my-borrows/${borrow.borrow_code}`;

  return (
    <Card className="group relative overflow-hidden hover:shadow-premium transition-all duration-300 border-2">
      <CardHeader className="pb-4 border-b border-border/50 bg-muted/30">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <CardTitle className="text-xl font-bold tracking-tight">
                {t("borrowHash")}{borrow.id}
              </CardTitle>
              <BorrowStatusBadge status={borrow.status} />
              <Badge variant="outline" className="text-[10px] font-mono border-dashed">
                {borrow.borrow_code}
              </Badge>
            </div>
            <CardDescription className="flex items-center gap-4 text-xs font-medium">
              <span className="flex items-center gap-1.5 text-foreground/80">
                <Calendar className="h-3.5 w-3.5 text-primary" />
                {format(new Date(borrow.borrow_date), "dd MMM yyyy")}
              </span>
              <span className="flex items-center gap-1.5 text-destructive bg-destructive/5 px-2.5 py-1 rounded-full border border-destructive/10">
                <Calendar className="h-3.5 w-3.5" />
                {t("returnLabel")}: {format(new Date(borrow.return_date), "dd MMM yyyy")}
              </span>
            </CardDescription>
          </div>
          <div className="flex gap-2 items-center self-end md:self-center">
            {borrow.borrow_code && (
              <Link href={detailLink}>
                <Button size="sm" variant="outline" className="h-8 gap-1">
                  <Eye className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">{tCommon("view")}</span>
                </Button>
              </Link>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground/70 flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-primary" />
              {t("borrowedBooks")} <span className="text-primary truncate max-w-37.5">
                ({borrow.borrow_details?.length || 0})
              </span>
            </h4>
          </div>
          
          <div className="grid gap-4">
            {borrow.borrow_details.map((detail) => {
              const book = detail.book_copy?.book;
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
                      alt={book?.title || tCommon("bookCover")}
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
                            <span className="truncate max-w-30">{authors}</span>
                          </div>
                          {book?.publishers && book.publishers.length > 0 && (
                            <div className="flex items-center gap-1">
                              <Building2 className="h-3 w-3" />
                              <span className="truncate max-w-30">{book.publishers[0].name}</span>
                            </div>
                          )}
                          {book?.publication_year && (
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>{book.publication_year}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        <BorrowDetailStatusBadge status={detail.status} className="text-[10px] h-6 px-3" />
                        <Badge variant="secondary" className="font-mono text-[11px] h-6 px-2.5 bg-muted/80 backdrop-blur border-border/50">
                          {detail.book_copy?.copy_code}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap items-center justify-between gap-4">
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

                      {borrow.status === "close" && book && (
                        <AddBookReviewDialog 
                          bookId={book.id} 
                          bookTitle={book.title}
                          trigger={
                            <Button size="sm" variant="brand" className="h-8 rounded-full text-[10px] uppercase font-bold tracking-wider px-4 shadow-sm group-hover/item:animate-pulse">
                              <MessageCircle className="h-3.5 w-3.5 mr-2" />
                              {t("addReview")}
                            </Button>
                          }
                        />
                      )}
                    </div>

                    {detail.note && (
                      <div className="mt-3 text-xs text-destructive/80 bg-destructive/5 border border-destructive/10 p-2.5 rounded-lg flex items-start gap-2">
                        <div className="p-1 rounded-full bg-destructive/10">
                          <Eye className="h-3 w-3" />
                        </div>
                        <div>
                          <span className="font-bold block text-[10px] uppercase tracking-wider mb-0.5">{t("noteLabel")}</span>
                          {detail.note}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
      <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-primary/5 rounded-full blur-3xl -z-10 group-hover:bg-primary/20 transition-colors" />
    </Card>
  );
}
