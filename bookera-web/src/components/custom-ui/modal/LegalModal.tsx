"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { termsOfServiceService } from "@/services/terms-of-service.service";
import { privacyPolicyService } from "@/services/privacy-policy.service";
import { TermsOfService } from "@/types/terms-of-service";
import { PrivacyPolicy } from "@/types/privacy-policy";
import { toast } from "sonner";
import { Loader2, FileText, Shield } from "lucide-react";

interface LegalModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: "terms" | "privacy";
}

export function LegalModal({ open, onOpenChange, type }: LegalModalProps) {
  const [contents, setContents] = useState<(TermsOfService | PrivacyPolicy)[]>(
    [],
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      fetchContent();
    }
  }, [open, type]);

  const fetchContent = async () => {
    setLoading(true);
    try {
      const response =
        type === "terms"
          ? await termsOfServiceService.getAll()
          : await privacyPolicyService.getAll();

      const items = response.data.data;
      setContents(items);
    } catch (error: any) {
      toast.error(
        error.response?.data?.message ||
          `Gagal memuat ${type === "terms" ? "Terms of Service" : "Privacy Policy"}`,
      );
    } finally {
      setLoading(false);
    }
  };

  const modalTitle =
    type === "terms" ? "Terms of Services Modal" : "Privacy Policy Modal";
  const modalIcon =
    type === "terms" ? (
      <FileText className="w-5 h-5 text-brand-primary" />
    ) : (
      <Shield className="w-5 h-5 text-brand-primary" />
    );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {modalIcon}
            {modalTitle}
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
            </div>
          ) : contents.length > 0 ? (
            <div className="space-y-6">
              <div className="p-4 bg-linear-to-r from-brand-primary/5 to-brand-primary/10 rounded-lg border border-brand-primary/20">
                <p className="text-sm text-gray-600">
                  Terakhir diperbarui:{" "}
                  {new Date(
                    contents[contents.length - 1].updated_at,
                  ).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {contents.length} bagian
                </p>
              </div>

              {/* Display all sections */}
              <div className="prose prose-sm max-w-none space-y-6">
                {contents.map((item, index) => (
                  <div
                    key={item.id}
                    className="border-l-4 border-brand-primary/30 pl-4 py-2"
                  >
                    <h2 className="text-lg font-semibold text-brand-primary-dark mb-3">
                      {item.title}
                    </h2>
                    <div
                      className="text-gray-700 space-y-2"
                      dangerouslySetInnerHTML={{ __html: item.content }}
                    />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <div className="mb-4 flex justify-center opacity-50">
                {modalIcon}
              </div>
              <p>Konten tidak tersedia</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
