"use client";

import { useState } from "react";
import { useAuthStore } from "@/store/auth.store";
import { useRouter, usePathname } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker";
import { BookPlus } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { borrowRequestService } from "@/services/borrow-request.service";

interface AddToRequestButtonProps {
  bookId: number;
}

export default function AddToRequestButton({
  bookId,
}: AddToRequestButtonProps) {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  const [showDialog, setShowDialog] = useState(false);
  const [borrowDate, setBorrowDate] = useState<Date | undefined>(undefined);
  const [returnDate, setReturnDate] = useState<Date | undefined>(undefined);
  const [loading, setLoading] = useState(false);

  const handleOpen = () => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=${pathname}`);
      return;
    }
    setShowDialog(true);
  };

  const handleClose = () => {
    setShowDialog(false);
    setBorrowDate(undefined);
    setReturnDate(undefined);
  };

  const handleSubmit = async () => {
    if (!borrowDate) {
      toast.error("Borrow date is required");
      return;
    }
    if (!returnDate) {
      toast.error("Return date is required");
      return;
    }
    if (returnDate <= borrowDate) {
      toast.error("Return date must be after borrow date");
      return;
    }

    try {
      setLoading(true);
      await borrowRequestService.create({
        book_ids: [bookId],
        borrow_date: format(borrowDate, "yyyy-MM-dd"),
        return_date: format(returnDate, "yyyy-MM-dd"),
      });
      toast.success("Borrow request created successfully!");
      handleClose();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to create borrow request",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={handleOpen}
        className="gap-2"
      >
        <BookPlus className="h-4 w-4" />
        {"Add to Request"}
      </Button>

      <Dialog open={showDialog} onOpenChange={handleClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{"Borrow Request"}</DialogTitle>
            <DialogDescription>
              {"Set the borrow date and return date for your borrow request"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label variant="required">{"Borrow Date"}</Label>
              <DatePicker
                value={borrowDate}
                onChange={setBorrowDate}
                placeholder={"Select borrow date"}
                dateMode="future"
              />
            </div>

            <div className="space-y-2">
              <Label variant="required">{"Return Date"}</Label>
              <DatePicker
                value={returnDate}
                onChange={setReturnDate}
                placeholder={"Select return date"}
                dateMode="future"
              />
              <p className="text-xs text-muted-foreground">
                {"Return date must be after borrow date"}
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                onClick={handleClose}
                className="flex-1"
                disabled={loading}
              >
                {"Cancel"}
              </Button>
              <Button
                onClick={handleSubmit}
                className="flex-1"
                disabled={loading}
              >
                {loading ? "Processing..." : "Submit Request"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
