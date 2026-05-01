"use client";

import { useEffect, useState } from "react";
import { BorrowRequest } from "@/types/borrow-request";
import { BookCopy } from "@/types/book-copy";
import { bookService } from "@/services/book.service";
import { borrowRequestService } from "@/services/borrow-request.service";
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
import DataLoading from "@/components/custom-ui/DataLoading";
import { BookOpen, PackageCheck, AlertCircle } from "lucide-react";
import { useTranslations } from "next-intl";

interface BookCopyOption {
  detailId: number;
  bookTitle: string;
  copies: BookCopy[];
}

interface BorrowRequestAssignCopiesCardProps {
  request: BorrowRequest;
  onAssigned: () => void;
  disabled?: boolean;
}

export function BorrowRequestAssignCopiesCard({
  request,
  onAssigned,
  disabled = false,
}: BorrowRequestAssignCopiesCardProps) {
  const t = useTranslations("borrow");
  const tRequest = useTranslations("borrow-request");
  const [copyOptions, setCopyOptions] = useState<BookCopyOption[]>([]);
  const [selectedCopyIds, setSelectedCopyIds] = useState<
    Record<number, number>
  >({});
  const [isLoadingCopies, setIsLoadingCopies] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const requestDetails = (request.borrow_request_details ?? []).filter(
    (detail) => detail.approval_status === "approved" && !detail.book_copy_id,
  );

  useEffect(() => {
    loadCopies();
  }, [request.id, requestDetails.map((detail) => detail.id).join("-")]);

  const loadCopies = async () => {
    setIsLoadingCopies(true);
    try {
      if (requestDetails.length === 0) {
        setCopyOptions([]);
        setSelectedCopyIds({});
        return;
      }

      const options: BookCopyOption[] = [];
      const preSelected: Record<number, number> = {};
      const usedCopyIds = new Set<number>();

      for (const detail of requestDetails) {
        const res = await bookService.getById(detail.book_id);
        const book = res.data.data;
        const available = (book.copies ?? []).filter(
          (c: BookCopy) => c.status === "available",
        );
        options.push({
          detailId: detail.id,
          bookTitle: book.title,
          copies: available,
        });

        // Find the first available copy that hasn't been used yet for another detail in this request
        const nextAvailable = available.find((c: BookCopy) => !usedCopyIds.has(c.id));
        if (nextAvailable) {
          preSelected[detail.id] = nextAvailable.id;
          usedCopyIds.add(nextAvailable.id);
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

  const hasUnavailableStock = copyOptions.some((opt) => {
    // For each book type, count how many copies are needed and how many are available
    const bookId = requestDetails.find(d => d.id === opt.detailId)?.book_id;
    const neededCount = requestDetails.filter(d => d.book_id === bookId).length;
    return opt.copies.length < neededCount;
  });

  const isFormValid =
    copyOptions.length > 0 &&
    !hasUnavailableStock &&
    copyOptions.every((opt) => Boolean(selectedCopyIds[opt.detailId])) &&
    new Set(Object.values(selectedCopyIds)).size === Object.values(selectedCopyIds).length;

  const handleAssign = async () => {
    if (!isFormValid) {
      toast.error(t("selectCopyError"));
      return;
    }

    setIsSubmitting(true);
    try {
      const assignments = selectedCopyIds;
      await borrowRequestService.assignBorrow(request.id, assignments);
      toast.success(t("assignSuccess"));
      onAssigned();
    } catch (error: any) {
      toast.error(error.response?.data?.message || t("assignError"));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (requestDetails.length === 0) return null;

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
              <div key={opt.detailId} className="space-y-2">
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
                    value={String(selectedCopyIds[opt.detailId] ?? "")}
                    onValueChange={(val) =>
                      setSelectedCopyIds((prev) => ({
                        ...prev,
                        [opt.detailId]: Number(val),
                      }))
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={t("selectCopyPlaceholder")} />
                    </SelectTrigger>
                    <SelectContent>
                      {opt.copies.map((copy) => {
                        const isAlreadySelected = Object.entries(selectedCopyIds).some(
                          ([detailId, selectedId]) =>
                            Number(detailId) !== opt.detailId &&
                            selectedId === copy.id,
                        );
                        return (
                          <SelectItem
                            key={copy.id}
                            value={String(copy.id)}
                            disabled={isAlreadySelected}
                          >
                            <div className="flex items-center justify-between w-full gap-4">
                              <span className="font-mono">{copy.copy_code}</span>
                              <span className="text-xs text-muted-foreground capitalize">
                                {copy.status}
                              </span>
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                )}
              </div>
            ))}

            {hasUnavailableStock && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm italic text-amber-800">
                {tRequest("cannotApproveNoStock")}
              </div>
            )}

            <div className="flex justify-end pt-2">
              <Button
                onClick={handleAssign}
                disabled={disabled || isLoadingCopies || isSubmitting || !isFormValid}
                className="gap-2"
                variant="submit"
                loading={isSubmitting}
              >
                {isSubmitting ? t("assigningBtn") : t("confirmAssignment")}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
