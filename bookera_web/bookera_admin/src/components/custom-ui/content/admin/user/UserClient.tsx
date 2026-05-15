"use client";

import { ITEMS_PER_PAGE_OPTIONS } from "@/constants/pagination";
import { useTranslations } from "next-intl";
import ContentHeader from "@/components/custom-ui/content/ContentHeader";
import Link from "next/link";
import { useEffect, useState } from "react";
import { User, UserFilterParams } from "@/types/user";
import { userService } from "@/services/user.service";
import UserTable from "./UserTable";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import DeleteConfirmDialog from "@/components/custom-ui/modal/DeleteConfirmDialog";
import { Plus, User as UserIcon } from "lucide-react";
import PaginatedContent from "@/components/custom-ui/PaginatedContent";
import DataLoading from "@/components/custom-ui/DataLoading";
import UserFilter from "./UserFilter";
import AdminMembershipPricing from "./AdminMembershipPricing";
import RefreshButton from "@/components/custom-ui/button/RefreshButton";
import { StaggerContainer, FadeUp } from "@/components/custom-ui/motion";

export default function UserClient() {
  const t = useTranslations("user");
  const tCommon = useTranslations("common");
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    total: 0,
    from: 0,
    to: 0,
  });
  const [filters, setFilters] = useState<UserFilterParams>({ 
    per_page: ITEMS_PER_PAGE_OPTIONS[1],
  });
  const confirmDelete = async () => {
    if (!deleteId) return;
    await userService.delete(deleteId);
    toast.success(t("deleteSuccess"));
    setDeleteId(null);
    fetchUsers(filters);
  };
  const fetchUsers = async (activeFilters: UserFilterParams) => {
    setLoading(true);
    try {
      const res = await userService.getAll(activeFilters);
      const paginatedData = res.data.data;
      setUsers(paginatedData.data ?? paginatedData);
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
    fetchUsers(filters);
  }, [filters]);
  return (
    <StaggerContainer className="space-y-6">
      <FadeUp>
        <ContentHeader
          title={t("title")}
          description={t("userManagementDesc")}
          isAdmin
          rightActions={
            <div className="flex items-center gap-2">
              <RefreshButton
                onClick={() => fetchUsers(filters)}
                loading={loading}
              />
              <Link href="/users/add">
                <Button variant="submit" className="h-8 gap-1">
                  <Plus className="w-3.5 h-3.5" />
                  {t("addUser")}
                </Button>
              </Link>
            </div>
          }
        />
      </FadeUp>
      <FadeUp delay={0.1}>
        <AdminMembershipPricing />
      </FadeUp>
      <FadeUp delay={0.2}>
        <UserFilter
          onChange={(value) =>
            setFilters((prev) => ({
              ...prev,
              ...value,
              page: 1,
            }))
          }
        />
      </FadeUp>
      <FadeUp delay={0.3}>
        <PaginatedContent
          currentPage={pagination.current_page}
          lastPage={pagination.last_page}
          total={pagination.total}
          from={pagination.from}
          to={pagination.to}
          onPageChange={(page) => setFilters((prev) => ({ ...prev, page }))}
        >
          {loading ? (
            <DataLoading size="lg" />
          ) : (
            <UserTable data={users} onDelete={(id) => setDeleteId(id)} />
          )}
        </PaginatedContent>
      </FadeUp>
      <DeleteConfirmDialog
        open={deleteId !== null}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title={t("deleteUser")}
        description={t("deleteUserConfirm")}
        onConfirm={confirmDelete}
      />
    </StaggerContainer>
  );
}
