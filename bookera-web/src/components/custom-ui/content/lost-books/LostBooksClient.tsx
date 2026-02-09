"use client";

import { useEffect, useState } from "react";
import { LostBook } from "@/types/lost-book";
import { lostBookService } from "@/services/lost-book.service";
import LostBooksTable from "./LostBooksTable";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import DeleteConfirmDialog from "@/components/custom-ui/DeleteConfirmDialog";
import { Search, AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function LostBooksClient() {
  const [lostBooks, setLostBooks] = useState<LostBook[]>([]);
  const [loading, setLoading] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const confirmDelete = async () => {
    if (!deleteId) return;

    try {
      await lostBookService.delete(deleteId);
      toast.success("Data buku hilang berhasil dihapus");
      setDeleteId(null);
      fetchLostBooks();
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Gagal menghapus data buku hilang"
      );
    }
  };

  const fetchLostBooks = async () => {
    setLoading(true);
    try {
      const res = await lostBookService.getAll(searchQuery || undefined);
      setLostBooks(res.data.data);
    } catch (err) {
      toast.error("Gagal memuat data buku hilang");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLostBooks();
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchLostBooks();
    }, 300);
    return () => clearTimeout(timeout);
  }, [searchQuery]);

  const handleFinish = async (id: number) => {
    try {
      await lostBookService.finish(id);
      toast.success(
        "Proses buku hilang selesai. Status peminjaman diubah menjadi lost."
      );
      fetchLostBooks();
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Gagal menyelesaikan proses buku hilang"
      );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <AlertCircle className="h-8 w-8 text-destructive" />
            Buku Hilang
          </h1>
          <p className="text-muted-foreground">
            Kelola laporan buku yang hilang. Pastikan denda telah dibayarkan
            sebelum menyelesaikan proses.
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari buku hilang..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-4 border rounded">
              <Skeleton className="h-12 w-12 rounded" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-3/4" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <LostBooksTable
          data={lostBooks}
          onDelete={(id) => setDeleteId(id)}
          onFinish={handleFinish}
        />
      )}

      <DeleteConfirmDialog
        open={deleteId !== null}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Hapus Data Buku Hilang"
        description="Data buku hilang yang dihapus tidak dapat dikembalikan."
        onConfirm={confirmDelete}
      />
    </div>
  );
}
