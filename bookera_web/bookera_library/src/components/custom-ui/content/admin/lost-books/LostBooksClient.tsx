"use client";
import { ITEMS_PER_PAGE_OPTIONS } from "@/constants/pagination";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import ContentHeader from "@/components/custom-ui/content/ContentHeader";
import { LostBook, LostBookFilterParams } from "@/types/lost-book";
import { lostBookService } from "@/services/lost-book.service";
import LostBooksTable from "./LostBooksTable";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import DeleteConfirmDialog from "@/components/custom-ui/modal/DeleteConfirmDialog";
import { Search, AlertCircle } from "lucide-react";
import DataLoading from "@/components/custom-ui/DataLoading";
import PaginatedContent from "@/components/custom-ui/PaginatedContent";

export default function LostBooksClient() {
  const t = useTranslations("lost-books");
  const [lostBooks, setLostBooks] = useState<LostBook[]>([]);
  const [loading, setLoading] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [filters, setFilters] = useState<LostBookFilterParams>({
    per_page: ITEMS_PER_PAGE_OPTIONS[1],
  });
  const [searchInput, setSearchInput] = useState("");
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    total: 0,
    from: 0,
    to: 0,
  });

  useEffect(() => {
    const timeout = setTimeout(() => {
      setFilters((prev) => ({
        ...prev,
        search: searchInput || undefined,
        page: 1,
      }));
    }, 500);
    return () => clearTimeout(timeout);
  }, [searchInput]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setSearchInput(e.target.value);

  const fetchLostBooks = async (activeFilters: LostBookFilterParams) => {
    setLoading(true);
    try {
      const res = await lostBookService.getAll(activeFilters);
      const paginatedData = res.data.data;
      setLostBooks(paginatedData.data ?? paginatedData);
      setPagination({
        current_page: paginatedData.current_page,
        last_page: paginatedData.last_page,
        total: paginatedData.total,
        from: paginatedData.from,
        to: paginatedData.to,
      });
    } catch (error) {
      toast.error(t("loadError"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLostBooks(filters);
  }, [filters]);

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await lostBookService.delete(deleteId);
      toast.success(t("deleteSuccess"));
      setDeleteId(null);
      fetchLostBooks(filters);
    } catch (error: any) {
      toast.error(t("deleteError"));
    }
  };

  const handleFinish = async (id: number) => {
    setActionLoading(id);
    try {
      await lostBookService.finish(id);
      toast.success(t("completeSuccess"));
      fetchLostBooks(filters);
    } catch (error: any) {
      toast.error(t("completeError"));
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      <ContentHeader
        title={t("title")}
        description={t("description")}
        isAdmin
      />

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("searchPlaceholder")}
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
          <div className="flex justify-center py-12">
            <DataLoading variant="inline" size="lg" />
          </div>
        ) : (
          <LostBooksTable
            data={lostBooks}
            onDelete={(id) => setDeleteId(id)}
            onFinish={handleFinish}
            actionLoading={actionLoading}
          />
        )}
      </PaginatedContent>

      <DeleteConfirmDialog
        open={deleteId !== null}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title={t("deleteLostBookRecord")}
        description={t("deleteLostDesc")}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
