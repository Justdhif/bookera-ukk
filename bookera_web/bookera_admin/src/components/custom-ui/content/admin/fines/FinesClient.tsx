"use client";

import { useTranslations } from "next-intl";
import ContentHeader from "@/components/custom-ui/content/ContentHeader";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DollarSign, Settings, Plus } from "lucide-react";
import FineTypeManagement from "./FineTypeManagement";
import FineManagement from "./FineManagement";
import { StaggerContainer, FadeUp } from "@/components/custom-ui/motion";
import { Button } from "@/components/ui/button";
import { fineService } from "@/services/fine.service";
import { downloadBlobFile } from "@/lib/download";
import { toast } from "sonner";
import { ITEMS_PER_PAGE_OPTIONS } from "@/constants/pagination";
import { getCurrentMonthRange } from "@/lib/month-range";
import { FineFilterParams } from "@/types/fine";
import FineTypeFormDialog from "./FineTypeFormDialog";
import ExportButton from "@/components/custom-ui/button/ExportButton";
import RefreshButton from "@/components/custom-ui/button/RefreshButton";

export default function FinesClient() {
  const t = useTranslations("fines");
  const tc = useTranslations("common");
  const [activeTab, setActiveTab] = useState("fines");

  // Fine Management State
  const defaultMonthRange = getCurrentMonthRange();
  const [filters, setFilters] = useState<FineFilterParams>({
    per_page: ITEMS_PER_PAGE_OPTIONS[1],
    ...defaultMonthRange,
  });
  const [exporting, setExporting] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const [isTypeDialogOpen, setIsTypeDialogOpen] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      const response = await fineService.exportData(filters);
      downloadBlobFile(
        response.data,
        `fines_data_${new Date().toISOString().split("T")[0]}.xlsx`,
      );
      toast.success(t("exportSuccess"));
    } catch (error: any) {
      toast.error(error.response?.data?.message || t("exportError"));
    } finally {
      setExporting(false);
    }
  };

  return (
    <StaggerContainer className="space-y-6">
      <FadeUp>
        <ContentHeader
          title={t("managementTitle")}
          description={t("managementDescription")}
          isAdmin
          rightActions={
            <div className="flex items-center gap-2">
              <RefreshButton
                onClick={() => setRefreshKey(prev => prev + 1)}
                label={tc("refresh")}
              />
              <ExportButton
                onClick={handleExport}
                loading={exporting}
                label={t("exportData")}
              />
              <Button
                onClick={() => setIsTypeDialogOpen(true)}
                variant="submit"
                className="h-8 gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                {t("addFineType")}
              </Button>
            </div>
          }
        />
      </FadeUp>

      <FadeUp delay={0.1}>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="fines" className="gap-2">
              <DollarSign className="h-4 w-4" />
              {t("title")}
            </TabsTrigger>
            <TabsTrigger value="fine-types" className="gap-2">
              <Settings className="h-4 w-4" />
              {t("fineTypesTab")}
            </TabsTrigger>
          </TabsList>
          <TabsContent value="fines" className="mt-6">
            <FineManagement 
              filters={filters} 
              setFilters={setFilters} 
              refreshKey={refreshKey}
            />
          </TabsContent>
          <TabsContent value="fine-types" className="mt-6">
            <FineTypeManagement 
              refreshKey={refreshKey} 
            />
          </TabsContent>
        </Tabs>
      </FadeUp>

      <FineTypeFormDialog
        open={isTypeDialogOpen}
        setOpen={setIsTypeDialogOpen}
        onSuccess={() => setRefreshKey(prev => prev + 1)}
      />
    </StaggerContainer>
  );
}
