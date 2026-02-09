"use client";

import { useEffect, useState } from "react";
import { FineType } from "@/types/fine";
import { fineTypeService } from "@/services/fine.service";
import FineTypeTable from "./FineTypeTable";
import FineTypeFormDialog from "./FineTypeFormDialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import DeleteConfirmDialog from "@/components/custom-ui/DeleteConfirmDialog";
import { FineTypeTableSkeleton } from "./FineTypeTableSkeleton";
import { Plus } from "lucide-react";

export default function FineTypeManagement() {
  const [fineTypes, setFineTypes] = useState<FineType[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<FineType | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const confirmDelete = async () => {
    if (!deleteId) return;

    try {
      await fineTypeService.delete(deleteId);
      toast.success("Tipe denda berhasil dihapus");
      setDeleteId(null);
      fetchFineTypes();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Gagal menghapus tipe denda");
    }
  };

  const fetchFineTypes = async () => {
    setLoading(true);
    try {
      const res = await fineTypeService.getAll();
      setFineTypes(res.data.data);
    } catch (err) {
      toast.error("Gagal memuat data tipe denda");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFineTypes();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
        <div>
          <h2 className="text-2xl font-bold">Tipe Denda</h2>
          <p className="text-muted-foreground">
            Konfigurasi tipe denda dan jumlah denda
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
          Tambah Tipe Denda
        </Button>
      </div>

      {loading ? (
        <FineTypeTableSkeleton />
      ) : (
        <FineTypeTable
          data={fineTypes}
          onEdit={(fineType) => {
            setEditing(fineType);
            setOpen(true);
          }}
          onDelete={(id) => setDeleteId(id)}
        />
      )}

      <DeleteConfirmDialog
        open={deleteId !== null}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Hapus Tipe Denda"
        description="Tipe denda yang dihapus tidak dapat dikembalikan."
        onConfirm={confirmDelete}
      />

      <FineTypeFormDialog
        open={open}
        setOpen={setOpen}
        fineType={editing}
        onSuccess={fetchFineTypes}
      />
    </div>
  );
}
