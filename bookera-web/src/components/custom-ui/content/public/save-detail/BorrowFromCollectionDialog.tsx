"use client";

import { useState, useEffect } from "react";
import { loanService } from "@/services/loan.service";
import { Book } from "@/types/book";
import { toast } from "sonner";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { DatePicker } from "@/components/ui/date-picker";
import { BookOpen, Loader2, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { ScrollArea } from "@/components/ui/scroll-area";

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
  const t = useTranslations("common");
  const [loading, setLoading] = useState(false);
  const [selectedCopies, setSelectedCopies] = useState<number[]>([]);
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);

  useEffect(() => {
    if (open) {
      // Set default due date to 7 days from now
      const defaultDate = new Date();
      defaultDate.setDate(defaultDate.getDate() + 7);
      setDueDate(defaultDate);
    } else {
      // Reset form
      setSelectedCopies([]);
      setDueDate(undefined);
    }
  }, [open]);

  const handleSubmit = async () => {
    if (selectedCopies.length === 0) {
      toast.error(t("minOneCopy"));
      return;
    }

    if (!dueDate) {
      toast.error(t("selectDueDate"));
      return;
    }

    setLoading(true);
    try {
      const response = await loanService.create({
        book_copy_ids: selectedCopies,
        due_date: dueDate.toISOString().split("T")[0],
      });
      toast.success(response.data.message || t("borrowRequestCreated"));
      onOpenChange(false);
      setSelectedCopies([]);
      setDueDate(undefined);
      onSuccess();
    } catch (error: any) {
      toast.error(error.response?.data?.message || t("failedCreateBorrow"));
    } finally {
      setLoading(false);
    }
  };

  const toggleCopy = (copyId: number) => {
    setSelectedCopies((prev) =>
      prev.includes(copyId)
        ? prev.filter((id) => id !== copyId)
        : [...prev, copyId]
    );
  };

  const removeCopy = (copyId: number) => {
    setSelectedCopies((prev) => prev.filter((id) => id !== copyId));
  };

  const getSelectedCopyNames = () => {
    const names: string[] = [];
    selectedBooks.forEach((book) => {
      if (book.copies) {
        book.copies
          .filter((copy) => selectedCopies.includes(copy.id))
          .forEach((copy) => {
            names.push(`${book.title} (${copy.copy_code})`);
          });
      }
    });
    return names;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto scrollbar-hide">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            {t("borrowBooks")} - {selectedBooks.length} {t("booksSelected")}
          </DialogTitle>
          <DialogDescription>
            {t("selectCopiesFromCollectionDesc")}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[50vh] pr-4">
          <div className="space-y-4 py-4">
            {selectedBooks.map((book) => {
              const availableCopies =
                book.copies?.filter((copy) => copy.status === "available") || [];
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
                        <div>
                          <p className="font-semibold line-clamp-2 text-sm">{book.title}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {book.author}
                          </p>
                        </div>
                        <div className="flex gap-2 flex-wrap">
                          <Badge variant="outline" className="text-xs">
                            {totalCopies} Total
                          </Badge>
                          <Badge variant="destructive" className="text-xs">
                            {t("noCopiesAvailable")}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <div key={book.id} className="border rounded-lg overflow-hidden">
                  <div className="flex gap-3 p-4 bg-muted/30">
                    {book.cover_image_url && (
                      <img
                        src={book.cover_image_url}
                        alt={book.title}
                        className="w-16 h-24 object-cover rounded shadow-sm shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0 space-y-2">
                      <div>
                        <p className="font-semibold line-clamp-2 text-sm">{book.title}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {book.author}
                        </p>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        <Badge variant="outline" className="text-xs">
                          {totalCopies} Total
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {availableCopies.length} {t("available")}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 space-y-1 bg-background">
                    <Label className="text-xs font-medium text-muted-foreground mb-2 block">
                      {t("selectCopies")}:
                    </Label>
                    <div className="space-y-1">
                      {availableCopies.map((copy) => (
                        <div
                          key={copy.id}
                          className="flex items-center gap-3 p-2.5 rounded-md border hover:bg-muted/50 transition-colors cursor-pointer"
                          onClick={() => toggleCopy(copy.id)}
                        >
                          <Checkbox
                            id={`copy-${copy.id}`}
                            checked={selectedCopies.includes(copy.id)}
                            onCheckedChange={() => toggleCopy(copy.id)}
                            className="shrink-0"
                          />
                          <label
                            htmlFor={`copy-${copy.id}`}
                            className="flex-1 text-sm font-medium cursor-pointer select-none"
                          >
                            {copy.copy_code}
                          </label>
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 shrink-0">
                            {t("available")}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>

        {selectedCopies.length > 0 && (
          <div className="space-y-3 border-t pt-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold">
                {t("selectedCopies", { count: selectedCopies.length })}
              </Label>
              <Badge variant="secondary" className="text-xs">
                {selectedCopies.length} Selected
              </Badge>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-32 overflow-y-auto">
              {getSelectedCopyNames().map((name, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 p-2 rounded-md border bg-muted/20 group hover:bg-muted/40 transition-colors"
                >
                  <span className="text-xs flex-1 truncate">{name}</span>
                  <button
                    onClick={() => removeCopy(selectedCopies[index])}
                    className="p-1 hover:bg-destructive/20 rounded-full transition-colors shrink-0"
                    title="Remove"
                  >
                    <X className="h-3 w-3 text-muted-foreground group-hover:text-destructive" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-2 border-t pt-4">
          <Label className="text-sm font-semibold" variant="required">{t("dueDate")}</Label>
          <DatePicker
            value={dueDate}
            onChange={setDueDate}
            placeholder={t("selectReturnDate")}
            minDate={new Date()}
          />
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            {t("cancel")}
          </Button>
          <Button
            variant="submit"
            onClick={handleSubmit}
            disabled={loading || selectedCopies.length === 0}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t("createLoan")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
