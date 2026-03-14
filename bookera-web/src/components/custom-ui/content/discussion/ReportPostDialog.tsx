"use client";

import { useState } from "react";
import { Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { discussionPostService } from "@/services/discussion.service";
import type { PostReportReason } from "@/types/discussion";

interface Props {
  postSlug: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const REPORT_REASONS: PostReportReason[] = [
  "spam",
  "harassment",
  "hate_speech",
  "misinformation",
  "inappropriate_content",
  "other",
];

export default function ReportPostDialog({ postSlug, open, onOpenChange }: Props) {
  const t = useTranslations("discussion");
  const [reason, setReason] = useState<PostReportReason | "">("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!reason) return;
    if (reason === "other" && !description.trim()) {
      toast.error(t("reportDescriptionRequired"));
      return;
    }
    setSubmitting(true);
    try {
      await discussionPostService.reportPost(postSlug, {
        reason,
        description: description.trim() || undefined,
      });
      toast.success(t("reportSubmitted"));
      onOpenChange(false);
      setReason("");
      setDescription("");
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 409) {
        toast.error(t("alreadyReported"));
      } else if (status === 403) {
        toast.error(t("cannotReportOwn"));
      } else if (status === 422) {
        toast.error(err?.response?.data?.message || t("failedReport"));
      } else {
        toast.error(t("failedReport"));
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Flag className="h-5 w-5 text-destructive" />
            {t("reportPost")}
          </DialogTitle>
          <DialogDescription>{t("reportPostDesc")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-3">
            <Label className="text-base font-semibold">{t("reportReason")}</Label>
            <RadioGroup value={reason} onValueChange={(v) => setReason(v as PostReportReason)}>
              {REPORT_REASONS.map((r) => (
                <div key={r} className="flex items-center space-x-2">
                  <RadioGroupItem value={r} id={`reason-${r}`} />
                  <Label htmlFor={`reason-${r}`} className="font-normal cursor-pointer text-sm">
                    {t(`reason_${r}`)}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {reason === "other" && (
            <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-200">
              <Label htmlFor="report-desc">
                {t("reportDescription")} <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="report-desc"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t("reportDescPlaceholder")}
                className="resize-none text-sm"
                maxLength={500}
                required
              />
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
            {t("cancel")}
          </Button>
          <Button
            variant="submit"
            onClick={handleSubmit}
            disabled={!reason || (reason === "other" && !description.trim()) || submitting}
          >
            {submitting ? t("loading") : t("submitReport")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
