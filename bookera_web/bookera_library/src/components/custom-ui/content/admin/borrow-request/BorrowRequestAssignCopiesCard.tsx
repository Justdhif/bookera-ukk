"use client";

import { useEffect, useState } from "react";
import { BorrowRequest } from "@/types/borrow-request";
import { BookCopy } from "@/types/book-copy";
import { bookService } from "@/services/book.service";
import { toast } from "sonner";
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
import DataLoading from "@/components/custom-ui/DataLoading";
import { BookOpen, PackageCheck, AlertCircle } from "lucide-react";
import { useTranslations } from "next-intl";

interface BookCopyOption {
  bookId: number;
  bookTitle: string;
  copies: BookCopy[];
}

interface BorrowRequestAssignCopiesCardProps {
  request: BorrowRequest;
  onSelectionChange: (copyIds: number[]) => void;
  disabled?: boolean;
}

export function BorrowRequestAssignCopiesCard({
  request,
  onSelectionChange,
  disabled = false,
}: BorrowRequestAssignCopiesCardProps) {
  const t = useTranslations("borrow");
  const tRequest = useTranslations("borrow-request");
  const [copyOptions, setCopyOptions] = useState<BookCopyOption[]>([]);
  const [selectedCopyIds, setSelectedCopyIds] = useState<
    Record<number, number>
  >({});
  const [isLoadingCopies, setIsLoadingCopies] = useState(true);

  const requestDetails = request.borrow_request_details ?? [];

  useEffect(() => {
    loadCopies();
  }, [request.id]);

  useEffect(() => {
    const copyIds = requestDetails
      .map((detail) => selectedCopyIds[detail.id])
      .filter(Boolean);
    
    if (copyIds.length === requestDetails.length) {
      onSelectionChange(copyIds);
    } else {
      onSelectionChange([]);
    }
  }, [selectedCopyIds, requestDetails.length]);

  const loadCopies = async () => {
    setIsLoadingCopies(true);
    try {
      const options: BookCopyOption[] = [];
      const preSelected: Record<number, number> = {};

      for (const detail of requestDetails) {
        const res = await bookService.getById(detail.book_id);
        const book = res.data.data;
        const available = (book.copies ?? []).filter(
          (c: BookCopy) => c.status === "available",
        );
        options.push({
          bookId: detail.id, // Using detail ID as key to handle multiple copies of same book if needed
          bookTitle: book.title,
          copies: available,
        });

        if (available.length > 0) {
          preSelected[detail.id] = available[0].id;
        }
      }
      setCopyOptions(options);
      setSelectedCopyIds(preSelected);
    } catch (error: any) {
      console.error("Failed to load copies:", error);
      toast.error(t("loadCopiesError"));
    } finally {
      setIsLoadingCopies(false);
    }
  };

  if (request.approval_status !== "processing") return null;

  return (
    <Card className="border-blue-200 bg-blue-50/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PackageCheck className="h-5 w-5 text-blue-600" />
          {t("assignCopiesTitle")}
        </CardTitle>
        <CardDescription>
          {t("assignCopiesDesc")}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoadingCopies ? (
          <div className="flex justify-center py-6">
            <DataLoading variant="inline" size="md" />
          </div>
        ) : (
          <div className="space-y-4">
            {copyOptions.map((opt) => (
              <div key={opt.bookId} className="space-y-2">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-muted-foreground shrink-0" />
                  <p className="font-medium text-sm truncate">
                    {opt.bookTitle}
                  </p>
                </div>
                {opt.copies.length === 0 ? (
                  <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    {t("noCopiesAvailableForThisBook")}
                  </div>
                ) : (
                  <Select
                    disabled={disabled}
                    value={String(selectedCopyIds[opt.bookId] ?? "")}
                    onValueChange={(val) =>
                      setSelectedCopyIds((prev) => ({
                        ...prev,
                        [opt.bookId]: Number(val),
                      }))
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={t("selectCopyPlaceholder")} />
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
            
            {copyOptions.some(opt => opt.copies.length === 0) && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm italic">
                {tRequest("cannotApproveNoStock")}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
