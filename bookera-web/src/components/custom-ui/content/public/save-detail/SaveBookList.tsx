"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Book } from "@/types/book";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { BookMarked, LayoutGrid, List, Eye, Trash } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useTranslations } from "next-intl";

interface SaveBookListProps {
  books: Book[];
  selectedBooks: number[];
  onToggleBookSelection: (bookId: number) => void;
  onRemoveBook: (bookId: number) => void;
  borrowButton?: React.ReactNode;
}

type ViewMode = "grid" | "list";

export default function SaveBookList({
  books,
  selectedBooks,
  onToggleBookSelection,
  onRemoveBook,
  borrowButton,
}: SaveBookListProps) {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const t = useTranslations("collections.detail");

  if (!books || books.length === 0) {
    return (
      <Card className="p-8 sm:p-12">
        <div className="text-center text-muted-foreground">
          <BookMarked className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-4 opacity-30" />
          <p className="text-sm sm:text-base">{t("noBooksYet")}</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        {borrowButton}
        <ToggleGroup
          type="single"
          value={viewMode}
          onValueChange={(value) => value && setViewMode(value as ViewMode)}
        >
          <ToggleGroupItem value="grid" aria-label="Grid view">
            <LayoutGrid className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="list" aria-label="List view">
            <List className="h-4 w-4" />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {viewMode === "grid" && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {books.map((book) => (
            <div
              key={book.id}
              className="border rounded-lg p-3 space-y-3 relative group cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => onToggleBookSelection(book.id)}
            >
              <div
                className="absolute top-2 left-2 z-10"
                onClick={(e) => e.stopPropagation()}
              >
                <Checkbox
                  id={`book-${book.id}`}
                  checked={selectedBooks.includes(book.id)}
                  onCheckedChange={() => onToggleBookSelection(book.id)}
                  className="bg-white dark:bg-gray-800 shadow-md"
                />
              </div>

              <div className="relative">
                <img
                  src={book.cover_image_url || "/placeholder-book.png"}
                  alt={book.title}
                  className="aspect-3/4 object-cover rounded w-full"
                />
                <div className="absolute top-2 right-2 flex flex-col gap-1">
                  <Badge
                    variant={
                      book.available_copies && book.available_copies > 0
                        ? "default"
                        : "secondary"
                    }
                    className={
                      book.available_copies && book.available_copies > 0
                        ? "bg-brand-primary hover:bg-brand-primary-dark text-white text-xs"
                        : "text-xs"
                    }
                  >
                    {book.available_copies || 0}/{book.total_copies || 0}{" "}
                    {t("available")}
                  </Badge>
                </div>
              </div>

              <div>
                <h3 className="font-semibold line-clamp-2">{book.title}</h3>
                <p className="text-sm text-muted-foreground">{book.author}</p>
              </div>

              <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 gap-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/books/${book.slug}`);
                  }}
                >
                  <Eye className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">{t("detail")}</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveBook(book.id);
                  }}
                >
                  {t("remove")}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* List View */}
      {viewMode === "list" && (
        <div className="rounded-md border">
          <div className="divide-y">
            {books.map((book) => (
              <div
                key={book.id}
                className="group hover:bg-primary/5 transition-colors cursor-pointer"
                onClick={() => onToggleBookSelection(book.id)}
              >
                <div className="p-4 flex items-center gap-4">
                  {/* Checkbox */}
                  <div
                    className="shrink-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Checkbox
                      id={`book-list-${book.id}`}
                      checked={selectedBooks.includes(book.id)}
                      onCheckedChange={() => onToggleBookSelection(book.id)}
                    />
                  </div>

                  <div className="w-12 h-16 shrink-0 relative overflow-hidden rounded">
                    {book.cover_image_url ? (
                      <img
                        src={book.cover_image_url}
                        alt={book.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center">
                        <BookMarked className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  {/* Book Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-foreground line-clamp-1">
                      {book.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {book.author}
                    </p>
                    {book.publisher && (
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {book.publisher}
                      </p>
                    )}
                  </div>

                  <div>
                    <div className="shrink-0 flex justify-end mb-2">
                      <Badge
                        variant={
                          book.available_copies && book.available_copies > 0
                            ? "default"
                            : "secondary"
                        }
                        className={
                          book.available_copies && book.available_copies > 0
                            ? "bg-brand-primary hover:bg-brand-primary-dark text-white text-xs"
                            : "text-xs"
                        }
                      >
                        {book.available_copies || 0}/{book.total_copies || 0}{" "}
                        {t("available")}
                      </Badge>
                    </div>

                    <div
                      className="shrink-0 flex gap-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/books/${book.slug}`);
                        }}
                        className="h-8 gap-1"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">{t("detail")}</span>
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemoveBook(book.id);
                        }}
                        className="h-8"
                      >
                        <Trash className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">{t("remove")}</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
