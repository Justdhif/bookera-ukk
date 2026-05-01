"use client";
import { useTranslations } from "next-intl";
import { StaggerContainer, SlideIn, FadeUp } from "@/components/custom-ui/motion";

import Image from "next/image";
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
import { cn } from "@/lib/utils";

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
  const tCommon = useTranslations("common");
  if (selectedBooks.length === 0) {
    return (
      <Card className="flex-1 flex items-center justify-center min-h-100">
        <CardContent className="text-center py-12">
          <FadeUp>
            <EmptyState
              title={tCommon("noBooksSelected")}
              description={tCommon("selectBooksFromLeftDesc")}
              icon={<BookOpen />}
              className="border-none h-auto p-0"
            />
          </FadeUp>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="flex-1 min-h-0 flex flex-col">
      <CardHeader className="shrink-0">
        <Label variant="required">
          <CardTitle>
            {tCommon("selectCopies")} - {selectedBooks.length}{" "}
            {selectedBooks.length === 1
              ? tCommon("bookCount")
              : tCommon("booksCount", { count: selectedBooks.length })}
          </CardTitle>
        </Label>
        <CardDescription>
          {tCommon("selectCopiesFromCollectionDesc")}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 min-h-0">
        <ScrollArea className="h-full pr-4">
          <StaggerContainer className="space-y-4">
            {selectedBooks.map((book) => {
              const availableCopies =
                book.copies?.filter((copy) => copy.status === "available") ||
                [];
              const totalCopies = book.copies?.length || 0;

              if (availableCopies.length === 0) {
                return (
                  <SlideIn
                    key={book.id}
                    direction="up"
                    distance={20}
                    className="border rounded-lg p-4 bg-muted/20"
                  >
                    <div className="flex gap-3 items-start">
                      {book.cover_image && (
                        <Image
                          src={book.cover_image}
                          alt={book.title}
                          className="w-16 h-24 object-cover rounded shadow-sm shrink-0"
                          width={300}
                          height={400}
                          unoptimized
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
                            {totalCopies} {tCommon("totalCopies")}
                          </Badge>
                          <Badge variant="destructive" className="text-xs">
                            {tCommon("noCopiesAvailable")}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </SlideIn>
                );
              }

              return (
                <SlideIn
                  key={book.id}
                  direction="up"
                  distance={20}
                  className="border rounded-lg overflow-hidden"
                >
                  <div className="flex gap-3 p-4 bg-muted/30">
                    {book.cover_image && (
                      <Image
                        src={book.cover_image}
                        alt={book.title}
                        className="w-16 h-24 object-cover rounded shadow-sm shrink-0"
                        width={300}
                        height={400}
                        unoptimized
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
                          {totalCopies} {tCommon("totalCopies")}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {availableCopies.length} {tCommon("available")}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="p-3 space-y-2">
                    <Label className="text-xs text-muted-foreground">
                      {tCommon("selectCopies")}:
                    </Label>
                    <StaggerContainer className="space-y-2">
                      {availableCopies.map((copy) => {
                        const isSelected = selectedCopyIds.includes(copy.id);
                        return (
                          <SlideIn
                            key={copy.id}
                            direction="up"
                            distance={10}
                          >
                            <div
                              className={cn(
                                "flex items-center gap-3 p-2.5 rounded-md border transition cursor-pointer",
                                isSelected
                                  ? "bg-brand-primary/10 border-brand-primary"
                                  : "hover:bg-muted/50"
                              )}
                              onClick={() => onCopyToggle(copy.id)}
                            >
                              <Checkbox
                                checked={isSelected}
                                onCheckedChange={() => onCopyToggle(copy.id)}
                                className="data-[state=checked]:bg-brand-primary data-[state=checked]:border-brand-primary"
                                onClick={(e) => e.stopPropagation()}
                              />
                              <span className="flex-1 text-sm font-medium select-none">
                                {copy.copy_code}
                              </span>
                              <Badge
                                variant="outline"
                                className="text-[10px] px-1.5 py-0"
                              >
                                {tCommon("available")}
                              </Badge>
                            </div>
                          </SlideIn>
                        );
                      })}
                    </StaggerContainer>
                  </div>
                </SlideIn>
              );
            })}
          </StaggerContainer>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
