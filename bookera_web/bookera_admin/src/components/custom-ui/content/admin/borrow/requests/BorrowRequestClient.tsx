"use client";

import { ITEMS_PER_PAGE_OPTIONS } from "@/constants/pagination";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ContentHeader from "@/components/custom-ui/content/ContentHeader";
import { borrowRequestService } from "@/services/borrow-request.service";
import { BorrowRequest } from "@/types/borrow-request";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { ClipboardList, Search } from "lucide-react";
import EmptyState from "@/components/custom-ui/EmptyState";
import PaginatedContent from "@/components/custom-ui/PaginatedContent";
import { Input } from "@/components/ui/input";
import BorrowRequestListItem from "./BorrowRequestListItem";
import DataLoading from "@/components/custom-ui/DataLoading";
import { StaggerContainer, FadeUp, FadeIn, SlideIn } from "@/components/custom-ui/motion";

export default function BorrowRequestClient() {
  const router = useRouter();
  const t = useTranslations("borrow-request");
  const [requests, setRequests] = useState<BorrowRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<{
    search?: string;
    per_page?: number;
    page?: number;
  }>({ per_page: ITEMS_PER_PAGE_OPTIONS[1] });
  const [searchInput, setSearchInput] = useState("");
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    total: 0,
    from: 0,
    to: 0,
  });

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


  return (
    <StaggerContainer className="space-y-6">
      <FadeUp>
        <ContentHeader
          title={t("title")}
          description={t("description")}
          isAdmin
        />
      </FadeUp>
      
      <FadeUp delay={0.1}>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t("searchRequests")}
              value={searchInput}
              onChange={handleSearchChange}
              className="pl-9 h-11! shadow-sm transition-all duration-300"
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
            <FadeIn key="loading" className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <DataLoading key={i} size="lg" />
              ))}
            </FadeIn>
          ) : requests.length === 0 ? (
            <FadeIn key="empty">
              <EmptyState
                icon={<ClipboardList />}
                title={t("noRequests")}
                description={t("noRequestsDesc")}
              />
            </FadeIn>
          ) : (
            <FadeIn key="content">
              <StaggerContainer className="space-y-4">
                {requests.map((req, index) => (
                  <SlideIn key={req.id} direction="up" distance={20} delay={index * 0.05}>
                    <BorrowRequestListItem
                      request={req}
                    />
                  </SlideIn>
                ))}
              </StaggerContainer>
            </FadeIn>
          )}
        </PaginatedContent>
      </FadeUp>
    </StaggerContainer>
  );
}
