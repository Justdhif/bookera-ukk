"use client";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import ContentHeader from "@/components/custom-ui/content/ContentHeader";
import { PrivacyPolicy } from "@/types/privacy-policy";
import { privacyPolicyService } from "@/services/privacy-policy.service";
import PrivacyPolicyList from "./PrivacyPolicyList";
import PrivacyPolicyFormDialog from "./PrivacyPolicyFormDialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import DeleteConfirmDialog from "@/components/custom-ui/modal/DeleteConfirmDialog";
import DataLoading from "@/components/custom-ui/DataLoading";
import { StaggerContainer, FadeUp, FadeIn } from "@/components/custom-ui/motion";

export default function PrivacyPolicyClient() {
  const t = useTranslations("privacy-policy");
  const [items, setItems] = useState<PrivacyPolicy[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<PrivacyPolicy | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await privacyPolicyService.delete(deleteId);
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
      const res = await privacyPolicyService.getAll();
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
    <StaggerContainer className="space-y-6">
      <FadeUp>
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
              {t("addPrivacyPolicy")}
            </Button>
          }
        />
      </FadeUp>

      {loading ? (
        <FadeIn key="loading">
          <DataLoading size="lg" />
        </FadeIn>
      ) : (
        <FadeIn key="content">
          <PrivacyPolicyList
            data={items}
            onEdit={(item) => {
              setEditing(item);
              setOpen(true);
            }}
            onDelete={(id) => setDeleteId(id)}
          />
        </FadeIn>
      )}

      <PrivacyPolicyFormDialog
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
    </StaggerContainer>
  );
}
