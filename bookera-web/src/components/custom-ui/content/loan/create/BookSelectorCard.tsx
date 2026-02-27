"use client";

import { Book } from "@/types/book";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

interface BookSelectorCardProps {
  books: Book[];
  selectedBooks: Book[];
  onBookToggle: (book: Book) => void;
}

export default function BookSelectorCard({
  books,
  selectedBooks,
  onBookToggle,
}: BookSelectorCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <Label variant="required">
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Select Books First
              </CardTitle>
            </Label>
            <CardDescription>Select at least one book copy</CardDescription>
          </div>
          {selectedBooks.length > 0 && (
            <Badge variant="secondary">
              {selectedBooks.length}{" "}
              {selectedBooks.length === 1 ? "book" : "books"}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <ScrollArea className="h-100 pr-4">
          <div className="space-y-2">
            {books.map((book) => {
              const isSelected = selectedBooks.some((b) => b.id === book.id);
              const availableCopiesCount =
                book.copies?.filter((copy) => copy.status === "available")
                  .length || 0;

              return (
                <div
                  key={book.id}
                  className={cn(
                    "flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors",
                    isSelected
                      ? "bg-primary/10 border-primary"
                      : "hover:bg-muted/50",
                  )}
                  onClick={() => onBookToggle(book)}
                >
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => onBookToggle(book)}
                    className="mt-1 shrink-0"
                    onClick={(e) => e.stopPropagation()}
                  />

                  {book.cover_image_url ? (
                    <img
                      src={book.cover_image_url}
                      alt={book.title}
                      className="w-12 h-16 object-cover rounded shadow-sm shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-16 bg-muted rounded flex items-center justify-center shrink-0">
                      <BookOpen className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}

                  <div className="flex-1 min-w-0 space-y-1">
                    <p className="font-semibold line-clamp-2 text-sm">
                      {book.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {book.author}
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      <Badge variant="outline" className="text-xs">
                        {book.isbn}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {availableCopiesCount} available
                      </Badge>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
