"use client";

import { useEffect, useState } from "react";
import { PrivacyPolicy } from "@/types/privacy-policy";
import { privacyPolicyService } from "@/services/privacy-policy.service";
import PrivacyPolicyList from "./PrivacyPolicyList";
import PrivacyPolicyFormDialog from "./PrivacyPolicyFormDialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { PrivacyPolicyListSkeleton } from "./PrivacyPolicyListSkeleton";
import { Plus } from "lucide-react";

export default function PrivacyPolicyClient() {
  const [items, setItems] = useState<PrivacyPolicy[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<PrivacyPolicy | null>(null);

  const handleDelete = async (id: number) => {
    try {
      await privacyPolicyService.delete(id);
      toast.success("Privacy Policy berhasil dihapus");
      fetchData();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Gagal menghapus Privacy Policy",
      );
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await privacyPolicyService.getAll();
      setItems(res.data.data);
    } catch (error) {
      toast.error("Gagal memuat data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
        <div>
          <h1 className="text-3xl font-bold">Privacy Policy</h1>
          <p className="text-muted-foreground">
            Kelola Privacy Policy untuk pengguna platform
          </p>
        </div>
        <Button
          onClick={() => {
            setEditing(null);
            setOpen(true);
          }}
          variant="brand"
          className="h-8 gap-1"
        >
          <Plus className="w-3.5 h-3.5" />
          Tambah Privacy Policy
        </Button>
      </div>

      {loading ? (
        <PrivacyPolicyListSkeleton />
      ) : (
        <PrivacyPolicyList
          data={items}
          onEdit={(item) => {
            setEditing(item);
            setOpen(true);
          }}
          onDelete={handleDelete}
        />
      )}

      <PrivacyPolicyFormDialog
        open={open}
        setOpen={setOpen}
        item={editing}
        onSuccess={fetchData}
      />
    </div>
  );
}
