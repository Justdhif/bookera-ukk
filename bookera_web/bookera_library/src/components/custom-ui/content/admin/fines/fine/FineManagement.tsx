"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { Fine, FineType, FineFilterParams } from "@/types/fine";
import { fineService, fineTypeService } from "@/services/fine.service";
import FineTable from "./FineTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import DeleteConfirmDialog from "@/components/custom-ui/modal/DeleteConfirmDialog";
import { FineTableSkeleton } from "./FineTableSkeleton";
import { Search } from "lucide-react";
import PaginatedContent from "@/components/custom-ui/PaginatedContent";

export default function FineManagement() {
  const t = useTranslations("fines");
  const [fines, setFines] = useState<Fine[]>([]);
  const [fineTypes, setFineTypes] = useState<FineType[]>([]);
  const [loading, setLoading] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [filters, setFilters] = useState<FineFilterParams>({ per_page: 10 });
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

  const statusValue = filters.status ?? "all";
  const handleStatusChange = (value: string) =>
    setFilters((prev) => ({
      ...prev,
      status: value === "all" ? undefined : value,
      page: 1,
    }));

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await fineService.delete(deleteId);
      toast.success("Fine deleted successfully");
      setDeleteId(null);
      fetchFines(filters);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to load fines");
    }
  };

  const fetchFines = async (activeFilters: FineFilterParams) => {
    setLoading(true);
    try {
      const res = await fineService.getAll(activeFilters);
      const paginatedData = res.data.data;
      setFines(paginatedData.data ?? paginatedData);
      setPagination({
        current_page: paginatedData.current_page ?? 1,
        last_page: paginatedData.last_page ?? 1,
        total: paginatedData.total ?? 0,
        from: paginatedData.from ?? 0,
        to: paginatedData.to ?? 0,
      });
    } catch (err) {
      toast.error("Failed to load fines");
    } finally {
      setLoading(false);
    }
  };

  const fetchFineTypes = async () => {
    try {
      const res = await fineTypeService.getAll();
      setFineTypes(res.data.data.data ?? res.data.data);
    } catch (err) {
      console.error("Failed to fetch fine types");
    }
  };

  useEffect(() => {
    fetchFineTypes();
  }, []);

  useEffect(() => {
    fetchFines(filters);
  }, [filters]);

  const handleWaive = async (id: number) => {
    try {
      await fineService.waive(id);
      toast.success("Fine cancelled successfully");
      fetchFines(filters);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to waive fine");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
        <div>
          <h2 className="text-2xl font-bold">{t("title")}</h2>
          <p className="text-muted-foreground">{t("finesTabDescription")}</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("searchFines")}
            value={searchInput}
            onChange={handleSearchChange}
            className="pl-9"
          />
        </div>
        <Select value={statusValue} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder={t("filterStatus")} />
          </SelectTrigger>{" "}
          <SelectContent>
            <SelectItem value="all">{t("allStatus")}</SelectItem>
            <SelectItem value="unpaid">{t("unpaid")}</SelectItem>
            <SelectItem value="paid">{t("paid")}</SelectItem>
            <SelectItem value="waived">{t("waived")}</SelectItem>
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
          <FineTableSkeleton />
        ) : (
          <FineTable data={fines} onDelete={(id) => setDeleteId(id)} />
        )}
      </PaginatedContent>

      <DeleteConfirmDialog
        open={deleteId !== null}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title={t("deleteFine")}
        description={t("deleteFineConfirm")}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
