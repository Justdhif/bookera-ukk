"use client";

import { useState } from "react";
import { lostBookService } from "@/services/lost-book.service";
import { Loan } from "@/types/loan";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertCircle, Loader2 } from "lucide-react";

interface ReportLostDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  loan: Loan | null;
  onSuccess: () => void;
}

export function ReportLostDialog({
  open,
  onOpenChange,
  loan,
  onSuccess,
}: ReportLostDialogProps) {
  const [loading, setLoading] = useState(false);
  const [bookCopyId, setBookCopyId] = useState<number | null>(null);
  const [estimatedLostDate, setEstimatedLostDate] = useState<Date | undefined>(
    undefined
  );
  const [notes, setNotes] = useState("");

  const handleSubmit = async () => {
    if (!loan || !bookCopyId) {
      toast.error("Pilih buku yang hilang");
      return;
    }

    setLoading(true);
    try {
      const response = await lostBookService.report(loan.id, {
        book_copy_id: bookCopyId,
        estimated_lost_date: estimatedLostDate
          ? estimatedLostDate.toISOString().split("T")[0]
          : undefined,
        notes: notes || undefined,
      });

      toast.success(
        response.data.message ||
          "Laporan kehilangan buku berhasil dibuat. Denda akan diproses oleh admin."
      );
      onOpenChange(false);
      setBookCopyId(null);
      setEstimatedLostDate(undefined);
      setNotes("");
      onSuccess();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Gagal melaporkan kehilangan buku"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            Laporkan Kehilangan Buku
          </DialogTitle>
          <DialogDescription>
            Laporkan buku yang hilang atau tidak dapat dikembalikan. Denda akan
            otomatis dibuat sesuai dengan ketentuan yang berlaku.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Book Selection */}
          <div className="space-y-2">
            <Label htmlFor="book-copy">
              Buku yang Hilang <span className="text-destructive">*</span>
            </Label>
            <Select
              value={bookCopyId?.toString() || ""}
              onValueChange={(value) => setBookCopyId(parseInt(value))}
            >
              <SelectTrigger id="book-copy">
                <SelectValue placeholder="Pilih buku yang hilang" />
              </SelectTrigger>
              <SelectContent>
                {loan?.loan_details.map((detail) => (
                  <SelectItem
                    key={detail.id}
                    value={detail.book_copy_id.toString()}
                  >
                    <div className="flex flex-col">
                      <span className="font-medium">
                        {detail.book_copy.book.title}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Kode: {detail.book_copy.copy_code}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Estimated Lost Date */}
          <div className="space-y-2">
            <Label htmlFor="lost-date">
              Perkiraan Tanggal Hilang (Opsional)
            </Label>
            <DatePicker
              value={estimatedLostDate}
              onChange={setEstimatedLostDate}
              placeholder="Pilih tanggal perkiraan hilang"
              dateMode="past"
            />
            <p className="text-xs text-muted-foreground">
              Tanggal perkiraan kapan buku hilang (jika diketahui)
            </p>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Catatan (Opsional)</Label>
            <Textarea
              id="notes"
              placeholder="Jelaskan kronologi atau detail kehilangan buku..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
            />
            <p className="text-xs text-muted-foreground">
              Anda dapat menjelaskan kronologi atau detail terkait kehilangan
              buku
            </p>
          </div>

          {/* Warning */}
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
            <div className="flex gap-3">
              <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-destructive">
                  Peringatan Penting
                </p>
                <p className="text-sm text-muted-foreground">
                  Dengan melaporkan buku hilang, Anda akan dikenakan denda
                  sesuai dengan ketentuan perpustakaan. Denda harus dibayarkan
                  sebelum dapat melakukan peminjaman selanjutnya.
                </p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false);
              setBookCopyId(null);
              setEstimatedLostDate(undefined);
              setNotes("");
            }}
            disabled={loading}
          >
            Batal
          </Button>
          <Button
            variant="destructive"
            onClick={handleSubmit}
            disabled={loading || !bookCopyId}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Memproses...
              </>
            ) : (
              "Laporkan Kehilangan"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
