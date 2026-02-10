"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { TermsOfService } from "@/types/terms-of-service";
import { termsOfServiceService } from "@/services/terms-of-service.service";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

export default function TermsOfServiceFormDialog({
  open,
  setOpen,
  item,
  onSuccess,
}: {
  open: boolean;
  setOpen: (v: boolean) => void;
  item: TermsOfService | null;
  onSuccess: () => void;
}) {
  const t = useTranslations('common');
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setTitle(item?.title ?? "");
      setContent(item?.content ?? "");
    }
  }, [item, open]);

  const handleSubmit = async () => {
    if (!title || !content) {
      toast.error(t('pleaseCompleteRequiredFields'));
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        title,
        content,
      };

      if (item) {
        await termsOfServiceService.update(item.id, payload);
        toast.success(t('termsOfServiceUpdated'));
      } else {
        await termsOfServiceService.create(payload);
        toast.success(t('termsOfServiceAdded'));
      }

      setTitle("");
      setContent("");
      setOpen(false);
      onSuccess();
    } catch (err: any) {
      toast.error(err.response?.data?.message || t('errorOccurred'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {item ? t('editTermsOfService') : t('addTermsOfService')}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">
              {t('title')} <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              placeholder={t('termsOfServiceTitlePlaceholder')}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">
              {t('contentHTML')} <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="content"
              placeholder={t('termsOfServiceContentPlaceholder')}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={16}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              {t('useHTMLTags')}
            </p>
          </div>

          <Button
            onClick={handleSubmit}
            variant="submit"
            disabled={isLoading || !title || !content}
            loading={isLoading}
            className="w-full"
          >
            {isLoading
              ? item
                ? t('savingChanges')
                : t('adding')
              : item
                ? t('saveChanges')
                : t('addTermsOfService')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
