"use client";
import { ITEMS_PER_PAGE_OPTIONS } from "@/constants/pagination";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";
import { FineType } from "@/types/fine";
import { fineTypeService } from "@/services/fine-type.service";
import FineTypeTable from "./FineTypeTable";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import DeleteConfirmDialog from "@/components/custom-ui/modal/DeleteConfirmDialog";
import { Plus } from "lucide-react";
import DataLoading from "@/components/custom-ui/DataLoading";
import FineTypeFormDialog from "./FineTypeFormDialog";
import { StaggerContainer, FadeUp, FadeIn } from "@/components/custom-ui/motion";

export default function FineTypeManagement({
  refreshKey,
}: {
  refreshKey: number;
}) {
  const t = useTranslations("fines");
  const [fineTypes, setFineTypes] = useState<FineType[]>([]);
  const [loading, setLoading] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await fineTypeService.delete(deleteId);
      toast.success("Fine type deleted successfully");
      setDeleteId(null);
      fetchFineTypes();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete fine type");
    }
  };

  const fetchFineTypes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fineTypeService.getAll({ per_page: ITEMS_PER_PAGE_OPTIONS[1] } as any);
      setFineTypes(res.data.data.data ?? res.data.data);
    } catch (err) {
      toast.error("Failed to load fine types");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchFineTypes();
  }, [fetchFineTypes, refreshKey]);

  return (
    <StaggerContainer className="space-y-6">
      <FadeUp delay={0.1}>
        {loading ? (
          <FadeIn
            key="loading"
          >
            <DataLoading size="lg" />
          </FadeIn>
        ) : (
          <FadeIn
            key="content"
          >
            <FineTypeTable
              data={fineTypes}
              onDelete={(id: number) => setDeleteId(id)}
            />
          </FadeIn>
        )}
      </FadeUp>

      <DeleteConfirmDialog
        open={deleteId !== null}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title={t("deleteFineType")}
        description={t("deleteFineConfirm")}
        onConfirm={confirmDelete}
      />
    </StaggerContainer>
  );
}
