"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { reservationService } from "@/services/reservation.service";
import { Reservation } from "@/types/reservation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

interface CancelReservationDialogProps {
  reservation: Reservation;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CancelReservationDialog({
  reservation,
  isOpen,
  onClose,
  onSuccess,
}: CancelReservationDialogProps) {
  const t = useTranslations("reservation");
  const [loading, setLoading] = useState(false);

  const handleCancel = async () => {
    setLoading(true);
    try {
      await reservationService.cancel(reservation.id);
      toast.success(t("cancelSuccess"));
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || t("cancelError"));
    } finally {
      setLoading(false);
    }
  };

  const isNotified = reservation.status === "notified";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            {t("cancelTitle")}
          </DialogTitle>
          <DialogDescription className="space-y-2 pt-1">
            {isNotified ? (
              <>
                <span className="block font-medium text-amber-600 dark:text-amber-400">
                  {t("cancelNotifiedWarning")}
                </span>
                <span className="block text-muted-foreground">
                  {t("cancelNotifiedDesc")}
                </span>
              </>
            ) : (
              <span className="block">{t("cancelWaitingDesc")}</span>
            )}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="gap-2 pt-2">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            {t("keepReservation")}
          </Button>
          <Button
            variant="destructive"
            onClick={handleCancel}
            disabled={loading}
            className="gap-2"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : null}
            {loading ? t("cancelling") : t("confirmCancel")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
