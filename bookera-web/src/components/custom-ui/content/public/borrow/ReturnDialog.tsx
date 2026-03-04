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
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { Borrow } from "@/types/borrow";
import { bookReturnService } from "@/services/book-return.service";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  PackageOpen,
  CalendarClock,
  Hash,
  BookOpen,
  Loader2,
  CheckSquare,
} from "lucide-react";

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

  const borrowedDetails = borrow?.borrow_details.filter(
    (d) => d.status === "borrowed"
  );

  const allSelected =
    (borrowedDetails?.length ?? 0) > 0 &&
    selectedDetailIds.length === borrowedDetails?.length;

  const handleToggleAll = () => {
    if (allSelected) {
      setSelectedDetailIds([]);
    } else {
      setSelectedDetailIds(borrowedDetails?.map((d) => d.id) ?? []);
    }
  };

  const handleCheckedChange = (detailId: number, checked: boolean) => {
    setSelectedDetailIds((prev) =>
      checked ? [...prev, detailId] : prev.filter((id) => id !== detailId)
    );
  };

  const handleClose = () => {
    setSelectedDetailIds([]);
    onOpenChange(false);
  };

  const isOverdue = borrow?.return_date
    ? new Date(borrow.return_date) < new Date()
    : false;

  const handleSubmit = async () => {
    if (!borrow || selectedDetailIds.length === 0) return;
    setLoading(true);
    try {
      await bookReturnService.create(borrow.id, {
        borrow_detail_ids: selectedDetailIds,
      });
      toast.success("Return request submitted successfully");
      handleClose();
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
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
              <PackageOpen className="h-4 w-4 text-primary" />
            </div>
            <span>Request Return</span>
          </DialogTitle>
        </DialogHeader>

        {/* Borrow Info */}
        <div className="rounded-lg border bg-muted/40 px-4 py-3 text-sm space-y-1.5">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Hash className="h-3.5 w-3.5 shrink-0" />
            <span>
              Borrow Code:{" "}
              <span className="font-medium text-foreground">
                {borrow?.borrow_code ?? `#${borrow?.id}`}
              </span>
            </span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <CalendarClock className="h-3.5 w-3.5 shrink-0" />
            <span>
              Due:{" "}
              <span
                className={`font-medium ${
                  isOverdue ? "text-destructive" : "text-foreground"
                }`}
              >
                {borrow?.return_date
                  ? format(new Date(borrow.return_date), "dd MMM yyyy")
                  : "—"}
              </span>
              {isOverdue && (
                <Badge variant="destructive" className="ml-2 text-xs py-0">
                  Overdue
                </Badge>
              )}
            </span>
          </div>
        </div>

        <Separator />

        {/* Book Selection */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Select Books to Return</Label>
            {(borrowedDetails?.length ?? 0) > 0 && (
              <button
                type="button"
                onClick={handleToggleAll}
                className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors"
              >
                <CheckSquare className="h-3.5 w-3.5" />
                {allSelected ? "Deselect All" : "Select All"}
              </button>
            )}
          </div>

          {borrowedDetails?.length === 0 ? (
            <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed py-8 text-center">
              <BookOpen className="h-8 w-8 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">
                No books available to return.
              </p>
            </div>
          ) : (
            <ScrollArea className="max-h-60">
              <div className="space-y-2 pr-1">
                {borrowedDetails?.map((detail) => (
                  <div
                    key={detail.id}
                    className={`flex items-center gap-3 rounded-lg border p-3 transition-colors cursor-pointer ${
                      selectedDetailIds.includes(detail.id)
                        ? "border-primary/40 bg-primary/5"
                        : "hover:bg-muted/40"
                    }`}
                    onClick={() =>
                      handleCheckedChange(
                        detail.id,
                        !selectedDetailIds.includes(detail.id)
                      )
                    }
                  >
                    <Checkbox
                      id={`detail-${detail.id}`}
                      checked={selectedDetailIds.includes(detail.id)}
                      onCheckedChange={(c) =>
                        handleCheckedChange(detail.id, c as boolean)
                      }
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium leading-snug truncate">
                        {detail.book_copy.book.title}
                      </p>
                      <Badge
                        variant="outline"
                        className="mt-1 text-xs font-normal"
                      >
                        {detail.book_copy.copy_code}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}

          {selectedDetailIds.length > 0 && (
            <p className="text-xs text-muted-foreground pt-1">
              {selectedDetailIds.length} book
              {selectedDetailIds.length > 1 ? "s" : ""} selected for return
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || selectedDetailIds.length === 0}
            variant="brand"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <PackageOpen className="h-4 w-4" />
                Return{" "}
                {selectedDetailIds.length > 0
                  ? `${selectedDetailIds.length} Book${selectedDetailIds.length > 1 ? "s" : ""}`
                  : "Books"}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
