"use client";

import { useState, useEffect } from "react";
import { bookReturnService } from "@/services/book-return.service";
import { BookReturn } from "@/types/book-return";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PackageCheck, Search } from "lucide-react";
import EmptyState from "@/components/custom-ui/EmptyState";
import { Input } from "@/components/ui/input";
import { ReturnCard } from "./ReturnCard";
import { ReturnRejectDialog } from "./ReturnRejectDialog";
import { ReturnSkeletonCard } from "./ReturnSkeletonCard";

export default function ReturnClient() {
  const [allReturns, setAllReturns] = useState<BookReturn[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Dialog states
  const [rejectDialog, setRejectDialog] = useState<{
    open: boolean;
    bookReturn: BookReturn | null;
  }>({ open: false, bookReturn: null });

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const allRes = await bookReturnService.getAllReturns(searchQuery);
      setAllReturns(allRes.data.data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Gagal memuat data");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchAllData();
  };

  const handleApprove = async (returnId: number) => {
    setActionLoading(returnId);
    try {
      const response = await bookReturnService.approveReturn(returnId);
      toast.success(
        response.data.message || "Pengembalian berhasil di-approve",
      );
      fetchAllData();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Gagal approve pengembalian",
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectSubmit = async (rejectionReason: string) => {
    if (!rejectDialog.bookReturn) return;

    setActionLoading(rejectDialog.bookReturn.id);
    try {
      const response = await bookReturnService.rejectReturn(
        rejectDialog.bookReturn.id,
        {
          rejection_reason: rejectionReason,
        },
      );
      toast.success(response.data.message || "Pengembalian berhasil ditolak");
      setRejectDialog({ open: false, bookReturn: null });
      fetchAllData();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Gagal menolak pengembalian",
      );
    } finally {
      setActionLoading(null);
    }
  };

  const renderReturnCards = (returns: BookReturn[], showActions = true) => {
    if (returns.length === 0) {
      return (
        <EmptyState
          icon={<PackageCheck className="h-16 w-16" />}
          title="Belum ada pengembalian"
          description="Belum ada data pengembalian buku yang dapat ditampilkan"
        />
      );
    }

    return (
      <div className="grid gap-4">
        {returns.map((bookReturn) => (
          <ReturnCard
            key={bookReturn.id}
            bookReturn={bookReturn}
            showActions={showActions}
            actionLoading={actionLoading}
            onApprove={handleApprove}
            onReject={(bookReturn) =>
              setRejectDialog({ open: true, bookReturn })
            }
          />
        ))}
      </div>
    );
  };

  // Filter returns by approval_status
  const pendingReturns = allReturns.filter(
    (r) => r.approval_status === "pending",
  );
  const approvedReturns = allReturns.filter(
    (r) => r.approval_status === "approved",
  );
  const rejectedReturns = allReturns.filter(
    (r) => r.approval_status === "rejected",
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
        <div>
          <h1 className="text-3xl font-bold">Return Management</h1>
          <p className="text-muted-foreground">
            Kelola pengembalian buku dan approval
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari berdasarkan ID, nama peminjam, atau judul buku..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="pl-10"
          />
        </div>
        <Button onClick={handleSearch} variant="secondary">
          <Search className="h-4 w-4 mr-2" />
          Cari
        </Button>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">Semua ({allReturns.length})</TabsTrigger>
          <TabsTrigger value="pending">
            Pending ({pendingReturns.length})
          </TabsTrigger>
          <TabsTrigger value="approved">
            Approved ({approvedReturns.length})
          </TabsTrigger>
          <TabsTrigger value="rejected">
            Rejected ({rejectedReturns.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-bold">Semua Pengembalian</h2>
              <p className="text-muted-foreground">
                Daftar semua pengembalian buku
              </p>
            </div>
            {loading ? (
              <div className="grid gap-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <ReturnSkeletonCard key={i} />
                ))}
              </div>
            ) : (
              renderReturnCards(allReturns)
            )}
          </div>
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-bold">Pending</h2>
              <p className="text-muted-foreground">
                Pengembalian dengan status pending
              </p>
            </div>
            {loading ? (
              <div className="grid gap-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <ReturnSkeletonCard key={i} />
                ))}
              </div>
            ) : (
              renderReturnCards(pendingReturns)
            )}
          </div>
        </TabsContent>

        <TabsContent value="approved" className="space-y-4">
          <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-bold">Approved</h2>
              <p className="text-muted-foreground">
                Pengembalian yang sudah di-approve
              </p>
            </div>
            {loading ? (
              <div className="grid gap-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <ReturnSkeletonCard key={i} />
                ))}
              </div>
            ) : (
              renderReturnCards(approvedReturns, false)
            )}
          </div>
        </TabsContent>

        <TabsContent value="rejected" className="space-y-4">
          <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-bold">Rejected</h2>
              <p className="text-muted-foreground">Pengembalian yang ditolak</p>
            </div>
            {loading ? (
              <div className="grid gap-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <ReturnSkeletonCard key={i} />
                ))}
              </div>
            ) : (
              renderReturnCards(rejectedReturns, false)
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Reject Dialog */}
      <ReturnRejectDialog
        open={rejectDialog.open}
        bookReturn={rejectDialog.bookReturn}
        onOpenChange={(open) =>
          !open && setRejectDialog({ open: false, bookReturn: null })
        }
        onConfirm={handleRejectSubmit}
      />
    </div>
  );
}
