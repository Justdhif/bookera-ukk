"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { AlertTriangle, Shield, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DiscussionPostReport } from "@/types/discussion";

export interface ReviewDialogState {
  report: DiscussionPostReport;
  action: "review" | "dismiss" | "takedown";
}

interface ConfirmData {
  reviewStatus: "reviewed" | "dismissed";
  adminNote?: string;
  takedownReason?: string;
}

interface Props {
  state: ReviewDialogState | null;
  loading: boolean;
  onClose: () => void;
  onConfirm: (data: ConfirmData) => void;
}

export function DiscussionReviewDialog({ state, loading, onClose, onConfirm }: Props) {
  const t = useTranslations("discussion");
  const [adminNote, setAdminNote] = useState("");
  const [takedownReason, setTakedownReason] = useState("");
  const [reviewStatus, setReviewStatus] = useState<"reviewed" | "dismissed">("reviewed");

  useEffect(() => {
    if (state) {
      setAdminNote("");
      setTakedownReason("");
      setReviewStatus(state.action === "dismiss" ? "dismissed" : "reviewed");
    }
  }, [state]);

  const isTakedown = state?.action === "takedown";

  return (
    <Dialog open={!!state} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isTakedown ? (
              <>
                <AlertTriangle className="h-5 w-5 text-red-500" />
                {t("confirmTakedown")}
              </>
            ) : (
              <>
                <Shield className="h-5 w-5 text-purple-500" />
                {t("reviewReport")}
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {!isTakedown && (
            <div className="space-y-1.5">
              <label className="text-sm font-medium">{t("reviewDecision")}</label>
              <Select
                value={reviewStatus}
                onValueChange={(v) => setReviewStatus(v as "reviewed" | "dismissed")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="reviewed">{t("markReviewed")}</SelectItem>
                  <SelectItem value="dismissed">{t("markDismissed")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {isTakedown && (
            <div className="space-y-1.5">
              <label className="text-sm font-medium">
                {t("takedownReason")}
                <span className="text-muted-foreground font-normal ml-1 text-xs">
                  ({t("optional")})
                </span>
              </label>
              <Textarea
                value={takedownReason}
                onChange={(e) => setTakedownReason(e.target.value)}
                placeholder={t("takedownReasonPlaceholder")}
                rows={3}
                maxLength={500}
              />
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-sm font-medium">
              {t("adminNote")}
              <span className="text-muted-foreground font-normal ml-1 text-xs">
                ({t("optional")})
              </span>
            </label>
            <Textarea
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              placeholder={t("adminNotePlaceholder")}
              rows={2}
              maxLength={500}
            />
          </div>
        </div>

        <DialogFooter className="gap-2 flex-wrap">
          <Button variant="brand" onClick={onClose}>
            {t("cancel")}
          </Button>
          <Button
            variant="outline"
            onClick={() =>
              onConfirm({
                reviewStatus,
                adminNote: adminNote || undefined,
                takedownReason: takedownReason || undefined,
              })
            }
            disabled={loading}
          >
                      <Eye className="w-4 h-4 mr-2" /> {isTakedown ? t("takedown") : t("confirm")}
                  </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
