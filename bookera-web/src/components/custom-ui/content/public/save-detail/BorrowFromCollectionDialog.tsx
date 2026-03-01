"use client";

import { useState, useEffect } from "react";
import { borrowRequestService } from "@/services/borrow-request.service";
import { Book } from "@/types/book";
import { toast } from "sonner";
import { format } from "date-fns";
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
import { DatePicker } from "@/components/ui/date-picker";
import { BookPlus, Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface BorrowFromCollectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedBooks: Book[];
  onSuccess: () => void;
}

export function BorrowFromCollectionDialog({
  open,
  onOpenChange,
  selectedBooks,
  onSuccess,
}: BorrowFromCollectionDialogProps) {
  const [loading, setLoading] = useState(false);
  const [borrowDate, setBorrowDate] = useState<Date | undefined>(undefined);
  const [returnDate, setReturnDate] = useState<Date | undefined>(undefined);

  useEffect(() => {
    if (!open) {
      setBorrowDate(undefined);
      setReturnDate(undefined);
    }
  }, [open]);

  const handleSubmit = async () => {
    if (selectedBooks.length === 0) {
      toast.error("Tidak ada buku yang dipilih");
      return;
    }
    if (!borrowDate) {
      toast.error("Tanggal pinjam wajib diisi");
      return;
    }
    if (!returnDate) {
      toast.error("Tanggal kembali wajib diisi");
      return;
    }
    if (returnDate <= borrowDate) {
      toast.error("Tanggal kembali harus setelah tanggal pinjam");
      return;
    }

    setLoading(true);
    try {
      await borrowRequestService.create({
        book_ids: selectedBooks.map((b) => b.id),
        borrow_date: format(borrowDate, "yyyy-MM-dd"),
        return_date: format(returnDate, "yyyy-MM-dd"),
      });
      toast.success("Permintaan peminjaman berhasil dibuat!");
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Gagal membuat permintaan peminjaman"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto scrollbar-hide">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookPlus className="h-5 w-5" />
            {"Borrow Request"} - {selectedBooks.length} {"buku dipilih"}
          </DialogTitle>
          <DialogDescription>
            {"Set the borrow date and return date for your borrow request"}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[30vh] pr-4 border rounded-md">
          <div className="space-y-4 p-4">
            {selectedBooks.map((book) => (
              <div key={book.id} className="flex gap-3 items-center">
                {book.cover_image_url && (
                  <img
                    src={book.cover_image_url}
                    alt={book.title}
                    className="w-12 h-16 object-cover rounded shadow-sm shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold line-clamp-1 text-sm">{book.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {book.author}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label variant="required">{"Tanggal Pinjam"}</Label>
            <DatePicker
              value={borrowDate}
              onChange={setBorrowDate}
              placeholder={"Pilih tanggal pinjam"}
              dateMode="future"
            />
          </div>

          <div className="space-y-2">
            <Label variant="required">{"Tanggal Kembali"}</Label>
            <DatePicker
              value={returnDate}
              onChange={setReturnDate}
              placeholder={"Pilih tanggal kembali"}
              dateMode="future"
            />
            <p className="text-xs text-muted-foreground">
              {"Tanggal kembali harus setelah tanggal pinjam"}
            </p>
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            {"Batal"}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || selectedBooks.length === 0}
          >
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {loading ? "Memproses..." : "Kirim Permintaan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
