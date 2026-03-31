"use client";

import { useTranslations } from "next-intl";
import ContentHeader from "@/components/custom-ui/content/ContentHeader";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DollarSign, Settings } from "lucide-react";
import FineTypeManagement from "./fine-type/FineTypeManagement";
import FineManagement from "./fine/FineManagement";

export default function FinesClient() {
  const t = useTranslations("fines");
  const [activeTab, setActiveTab] = useState("fines");

  return (
    <div className="space-y-6">
      <ContentHeader
        title={t("managementTitle")}
        description={t("managementDescription")}
        isAdmin
      />

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
          <FineManagement />
        </TabsContent>
        <TabsContent value="fine-types" className="mt-6">
          <FineTypeManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
}
