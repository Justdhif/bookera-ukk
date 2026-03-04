"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { borrowService } from "@/services/borrow.service";
import { borrowRequestService } from "@/services/borrow-request.service";
import { Borrow } from "@/types/borrow";
import { BorrowRequest } from "@/types/borrow-request";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Package, Search, ClipboardList } from "lucide-react";
import EmptyState from "@/components/custom-ui/EmptyState";
import { Input } from "@/components/ui/input";
import { BorrowCard } from "./BorrowCard";
import { BorrowSkeletonCard } from "./BorrowSkeletonCard";
import { BorrowRequestCard } from "./BorrowRequestCard";
import { BorrowRequestSkeletonCard } from "./BorrowRequestSkeletonCard";
import DeleteConfirmDialog from "@/components/custom-ui/DeleteConfirmDialog";

export default function BorrowClient() {
  const router = useRouter();

  const [allBorrows, setAllBorrows] = useState<Borrow[]>([]);
  const [loadingBorrows, setLoadingBorrows] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [requests, setRequests] = useState<BorrowRequest[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [requestSearchQuery, setRequestSearchQuery] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);

  useEffect(() => {
    fetchBorrows();
    fetchRequests();
  }, []);

  const fetchBorrows = async (query?: string) => {
    setLoadingBorrows(true);
    try {
      const response = await borrowService.getAll(query ?? searchQuery);
      setAllBorrows(response.data.data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to load borrows");
    } finally {
      setLoadingBorrows(false);
    }
  };

  const fetchRequests = async (query?: string) => {
    setLoadingRequests(true);
    try {
      const response = await borrowRequestService.getAll(
        query ?? requestSearchQuery,
      );
      setRequests(response.data.data);
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to load borrow requests",
      );
    } finally {
      setLoadingRequests(false);
    }
  };

  const handleBorrowSearch = () => fetchBorrows(searchQuery);
  const handleRequestSearch = () => fetchRequests(requestSearchQuery);

  const handleDeleteRequest = (id: number) => setDeleteId(id);

  const confirmDeleteRequest = async () => {
    if (!deleteId) return;
    try {
      await borrowRequestService.destroy(deleteId);
      toast.success("Request deleted successfully");
      setDeleteId(null);
      fetchRequests();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete request");
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
          <TabsTrigger value="closed">
            Closed ({closedBorrows.length})
          </TabsTrigger>
          <TabsTrigger value="requests" className="flex items-center gap-1">
            <ClipboardList className="h-3.5 w-3.5" />
            Requests ({requests.length})
          </TabsTrigger>
        </TabsList>

        {[
          {
            value: "all",
            label: "All Borrows",
            desc: "View and manage all borrow transactions",
            data: allBorrows,
          },
          {
            value: "open",
            label: "Open",
            desc: "Currently active borrows",
            data: openBorrows,
          },
          {
            value: "closed",
            label: "Closed",
            desc: "Completed borrows",
            data: closedBorrows,
          },
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

        <TabsContent value="requests" className="space-y-4">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold">Borrow Requests</h3>
              <p className="text-sm text-muted-foreground">
                Borrow requests from members
              </p>
            </div>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or book title..."
                  value={requestSearchQuery}
                  onChange={(e) => setRequestSearchQuery(e.target.value)}
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
                {Array.from({ length: 3 }).map((_, i) => (
                  <BorrowRequestSkeletonCard key={i} />
                ))}
              </div>
            ) : requests.length === 0 ? (
              <EmptyState
                icon={<ClipboardList className="h-16 w-16" />}
                title="No Requests"
                description="No borrow requests from members yet"
              />
            ) : (
              <div className="space-y-4">
                {requests.map((req) => (
                  <BorrowRequestCard
                    key={req.id}
                    req={req}
                    onDelete={handleDeleteRequest}
                  />
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <DeleteConfirmDialog
        open={deleteId !== null}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete Borrow Request"
        description="Are you sure you want to delete this borrow request? This action cannot be undone."
        onConfirm={confirmDeleteRequest}
      />
    </div>
  );
}
