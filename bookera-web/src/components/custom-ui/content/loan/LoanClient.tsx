"use client";

import { useState, useEffect } from "react";
import { loanService } from "@/services/loan.service";
import { Loan } from "@/types/loan";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Package, Search } from "lucide-react";
import { AdminBorrowDialog } from "./AdminBorrowDialog";
import EmptyState from "@/components/custom-ui/EmptyState";
import { Input } from "@/components/ui/input";
import { LoanCard } from "./LoanCard";
import { LoanRejectDialog } from "./LoanRejectDialog";
import { LoanSkeletonCard } from "./LoanSkeletonCard";

export default function LoanClient() {
  const [allLoans, setAllLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Dialog states
  const [borrowDialog, setBorrowDialog] = useState(false);
  const [rejectDialog, setRejectDialog] = useState<{
    open: boolean;
    loan: Loan | null;
  }>({ open: false, loan: null });

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const allRes = await loanService.getAll(searchQuery);
      setAllLoans(allRes.data.data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Gagal memuat data");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchAllData();
  };

  const handleApprove = async (loanId: number) => {
    setActionLoading(loanId);
    try {
      const response = await loanService.approveLoan(loanId);
      toast.success(response.data.message || "Peminjaman berhasil di-approve");
      fetchAllData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Gagal approve peminjaman");
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectSubmit = async (rejectionReason: string) => {
    if (!rejectDialog.loan) return;

    setActionLoading(rejectDialog.loan.id);
    try {
      const response = await loanService.rejectLoan(rejectDialog.loan.id, {
        rejection_reason: rejectionReason,
      });
      toast.success(response.data.message || "Peminjaman berhasil ditolak");
      setRejectDialog({ open: false, loan: null });
      fetchAllData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Gagal menolak peminjaman");
    } finally {
      setActionLoading(null);
    }
  };

  const handleMarkAsBorrowed = async (loanId: number) => {
    setActionLoading(loanId);
    try {
      const response = await loanService.markAsBorrowed(loanId);
      toast.success(
        response.data.message || "Status berhasil diubah ke borrowed",
      );
      fetchAllData();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Gagal mengubah status peminjaman",
      );
    } finally {
      setActionLoading(null);
    }
  };

  const renderLoanCards = (loans: Loan[], showActions = true) => {
    if (loans.length === 0) {
      return (
        <EmptyState
          icon={<Package className="h-16 w-16" />}
          title="Belum ada peminjaman"
          description="Belum ada data peminjaman buku yang dapat ditampilkan"
        />
      );
    }

    return (
      <div className="grid gap-4">
        {loans.map((loan) => (
          <LoanCard
            key={loan.id}
            loan={loan}
            showActions={showActions}
            actionLoading={actionLoading}
            onApprove={handleApprove}
            onReject={(loan) => setRejectDialog({ open: true, loan })}
            onMarkAsBorrowed={handleMarkAsBorrowed}
          />
        ))}
      </div>
    );
  };

  // Filter loans by status
  const pendingLoans = allLoans.filter((loan) => loan.status === "pending");
  const waitingLoans = allLoans.filter((loan) => loan.status === "waiting");
  const borrowedLoans = allLoans.filter((loan) => loan.status === "borrowed");
  const returnedLoans = allLoans.filter((loan) => loan.status === "returned");
  const rejectedLoans = allLoans.filter((loan) => loan.status === "rejected");
  const lateLoans = allLoans.filter((loan) => loan.status === "late");

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
        <div>
          <h1 className="text-3xl font-bold">Loan Management</h1>
          <p className="text-muted-foreground">
            Kelola peminjaman buku dan approval
          </p>
        </div>
        <Button onClick={() => setBorrowDialog(true)} variant="brand">
          <Plus className="h-4 w-4 mr-2" />
          Request Peminjaman
        </Button>
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
          <TabsTrigger value="all">Semua ({allLoans.length})</TabsTrigger>
          <TabsTrigger value="pending">
            Pending ({pendingLoans.length})
          </TabsTrigger>
          <TabsTrigger value="waiting">
            Waiting ({waitingLoans.length})
          </TabsTrigger>
          <TabsTrigger value="borrowed">
            Borrowed ({borrowedLoans.length})
          </TabsTrigger>
          <TabsTrigger value="returned">
            Returned ({returnedLoans.length})
          </TabsTrigger>
          <TabsTrigger value="rejected">
            Rejected ({rejectedLoans.length})
          </TabsTrigger>
          <TabsTrigger value="late">Late ({lateLoans.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold">Semua Peminjaman</h3>
              <p className="text-sm text-muted-foreground">
                Daftar semua peminjaman buku
              </p>
            </div>
            {loading ? (
              <div className="grid gap-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <LoanSkeletonCard key={i} />
                ))}
              </div>
            ) : (
              renderLoanCards(allLoans)
            )}
          </div>
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold">Pending</h3>
              <p className="text-sm text-muted-foreground">
                Peminjaman dengan status pending
              </p>
            </div>
            {loading ? (
              <div className="grid gap-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <LoanSkeletonCard key={i} />
                ))}
              </div>
            ) : (
              renderLoanCards(pendingLoans)
            )}
          </div>
        </TabsContent>

        <TabsContent value="waiting" className="space-y-4">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold">Waiting</h3>
              <p className="text-sm text-muted-foreground">
                Peminjaman dengan status waiting
              </p>
            </div>
            {loading ? (
              <div className="grid gap-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <LoanSkeletonCard key={i} />
                ))}
              </div>
            ) : (
              renderLoanCards(waitingLoans)
            )}
          </div>
        </TabsContent>

        <TabsContent value="borrowed" className="space-y-4">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold">Borrowed</h3>
              <p className="text-sm text-muted-foreground">
                Peminjaman dengan status borrowed (sedang dipinjam)
              </p>
            </div>
            {loading ? (
              <div className="grid gap-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <LoanSkeletonCard key={i} />
                ))}
              </div>
            ) : (
              renderLoanCards(borrowedLoans, false)
            )}
          </div>
        </TabsContent>

        <TabsContent value="returned" className="space-y-4">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold">Returned</h3>
              <p className="text-sm text-muted-foreground">
                Peminjaman yang sudah dikembalikan
              </p>
            </div>
            {loading ? (
              <div className="grid gap-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <LoanSkeletonCard key={i} />
                ))}
              </div>
            ) : (
              renderLoanCards(returnedLoans, false)
            )}
          </div>
        </TabsContent>

        <TabsContent value="rejected" className="space-y-4">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold">Rejected</h3>
              <p className="text-sm text-muted-foreground">
                Peminjaman yang ditolak
              </p>
            </div>
            {loading ? (
              <div className="grid gap-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <LoanSkeletonCard key={i} />
                ))}
              </div>
            ) : (
              renderLoanCards(rejectedLoans, false)
            )}
          </div>
        </TabsContent>

        <TabsContent value="late" className="space-y-4">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold">Late</h3>
              <p className="text-sm text-muted-foreground">
                Peminjaman yang terlambat dikembalikan
              </p>
            </div>
            {loading ? (
              <div className="grid gap-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <LoanSkeletonCard key={i} />
                ))}
              </div>
            ) : (
              renderLoanCards(lateLoans, false)
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Borrow Dialog */}
      <AdminBorrowDialog
        open={borrowDialog}
        onOpenChange={setBorrowDialog}
        onSuccess={fetchAllData}
      />

      {/* Reject Dialog */}
      <LoanRejectDialog
        open={rejectDialog.open}
        loan={rejectDialog.loan}
        onOpenChange={(open) => {
          if (!open) setRejectDialog({ open: false, loan: null });
        }}
        onConfirm={handleRejectSubmit}
      />
    </div>
  );
}
