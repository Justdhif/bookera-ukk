"use client";

import { useEffect, useState } from "react";
import { Borrow } from "@/types/borrow";
import { BookCopy } from "@/types/book-copy";
import { bookService } from "@/services/book.service";
import { borrowService } from "@/services/borrow.service";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, PackageCheck, Loader2 } from "lucide-react";

interface BookCopyOption {
  bookId: number;
  bookTitle: string;
  copies: BookCopy[];
}

interface BorrowAssignCopiesCardProps {
  borrow: Borrow;
  onAssigned: () => void;
}

export function BorrowAssignCopiesCard({ borrow, onAssigned }: BorrowAssignCopiesCardProps) {
  const [copyOptions, setCopyOptions] = useState<BookCopyOption[]>([]);
  const [selectedCopyIds, setSelectedCopyIds] = useState<Record<number, number>>({});
  const [isLoadingCopies, setIsLoadingCopies] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const requestDetails = borrow.borrow_request?.borrow_request_details ?? [];

  useEffect(() => {
    loadCopies();
  }, [borrow.id]);

  const loadCopies = async () => {
    setIsLoadingCopies(true);
    try {
      const options: BookCopyOption[] = [];
      for (const detail of requestDetails) {
        const res = await bookService.getById(detail.book_id);
        const book = res.data.data;
        const available = (book.copies ?? []).filter(
          (c: BookCopy) => c.status === "available",
        );
        options.push({
          bookId: detail.book_id,
          bookTitle: book.title,
          copies: available,
        });
      }
      setCopyOptions(options);
      const preSelected: Record<number, number> = {};
      options.forEach((opt) => {
        if (opt.copies.length > 0) preSelected[opt.bookId] = opt.copies[0].id;
      });
      setSelectedCopyIds(preSelected);
    } catch (error: any) {
      toast.error("Failed to load available book copies");
    } finally {
      setIsLoadingCopies(false);
    }
  };

  const isFormValid = (): boolean => {
    if (copyOptions.some((o) => o.copies.length === 0)) return false;
    const copyIds = copyOptions
      .map((opt) => selectedCopyIds[opt.bookId])
      .filter(Boolean);
    return copyIds.length === requestDetails.length;
  };

  const isSubmitDisabled = (): boolean => {
    return isLoading || !isFormValid();
  };

  const handleAssign = async () => {
    if (!isFormValid()) {
      toast.error("Please select a book copy for each requested title");
      return;
    }

    setIsLoading(true);
    try {
      const copyIds = copyOptions.map((opt) => selectedCopyIds[opt.bookId]);
      await borrowService.assignCopies(borrow.id, copyIds);
      toast.success("Book copies assigned successfully!");
      onAssigned();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message ||
          "Failed to assign copies — make sure selected copies are still available",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-blue-200 bg-blue-50/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PackageCheck className="h-5 w-5 text-blue-600" />
          Assign Book Copies
        </CardTitle>
        <CardDescription>
          Select an available copy for each book requested. This borrow was approved but
          copies have not been assigned yet.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoadingCopies ? (
          <div className="space-y-4">
            {Array.from({ length: requestDetails.length || 1 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {copyOptions.map((opt) => (
                <div key={opt.bookId} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-muted-foreground shrink-0" />
                    <p className="font-medium text-sm truncate">{opt.bookTitle}</p>
                  </div>
                  {opt.copies.length === 0 ? (
                    <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
                      No available copies for this book. Please check the inventory.
                    </div>
                  ) : (
                    <Select
                      value={String(selectedCopyIds[opt.bookId] ?? "")}
                      onValueChange={(val) =>
                        setSelectedCopyIds((prev) => ({
                          ...prev,
                          [opt.bookId]: Number(val),
                        }))
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a copy..." />
                      </SelectTrigger>
                      <SelectContent>
                        {opt.copies.map((copy) => (
                          <SelectItem key={copy.id} value={String(copy.id)}>
                            <span className="font-mono">{copy.copy_code}</span>
                            <span className="ml-2 text-xs text-muted-foreground capitalize">
                              {copy.status}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <Button
                onClick={handleAssign}
                disabled={isSubmitDisabled()}
                className="gap-2"
                variant="submit"
                loading={isLoading}
              >
                {isLoading ? "Assigning..." : "Confirm Assignment"}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
