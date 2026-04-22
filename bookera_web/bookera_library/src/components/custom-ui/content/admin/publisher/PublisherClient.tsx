"use client";
import { ITEMS_PER_PAGE_OPTIONS } from "@/constants/pagination";
import { useEffect, useState } from "react";
import ContentHeader from "@/components/custom-ui/content/ContentHeader";
import { Publisher, PublisherFilterParams } from "@/types/publisher";
import { publisherService } from "@/services/publisher.service";
import PublisherTable from "./PublisherTable";
import PublisherFormDialog from "./PublisherFormDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import DeleteConfirmDialog from "@/components/custom-ui/modal/DeleteConfirmDialog";
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
import DataLoading from "@/components/custom-ui/DataLoading";
export default function PublisherClient() {
  const t = useTranslations("publisher");
  const [publishers, setPublishers] = useState<Publisher[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<PublisherFilterParams>({
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
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const fetchPublishers = async (activeFilters: PublisherFilterParams) => {
    setLoading(true);
    try {
      const res = await publisherService.getAll(activeFilters);
      const paginatedData = res.data.data;
      setPublishers(paginatedData.data ?? []);
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

  const handleEdit = (publisher: Publisher) => {
    setSelectedPublisher(publisher);
    setAddOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await publisherService.delete(deleteId);
      toast.success(t("deleteSuccess"));
      setDeleteId(null);
      fetchPublishers(filters);
    } catch (err: any) {
      toast.error(err.response?.data?.message || t("deleteError"));
    }
  };

  return (
    <div className="space-y-6">
      <ContentHeader
        title={t("title")}
        description={t("description")}
        isAdmin
        rightActions={
          <Button
            onClick={() => {
              setSelectedPublisher(null);
              setAddOpen(true);
            }}
            variant="submit"
            className="h-8 gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            {t("addPublisher")}
          </Button>
        }
      />
      <div className="flex flex-col sm:flex-row items-center gap-3 mb-6">
        <div className="relative flex-2 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("searchPublishers")}
            value={searchInput}
            onChange={handleSearchChange}
            className="pl-9 h-11! w-full shadow-sm transition-all duration-300"
          />
        </div>
        <Select value={statusValue} onValueChange={handleStatusChange}>
          <SelectTrigger className="flex-1 w-full sm:w-auto h-11! shadow-sm transition-all duration-300">
            <SelectValue placeholder={t("allStatus")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("allStatus")}</SelectItem>
            <SelectItem value="active">{t("active")}</SelectItem>
            <SelectItem value="inactive">{t("inactive")}</SelectItem>
          </SelectContent>
        </Select>
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
        ) : (
          <PublisherTable
            data={publishers}
            onEdit={handleEdit}
            onDelete={(id) => setDeleteId(id)}
          />
        )}
      </PaginatedContent>
      <PublisherFormDialog
        open={addOpen}
        setOpen={setAddOpen}
        publisher={selectedPublisher}
        onSuccess={() => fetchPublishers(filters)}
      />

      <DeleteConfirmDialog
        open={deleteId !== null}
        onOpenChange={() => setDeleteId(null)}
        title={t("deletePublisher")}
        description={t("deletePublisherConfirm")}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
