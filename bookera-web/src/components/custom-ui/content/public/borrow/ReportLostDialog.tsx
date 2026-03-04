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
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DatePicker } from "@/components/ui/date-picker";
import { Borrow } from "@/types/borrow";
import { lostBookService } from "@/services/lost-book.service";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  AlertTriangle,
  BookOpen,
  CalendarClock,
  Hash,
  Loader2,
} from "lucide-react";

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
  const [estimatedLostDate, setEstimatedLostDate] = useState<
    Date | undefined
  >(undefined);
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

  const handleClose = () => {
    setSelectedDetailIds([]);
    setNotes({});
    setEstimatedLostDate(undefined);
    onOpenChange(false);
  };

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
          estimated_lost_date: estimatedLostDate
            ? format(estimatedLostDate, "yyyy-MM-dd")
            : undefined,
        });
      }
      toast.success("Loss report submitted successfully");
      handleClose();
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
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </div>
            <span>Report Lost Book</span>
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
              <span className="font-medium text-foreground">
                {borrow?.return_date
                  ? format(new Date(borrow.return_date), "dd MMM yyyy")
                  : "—"}
              </span>
            </span>
          </div>
        </div>

        {/* Warning Banner */}
        <div className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
          <p>
            Reporting a lost book will notify the library. A fine may be
            applied based on the book&apos;s value.
          </p>
        </div>

        <Separator />

        {/* Book Selection */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">
              Select Lost Books
            </Label>
            {(borrowedDetails?.length ?? 0) > 0 && (
              <span className="text-xs text-muted-foreground">
                {selectedDetailIds.length} of {borrowedDetails?.length}{" "}
                selected
              </span>
            )}
          </div>

          {borrowedDetails?.length === 0 ? (
            <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed py-8 text-center">
              <BookOpen className="h-8 w-8 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">
                No books available to report.
              </p>
            </div>
          ) : (
            <ScrollArea className="max-h-52">
              <div className="space-y-2 pr-1">
                {borrowedDetails?.map((detail) => (
                  <div key={detail.id} className="space-y-2">
                    <div
                      className={`flex items-start gap-3 rounded-lg border p-3 transition-colors cursor-pointer ${
                        selectedDetailIds.includes(detail.id)
                          ? "border-destructive/40 bg-destructive/5"
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
                        id={`lost-${detail.id}`}
                        checked={selectedDetailIds.includes(detail.id)}
                        onCheckedChange={(c) =>
                          handleCheckedChange(detail.id, c as boolean)
                        }
                        className="mt-0.5"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium leading-snug truncate">
                          {detail.book_copy.book.title}
                        </p>
                        <Badge variant="outline" className="mt-1 text-xs font-normal">
                          {detail.book_copy.copy_code}
                        </Badge>
                      </div>
                    </div>

                    {selectedDetailIds.includes(detail.id) && (
                      <div className="ml-6 space-y-1">
                        <Label className="text-xs text-muted-foreground">
                          Additional notes (optional)
                        </Label>
                        <Textarea
                          placeholder="Describe how the book was lost..."
                          value={notes[detail.id] || ""}
                          onChange={(e) =>
                            setNotes((prev) => ({
                              ...prev,
                              [detail.id]: e.target.value,
                            }))
                          }
                          rows={2}
                          className="text-sm resize-none"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>

        {/* Estimated Lost Date */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5">
            <Label className="text-sm font-medium">
              Estimated Date Lost
            </Label>
            <Badge variant="secondary" className="text-xs font-normal py-0">
              Optional
            </Badge>
          </div>
          <DatePicker
            value={estimatedLostDate}
            onChange={setEstimatedLostDate}
            placeholder="Select approximate date book was lost"
            dateMode="all"
          />
          <p className="text-xs text-muted-foreground">
            If you remember approximately when the book went missing, provide
            the date.
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleSubmit}
            disabled={loading || selectedDetailIds.length === 0}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <AlertTriangle className="h-4 w-4" />
                Report{" "}
                {selectedDetailIds.length > 0
                  ? `${selectedDetailIds.length} Book${selectedDetailIds.length > 1 ? "s" : ""}`
                  : "Lost Book"}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
