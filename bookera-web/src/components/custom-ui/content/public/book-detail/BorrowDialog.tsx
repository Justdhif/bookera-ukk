"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker";
import { useState } from "react";
import { loanService } from "@/services/loan.service";
import { toast } from "sonner";
import { BookCopy } from "@/types/book-copy";
import { format } from "date-fns";

export default function BorrowDialog({
  copy,
  onClose,
}: {
  copy: BookCopy | null;
  onClose: () => void;
}) {
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [loading, setLoading] = useState(false);

  if (!copy) return null;

  const submit = async () => {
    if (!dueDate) {
      toast.error("Tanggal pengembalian wajib diisi");
      return;
    }

    try {
      setLoading(true);

      const formattedDate = format(dueDate, "yyyy-MM-dd");

      await loanService.create({
        book_copy_ids: [copy.id],
        due_date: formattedDate,
      });

      toast.success("Peminjaman berhasil diajukan!");
      setDueDate(undefined);
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Gagal melakukan peminjaman");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={!!copy} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Pinjam Buku</DialogTitle>
          <DialogDescription>
            Tentukan tanggal pengembalian untuk buku yang akan dipinjam
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-lg border p-3 bg-muted/30">
            <p className="text-sm text-muted-foreground mb-1">Kode Salinan</p>
            <p className="font-medium font-mono">{copy.copy_code}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="due_date">
              Tanggal Pengembalian <span className="text-red-500">*</span>
            </Label>
            <DatePicker
              value={dueDate}
              onChange={setDueDate}
              placeholder="Pilih tanggal pengembalian"
              dateMode="future"
            />
            <p className="text-xs text-muted-foreground">
              Pilih tanggal kapan Anda akan mengembalikan buku ini
            </p>
          </div>

          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={onClose} 
              className="flex-1"
              disabled={loading}
            >
              Batal
            </Button>
            <Button 
              onClick={submit} 
              className="flex-1" 
              disabled={loading || !dueDate}
              loading={loading}
            >
              {loading ? "Memproses..." : "Konfirmasi Peminjaman"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
