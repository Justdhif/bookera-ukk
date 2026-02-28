"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DollarSign, Settings } from "lucide-react";
import FineTypeManagement from "./FineTypeManagement";
import FineManagement from "./FineManagement";
export default function FinesClient() {
  const [activeTab, setActiveTab] = useState("fines");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{"Fine Management"}</h1>
        <p className="text-muted-foreground">
          {"Manage fines and configure fine types"}
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="fines" className="gap-2">
            <DollarSign className="h-4 w-4" />
            {"Fines"}
          </TabsTrigger>
          <TabsTrigger value="fine-types" className="gap-2">
            <Settings className="h-4 w-4" />
            {"Fine Types"}
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
