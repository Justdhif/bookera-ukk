"use client";
import { useRouter } from "next/navigation";

import { useEffect, useState, useCallback } from "react";
import { User } from "@/types/user";
import { userService } from "@/services/user.service";
import UserTable from "./UserTable";
import UserFilter from "./UserFilter";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import DeleteConfirmDialog from "@/components/custom-ui/DeleteConfirmDialog";
import { UserTableSkeleton } from "./UserTableSkeleton";
import { Plus, User as UserIcon } from "lucide-react";
export default function UserClient() {
  const router = useRouter();
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
    toast.success("User deleted successfully");
    setDeleteId(null);
    fetchUsers();
  };

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await userService.getAll(
        filters.search,
        filters.role,
        filters.status,
      );
      setUsers(res.data.data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchUsers();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [fetchUsers]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-brand-primary rounded-lg">
            <UserIcon className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Users</h1>
            <p className="text-muted-foreground">
              Manage your library users and their roles
            </p>
          </div>
        </div>
        <Button
          onClick={() => router.push("/admin/users/add")}
          variant="brand"
          className="h-8 gap-1"
        >
          <Plus className="w-3.5 h-3.5" />
          Add User
        </Button>
      </div>

      <UserFilter
        onChange={(value) =>
          setFilters((prev) => ({
            ...prev,
            ...value,
          }))
        }
      />

      {loading ? (
        <UserTableSkeleton />
      ) : (
        <UserTable data={users} onDelete={(id) => setDeleteId(id)} />
      )}

      <DeleteConfirmDialog
        open={deleteId !== null}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete User"
        description="Are you sure you want to delete this user? This action cannot be undone."
        onConfirm={confirmDelete}
      />
    </div>
  );
}
