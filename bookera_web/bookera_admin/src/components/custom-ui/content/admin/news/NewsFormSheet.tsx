"use client";

import { useTranslations } from "next-intl";
import { Sparkles } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { FadeUp } from "@/components/custom-ui/motion";
import NewsForm from "./NewsForm";
import { News } from "@/types/news";

interface NewsFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: News | null;
  onSuccess: () => void;
}

export default function NewsFormSheet({
  open,
  onOpenChange,
  initialData,
  onSuccess,
}: NewsFormSheetProps) {
  const t = useTranslations("news");

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="sm:max-w-[500px] w-full border-l-0 p-0 overflow-hidden"
      >
        <div className="h-full flex flex-col relative">
          {/* Top Gradient Overlay */}
          <div className="absolute top-0 right-0 w-full h-32 bg-linear-to-b from-brand-primary/10 to-transparent pointer-events-none z-0" />

          {/* Header Section */}
          <div className="px-8 py-6 relative z-10">
            <SheetHeader>
              <FadeUp>
                <div className="inline-flex items-center gap-2 rounded-full border border-brand-primary/15 bg-brand-primary/5 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-primary mb-4 w-fit">
                  <Sparkles className="h-3.5 w-3.5" />
                  Editorial
                </div>
                <SheetTitle className="text-3xl font-extrabold tracking-tight bg-linear-to-br from-foreground to-foreground/70 bg-clip-text text-transparent pb-1">
                  {initialData ? t("editNews") : t("addNews")}
                </SheetTitle>
                <SheetDescription className="text-base text-muted-foreground leading-relaxed pt-2">
                  {initialData ? t("editNewsDesc") : t("addNewsDesc")}
                </SheetDescription>
              </FadeUp>
            </SheetHeader>
          </div>
          
          {/* Form Content */}
          <div className="flex-1 overflow-y-auto px-8 pb-8 custom-scrollbar relative z-10">
            <NewsForm
              initialData={initialData}
              onSuccess={() => {
                onOpenChange(false);
                onSuccess();
              }}
              onCancel={() => onOpenChange(false)}
            />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
