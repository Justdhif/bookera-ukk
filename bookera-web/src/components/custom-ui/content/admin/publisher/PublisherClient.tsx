"use client";

import { useEffect, useState } from "react";
import { Publisher, PublisherFilterParams } from "@/types/publisher";
import { publisherService } from "@/services/publisher.service";
import PublisherTable from "./PublisherTable";
import PublisherFormDialog from "./publisher-add/PublisherFormDialog";
import PublisherDetailDialog from "./publisher-detail/PublisherDetailDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import DeleteConfirmDialog from "@/components/custom-ui/DeleteConfirmDialog";
import { PublisherTableSkeleton } from "./PublisherTableSkeleton";
import { Building2, Plus, Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import PaginatedContent from "@/components/custom-ui/PaginatedContent";
import { useTranslations } from "next-intl";

export default function PublisherClient() {
  const t = useTranslations("publisher");
  const [publishers, setPublishers] = useState<Publisher[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<PublisherFilterParams>({ per_page: 10 });
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

  const statusValue =
    filters.is_active === undefined
      ? "all"
      : filters.is_active
      ? "active"
      : "inactive";
  const handleStatusChange = (value: string) =>
    setFilters((prev) => ({
      ...prev,
      is_active: value === "all" ? undefined : value === "active",
      page: 1,
    }));

  const [addOpen, setAddOpen] = useState(false);
  const [selectedPublisher, setSelectedPublisher] = useState<Publisher | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const fetchPublishers = async (activeFilters: PublisherFilterParams) => {
    setLoading(true);
    try {
      const res = await publisherService.getAll(activeFilters, true);
      const paginatedData = res.data.data;
      setPublishers(paginatedData.data ?? paginatedData);
      setPagination({
        current_page: paginatedData.current_page ?? 1,
        last_page: paginatedData.last_page ?? 1,
        total: paginatedData.total ?? 0,
        from: paginatedData.from ?? 0,
        to: paginatedData.to ?? 0,
      });
    } catch {
      toast.error(t("loadError"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPublishers(filters);
  }, [filters]);

  const handleView = (publisher: Publisher) => {
    setSelectedPublisher(publisher);
    setDetailOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await publisherService.delete(deleteId);
      toast.success(t("deleteSuccess"));
      setDeleteId(null);
      fetchPublishers(filters);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete publisher");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-brand-primary rounded-lg">
            <Building2 className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">{t("title")}</h1>
            <p className="text-muted-foreground">{t("description")}</p>
          </div>
        </div>
        <Button
          onClick={() => setAddOpen(true)}
          variant="submit"
          className="h-8 gap-1"
        >
          <Plus className="w-3.5 h-3.5" />
          {t("addPublisher")}
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("searchPublishers")}
            value={searchInput}
            onChange={handleSearchChange}
            className="pl-9"
          />
        </div>
        <Select
          value={statusValue}
          onValueChange={handleStatusChange}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder={t("allStatus")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("allStatus")}</SelectItem>
            <SelectItem value="active">{t("active")}</SelectItem>
            <SelectItem value="inactive">{t("inactive")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <PaginatedContent
        currentPage={pagination.current_page}
        lastPage={pagination.last_page}
        total={pagination.total}
        from={pagination.from}
        to={pagination.to}
        onPageChange={(page) => setFilters((prev) => ({ ...prev, page }))}
      >
        {loading ? (
          <PublisherTableSkeleton />
        ) : (
          <PublisherTable
            data={publishers}
            onView={handleView}
            onDelete={(id) => setDeleteId(id)}
          />
        )}
      </PaginatedContent>

      {/* Dialogs */}
      <PublisherFormDialog
        open={addOpen}
        setOpen={setAddOpen}
        onSuccess={() => fetchPublishers(filters)}
      />

      <PublisherDetailDialog
        open={detailOpen}
        setOpen={setDetailOpen}
        publisher={selectedPublisher}
        onSuccess={() => fetchPublishers(filters)}
      />

      <DeleteConfirmDialog
        open={deleteId !== null}
        onOpenChange={() => setDeleteId(null)}
        title={t("deletePublisher")}
        description="Are you sure you want to delete this publisher? This action cannot be undone."
        onConfirm={confirmDelete}
      />
    </div>
  );
}
