"use client";

import { useTranslations } from "next-intl";
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
import { BookPlus, Eye } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { borrowRequestService } from "@/services/borrow-request.service";

interface AddToRequestButtonProps {
  bookId: number;
}

export default function AddToRequestButton({
  bookId,
}: AddToRequestButtonProps) {
    const t = useTranslations("public");
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
        variant="submit"
        size="sm"
        onClick={handleOpen}
        className="gap-2"
      >
        <BookPlus className="h-4 w-4" />
        {t("addToRequest")}
      </Button>

      <Dialog open={showDialog} onOpenChange={handleClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("borrowRequestTitle")}</DialogTitle>
            <DialogDescription>
              {t("borrowRequestDesc")}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label variant="required">{t("borrowDateLabel")}</Label>
              <DatePicker
                value={borrowDate}
                onChange={setBorrowDate}
                placeholder={t("selectBorrowDate")}
                dateMode="future"
              />
            </div>

            <div className="space-y-2">
              <Label variant="required">{t("returnDateLabel")}</Label>
              <DatePicker
                value={returnDate}
                onChange={setReturnDate}
                placeholder={t("selectReturnDate")}
                dateMode="future"
              />
              <p className="text-xs text-muted-foreground">
                {t("returnDateMustBeAfter")}
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                onClick={handleClose}
                className="flex-1"
                disabled={loading}
              >
                              {t("detail.editDialog.cancel")}
                          </Button>
              <Button
                onClick={handleSubmit}
                className="flex-1"
                disabled={loading} variant="submit"
              >
                {loading ? t("processingBtn") : t("submitRequest")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
