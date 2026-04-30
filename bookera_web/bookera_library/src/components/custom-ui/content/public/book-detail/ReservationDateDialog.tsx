"use client";

import { useTranslations } from "next-intl";
import { useState, useEffect } from "react";
import { reservationService } from "@/services/reservation.service";
import { Book } from "@/types/book";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Info, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ReservationDateDialogProps {
  book: Book;
  isOpen: boolean;
  loading?: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ReservationDateDialog({
  book,
  isOpen,
  loading = false,
  onClose,
  onSuccess,
}: ReservationDateDialogProps) {
  const t = useTranslations("reservation");
  const [initLoading, setInitLoading] = useState(false);
  const [prediction, setPrediction] = useState<{
    earliest_return: string | null;
    suggested_date: string;
    message: string;
  } | null>(null);

  // Fetch prediction on open
  useEffect(() => {
    if (isOpen) {
      fetchPrediction();
    } else {
      // Reset state on close
      setPrediction(null);
    }
  }, [isOpen]);

  const fetchPrediction = async () => {
    setInitLoading(true);
    try {
      const res = await reservationService.getPrediction(book.id);
      setPrediction(res.data.data);
    } catch (error: any) {
      toast.error(t("predictionError") || "Failed to load prediction");
    } finally {
      setInitLoading(false);
    }
  };

  const handleConfirm = () => {
    onSuccess();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Info className="h-5 w-5 text-brand-primary" />
            {t("infoDialogTitle")}
          </DialogTitle>
          <DialogDescription>
            {t("infoDialogDesc")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {initLoading ? (
            <div className="flex flex-col items-center justify-center py-6 space-y-2">
              <Loader2 className="h-8 w-8 animate-spin text-brand-primary" />
              <p className="text-sm text-muted-foreground">{t("loadingPrediction") || "Checking availability..."}</p>
            </div>
          ) : (
            <>
              {prediction && (
                <div className="p-4 rounded-xl bg-brand-primary/5 border border-brand-primary/20 space-y-3">
                  <div className="flex gap-3 text-sm">
                    <Info className="h-4 w-4 mt-0.5 shrink-0 text-brand-primary" />
                    <p className="text-foreground leading-relaxed font-medium">{prediction.message}</p>
                  </div>
                  <div className="flex gap-2 p-2.5 bg-amber-500/10 rounded-lg text-[11px] text-amber-700 dark:text-amber-400 border border-amber-500/20">
                    <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                    <p className="leading-normal">{t("expirationWarning") || "Note: You must borrow the book within 24 hours after it becomes available, or your reservation will be passed to the next person."}</p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading || initLoading}>
            {t("cancel")}
          </Button>
          <Button 
            variant="submit" 
            onClick={handleConfirm} 
            disabled={loading || initLoading}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            {t("confirmReserve")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
