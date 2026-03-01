"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { borrowRequestService } from "@/services/borrow-request.service";
import { bookService } from "@/services/book.service";
import { BorrowRequest } from "@/types/borrow-request";
import { BookCopy } from "@/types/book-copy";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  User,
  QrCode,
  PackageCheck,
  Loader2,
  Trash2,
} from "lucide-react";
import { QrCodeImage } from "@/components/custom-ui/QrCodeImage";
import { format } from "date-fns";

interface BookCopyOption {
  bookId: number;
  bookTitle: string;
  copies: BookCopy[];
}

export default function AdminBorrowRequestDetailClient() {
  const router = useRouter();
  const params = useParams();
  const requestCode = params.requestCode as string;

  const [request, setRequest] = useState<BorrowRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Copy selection dialog state
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [copyOptions, setCopyOptions] = useState<BookCopyOption[]>([]);
  const [selectedCopyIds, setSelectedCopyIds] = useState<Record<number, number>>({});
  const [loadingCopies, setLoadingCopies] = useState(false);

  useEffect(() => {
    fetchRequest();
  }, [requestCode]);

  const fetchRequest = async () => {
    try {
      setLoading(true);
      const res = await borrowRequestService.showByCode(requestCode);
      setRequest(res.data.data);
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Gagal memuat detail permintaan"
      );
      router.push("/admin/borrows");
    } finally {
      setLoading(false);
    }
  };

  // Open dialog and fetch available copies for each requested book
  const openAssignDialog = async () => {
    if (!request) return;
    setLoadingCopies(true);
    setAssignDialogOpen(true);
    try {
      const options: BookCopyOption[] = [];
      for (const detail of request.borrow_request_details) {
        const res = await bookService.show(detail.book_id);
        const book = res.data.data;
        const available = (book.copies ?? []).filter((c: BookCopy) => c.status === "available");
        options.push({ bookId: detail.book_id, bookTitle: book.title, copies: available });
      }
      setCopyOptions(options);
      // Pre-select first available copy for each
      const preSelected: Record<number, number> = {};
      options.forEach((opt) => {
        if (opt.copies.length > 0) preSelected[opt.bookId] = opt.copies[0].id;
      });
      setSelectedCopyIds(preSelected);
    } catch (error: any) {
      toast.error("Gagal memuat salinan buku");
    } finally {
      setLoadingCopies(false);
    }
  };

  const handleAssign = async () => {
    if (!request) return;
    const copyIds = copyOptions.map((opt) => selectedCopyIds[opt.bookId]).filter(Boolean);
    if (copyIds.length !== (request.borrow_request_details?.length ?? 0)) {
      toast.error("Pilih salinan buku untuk setiap judul terlebih dahulu");
      return;
    }
    setAssigning(true);
    try {
      const res = await borrowRequestService.assignBorrow(request.id, copyIds);
      const borrow = res.data.data;
      toast.success("Peminjaman berhasil dibuat dari permintaan!");
      router.push(`/admin/borrows/${borrow.borrow_code}`);
    } catch (error: any) {
      toast.error(
        error.response?.data?.message ||
          "Gagal membuat peminjaman — pastikan ada salinan buku yang tersedia"
      );
    } finally {
      setAssigning(false);
      setAssignDialogOpen(false);
    }
  };

  const handleDelete = async () => {
    if (!request) return;
    setDeleting(true);
    try {
      await borrowRequestService.destroy(request.id);
      toast.success("Permintaan berhasil dihapus");
      router.push("/admin/borrows");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Gagal menghapus permintaan");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-8 w-8" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <Skeleton className="h-64" />
          <Skeleton className="lg:col-span-2 h-64" />
        </div>
      </div>
    );
  }

  if (!request) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/admin/borrows")}
            className="h-8 w-8"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Detail Permintaan</h1>
            <p className="text-muted-foreground">
              Informasi lengkap permintaan peminjaman
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="text-destructive hover:text-destructive"
            onClick={handleDelete}
            disabled={deleting || assigning}
          >
            {deleting ? (
              <Loader2 className="h-4 w-4 animate-spin mr-1" />
            ) : (
              <Trash2 className="h-4 w-4 mr-1" />
            )}
            Hapus Permintaan
          </Button>
          <Button onClick={openAssignDialog} disabled={assigning || deleting}>
            <PackageCheck className="h-4 w-4 mr-1" />
            Assign Borrow
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              QR Code Permintaan
            </CardTitle>
            <CardDescription>
              Scan untuk membuka detail permintaan ini
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <QrCodeImage
              url={request.qr_code_url}
              code={request.request_code}
              label="Request Code"
              size="lg"
            />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Informasi Permintaan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <h3 className="font-semibold flex items-center gap-2">
                <User className="h-4 w-4" />
                Peminjam
              </h3>
              <div className="rounded-lg border p-3 bg-muted/30 space-y-1">
                <p className="font-medium">
                  {request.user?.profile?.full_name || "-"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {request.user?.email}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Tanggal
              </h3>
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="rounded-lg border p-3 bg-muted/30">
                  <p className="text-xs text-muted-foreground mb-1">
                    Tanggal Pinjam
                  </p>
                  <p className="font-medium">
                    {format(new Date(request.borrow_date), "dd MMMM yyyy")}
                  </p>
                </div>
                <div className="rounded-lg border p-3 bg-muted/30">
                  <p className="text-xs text-muted-foreground mb-1">
                    Tanggal Kembali
                  </p>
                  <p className="font-medium">
                    {format(new Date(request.return_date), "dd MMMM yyyy")}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Buku yang Diminta ({request.borrow_request_details?.length || 0})
              </h3>
              <div className="space-y-2">
                {request.borrow_request_details?.map((detail) => (
                  <div
                    key={detail.id}
                    className="rounded-lg border p-3 bg-muted/30 flex items-center gap-3"
                  >
                    {detail.book?.cover_image_url ? (
                      <img
                        src={detail.book.cover_image_url}
                        alt={detail.book.title}
                        className="h-12 w-9 object-cover rounded"
                      />
                    ) : (
                      <div className="h-12 w-9 bg-muted rounded flex items-center justify-center">
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium">{detail.book?.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {detail.book?.author}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-dashed">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <PackageCheck className="h-5 w-5 mt-0.5 text-primary shrink-0" />
            <div>
              <p className="font-medium text-sm">Cara assign peminjaman</p>
              <p className="text-sm text-muted-foreground mt-1">
                Klik <strong>Assign Borrow</strong> untuk memilih salinan buku dan
                membuat peminjaman dari permintaan ini. Sistem akan membuat kode
                borrow baru dan QR code. Permintaan ini akan dihapus setelah
                peminjaman berhasil dibuat.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Copy selector dialog */}
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <PackageCheck className="h-5 w-5" />
              Pilih Salinan Buku
            </DialogTitle>
            <DialogDescription>
              Pilih salinan buku yang akan dipinjamkan untuk setiap judul.
            </DialogDescription>
          </DialogHeader>

          {loadingCopies ? (
            <div className="space-y-4 py-4">
              {[...Array(request.borrow_request_details?.length || 1)].map((_, i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : (
            <div className="space-y-4 py-2">
              {copyOptions.map((opt) => (
                <div key={opt.bookId} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-muted-foreground shrink-0" />
                    <p className="font-medium text-sm truncate">{opt.bookTitle}</p>
                  </div>
                  {opt.copies.length === 0 ? (
                    <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
                      Tidak ada salinan tersedia untuk buku ini
                    </div>
                  ) : (
                    <Select
                      value={String(selectedCopyIds[opt.bookId] ?? "")}
                      onValueChange={(val) =>
                        setSelectedCopyIds((prev) => ({ ...prev, [opt.bookId]: Number(val) }))
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Pilih salinan..." />
                      </SelectTrigger>
                      <SelectContent>
                        {opt.copies.map((copy) => (
                          <SelectItem key={copy.id} value={String(copy.id)}>
                            <span className="font-mono">{copy.copy_code}</span>
                            <span className="ml-2 text-xs text-muted-foreground capitalize">{copy.status}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              ))}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignDialogOpen(false)} disabled={assigning}>
              Batal
            </Button>
            <Button
              onClick={handleAssign}
              disabled={assigning || loadingCopies || copyOptions.some((o) => o.copies.length === 0)}
            >
              {assigning ? (
                <><Loader2 className="h-4 w-4 animate-spin mr-1" />Memproses...</>
              ) : (
                <><PackageCheck className="h-4 w-4 mr-1" />Konfirmasi Assign</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
