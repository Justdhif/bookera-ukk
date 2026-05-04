"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { LogIn, MessageSquarePlus, Sparkles } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import ComplaintForm from "./ComplaintForm";
import { CreateComplaintData } from "@/types/complaint";
import { complaintService } from "@/services/complaint.service";
import { buildComplaintFormData } from "@/services/form-data/complaint.form-data";
import { toast } from "sonner";
import EmptyState from "@/components/custom-ui/EmptyState";
import { useAuthStore } from "@/store/auth.store";
import { FadeUp } from "@/components/custom-ui/motion";

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
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const initialLoading = useAuthStore((state) => state.initialLoading);

  const handleSubmit = async (data: CreateComplaintData) => {
    setSubmitting(true);
    try {
      const formData = buildComplaintFormData(data);
      await complaintService.create(formData);
      toast.success(t("submitSuccess"));
      setOpen(false);
      onSuccess?.();
    } catch (error: any) {
      const message =
        error.response?.status === 422
          ? (
              Object.values(error.response.data.errors || {})[0] as string[]
            )?.[0] || error.response.data.message
          : error.response?.data?.message || t("submitError");
      toast.error(message);
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
      <SheetContent
        side="right"
        className="sm:max-w-125 w-full border-l-0 p-0 overflow-hidden"
      >
        <div className="h-full flex flex-col">
          <div className="absolute top-0 right-0 w-full h-32 bg-linear-to-b from-brand-primary/10 to-transparent pointer-events-none" />

          <FadeUp className="px-8 pt-10 pb-6 relative">
            <SheetHeader>
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
          </FadeUp>

          <FadeUp delay={0.08} className="flex-1 overflow-y-auto px-8 pb-8 custom-scrollbar">
            {initialLoading ? (
              <div className="flex h-full min-h-90 items-center justify-center">
                <div className="h-10 w-10 animate-spin rounded-full border-2 border-brand-primary border-t-transparent" />
              </div>
            ) : !isAuthenticated ? (
              <div className="flex h-full min-h-90 items-center justify-center">
                <EmptyState
                  variant="compact"
                  icon={<LogIn />}
                  title={t("loginRequired", { defaultValue: "Login Required" })}
                  description={t("loginRequiredDesc", {
                    defaultValue:
                      "Sign in to create a complaint and share your feedback.",
                  })}
                  linkLabel={t("loginBtn", { defaultValue: "Sign In" })}
                  linkHref="/login?redirect=/complaints"
                  className="w-full max-w-sm"
                />
              </div>
            ) : (
              <ComplaintForm
                onSubmit={handleSubmit}
                submitting={submitting}
                onCancel={() => setOpen(false)}
              />
            )}
          </FadeUp>
        </div>
      </SheetContent>
    </Sheet>
  );
}
