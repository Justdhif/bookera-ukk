"use client";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import ContentHeader from "@/components/custom-ui/content/ContentHeader";
import { TermsOfService } from "@/types/terms-of-service";
import { termsOfServiceService } from "@/services/terms-of-service.service";
import TermsOfServiceList from "./list/TermsOfServiceList";
import TermsOfServiceFormDialog from "./form/TermsOfServiceFormDialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { TermsOfServiceListSkeleton } from "./list/TermsOfServiceListSkeleton";
import { Plus } from "lucide-react";
import DeleteConfirmDialog from "@/components/custom-ui/modal/DeleteConfirmDialog";
export default function TermsOfServiceClient() {
  const t = useTranslations("terms-of-service");
  const [items, setItems] = useState<TermsOfService[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<TermsOfService | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await termsOfServiceService.delete(deleteId);
      toast.success(t("deleteSuccess"));
      fetchData();
      setDeleteId(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || t("deleteError"));
    }
  };
  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await termsOfServiceService.getAll();
      setItems(res.data.data);
    } catch (error) {
      toast.error(t("loadError"));
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchData();
  }, []);
  return (
    <div className="space-y-6">
      <ContentHeader
        title={t("title")}
        description={t("description")}
        isAdmin
        rightActions={
          <Button
            onClick={() => {
              setEditing(null);
              setOpen(true);
            }}
            variant="submit"
            className="h-8 gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            {t("addTerms")}
          </Button>
        }
      />
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
        title={t("deleteTitle")}
        description={t("deleteConfirm")}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
