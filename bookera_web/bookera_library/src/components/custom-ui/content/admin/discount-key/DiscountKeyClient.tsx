"use client";

import { ITEMS_PER_PAGE_OPTIONS } from "@/constants/pagination";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import ContentHeader from "@/components/custom-ui/content/ContentHeader";
import { DiscountKey, DiscountKeyFilterParams } from "@/types/membership-discount";
import { discountKeyService } from "@/services/discount-key.service";
import DiscountKeyTable from "./DiscountKeyTable";
import DiscountKeyFormDialog from "./DiscountKeyFormDialog";
import { Button } from "@/components/ui/button";
import { Plus, Search, Key } from "lucide-react";
import { toast } from "sonner";
import { StaggerContainer, FadeUp, FadeIn } from "@/components/custom-ui/motion";
import DataLoading from "@/components/custom-ui/DataLoading";
import { Input } from "@/components/ui/input";
import PaginatedContent from "@/components/custom-ui/PaginatedContent";
import RefreshButton from "@/components/custom-ui/button/RefreshButton";
import DeleteConfirmDialog from "@/components/custom-ui/modal/DeleteConfirmDialog";

export default function DiscountKeyClient() {
  const t = useTranslations("discountKey");
  const tCommon = useTranslations("common");
  const [keys, setKeys] = useState<DiscountKey[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [filters, setFilters] = useState<DiscountKeyFilterParams>({
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

  const confirmDelete = async () => {
    if (!deleteId) {
      toast.error(tCommon("errorOccurred"));
      return;
    }
    try {
      await discountKeyService.delete(deleteId);
      toast.success(t("successDelete"));
      setDeleteId(null);
      fetchKeys(filters);
    } catch {
      toast.error(tCommon("errorOccurred"));
    }
  };

  const fetchKeys = async (activeFilters: DiscountKeyFilterParams) => {
    setLoading(true);
    try {
      const res = await discountKeyService.getAll(activeFilters);
      const paginatedData = res.data.data;
      setKeys(paginatedData.data);
      setPagination({
        current_page: paginatedData.current_page,
        last_page: paginatedData.last_page,
        total: paginatedData.total,
        from: paginatedData.from,
        to: paginatedData.to,
      });
    } catch (err) {
      toast.error(t("failedLoad"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKeys(filters);
  }, [filters]);

  return (
    <StaggerContainer className="space-y-6">
      <FadeUp>
        <ContentHeader
          title={t("title")}
          description={t("subtitle") || t("title")}
          isAdmin
          rightActions={
            <div className="flex items-center gap-2">
              <RefreshButton
                onClick={() => fetchKeys(filters)}
                loading={loading}
                label={tCommon("refresh")}
              />
              <Button
                onClick={() => {
                  setOpen(true);
                }}
                variant="submit"
                className="h-8 gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                {t("add")}
              </Button>
            </div>
          }
        />
      </FadeUp>

      <FadeUp delay={0.1}>
        <div className="flex flex-col sm:flex-row items-center gap-3 mb-6">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("searchPlaceholder") || t("search")}
              value={searchInput}
              onChange={handleSearchChange}
              className="pl-9 h-11! w-full shadow-sm transition-all duration-300"
            />
          </div>
        </div>
      </FadeUp>

      <FadeUp delay={0.2}>
        <PaginatedContent
          currentPage={pagination.current_page}
          lastPage={pagination.last_page}
          total={pagination.total}
          from={pagination.from}
          to={pagination.to}
          onPageChange={(page) => setFilters((prev) => ({ ...prev, page }))}
        >
          {loading ? (
            <FadeIn key="loading">
              <DataLoading size="lg" />
            </FadeIn>
          ) : (
            <FadeIn key="content">
              <DiscountKeyTable
                data={keys}
                onDelete={(id) => setDeleteId(id)}
              />
            </FadeIn>
          )}
        </PaginatedContent>
      </FadeUp>

      <DeleteConfirmDialog
        open={deleteId !== null}
        onOpenChange={() => setDeleteId(null)}
        title={t("delete")}
        description={t("deleteConfirm")}
        onConfirm={confirmDelete}
      />

      <DiscountKeyFormDialog
        open={open}
        setOpen={setOpen}
        onSuccess={() => fetchKeys(filters)}
      />
    </StaggerContainer>
  );
}
