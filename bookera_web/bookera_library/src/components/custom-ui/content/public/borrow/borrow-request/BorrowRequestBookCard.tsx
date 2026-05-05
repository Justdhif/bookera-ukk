"use client";

import { Book } from "@/types/book";
import { useTranslations } from "next-intl";
import Image from "next/image";
import {
  BookOpen,
  Building2,
  Star,
  AlertCircle,
  Minus,
  Plus,
  Trash2,
  ShoppingCart,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { StaggerContainer, FadeUp } from "@/components/custom-ui/motion";
import DataLoading from "@/components/custom-ui/DataLoading";
import EmptyState from "@/components/custom-ui/EmptyState";
import { cn } from "@/lib/utils";

interface BorrowRequestBookCardProps {
  book: Book;
  quantity: number;
  onQuantityChange: (bookId: number, delta: number, max: number) => void;
  onRemove: (bookId: number) => void;
}

export function BorrowRequestBookCard({
  book,
  quantity,
  onQuantityChange,
  onRemove,
}: BorrowRequestBookCardProps) {
  const t = useTranslations("public");
  const tCommon = useTranslations("common");
  const available = book.available_copies ?? 0;

  return (
    <div className="group/item flex flex-col sm:flex-row items-center sm:items-start gap-6 p-5 hover:bg-muted/30 transition-all duration-300 relative rounded-2xl border-b last:border-b-0 border-border/50">
      <div className="relative w-16 h-24 sm:w-20 sm:h-28 shrink-0 shadow-md group-hover/item:scale-105 transition-transform duration-300 z-10 rounded-lg overflow-hidden bg-muted border border-border/50">
        <Image
          src={book.cover_image ?? "/placeholder.png"}
          alt={book.title}
          fill
          sizes="80px"
          className="object-cover"
          unoptimized
        />
      </div>

      <div className="flex-1 min-w-0 space-y-2 z-10 w-full">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="font-bold text-base sm:text-lg tracking-tight truncate group-hover/item:text-primary transition-colors">
              {book.title}
            </p>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-0.5">
              {book.author && (
                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <BookOpen className="h-3 w-3 shrink-0" />
                  <span className="truncate max-w-40">{book.author}</span>
                </div>
              )}
              {book.publisher && (
                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <Building2 className="h-3 w-3 shrink-0" />
                  <span className="truncate max-w-40">{book.publisher}</span>
                </div>
              )}
            </div>
          </div>

          <div className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[11px] font-bold text-amber-600 shrink-0 border border-amber-500/20">
            <Star className="h-3 w-3 fill-current" />
            {book.average_rating
              ? Number(book.average_rating).toFixed(1)
              : "0.0"}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <Badge
            variant="outline"
            className={cn(
              "h-6 px-2.5 text-[9px] font-bold uppercase tracking-wider transition-all duration-300 border-none",
              available > 0
                ? "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20"
                : "bg-rose-500/10 text-rose-500 hover:bg-rose-500/20",
            )}
          >
            {available > 0 ? (
              <div className="flex items-center gap-1.5">
                <span className="relative flex h-1 w-1">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-1 w-1 bg-emerald-500" />
                </span>
                {t("stockAvailable", { count: available })}
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <AlertCircle className="h-3 w-3 shrink-0" />
                {t("outOfStock")}
              </div>
            )}
          </Badge>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 rounded-lg border border-border bg-background p-0.5 shadow-xs">
              <button
                type="button"
                onClick={() => onQuantityChange(book.id, -1, available)}
                disabled={quantity <= 1}
                className="flex h-6 w-6 items-center justify-center rounded-md transition-colors hover:bg-muted disabled:opacity-30"
              >
                <Minus className="h-3 w-3" />
              </button>
              <span className="w-5 text-center text-[11px] font-bold text-foreground">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => onQuantityChange(book.id, 1, available)}
                disabled={quantity >= available}
                className="flex h-6 w-6 items-center justify-center rounded-md transition-colors hover:bg-muted disabled:opacity-30"
              >
                <Plus className="h-3 w-3" />
              </button>
            </div>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => onRemove(book.id)}
              className="h-7 w-7 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface BorrowRequestBookCardListProps {
  selectedBooks: Book[];
  quantities: Record<number, number>;
  loadingBooks: boolean;
  totalSelectedBooks: number;
  onQuantityChange: (bookId: number, delta: number, max: number) => void;
  onRemove: (bookId: number) => void;
  onAddClick: () => void;
}

export function BorrowRequestBookCardList({
  selectedBooks,
  quantities,
  loadingBooks,
  totalSelectedBooks,
  onQuantityChange,
  onRemove,
  onAddClick,
}: BorrowRequestBookCardListProps) {
  const t = useTranslations("public");
  const tCommon = useTranslations("common");

  return (
    <FadeUp>
      <Card className="border-2 border-border bg-linear-to-br from-background via-background to-primary/5">
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <div className="space-y-1">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-primary" />
                {tCommon("booksSelected")}
              </CardTitle>
              <CardDescription>{t("borrowRequestDetailsDesc")}</CardDescription>
            </div>

            <div className="flex items-center gap-2">
              <div className="inline-flex min-w-10 items-center justify-center rounded-full bg-primary/10 px-3 py-1 text-sm font-bold text-primary">
                {totalSelectedBooks}
              </div>
              <Button
                variant="brand"
                size="sm"
                onClick={onAddClick}
              >
                <Plus className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{t("addBook")}</span>
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {loadingBooks && selectedBooks.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <DataLoading variant="inline" size="lg" />
            </div>
          ) : selectedBooks.length > 0 ? (
            <StaggerContainer className="divide-y divide-border/50">
              {selectedBooks.map((book) => (
                <FadeUp key={book.id}>
                  <BorrowRequestBookCard
                    book={book}
                    quantity={quantities[book.id] || 1}
                    onQuantityChange={onQuantityChange}
                    onRemove={onRemove}
                  />
                </FadeUp>
              ))}
            </StaggerContainer>
          ) : (
            <div className="py-10">
              <EmptyState
                icon={
                  <BookOpen className="h-10 w-10 text-muted-foreground/30" />
                }
                title={tCommon("noBooksSelected")}
                description={t("detail.selectOne")}
                variant="compact"
              />
              <div className="mt-4 flex justify-center">
                <Button
                  variant="brand"
                  size="sm"
                  onClick={onAddClick}
                  className="rounded-full px-6"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {t("selectBooks")}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </FadeUp>
  );
}
