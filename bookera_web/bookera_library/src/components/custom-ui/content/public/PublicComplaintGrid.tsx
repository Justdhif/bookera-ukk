"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { AlertCircle, Search } from "lucide-react";
import { Complaint } from "@/types/complaint";
import { complaintService } from "@/services/complaint.service";
import PublicComplaintCard from "./PublicComplaintCard";
import DataLoading from "@/components/custom-ui/DataLoading";
import LoadMoreButton from "@/components/custom-ui/LoadMoreButton";
import EmptyState from "@/components/custom-ui/EmptyState";
import { cn } from "@/lib/utils";
import PublicComplaintFilters from "./PublicComplaintFilters";

interface PublicComplaintGridProps {
  search?: string;
}

export default function PublicComplaintGrid({
  search,
}: PublicComplaintGridProps) {
  const t = useTranslations("complaint");
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
  }, [search, category, status]);

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
        });

        if (!active || requestIdRef.current !== requestId) return;

        const paginatedData = res.data.data;
        setComplaints((prev) => (isLoadMore ? [...prev, ...paginatedData.data] : paginatedData.data));
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
  }, [page, search, category, status]);

  const handleLoadMore = () => {
    if (loading || loadingMore || page >= totalPages) return;
    setPage((current) => current + 1);
  };

  const tExplore = useTranslations("explore");

  return (
    <div className="space-y-6">
      <PublicComplaintFilters
        selectedCategory={category}
        onCategoryChange={setCategory}
        selectedStatus={status}
        onStatusChange={setStatus}
        totalCount={total}
      />

      {loading && complaints.length === 0 ? (
        <DataLoading />
      ) : complaints.length === 0 ? (
        <EmptyState
          icon={<AlertCircle />}
          title={search ? tExplore("noComplaintsFound") : tExplore("complaintsSubtitle")}
          description={search ? tExplore("noComplaintsDesc") : tExplore("firstComplaint")}
          variant="compact"
        />
      ) : (
        <div className="space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {complaints.map((complaint) => (
              <PublicComplaintCard
                key={complaint.id}
                complaint={complaint}
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
    </div>
  );
}
