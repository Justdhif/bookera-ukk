"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import ContentHeader from "@/components/custom-ui/content/ContentHeader";
import { fineService } from "@/services/fine.service";
import { FineBorrowGroup, FineFilterParams } from "@/types/fine";
import EmptyState from "@/components/custom-ui/EmptyState";
import { DollarSign, Search } from "lucide-react";
import DataLoading from "@/components/custom-ui/DataLoading";
import {
  StaggerContainer,
  FadeUp,
  FadeIn,
} from "@/components/custom-ui/motion";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import MyFineCard from "./MyFineCard";
import PaginatedContent from "@/components/custom-ui/PaginatedContent";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import DateRangeFilter from "@/components/custom-ui/DateRangeFilter";
import { getCurrentMonthRange } from "@/lib/month-range";

export default function MyFinesClient() {
  const router = useRouter();
  const t = useTranslations("public");
  const tFines = useTranslations("fines");
  const tProfile = useTranslations("profile");
  const defaultMonthRange = getCurrentMonthRange();
  
  const [fineGroups, setFineGroups] = useState<FineBorrowGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState("");
  const [filters, setFilters] = useState<FineFilterParams>({
    per_page: 10,
    page: 1,
  });
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

  const handleDateFilter = (start_date?: string, end_date?: string) =>
    setFilters((prev) => ({
      ...prev,
      start_date,
      end_date,
      page: 1,
    }));

  const fetchFines = async (activeFilters: FineFilterParams) => {
    setLoading(true);
    try {
      const res = await fineService.getByUser(activeFilters);
      const paginatedData = res.data.data;
      
      const dataArray = Array.isArray(paginatedData) 
        ? paginatedData 
        : (paginatedData?.data || []);

      setFineGroups(dataArray);

      if (!Array.isArray(paginatedData)) {
        setPagination({
          current_page: paginatedData?.current_page ?? 1,
          last_page: paginatedData?.last_page ?? 1,
          total: paginatedData?.total ?? 0,
          from: paginatedData?.from ?? 0,
          to: paginatedData?.to ?? 0,
        });
      }
    } catch (error) {
      console.error("Failed to fetch fines:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFines(filters);
  }, [filters]);

  return (
    <StaggerContainer className="pt-1 md:pt-2 px-0">
      <ContentHeader
        title={t("myFines")}
        description={t("viewAllFinesDesc")}
        showBackButton={false}
        className="mb-8"
      />

      <FadeUp delay={0.1}>
        <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_auto_auto] xl:items-center mb-8">
          <div className="relative min-w-0 w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={tFines("searchFines")}
              value={searchInput}
              onChange={handleSearchChange}
              className="pl-9 h-11! w-full shadow-sm transition-all duration-300"
            />
          </div>
          <Select value={statusValue} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-full xl:w-44 h-11! shadow-sm transition-all duration-300">
              <SelectValue placeholder={tFines("filterStatus")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{tFines("allStatus")}</SelectItem>
              <SelectItem value="unpaid">{tFines("unpaid")}</SelectItem>
              <SelectItem value="paid">{tFines("paid")}</SelectItem>
              <SelectItem value="waived">{tFines("waived")}</SelectItem>
            </SelectContent>
          </Select>
          <DateRangeFilter
            onFilter={handleDateFilter}
            className="w-full xl:w-auto"
          />
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
            <div className="flex justify-center py-12">
              <DataLoading variant="inline" size="lg" />
            </div>
          ) : fineGroups.length === 0 ? (
            <FadeIn key="empty">
              <EmptyState
                icon={<DollarSign />}
                title={t("noFinesYet")}
                description={t("noFinesYetDesc")}
              />
            </FadeIn>
          ) : (
            <div className="w-full space-y-1">
              {fineGroups.map((group, index) => (
                <MyFineCard
                  key={`${group.borrowId}-${index}`}
                  group={group}
                  index={index}
                />
              ))}
            </div>
          )}
        </PaginatedContent>
      </FadeUp>
    </StaggerContainer>
  );
}
