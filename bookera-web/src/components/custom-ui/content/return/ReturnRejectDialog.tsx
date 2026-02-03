import { useState } from "react";
import { BookReturn } from "@/types/book-return";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface ReturnRejectDialogProps {
  open: boolean;
  bookReturn: BookReturn | null;
  onOpenChange: (open: boolean) => void;
  onConfirm: (reason: string) => void;
}

export function ReturnRejectDialog({
  open,
  bookReturn,
  onOpenChange,
  onConfirm,
}: ReturnRejectDialogProps) {
  const [rejectionReason, setRejectionReason] = useState("");

  const handleConfirm = () => {
    onConfirm(rejectionReason);
    setRejectionReason("");
  };

  const handleCancel = () => {
    onOpenChange(false);
    setRejectionReason("");
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Tolak Pengembalian</AlertDialogTitle>
          <AlertDialogDescription>
            Anda akan menolak pengembalian #{bookReturn?.id} dari{" "}
            {bookReturn?.loan?.user?.email}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="space-y-2">
          <Label htmlFor="rejection-reason">Alasan Penolakan (opsional)</Label>
          <Textarea
            id="rejection-reason"
            placeholder="Masukkan alasan penolakan..."
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            rows={4}
          />
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel}>Batal</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Tolak Pengembalian
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
