"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/auth.store";
import { useRouter, usePathname } from "next/navigation";
import { reservationService } from "@/services/reservation.service";
import { Reservation } from "@/types/reservation";
import { Book } from "@/types/book";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookmarkPlus, Loader2, Clock, Bell, X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import CancelReservationDialog from "./CancelReservationDialog";
import ReservationDateDialog from "./ReservationDateDialog";

interface ReservationButtonProps {
  book: Book;
  onReservationChange?: () => void;
}

export default function ReservationButton({
  book,
  onReservationChange,
}: ReservationButtonProps) {
  const t = useTranslations("reservation");
  const { isAuthenticated, user } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  // Hide button completely if not authenticated
  if (!isAuthenticated || !book || !user) {
    return null;
  }

  // Only members can reserve
  if (user.role !== 'member') {
    return null;
  }

  // Tampilkan tombol jika stok habis ATAU user sudah punya reservasi (untuk pembatalan/cek status)
  const hasActiveReservation = !!book.user_reservation;
  if ((book.available_copies ?? 0) > 0 && !hasActiveReservation) {
    return null;
  }

  const [reservation, setReservation] = useState<Reservation | null>(
    book.user_reservation ?? null
  );
  const [loading, setLoading] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showDateDialog, setShowDateDialog] = useState(false);

  // Sync from book prop when it refreshes
  useEffect(() => {
    setReservation(book.user_reservation ?? null);
  }, [book.user_reservation]);

  // Only show when book is fully out of stock AND user has no active reservation
  // OR user already has an active reservation
  const isOutOfStock = (book.available_copies ?? 0) === 0 && !book.user_has_available_copy;
  const hasReservation = reservation !== null;

  // Don't show if book is available and user doesn't have a reservation
  if (!isOutOfStock && !hasReservation) {
    return null;
  }

  const handleReserveClick = () => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=${pathname}`);
      return;
    }
    setShowDateDialog(true);
  };

  const handleFinalReserve = async () => {
    setLoading(true);
    try {
      const res = await reservationService.reserve(book.id);
      setReservation(res.data.data);
      toast.success(t("reserveSuccess"));
      setShowDateDialog(false);
      onReservationChange?.();
    } catch (error: any) {
      toast.error(error.response?.data?.message || t("reserveError"));
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSuccess = () => {
    setReservation(null);
    onReservationChange?.();
  };

  // ── Already has a reservation ──────────────────────────────────────────────
  if (hasReservation) {
    const isNotified = reservation.status === "notified";

    return (
      <>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setShowCancelDialog(true)}
            className="gap-1.5 h-9"
          >
            <X className="h-3.5 w-3.5" />
            {t("cancelReservation") || "Cancel Reservation"}
          </Button>

        <CancelReservationDialog
          reservation={reservation}
          isOpen={showCancelDialog}
          onClose={() => setShowCancelDialog(false)}
          onSuccess={handleCancelSuccess}
        />
      </>
    );
  }

  // ── No reservation yet – show Reserve button ───────────────────────────────
  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={handleReserveClick}
        disabled={loading}
        className={cn(
          "gap-2 border-amber-500 text-amber-600 dark:text-amber-400",
          "hover:bg-amber-50 dark:hover:bg-amber-950/30",
          "hover:text-amber-700 dark:hover:text-amber-300"
        )}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <BookmarkPlus className="h-4 w-4" />
        )}
        {loading ? t("reserving") : t("reserveButton")}
      </Button>

      <ReservationDateDialog
        book={book}
        isOpen={showDateDialog}
        loading={loading}
        onClose={() => setShowDateDialog(false)}
        onSuccess={handleFinalReserve}
      />
    </>
  );
}
