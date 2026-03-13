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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
          <div className="space-y-1.5">
            <Label htmlFor="report-reason">{t("reportReason")}</Label>
            <Select value={reason} onValueChange={(v) => setReason(v as PostReportReason)}>
              <SelectTrigger id="report-reason">
                <SelectValue placeholder={t("selectReason")} />
              </SelectTrigger>
              <SelectContent>
                {REPORT_REASONS.map((r) => (
                  <SelectItem key={r} value={r}>
                    {t(`reason_${r}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="report-desc">
              {t("reportDescription")}
            </Label>
            <Textarea
              id="report-desc"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t("reportDescPlaceholder")}
              className="resize-none text-sm"
              maxLength={500}
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="submit" onClick={() => onOpenChange(false)} disabled={submitting}>
            {t("cancel")}
          </Button>
          <Button
            variant="submit"
            onClick={handleSubmit}
            disabled={!reason || submitting}
          >
            {submitting ? t("loading") : t("submitReport")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
