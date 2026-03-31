"use client";
import { useTranslations } from "next-intl";
import { useState, useEffect } from "react";
import ContentHeader from "@/components/custom-ui/content/ContentHeader";
import { borrowService } from "@/services/borrow.service";
import { Borrow, BorrowFilterParams } from "@/types/borrow";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PackageCheck, Search } from "lucide-react";
import EmptyState from "@/components/custom-ui/EmptyState";
import { Input } from "@/components/ui/input";
import { ReturnCard } from "./ReturnCard";
import { ReturnSkeletonCard } from "./ReturnSkeletonCard";
import PaginatedContent from "@/components/custom-ui/PaginatedContent";
export default function ReturnClient() {
  const t = useTranslations("return");
  const [allBorrows, setAllBorrows] = useState<Borrow[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<BorrowFilterParams>({ per_page: 10 });
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
  const fetchAllData = async (activeFilters: BorrowFilterParams) => {
    setLoading(true);
    try {
      const borrowsRes = await borrowService.getAll(activeFilters);
      const paginatedData = borrowsRes.data.data;
      const allData: any[] = paginatedData.data ?? paginatedData;
      const filteredBorrows = allData.filter(
        (borrow) => borrow.book_returns && borrow.book_returns.length > 0,
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
  const renderBorrowCards = (borrows: Borrow[], showActions = true) => {
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
        {borrows.map((borrow) => {
          const latestReturn = borrow.book_returns?.[0];
          if (!latestReturn) {
            console.warn(`Borrow #${borrow.id} has no book_returns`);
            return null;
          }
          return (
            <ReturnCard
              key={latestReturn.id}
              bookReturn={latestReturn}
              borrow={borrow}
              showActions={showActions}
            />
          );
        })}
      </div>
    );
  };
  const checkingBorrows = allBorrows.filter(
    (borrow) => borrow.status === "open",
  );
  const returnedBorrows = allBorrows.filter(
    (borrow) => borrow.status === "close",
  );
  const tabs = [
    {
      value: "all",
      label: t("allReturns"),
      desc: t("allReturnsDesc"),
      data: allBorrows,
      showActions: true,
    },
    {
      value: "checking",
      label: t("checking"),
      desc: t("checkingDesc"),
      data: checkingBorrows,
      showActions: true,
    },
    {
      value: "returned",
      label: t("returned"),
      desc: t("returnedDesc"),
      data: returnedBorrows,
      showActions: false,
    },
  ];
  return (
    <div className="space-y-6">
      <ContentHeader
        title={t("managementTitle")}
        description={t("managementDesc")}
        isAdmin
      />
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">
            {t("allReturns")} ({allBorrows.length})
          </TabsTrigger>
          <TabsTrigger value="checking">
            {t("checking")} ({checkingBorrows.length})
          </TabsTrigger>
          <TabsTrigger value="returned">
            {t("returned")} ({returnedBorrows.length})
          </TabsTrigger>
        </TabsList>
        {tabs.map(({ value, label, desc, data, showActions }) => (
          <TabsContent key={value} value={value} className="space-y-4">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold">{label}</h3>
                <p className="text-sm text-muted-foreground">{desc}</p>
              </div>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={t("searchByUserOrTitle")}
                    value={searchInput}
                    onChange={handleSearchChange}
                    className="pl-10"
                  />
                </div>
              </div>
              <PaginatedContent
                currentPage={pagination.current_page}
                lastPage={pagination.last_page}
                total={pagination.total}
                from={pagination.from}
                to={pagination.to}
                onPageChange={(page) =>
                  setFilters((prev) => ({ ...prev, page }))
                }
              >
                {loading ? (
                  <div className="grid gap-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <ReturnSkeletonCard key={i} />
                    ))}
                  </div>
                ) : (
                  renderBorrowCards(data, showActions)
                )}
              </PaginatedContent>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
