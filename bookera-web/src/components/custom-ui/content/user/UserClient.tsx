"use client";

import { useEffect, useState, useCallback } from "react";
import { User } from "@/types/user";
import { userService } from "@/services/user.service";
import UserTable from "./UserTable";
import UserFilter from "./UserFilter";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import DeleteConfirmDialog from "@/components/custom-ui/DeleteConfirmDialog";
import { UserTableSkeleton } from "./UserTableSkeleton";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

export default function UserClient() {
  const router = useRouter();
  const t = useTranslations('admin.users');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const [filters, setFilters] = useState<{
    search?: string;
    role?: string;
    status?: "active" | "inactive";
  }>({});

  const confirmDelete = async () => {
    if (!deleteId) return;

    await userService.delete(deleteId);
    toast.success(t('deleteSuccess'));
    setDeleteId(null);
    fetchUsers();
  };

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await userService.getAll(
        filters.search,
        filters.role,
        filters.status
      );
      setUsers(res.data.data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || t('loadError'));
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Debounce effect for filters
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchUsers();
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [fetchUsers]);

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
        <div>
          <h1 className="text-3xl font-bold">{t('title')}</h1>
          <p className="text-muted-foreground">
            {t('description')}
          </p>
        </div>
        <Button
          onClick={() => router.push("/admin/users/add")}
          variant="brand"
          className="h-8 gap-1"
        >
          <Plus className="w-3.5 h-3.5" />
          {t('addUser')}
        </Button>
      </div>

      {/* FILTER */}
      <UserFilter
        onChange={(value) =>
          setFilters((prev) => ({
            ...prev,
            ...value,
          }))
        }
      />

      {/* TABLE */}
      {loading ? (
        <UserTableSkeleton />
      ) : (
        <UserTable data={users} onDelete={(id) => setDeleteId(id)} />
      )}

      {/* DELETE CONFIRM */}
      <DeleteConfirmDialog
        open={deleteId !== null}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title={t('deleteUser')}
        description={t('deleteUserWarning')}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
