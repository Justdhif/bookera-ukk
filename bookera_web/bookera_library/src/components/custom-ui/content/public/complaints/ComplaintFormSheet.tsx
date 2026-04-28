"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { MessageSquarePlus, Sparkles } from "lucide-react";
import ComplaintForm from "./ComplaintForm";
import { CreateComplaintData } from "@/types/complaint";
import { complaintService } from "@/services/complaint.service";
import { buildComplaintFormData } from "@/services/form-data/complaint.form-data";
import { toast } from "sonner";

interface ComplaintFormSheetProps {
  onSuccess?: () => void;
  trigger?: React.ReactNode;
}

export default function ComplaintFormSheet({
  onSuccess,
  trigger,
}: ComplaintFormSheetProps) {
  const t = useTranslations("complaint.form");
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (data: CreateComplaintData) => {
    setSubmitting(true);
    try {
      const formData = buildComplaintFormData(data);
      await complaintService.create(formData);
      toast.success(t("submitSuccess"));
      setOpen(false);
      onSuccess?.();
    } catch (error: any) {
      toast.error(error.response?.data?.message || t("submitError"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {trigger || (
          <Button className="rounded-2xl gap-2 shadow-lg shadow-brand-primary/20 hover:scale-105 transition-all bg-brand-primary hover:bg-brand-primary/90 text-white">
            <MessageSquarePlus className="h-4 w-4" />
            {t("submitBtn")}
          </Button>
        )}
      </SheetTrigger>
      <SheetContent side="right" className="sm:max-w-[500px] w-full border-l-0 p-0 overflow-hidden">
        <div className="h-full flex flex-col">
          <div className="absolute top-0 right-0 w-full h-32 bg-linear-to-b from-brand-primary/10 to-transparent pointer-events-none" />
          
          <SheetHeader className="px-8 pt-10 pb-6 relative">
            <div className="inline-flex items-center gap-2 rounded-full border border-brand-primary/15 bg-brand-primary/5 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-primary mb-4 w-fit">
              <Sparkles className="h-3.5 w-3.5" />
              Service
            </div>
            <SheetTitle className="text-3xl font-extrabold tracking-tight bg-linear-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
              {t("sheetTitle")}
            </SheetTitle>
            <SheetDescription className="text-base text-muted-foreground leading-relaxed pt-2">
              {t("sheetDescription")}
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto px-8 pb-8 custom-scrollbar">
            <ComplaintForm
              onSubmit={handleSubmit}
              submitting={submitting}
              onCancel={() => setOpen(false)}
            />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
