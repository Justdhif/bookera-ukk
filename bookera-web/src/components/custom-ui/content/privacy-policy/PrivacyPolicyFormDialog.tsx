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
import { PrivacyPolicy } from "@/types/privacy-policy";
import { privacyPolicyService } from "@/services/privacy-policy.service";
import { toast } from "sonner";
export default function PrivacyPolicyFormDialog({
  open,
  setOpen,
  item,
  onSuccess,
}: {
  open: boolean;
  setOpen: (v: boolean) => void;
  item: PrivacyPolicy | null;
  onSuccess: () => void;
}) {
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
    if (!title.trim() || !content.trim()) {
      toast.error("pleaseCompleteRequiredFields");
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        title: title.trim(),
        content: content.trim(),
      };

      if (item) {
        await privacyPolicyService.update(item.id, payload);
        toast.success("privacyPolicyUpdated");
      } else {
        await privacyPolicyService.create(payload);
        toast.success("privacyPolicyAdded");
      }

      setTitle("");
      setContent("");
      setOpen(false);
      onSuccess();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {item ? "editPrivacyPolicy" : "addPrivacyPolicy"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title" variant="required">
              {"Title"}
            </Label>
            <Input
              id="title"
              placeholder="e.g., Privacy Policy - Bookera Library System"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content" variant="required">
              {"contentHTML"}
            </Label>
            <Textarea
              id="content"
              placeholder={`<h2>1. Information We Collect</h2>\n<p>We collect information that you provide...</p>`}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={16}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              {"useHTMLTags"}
            </p>
          </div>

          <Button
            onClick={handleSubmit}
            variant="submit"
            disabled={isLoading || !title.trim() || !content.trim()}
            loading={isLoading}
            className="w-full"
          >
            {isLoading
              ? item
                ? "Saving..."
                : "Adding..."
              : item
                ? "Save Changes"
                : "Add"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
