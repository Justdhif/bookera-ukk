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
import EmptyState from "@/components/custom-ui/EmptyState";

interface BookCopySelectorCardProps {
  selectedBooks: Book[];
  selectedCopyIds: number[];
  onCopyToggle: (copyId: number) => void;
}

export default function BookCopySelectorCard({
  selectedBooks,
  selectedCopyIds,
  onCopyToggle,
}: BookCopySelectorCardProps) {
  if (selectedBooks.length === 0) {
    return (
      <Card className="h-full flex items-center justify-center min-h-100">
        <CardContent className="text-center py-12">
          <EmptyState
            title="No Books Selected"
            description="Select books from the left to view available copies"
            icon={
              <BookOpen className="h-20 w-20 mx-auto opacity-20 text-muted-foreground" />
            }
            className="border-none h-auto p-0"
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="shrink-0">
        <Label variant="required">
          <CardTitle>
            Select Copies - {selectedBooks.length}{" "}
            {selectedBooks.length === 1 ? "book" : "books"}
          </CardTitle>
        </Label>
        <CardDescription>
          Select specific copies from the collection
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1 min-h-0">
        <ScrollArea className="h-full pr-4">
          <div className="space-y-4">
            {selectedBooks.map((book) => {
              const availableCopies =
                book.copies?.filter((copy) => copy.status === "available") ||
                [];
              const totalCopies = book.copies?.length || 0;

              if (availableCopies.length === 0) {
                return (
                  <div
                    key={book.id}
                    className="border rounded-lg p-4 bg-muted/20"
                  >
                    <div className="flex gap-3 items-start">
                      {book.cover_image_url && (
                        <img
                          src={book.cover_image_url}
                          alt={book.title}
                          className="w-16 h-24 object-cover rounded shadow-sm shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0 space-y-2">
                        <p className="font-semibold text-sm line-clamp-2">
                          {book.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {book.author}
                        </p>

                        <div className="flex gap-2 flex-wrap">
                          <Badge variant="outline" className="text-xs">
                            {totalCopies} Total
                          </Badge>
                          <Badge variant="destructive" className="text-xs">
                            No Copies Available
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={book.id}
                  className="border rounded-lg overflow-hidden"
                >
                  <div className="flex gap-3 p-4 bg-muted/30">
                    {book.cover_image_url && (
                      <img
                        src={book.cover_image_url}
                        alt={book.title}
                        className="w-16 h-24 object-cover rounded shadow-sm shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0 space-y-2">
                      <p className="font-semibold text-sm line-clamp-2">
                        {book.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {book.author}
                      </p>

                      <div className="flex gap-2 flex-wrap">
                        <Badge variant="outline" className="text-xs">
                          {totalCopies} Total
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {availableCopies.length} available
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 space-y-2">
                    <Label className="text-xs text-muted-foreground">
                      Select Copies:
                    </Label>

                    {availableCopies.map((copy) => {
                      const isSelected = selectedCopyIds.includes(copy.id);

                      return (
                        <div
                          key={copy.id}
                          className="flex items-center gap-3 p-2.5 rounded-md border hover:bg-muted/50 transition cursor-pointer"
                          onClick={() => onCopyToggle(copy.id)}
                        >
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => onCopyToggle(copy.id)}
                            onClick={(e) => e.stopPropagation()}
                          />

                          <span className="flex-1 text-sm font-medium select-none">
                            {copy.copy_code}
                          </span>

                          <Badge
                            variant="outline"
                            className="text-[10px] px-1.5 py-0"
                          >
                            Available
                          </Badge>
                        </div>
                      );
                    })}
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
