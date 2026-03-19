"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Book } from "@/types/book";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookMarked, LayoutGrid, List, Eye } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

interface FollowDetailBookListProps {
  books: Book[];
}

type ViewMode = "grid" | "list";

export default function FollowDetailBookList({ books }: FollowDetailBookListProps) {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  if (!books || books.length === 0) {
    return (
      <div className="rounded-lg border p-8 sm:p-12">
        <div className="text-center text-muted-foreground">
          <BookMarked className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-4 opacity-30" />
          <p className="text-sm sm:text-base">No books yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
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
              onClick={() => router.push(`/books/${book.slug}`)}
            >
              <div className="relative">
                <img
                  src={book.cover_image || "/placeholder-book.png"}
                  alt={book.title}
                  className="aspect-3/4 object-cover rounded w-full"
                />
                <div className="absolute top-2 right-2">
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
                    {book.available_copies || 0}/{book.total_copies || 0}
                  </Badge>
                </div>
              </div>

              <div>
                <h3 className="font-semibold line-clamp-2">{book.title}</h3>
                {book.author && (
                  <p className="text-sm text-muted-foreground line-clamp-1">{book.author}</p>
                )}
              </div>

              <Button
                variant="outline"
                size="sm"
                className="w-full gap-1"
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(`/books/${book.slug}`);
                }}
              >
                <Eye className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Detail</span>
              </Button>
            </div>
          ))}
        </div>
      )}

      {viewMode === "list" && (
        <div className="rounded-md border">
          <div className="divide-y">
            {books.map((book) => (
              <div
                key={book.id}
                className="group hover:bg-primary/5 transition-colors cursor-pointer"
                onClick={() => router.push(`/books/${book.slug}`)}
              >
                <div className="p-4 flex items-center gap-4">
                  <div className="w-12 h-16 shrink-0 relative overflow-hidden rounded">
                    {book.cover_image ? (
                      <img
                        src={book.cover_image}
                        alt={book.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center">
                        <BookMarked className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-foreground line-clamp-1">{book.title}</h3>
                    {book.author && (
                      <p className="text-sm text-muted-foreground line-clamp-1">{book.author}</p>
                    )}
                    {book.publisher && (
                      <p className="text-xs text-muted-foreground line-clamp-1">{book.publisher}</p>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-2 shrink-0">
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
                      {book.available_copies || 0}/{book.total_copies || 0}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/books/${book.slug}`);
                      }}
                    >
                      <Eye className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">Detail</span>
                    </Button>
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
