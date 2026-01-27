"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { loanService } from "@/services/loan.service";
import { toast } from "sonner";
import { BookCopy } from "@/types/book-copy";

export default function BorrowDialog({
  copy,
  onClose,
}: {
  copy: BookCopy | null;
  onClose: () => void;
}) {
  const [dueDate, setDueDate] = useState("");
  const [loading, setLoading] = useState(false);

  if (!copy) return null;

  const submit = async () => {
    if (!dueDate) {
      toast.error("Tanggal pengembalian wajib diisi");
      return;
    }

    try {
      setLoading(true);

      await loanService.create({
        book_copy_ids: [copy.id],
        due_date: dueDate,
      });

      toast.success("Peminjaman berhasil");
      onClose();
    } catch {
      toast.error("Gagal melakukan peminjaman");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={!!copy} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Pinjam Buku</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />

          <Button onClick={submit} className="w-full" disabled={loading}>
            {loading ? "Memproses..." : "Konfirmasi Peminjaman"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
