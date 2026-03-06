"use client";

import { useEffect, useState } from "react";
import { LostBook } from "@/types/lost-book";
import { lostBookService, LostBookFilterParams } from "@/services/lost-book.service";
import LostBooksTable from "./LostBooksTable";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import DeleteConfirmDialog from "@/components/custom-ui/DeleteConfirmDialog";
import { Search, AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import PaginatedContent from "@/components/custom-ui/PaginatedContent";
export default function LostBooksClient() {
  const [lostBooks, setLostBooks] = useState<LostBook[]>([]);
  const [loading, setLoading] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [filters, setFilters] = useState<LostBookFilterParams>({ per_page: 10 });
  const [searchInput, setSearchInput] = useState("");
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0, from: 0, to: 0 });

  
  useEffect(() => {
    const timeout = setTimeout(() => {
      setFilters((prev) => ({ ...prev, search: searchInput || undefined, page: 1 }));
    }, 500);
    return () => clearTimeout(timeout);
  }, [searchInput]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setSearchInput(e.target.value);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const confirmDelete = async () => {
    if (!deleteId) return;

    try {
      await lostBookService.delete(deleteId);
      toast.success("Lost book record deleted successfully");
      setDeleteId(null);
      fetchLostBooks(filters);
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to delete lost book record",
      );
    }
  };

  const fetchLostBooks = async (activeFilters: LostBookFilterParams) => {
    setLoading(true);
    try {
      const res = await lostBookService.getAll(activeFilters);
      const paginatedData = res.data.data;
      setLostBooks(paginatedData.data ?? paginatedData);
      setPagination({
        current_page: paginatedData.current_page ?? 1,
        last_page: paginatedData.last_page ?? 1,
        total: paginatedData.total ?? 0,
        from: paginatedData.from ?? 0,
        to: paginatedData.to ?? 0,
      });
    } catch (error) {
      toast.error("Failed to load lost books");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLostBooks(filters);
  }, [filters]);

  const handleFinish = async (id: number) => {
    setActionLoading(id);
    try {
      await lostBookService.finish(id);
      toast.success("Lost book process completed successfully");
      fetchLostBooks(filters);
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to complete lost book process",
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleProcessFine = async (id: number) => {
    setActionLoading(id);
    try {
      const response = await lostBookService.processFine(id);
      toast.success(response.data.message || "Fine processed successfully");
      fetchLostBooks(filters);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to process fine");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <AlertCircle className="h-8 w-8 text-destructive" />
            {"Lost Books"}
          </h1>
          <p className="text-muted-foreground">
            {
              "Manage lost book reports. Make sure the fine has been paid before completing the process."
            }
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={"Search lost books..."}
            value={searchInput}
            onChange={handleSearchChange}
            className="pl-9"
          />
        </div>
      </div>

      <PaginatedContent
        currentPage={pagination.current_page}
        lastPage={pagination.last_page}
        total={pagination.total}
        from={pagination.from}
        to={pagination.to}
        onPageChange={(page) => setFilters((prev) => ({ ...prev, page }))}
      >
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
            onProcessFine={handleProcessFine}
            actionLoading={actionLoading}
          />
        )}
      </PaginatedContent>

      <DeleteConfirmDialog
        open={deleteId !== null}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title={"Delete Lost Book Record"}
        description={"Deleted lost book records cannot be recovered."}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
