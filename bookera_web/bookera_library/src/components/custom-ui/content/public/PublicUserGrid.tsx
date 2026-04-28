"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { User } from "@/types/user";
import { publicService } from "@/services/public.service";
import PublicUserCard from "./PublicUserCard";
import DataLoading from "@/components/custom-ui/DataLoading";
import LoadMoreButton from "@/components/custom-ui/LoadMoreButton";
import EmptyState from "@/components/custom-ui/EmptyState";
import { Users } from "lucide-react";

interface PublicUserGridProps {
  search?: string;
}

export default function PublicUserGrid({ search }: PublicUserGridProps) {
  const t = useTranslations("explore");
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);

  const fetchUsers = async (pageNum: number, isNewSearch: boolean = false) => {
    try {
      setLoading(true);
      const res = await publicService.getUsers({
        page: pageNum,
        per_page: 12,
        search: search,
      });

      const response = res.data.data;
      const data = response.data;
      
      if (isNewSearch) {
        setUsers(data);
      } else {
        setUsers((prev) => [...prev, ...data]);
      }

      setHasMore(response.current_page < response.last_page);
      setTotal(response.total);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
    fetchUsers(1, true);
  }, [search]);

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchUsers(nextPage);
    }
  };


  return (
    <div className="space-y-6">
      {loading && users.length === 0 ? (
        <DataLoading />
      ) : users.length === 0 ? (
        <EmptyState
          icon={<Users />}
          title={t("noUsersFound")}
          description={t("searchUsersDescription")}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {users.map((user) => (
            <PublicUserCard key={user.id} user={user} />
          ))}
        </div>
      )}

      {hasMore && (
        <div className="flex justify-center pt-8">
          <LoadMoreButton
            onClick={handleLoadMore}
            loading={loading}
            variant="outline"
          />
        </div>
      )}
    </div>
  );
}
