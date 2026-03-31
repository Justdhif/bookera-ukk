"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { termsOfServiceService } from "@/services/terms-of-service.service";
import { TermsOfService } from "@/types/terms-of-service";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface TermsOfServiceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TermsOfServiceModal({
  open,
  onOpenChange,
}: TermsOfServiceModalProps) {
  const [contents, setContents] = useState<TermsOfService[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      fetchContent();
    }
  }, [open]);

  const fetchContent = async () => {
    setLoading(true);
    try {
      const response = await termsOfServiceService.getAll();
      const items = response.data.data;
      setContents(items);
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to load Terms of Service",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-brand-primary" />
            Terms of Service
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="mt-4 h-[calc(90vh-8rem)]">
          {loading ? (
            <div className="space-y-4 pr-4 py-4">
              <Skeleton className="h-10 w-full rounded-lg" />
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-5 w-2/3" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-11/12" />
                </div>
              ))}
            </div>
          ) : contents.length > 0 ? (
            <div className="space-y-6 pr-4">
              <div className="p-4 bg-linear-to-r from-brand-primary/5 to-brand-primary/10 rounded-lg border border-brand-primary/20">
                <p className="text-sm text-muted-foreground">
                  Last updated:
                  {new Date(
                    contents[contents.length - 1].updated_at,
                  ).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {contents.length} sections
                </p>
              </div>
              <div className="prose prose-sm dark:prose-invert max-w-none space-y-6">
                {contents.map((item) => (
                  <div
                    key={item.id}
                    className="border-l-4 border-brand-primary/30 dark:border-brand-primary/50 pl-4 py-2"
                  >
                    <h2 className="text-lg font-semibold text-brand-primary-dark dark:text-brand-primary mb-3">
                      {item.title}
                    </h2>
                    <div
                      className="text-gray-700 dark:text-gray-300 space-y-2 prose-headings:text-gray-900 dark:prose-headings:text-gray-100 prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-li:text-gray-700 dark:prose-li:text-gray-300 prose-strong:text-gray-900 dark:prose-strong:text-gray-100"
                      dangerouslySetInnerHTML={{ __html: item.content }}
                    />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <div className="mb-4 flex justify-center opacity-50">
                <FileText className="w-12 h-12" />
              </div>
              <p>Content not available</p>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
