"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { PackageCheck, Search } from "lucide-react";
import ContentHeader from "@/components/custom-ui/content/ContentHeader";
import EmptyState from "@/components/custom-ui/EmptyState";
import PaginatedContent from "@/components/custom-ui/PaginatedContent";
import DataLoading from "@/components/custom-ui/DataLoading";
import { Input } from "@/components/ui/input";
import { borrowService } from "@/services/borrow.service";
import { Borrow, BorrowFilterParams } from "@/types/borrow";
import { ITEMS_PER_PAGE_OPTIONS } from "@/constants/pagination";
import { toast } from "sonner";
import { ReturnCard } from "./ReturnCard";

export default function ReturnClient() {
  const t = useTranslations("return");
  const [allBorrows, setAllBorrows] = useState<Borrow[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<BorrowFilterParams>({
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

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
  };

  const fetchAllData = async (activeFilters: BorrowFilterParams) => {
    setLoading(true);

    try {
      const borrowsRes = await borrowService.getAll(activeFilters);
      const paginatedData = borrowsRes.data.data;
      const allData: Borrow[] = paginatedData.data ?? paginatedData;
      const filteredBorrows = allData.filter(
        (borrow) => (borrow.book_returns?.length ?? 0) > 0,
      );

      setAllBorrows(filteredBorrows);
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
    fetchAllData(filters);
  }, [filters]);

  const renderBorrowCards = (borrows: Borrow[]) => {
    if (borrows.length === 0) {
      return (
        <EmptyState
          icon={<PackageCheck />}
          title={t("noReturns")}
          description={t("noReturnsDesc")}
        />
      );
    }

    return (
      <div className="grid gap-4">
        {borrows.map((borrow) => (
          <ReturnCard key={borrow.id} borrow={borrow} />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <ContentHeader
        title={t("managementTitle")}
        description={t("managementDesc")}
        isAdmin
      />

      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">{t("title")}</h3>
          <p className="text-sm text-muted-foreground">{t("returnedDesc")}</p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 mb-6">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t("searchByUserOrTitle")}
              value={searchInput}
              onChange={handleSearchChange}
              className="pl-10 h-11! w-full shadow-sm transition-all duration-300"
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
            <div className="grid gap-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <DataLoading key={index} size="lg" />
              ))}
            </div>
          ) : (
            renderBorrowCards(allBorrows)
          )}
        </PaginatedContent>
      </div>
    </div>
  );
}
