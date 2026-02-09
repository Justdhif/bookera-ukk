"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { privacyPolicyService } from "@/services/privacy-policy.service";
import { PrivacyPolicy } from "@/types/privacy-policy";
import { toast } from "sonner";
import { Loader2, Shield } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface PrivacyPolicyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PrivacyPolicyModal({
  open,
  onOpenChange,
}: PrivacyPolicyModalProps) {
  const [contents, setContents] = useState<PrivacyPolicy[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      fetchContent();
    }
  }, [open]);

  const fetchContent = async () => {
    setLoading(true);
    try {
      const response = await privacyPolicyService.getAll();
      const items = response.data.data;
      setContents(items);
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Gagal memuat Privacy Policy"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
            <Shield className="w-5 h-5 text-brand-primary" />
            Privacy Policy
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="mt-4 h-[calc(90vh-8rem)]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
            </div>
          ) : contents.length > 0 ? (
            <div className="space-y-6 pr-4">
              <div className="p-4 bg-linear-to-r from-brand-primary/5 to-brand-primary/10 dark:from-brand-primary/10 dark:to-brand-primary/20 rounded-lg border border-brand-primary/20 dark:border-brand-primary/30">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Terakhir diperbarui:{" "}
                  {new Date(
                    contents[contents.length - 1].updated_at
                  ).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  {contents.length} bagian
                </p>
              </div>

              {/* Display all sections */}
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
                <Shield className="w-12 h-12" />
              </div>
              <p>Konten tidak tersedia</p>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
