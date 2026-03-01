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
import { Textarea } from "@/components/ui/textarea";
import { Borrow } from "@/types/borrow";
import { lostBookService } from "@/services/lost-book.service";
import { toast } from "sonner";
import { AlertCircle } from "lucide-react";

interface ReportLostDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  borrow: Borrow | null;
  onSuccess?: () => void;
}

export function ReportLostDialog({
  open,
  onOpenChange,
  borrow,
  onSuccess,
}: ReportLostDialogProps) {
  const [selectedDetailIds, setSelectedDetailIds] = useState<number[]>([]);
  const [notes, setNotes] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(false);

  const handleCheckedChange = (detailId: number, checked: boolean) => {
    setSelectedDetailIds((prev) =>
      checked ? [...prev, detailId] : prev.filter((id) => id !== detailId)
    );
    if (!checked) {
      setNotes((prev) => {
        const updated = { ...prev };
        delete updated[detailId];
        return updated;
      });
    }
  };

  const borrowedDetails = borrow?.borrow_details.filter(
    (d) => d.status === "borrowed"
  );

  const handleSubmit = async () => {
    if (!borrow || selectedDetailIds.length === 0) return;
    setLoading(true);
    try {
      for (const detailId of selectedDetailIds) {
        const detail = borrow.borrow_details.find((d) => d.id === detailId);
        if (!detail) continue;
        await lostBookService.report(borrow.id, {
          book_copy_id: detail.book_copy.id,
          notes: notes[detailId] || undefined,
        });
      }
      toast.success("Loss report submitted successfully");
      setSelectedDetailIds([]);
      setNotes({});
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Failed to submit loss report"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            Report Lost Book
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <p className="text-sm text-muted-foreground">
            Select the books that are lost from Borrow #{borrow?.id}:
          </p>
          <div className="space-y-3">
            {borrowedDetails?.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">
                No books available to report.
              </p>
            ) : (
              borrowedDetails?.map((detail) => (
                <div key={detail.id} className="space-y-2">
                  <div className="flex items-start gap-3 border rounded p-3 hover:bg-muted/30">
                    <Checkbox
                      id={`lost-${detail.id}`}
                      checked={selectedDetailIds.includes(detail.id)}
                      onCheckedChange={(c) =>
                        handleCheckedChange(detail.id, c as boolean)
                      }
                      className="mt-0.5"
                    />
                    <Label
                      htmlFor={`lost-${detail.id}`}
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
                  {selectedDetailIds.includes(detail.id) && (
                    <Textarea
                      placeholder="Describe how the book was lost (optional)..."
                      value={notes[detail.id] || ""}
                      onChange={(e) =>
                        setNotes((prev) => ({
                          ...prev,
                          [detail.id]: e.target.value,
                        }))
                      }
                      rows={2}
                      className="ml-6 text-sm"
                    />
                  )}
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
            variant="destructive"
            onClick={handleSubmit}
            disabled={loading || selectedDetailIds.length === 0}
          >
            {loading ? "Submitting..." : "Report Lost"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
