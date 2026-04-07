"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ContentHeader from "@/components/custom-ui/content/ContentHeader";
import { borrowRequestService } from "@/services/borrow-request.service";
import { BorrowRequest } from "@/types/borrow-request";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { ClipboardList, Search } from "lucide-react";
import EmptyState from "@/components/custom-ui/EmptyState";
import DeleteConfirmDialog from "@/components/custom-ui/modal/DeleteConfirmDialog";
import PaginatedContent from "@/components/custom-ui/PaginatedContent";
import { Input } from "@/components/ui/input";
import BorrowRequestListItem from "./BorrowRequestListItem";
import DataLoading from "@/components/custom-ui/DataLoading";

export default function BorrowRequestClient() {
  const router = useRouter();
  const t = useTranslations("borrow-request");
  const [requests, setRequests] = useState<BorrowRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<{
    search?: string;
    per_page?: number;
    page?: number;
  }>({ per_page: 10 });
  const [searchInput, setSearchInput] = useState("");
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    total: 0,
    from: 0,
    to: 0,
  });
  const [deleteId, setDeleteId] = useState<number | null>(null);
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters((prev) => ({
        ...prev,
        search: searchInput || undefined,
        page: 1,
      }));
    }, 500);
    return () => clearTimeout(timer);
  }, [searchInput]);
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setSearchInput(e.target.value);
  const fetchRequests = async (activeFilters: {
    search?: string;
    per_page?: number;
    page?: number;
  }) => {
    setLoading(true);
    try {
      const res = await borrowRequestService.getAll(activeFilters);
      const paginatedData = res.data.data;
      setRequests(paginatedData.data ?? paginatedData);
      setPagination({
        current_page: paginatedData.current_page ?? 1,
        last_page: paginatedData.last_page ?? 1,
        total: paginatedData.total ?? 0,
        from: paginatedData.from ?? 0,
        to: paginatedData.to ?? 0,
      });
    } catch (error: any) {
      toast.error(error.response?.data?.message || t("loadError"));
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchRequests(filters);
  }, [filters]);

  const handleDelete = (id: number) => {
    setDeleteId(id);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await borrowRequestService.delete(deleteId);
      toast.success(t("deleteSuccess"));
      setDeleteId(null);
      fetchRequests(filters);
    } catch (error: any) {
      toast.error(error.response?.data?.message || t("deleteError"));
    }
  };
  return (
    <div className="space-y-6">
      <ContentHeader
        title={t("title")}
        description={t("description")}
        isAdmin
      />
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t("searchRequests")}
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
          <DataLoading size="lg" />
        ) : requests.length === 0 ? (
          <EmptyState
            icon={<ClipboardList />}
            title={t("noRequests")}
            description={t("noRequestsDesc")}
          />
        ) : (
          <div className="space-y-4">
            {requests.map((req) => (
              <BorrowRequestListItem
                key={req.id}
                request={req}
                onDelete={handleDelete}
                onOpenDetail={(requestId) =>
                  router.push(`/admin/borrow-requests/${requestId}`)
                }
              />
            ))}
          </div>
        )}
      </PaginatedContent>
      <DeleteConfirmDialog
        open={deleteId !== null}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title={t("deleteRequest")}
        description={t("deleteDesc")}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
