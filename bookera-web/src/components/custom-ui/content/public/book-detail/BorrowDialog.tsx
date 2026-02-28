"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker";
import { useState } from "react";
import { loanService } from "@/services/loan.service";
import { toast } from "sonner";
import { BookCopy } from "@/types/book-copy";
import { format } from "date-fns";

export default function BorrowDialog({
  copy,
  onClose,
}: {
  copy: BookCopy | null;
  onClose: () => void;
}) {
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [loading, setLoading] = useState(false);

  if (!copy) return null;

  const submit = async () => {
    if (!dueDate) {
      toast.error("Return date is required");
      return;
    }

    try {
      setLoading(true);

      const formattedDate = format(dueDate, "yyyy-MM-dd");

      await loanService.create({
        book_copy_ids: [copy.id],
        due_date: formattedDate,
      });

      toast.success("Borrow request submitted successfully!");
      setDueDate(undefined);
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to borrow book");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={!!copy} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{"Borrow Book"}</DialogTitle>
          <DialogDescription>
            {"Set the return date for the book you want to borrow"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-lg border p-3 bg-muted/30">
            <p className="text-sm text-muted-foreground mb-1">{"Copy Code"}</p>
            <p className="font-medium font-mono">{copy.copy_code}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="due_date" variant="required">
              {"Return Date"}
            </Label>
            <DatePicker
              value={dueDate}
              onChange={setDueDate}
              placeholder={"Select return date"}
              dateMode="future"
            />
            <p className="text-xs text-muted-foreground">
              {"Select the date when you will return this book"}
            </p>
          </div>

          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={onClose} 
              className="flex-1"
              disabled={loading}
            >
              {"Cancel"}
            </Button>
            <Button 
              onClick={submit} 
              className="flex-1" 
              disabled={loading || !dueDate}
              loading={loading}
            >
              {loading ? "Processing..." : "Confirm Borrow"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
