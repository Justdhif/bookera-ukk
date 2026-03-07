"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";

import { useEffect, useState } from "react";
import { User } from "@/types/user";
import { userService, UserFilterParams } from "@/services/user.service";
import UserTable from "./UserTable";
import UserFilter from "./UserFilter";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import DeleteConfirmDialog from "@/components/custom-ui/DeleteConfirmDialog";
import { UserTableSkeleton } from "./UserTableSkeleton";
import { Plus, User as UserIcon } from "lucide-react";
import PaginatedContent from "@/components/custom-ui/PaginatedContent";
export default function UserClient() {
    const t = useTranslations("user");
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

  const [filters, setFilters] = useState<UserFilterParams>({ per_page: 10 });

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
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-brand-primary rounded-lg">
            <UserIcon className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">{t("title")}</h1>
            <p className="text-muted-foreground">
              Manage your library users and their roles
            </p>
          </div>
        </div>
        <Link href="/admin/users/add">
          <Button variant="brand" className="h-8 gap-1">
            <Plus className="w-3.5 h-3.5" />
            
                                  {t("addUser")}
                                </Button>
        </Link>
      </div>

      <UserFilter
        onChange={(value) =>
          setFilters((prev) => ({
            ...prev,
            ...value,
            page: 1,
          }))
        }
      />

      <PaginatedContent
        currentPage={pagination.current_page}
        lastPage={pagination.last_page}
        total={pagination.total}
        from={pagination.from}
        to={pagination.to}
        onPageChange={(page) => setFilters((prev) => ({ ...prev, page }))}
      >
        {loading ? (
          <UserTableSkeleton />
        ) : (
          <UserTable data={users} onDelete={(id) => setDeleteId(id)} />
        )}
      </PaginatedContent>

      <DeleteConfirmDialog
        open={deleteId !== null}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title={t("deleteUser")}
        description="Are you sure you want to delete this user? This action cannot be undone."
        onConfirm={confirmDelete}
      />
    </div>
  );
}
