"use client";

import { useEffect, useState } from "react";
import { TermsOfService } from "@/types/terms-of-service";
import { termsOfServiceService } from "@/services/terms-of-service.service";
import TermsOfServiceList from "./TermsOfServiceList";
import TermsOfServiceFormDialog from "./TermsOfServiceFormDialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { TermsOfServiceListSkeleton } from "./TermsOfServiceListSkeleton";
import { Plus } from "lucide-react";
import DeleteConfirmDialog from "@/components/custom-ui/DeleteConfirmDialog";
import { useTranslations } from "next-intl";

export default function TermsOfServiceClient() {
  const t = useTranslations('admin.termsOfService');
  const [items, setItems] = useState<TermsOfService[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<TermsOfService | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const confirmDelete = async () => {
    if (!deleteId) return;
    
    try {
      await termsOfServiceService.delete(deleteId);
      toast.success(t('deleteSuccess'));
      fetchData();
      setDeleteId(null);
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || t('deleteError'),
      );
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await termsOfServiceService.getAll();
      setItems(res.data.data);
    } catch (error) {
      toast.error(t('loadError'));
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
          <h1 className="text-3xl font-bold">Terms of Service</h1>
          <p className="text-muted-foreground">
            Kelola Terms of Service untuk pengguna platform
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
          Tambah Terms of Service
        </Button>
      </div>

      {loading ? (
        <TermsOfServiceListSkeleton />
      ) : (
        <TermsOfServiceList
          data={items}
          onEdit={(item) => {
            setEditing(item);
            setOpen(true);
          }}
          onDelete={(id) => setDeleteId(id)}
        />
      )}

      <TermsOfServiceFormDialog
        open={open}
        setOpen={setOpen}
        item={editing}
        onSuccess={fetchData}
      />
      
      <DeleteConfirmDialog
        open={deleteId !== null}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Hapus Terms of Service"
        description="Apakah kamu yakin ingin menghapus Terms of Service ini? Data yang dihapus tidak dapat dikembalikan."
        onConfirm={confirmDelete}
      />
    </div>
  );
}
