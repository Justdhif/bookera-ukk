"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Complaint } from "@/types/complaint";
import { complaintService } from "@/services/complaint.service";
import ComplaintCard from "./ComplaintCard";
import ComplaintHeader from "./ComplaintHeader";
import DataLoading from "@/components/custom-ui/DataLoading";
import EmptyState from "@/components/custom-ui/EmptyState";
import { useTranslations } from "next-intl";
import LoadMoreButton from "@/components/custom-ui/LoadMoreButton";
import { useSearchParams } from "next/navigation";

interface ComplaintListProps {
  hideHeader?: boolean;
  limit?: number;
  excludeSlug?: string;
}

export default function ComplaintList({
  hideHeader = false,
  limit,
  excludeSlug,
}: ComplaintListProps = {}) {
  const t = useTranslations("complaint");
  const searchParams = useSearchParams();

  const category = searchParams.get("category") || "";

  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);

  const fetchComplaints = useCallback(
    async (isInitial = true, currentSearch = "") => {
      try {
        if (isInitial) {
          setLoading(true);
          setPage(1);
        } else {
          setLoadingMore(true);
        }

        const response = await complaintService.getAll({
          category: category,
          search: currentSearch,
          page: isInitial ? 1 : page + 1,
          per_page: 12,
        });

        const paginatedData = response.data.data;

        const filteredData = excludeSlug
          ? paginatedData.data.filter((c: Complaint) => c.slug !== excludeSlug)
          : paginatedData.data;

        if (isInitial) {
          setComplaints(filteredData);
        } else {
          setComplaints((prev) => [...prev, ...filteredData]);
          setPage((prev) => prev + 1);
        }

        setHasMore(paginatedData.current_page < paginatedData.last_page);
        setTotal(paginatedData.total);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [page, category],
  );

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchComplaints(true, search);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [search, category, fetchComplaints]);

  const handleLoadMore = () => {
    if (hasMore && !loadingMore && !loading) {
      fetchComplaints(false, search);
    }
  };

  return (
    <div className={hideHeader ? "" : "container mx-auto px-4 py-8"}>
      {!hideHeader && (
        <ComplaintHeader
          search={search}
          onSearchChange={setSearch}
          onRefresh={() => fetchComplaints(true, search)}
        />
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <DataLoading key={i} className="h-[400px] rounded-3xl" />
          ))}
        </div>
      ) : complaints.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {complaints.map((complaint) => (
              <ComplaintCard key={complaint.id} complaint={complaint} />
            ))}
          </div>

          {hasMore && (
            <div className="flex justify-center mt-12 mb-8">
              <LoadMoreButton
                onClick={handleLoadMore}
                loading={loadingMore}
                variant="outline"
              />
            </div>
          )}
        </>
      ) : (
        <EmptyState
          title={t("emptyTitle")}
          description={
            search ? t("emptySearchDesc", { query: search }) : t("emptyDesc")
          }
        />
      )}
    </div>
  );
}
