import { useState } from "react";
import { Loan } from "@/types/loan";
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

interface LoanRejectDialogProps {
  open: boolean;
  loan: Loan | null;
  onOpenChange: (open: boolean) => void;
  onConfirm: (reason: string) => void;
}

export function LoanRejectDialog({
  open,
  loan,
  onOpenChange,
  onConfirm,
}: LoanRejectDialogProps) {
  const [rejectionReason, setRejectionReason] = useState("");

  const handleConfirm = () => {
    onConfirm(rejectionReason);
    setRejectionReason("");
  };

  const handleCancel = () => {
    onOpenChange(false);
    setRejectionReason("");
  };

  const handleReasonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setRejectionReason(e.target.value);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Reject Loan</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to reject loan #{loan?.id} from{" "}
            {loan?.user?.email}?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="space-y-2">
          <Label htmlFor="rejection-reason">Rejection Reason (Optional)</Label>
          <Textarea
            id="rejection-reason"
            placeholder="Enter rejection reason..."
            value={rejectionReason}
            onChange={handleReasonChange}
            rows={4}
          />
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Reject Loan
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
