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
import { format } from "date-fns";
import { toast } from "sonner";
import { borrowRequestService } from "@/services/borrow-request.service";
import ReCAPTCHA from "react-google-recaptcha";
import { useRecaptcha } from "@/hooks/useRecaptcha";

interface BorrowRequestDialogProps {
  bookIds: number[];
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function BorrowRequestDialog({
  bookIds,
  isOpen,
  onClose,
  onSuccess,
}: BorrowRequestDialogProps) {
  const t = useTranslations("public");
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [borrowDate, setBorrowDate] = useState<Date | undefined>(undefined);
  const [returnDate, setReturnDate] = useState<Date | undefined>(undefined);
  const [loading, setLoading] = useState(false);

  const {
    siteKey,
    recaptchaRef,
    token,
    handleRecaptchaChange,
    reset: resetRecaptcha,
    ready: recaptchaReady,
  } = useRecaptcha();

  const handleClose = () => {
    onClose();
    setBorrowDate(undefined);
    setReturnDate(undefined);
    resetRecaptcha();
  };

  const handleSubmit = async () => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=${pathname}`);
      return;
    }

    if (bookIds.length === 0) {
      toast.error(t("detail.selectOne") || "Please select at least one book");
      return;
    }

    if (!borrowDate) {
      toast.error(t("borrowDateRequired") || "Borrow date is required");
      return;
    }
    if (!returnDate) {
      toast.error(t("common.returnDateRequired") || "Return date is required");
      return;
    }
    if (returnDate <= borrowDate) {
      toast.error(t("returnDateMustBeAfter") || "Return date must be after borrow date");
      return;
    }

    if (!token) {
      toast.error(t("pleaseVerifyRecaptcha") || "Please verify reCAPTCHA");
      return;
    }

    try {
      setLoading(true);
      await borrowRequestService.create({
        book_ids: bookIds,
        borrow_date: format(borrowDate, "yyyy-MM-dd"),
        return_date: format(returnDate, "yyyy-MM-dd"),
        recaptcha_token: token,
      });
      toast.success(t("common.borrowRequestSubmitted") || "Borrow request created successfully!");
      if (onSuccess) onSuccess();
      handleClose();
    } catch (error: any) {
      resetRecaptcha();
      toast.error(
        error.response?.data?.message || t("common.failedToBorrow") || "Failed to create borrow request",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("borrowRequestTitle")}</DialogTitle>
          <DialogDescription>
            {bookIds.length > 1 
              ? `${t("borrowRequestDesc")} (${bookIds.length} ${t("books")})`
              : t("borrowRequestDesc")}
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

          <div className="flex justify-center pt-2">
            <ReCAPTCHA
              ref={recaptchaRef}
              sitekey={siteKey}
              onChange={handleRecaptchaChange}
              theme="light"
            />
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
              disabled={loading || !recaptchaReady}
              variant="submit"
            >
              {loading ? t("processingBtn") : t("submitRequest")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
