"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { AlertCircle, Search } from "lucide-react";
import { Complaint } from "@/types/complaint";
import { complaintService } from "@/services/complaint.service";
import PublicComplaintCard from "./PublicComplaintCard";
import DataLoading from "@/components/custom-ui/DataLoading";
import LoadMoreButton from "@/components/custom-ui/button/LoadMoreButton";
import EmptyState from "@/components/custom-ui/EmptyState";
import { cn } from "@/lib/utils";
import PublicComplaintFilters from "./PublicComplaintFilters";
import ComplaintFormSheet from "./ComplaintFormSheet";
import { useAuthStore } from "@/store/auth.store";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { usePathnameCondition } from "@/hooks/usePathnameCondition";
import { FadeUp, StaggerContainer } from "@/components/custom-ui/motion";

interface PublicComplaintGridProps {
  search?: string;
  showFilters?: boolean;
  userId?: number;
  refreshToken?: number;
}

export default function PublicComplaintGrid({
  search,
  showFilters = true,
  userId,
  refreshToken,
}: PublicComplaintGridProps) {
  const t = useTranslations("complaint");
  const { isAuthenticated } = useAuthStore();
  const { isExplore } = usePathnameCondition();
  const requestIdRef = useRef(0);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [total, setTotal] = useState(0);

  const resetPagination = () => {
    setComplaints([]);
    setPage(1);
    setTotalPages(1);
    setLoading(true);
  };

  useEffect(() => {
    resetPagination();
  }, [search, category, status, refreshToken]);

  useEffect(() => {
    const requestId = ++requestIdRef.current;
    let active = true;
    const isLoadMore = page > 1;

    if (isLoadMore) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }

    const fetchComplaints = async () => {
      try {
        const res = await complaintService.getAll({
          page,
          per_page: 12,
          search: search || undefined,
          category: category || undefined,
          status: status || undefined,
          user_id: userId || undefined,
        });

        if (!active || requestIdRef.current !== requestId) return;

        const paginatedData = res.data.data;
        setComplaints((prev) =>
          isLoadMore ? [...prev, ...paginatedData.data] : paginatedData.data,
        );
        setTotalPages(paginatedData.last_page);
        setTotal(paginatedData.total);
      } catch (error) {
        if (active && requestIdRef.current === requestId) {
          console.error(error);
        }
      } finally {
        if (active && requestIdRef.current === requestId) {
          setLoading(false);
          setLoadingMore(false);
        }
      }
    };

    fetchComplaints();

    return () => {
      active = false;
    };
  }, [page, search, category, status, refreshToken]);

  const handleLoadMore = () => {
    if (loading || loadingMore || page >= totalPages) return;
    setPage((current) => current + 1);
  };

  const tExplore = useTranslations("explore");

  return (
    <StaggerContainer className={cn("space-y-6", !showFilters && "space-y-0")}>
      {showFilters && (
        <FadeUp>
          <div className="flex flex-col sm:flex-row sm:items-center justify-end gap-4">
            {isAuthenticated && isExplore && (
              <div className="flex items-center gap-4 px-4 py-2 bg-muted/40 rounded-full border border-border/50 shadow-sm backdrop-blur-sm shrink-0 w-fit">
                <p className="hidden md:block text-xs font-medium text-muted-foreground">
                  {t("welcomeSubtitle")}
                </p>
                <div className="hidden md:block w-px h-5 bg-border/80"></div>
                <ComplaintFormSheet
                  onSuccess={resetPagination}
                  trigger={
                    <Button
                      variant="submit"
                      size="sm"
                      className="h-8 gap-2 rounded-full px-5 shadow-xs transition-all hover:scale-[1.02]"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      {t("submitButton")}
                    </Button>
                  }
                />
              </div>
            )}
          </div>
        </FadeUp>
      )}

      {showFilters && (
        <FadeUp delay={0.08}>
          <PublicComplaintFilters
            selectedCategory={category}
            onCategoryChange={setCategory}
            selectedStatus={status}
            onStatusChange={setStatus}
            totalCount={total}
          />
        </FadeUp>
      )}

      <FadeUp delay={0.16}>
        {loading && complaints.length === 0 ? (
          <DataLoading />
        ) : complaints.length === 0 ? (
          <EmptyState
            icon={<AlertCircle />}
            title={
              search
                ? tExplore("noComplaintsFound")
                : tExplore("complaintsSubtitle")
            }
            description={
              search ? tExplore("noComplaintsDesc") : tExplore("firstComplaint")
            }
            variant="compact"
          />
        ) : (
          <div className="space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {complaints.map((complaint, index) => (
                <PublicComplaintCard
                  key={complaint.id}
                  complaint={complaint}
                  delay={index * 0.05}
                />
              ))}
            </div>

            {page < totalPages && (
              <div className="flex justify-center pt-4">
                <LoadMoreButton
                  onClick={handleLoadMore}
                  loading={loadingMore}
                  variant="outline"
                />
              </div>
            )}
          </div>
        )}
      </FadeUp>
    </StaggerContainer>
  );
}
