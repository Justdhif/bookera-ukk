"use client";
import { useRouter } from "next/navigation";

import { useState, useEffect } from "react";
import { borrowService } from "@/services/borrow.service";
import { borrowRequestService } from "@/services/borrow-request.service";
import { Borrow } from "@/types/borrow";
import { BorrowRequest } from "@/types/borrow-request";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Package, Search, ClipboardList, BookOpen, Calendar, User, ArrowRight, Trash2, Loader2 } from "lucide-react";
import EmptyState from "@/components/custom-ui/EmptyState";
import { Input } from "@/components/ui/input";
import { BorrowCard } from "./BorrowCard";
import { BorrowSkeletonCard } from "./BorrowSkeletonCard";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

export default function BorrowClient() {
  const router = useRouter();

  // Borrows state
  const [allBorrows, setAllBorrows] = useState<Borrow[]>([]);
  const [loadingBorrows, setLoadingBorrows] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Requests state
  const [requests, setRequests] = useState<BorrowRequest[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [requestSearch, setRequestSearch] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    fetchBorrows();
    fetchRequests();
  }, []);

  const fetchBorrows = async (query?: string) => {
    setLoadingBorrows(true);
    try {
      const allRes = await borrowService.getAll(query ?? searchQuery);
      setAllBorrows(allRes.data.data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to load borrows");
    } finally {
      setLoadingBorrows(false);
    }
  };

  const fetchRequests = async (query?: string) => {
    setLoadingRequests(true);
    try {
      const res = await borrowRequestService.getAll(query ?? requestSearch);
      setRequests(res.data.data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Gagal memuat permintaan peminjaman");
    } finally {
      setLoadingRequests(false);
    }
  };

  const handleBorrowSearch = () => fetchBorrows(searchQuery);
  const handleRequestSearch = () => fetchRequests(requestSearch);

  const handleDeleteRequest = async (id: number) => {
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

  const renderBorrowCards = (borrows: Borrow[]) => {
    if (borrows.length === 0) {
      return (
        <EmptyState
          icon={<Package className="h-16 w-16" />}
          title="No Borrows Found"
          description="There are no borrows to display at the moment."
        />
      );
    }
    return (
      <div className="grid gap-4">
        {borrows.map((borrow) => (
          <BorrowCard key={borrow.id} borrow={borrow} />
        ))}
      </div>
    );
  };

  const openBorrows = allBorrows.filter((b) => b.status === "open");
  const closedBorrows = allBorrows.filter((b) => b.status === "close");

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
        <div>
          <h1 className="text-3xl font-bold">Borrow Management</h1>
          <p className="text-muted-foreground">
            Manage and track borrowing activities
          </p>
        </div>
        <Button
          onClick={() => router.push("/admin/borrows/create")}
          variant="brand"
        >
          <Plus className="h-4 w-4" />
          Create Borrow
        </Button>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All ({allBorrows.length})</TabsTrigger>
          <TabsTrigger value="open">Open ({openBorrows.length})</TabsTrigger>
          <TabsTrigger value="closed">Closed ({closedBorrows.length})</TabsTrigger>
          <TabsTrigger value="requests" className="flex items-center gap-1">
            <ClipboardList className="h-3.5 w-3.5" />
            Requests ({requests.length})
          </TabsTrigger>
        </TabsList>

        {/* Borrow tabs */}
        {[
          { value: "all", label: "All Borrows", desc: "View and manage all borrow transactions", data: allBorrows },
          { value: "open", label: "Open", desc: "Currently active borrows", data: openBorrows },
          { value: "closed", label: "Closed", desc: "Completed borrows", data: closedBorrows },
        ].map(({ value, label, desc, data }) => (
          <TabsContent key={value} value={value} className="space-y-4">
            <div className="space-y-4">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by user or title..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleBorrowSearch()}
                    className="pl-10"
                  />
                </div>
                <Button onClick={handleBorrowSearch} variant="secondary">
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
              </div>
              <div>
                <h3 className="text-lg font-semibold">{label}</h3>
                <p className="text-sm text-muted-foreground">{desc}</p>
              </div>
              {loadingBorrows ? (
                <div className="grid gap-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <BorrowSkeletonCard key={i} />
                  ))}
                </div>
              ) : (
                renderBorrowCards(data)
              )}
            </div>
          </TabsContent>
        ))}

        {/* Requests tab */}
        <TabsContent value="requests" className="space-y-4">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold">Borrow Requests</h3>
              <p className="text-sm text-muted-foreground">Permintaan peminjaman dari member</p>
            </div>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari berdasarkan kode, nama, atau judul buku..."
                  value={requestSearch}
                  onChange={(e) => setRequestSearch(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleRequestSearch()}
                  className="pl-9"
                />
              </div>
              <Button onClick={handleRequestSearch} variant="secondary">
                <Search className="h-4 w-4" />
              </Button>
            </div>

            {loadingRequests ? (
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
                              <span>{req.user?.profile?.full_name || req.user?.email}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5" />
                              <span>Pinjam: {format(new Date(req.borrow_date), "dd MMM yyyy")}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5" />
                              <span>Kembali: {format(new Date(req.return_date), "dd MMM yyyy")}</span>
                            </div>
                          </div>
                          <div className="flex items-start gap-1.5 text-sm">
                            <BookOpen className="h-3.5 w-3.5 mt-0.5 text-muted-foreground shrink-0" />
                            <span className="text-muted-foreground">
                              {req.borrow_request_details?.map((d) => d.book?.title).join(", ") || "-"}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleDeleteRequest(req.id)}
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
                            onClick={() => router.push(`/admin/borrow-requests/${req.request_code}`)}
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
        </TabsContent>
      </Tabs>
    </div>
  );
}
