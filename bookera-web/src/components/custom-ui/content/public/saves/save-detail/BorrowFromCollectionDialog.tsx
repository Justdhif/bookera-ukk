"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { borrowRequestService } from "@/services/borrow-request.service";
import { Book } from "@/types/book";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker";
import { BookPlus, Loader2, Eye } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import Image from "next/image";

interface BorrowFromCollectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedBooks: Book[];
  onSuccess: () => void;
}

export function BorrowFromCollectionDialog({
  open,
  onOpenChange,
  selectedBooks,
  onSuccess,
}: BorrowFromCollectionDialogProps) {
    const t = useTranslations("public");
  const [isLoading, setIsLoading] = useState(false);
  const [borrowDate, setBorrowDate] = useState<Date | undefined>(undefined);
  const [returnDate, setReturnDate] = useState<Date | undefined>(undefined);

  useEffect(() => {
    if (!open) {
      setBorrowDate(undefined);
      setReturnDate(undefined);
    }
  }, [open]);

  const isFormValid = (): boolean => {
    if (selectedBooks.length === 0) return false;
    if (!borrowDate || !returnDate) return false;
    if (returnDate <= borrowDate) return false;
    return true;
  };

  const isSubmitDisabled = (): boolean => {
    return isLoading || !isFormValid();
  };

  const handleSubmit = async () => {
    if (!isFormValid()) {
      if (selectedBooks.length === 0) toast.error("No books selected");
      else if (!borrowDate) toast.error("Borrow date is required");
      else if (!returnDate) toast.error("Return date is required");
      else toast.error("Return date must be after borrow date");
      return;
    }

    setIsLoading(true);
    try {
      await borrowRequestService.create({
        book_ids: selectedBooks.map((b) => b.id),
        borrow_date: format(borrowDate!, "yyyy-MM-dd"),
        return_date: format(returnDate!, "yyyy-MM-dd"),
      });
      toast.success("Borrow request created successfully!");
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to create borrow request",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto scrollbar-hide">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookPlus className="h-5 w-5" />
            Borrow request - {selectedBooks.length} books selected
          </DialogTitle>
          <DialogDescription>
            Please review the selected books and choose your borrow and return dates.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[30vh] pr-4 border rounded-md">
          <div className="space-y-4 p-4">
            {selectedBooks.map((book) => (
              <div key={book.id} className="flex gap-3 items-center">
                {book.cover_image_url && (
                  <Image
                    src={book.cover_image_url}
                    alt={book.title}
                    width={48}
                    height={64}
                    className="w-12 h-16 object-cover rounded shadow-sm shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold line-clamp-1 text-sm">
                    {book.title}
                  </p>
                  <p className="text-xs text-muted-foreground">{book.author}</p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label variant="required">Borrow Date</Label>
            <DatePicker
              value={borrowDate}
              onChange={setBorrowDate}
              placeholder="Select borrow date"
              dateMode="future"
            />
          </div>

          <div className="space-y-2">
            <Label variant="required">Return Date</Label>
            <DatePicker
              value={returnDate}
              onChange={setReturnDate}
              placeholder="Select return date"
              dateMode="future"
            />
            <p className="text-xs text-muted-foreground">
              Return date must be after borrow date.
            </p>
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
                      {t("detail.editDialog.cancel")}
                  </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitDisabled()}
            loading={isLoading}
            variant="submit"
          >
            {isLoading ? "Processing..." : "Submit Request"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
