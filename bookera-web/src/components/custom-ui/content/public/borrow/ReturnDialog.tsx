"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Borrow } from "@/types/borrow";
import { bookReturnService } from "@/services/book-return.service";
import { toast } from "sonner";
import { PackageX } from "lucide-react";

interface ReturnDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  borrow: Borrow | null;
  onSuccess?: () => void;
}

export function ReturnDialog({
  open,
  onOpenChange,
  borrow,
  onSuccess,
}: ReturnDialogProps) {
  const [selectedDetailIds, setSelectedDetailIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);

  const handleCheckedChange = (detailId: number, checked: boolean) => {
    setSelectedDetailIds((prev) =>
      checked ? [...prev, detailId] : prev.filter((id) => id !== detailId)
    );
  };

  const borrowedDetails = borrow?.borrow_details.filter(
    (d) => d.status === "borrowed"
  );

  const handleSubmit = async () => {
    if (!borrow || selectedDetailIds.length === 0) return;
    setLoading(true);
    try {
      await bookReturnService.create(borrow.id, {
        borrow_detail_ids: selectedDetailIds,
      });
      toast.success("Return request submitted successfully");
      setSelectedDetailIds([]);
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Failed to submit return request"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PackageX className="h-5 w-5" />
            Request Return
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <p className="text-sm text-muted-foreground">
            Select the books you want to return from Borrow #{borrow?.id}:
          </p>
          <div className="space-y-2">
            {borrowedDetails?.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">
                No books available to return.
              </p>
            ) : (
              borrowedDetails?.map((detail) => (
                <div
                  key={detail.id}
                  className="flex items-start gap-3 border rounded p-3 hover:bg-muted/30"
                >
                  <Checkbox
                    id={`detail-${detail.id}`}
                    checked={selectedDetailIds.includes(detail.id)}
                    onCheckedChange={(c) =>
                      handleCheckedChange(detail.id, c as boolean)
                    }
                    className="mt-0.5"
                  />
                  <Label
                    htmlFor={`detail-${detail.id}`}
                    className="font-normal cursor-pointer leading-snug"
                  >
                    <span className="font-medium">
                      {detail.book_copy.book.title}
                    </span>
                    <br />
                    <span className="text-xs text-muted-foreground">
                      Code: {detail.book_copy.copy_code}
                    </span>
                  </Label>
                </div>
              ))
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="submit"
            onClick={handleSubmit}
            disabled={loading || selectedDetailIds.length === 0}
          >
            {loading ? "Submitting..." : "Submit Return"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
