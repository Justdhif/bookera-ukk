"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { borrowRequestService } from "@/services/borrow-request.service";
import { BorrowRequest } from "@/types/borrow-request";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Search,
  ClipboardList,
  User,
  Calendar,
  BookOpen,
  ArrowRight,
  Trash2,
  Loader2,
} from "lucide-react";
import EmptyState from "@/components/custom-ui/EmptyState";
import { format } from "date-fns";

export default function BorrowRequestClient() {
  const router = useRouter();
  const [requests, setRequests] = useState<BorrowRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await borrowRequestService.getAll(searchQuery);
      setRequests(res.data.data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Gagal memuat permintaan peminjaman");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchRequests();
  };

  const handleDelete = async (id: number) => {
    setDeletingId(id);
    try {
      await borrowRequestService.destroy(id);
      toast.success("Permintaan berhasil dihapus");
      fetchRequests();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Gagal menghapus permintaan");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Borrow Requests</h1>
          <p className="text-muted-foreground">
            Daftar permintaan peminjaman dari member
          </p>
        </div>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari berdasarkan kode, nama, atau judul buku..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="pl-9"
          />
        </div>
        <Button onClick={handleSearch} variant="outline">
          <Search className="h-4 w-4" />
        </Button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      ) : requests.length === 0 ? (
        <EmptyState
          icon={<ClipboardList className="h-16 w-16" />}
          title="Tidak Ada Permintaan"
          description="Belum ada permintaan peminjaman dari member"
        />
      ) : (
        <div className="space-y-4">
          {requests.map((req) => (
            <Card key={req.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className="font-mono text-sm">
                        {req.request_code}
                      </Badge>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <User className="h-3.5 w-3.5" />
                        <span>
                          {req.user?.profile?.full_name || req.user?.email}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>
                          Pinjam:{" "}
                          {format(new Date(req.borrow_date), "dd MMM yyyy")}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>
                          Kembali:{" "}
                          {format(new Date(req.return_date), "dd MMM yyyy")}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-start gap-1.5 text-sm">
                      <BookOpen className="h-3.5 w-3.5 mt-0.5 text-muted-foreground shrink-0" />
                      <span className="text-muted-foreground">
                        {req.borrow_request_details
                          ?.map((d) => d.book?.title)
                          .join(", ") || "-"}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2 shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDelete(req.id)}
                      disabled={deletingId === req.id}
                    >
                      {deletingId === req.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      size="sm"
                      onClick={() =>
                        router.push(
                          `/admin/borrow-requests/${req.request_code}`
                        )
                      }
                    >
                      Detail
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
