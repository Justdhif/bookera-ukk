"use client";

import { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Publisher, UpdatePublisherData } from "@/types/publisher";
import { publisherService } from "@/services/publisher.service";
import { toast } from "sonner";
import { Edit, FileWarning, Save, Upload, X, Trash, Eye } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";


export default function PublisherDetailDialog({
  open,
  setOpen,
  publisher,
  onSuccess,
}: {
  open: boolean;
  setOpen: (v: boolean) => void;
  publisher: Publisher | null;
  onSuccess: () => void;
}) {
  const t = useTranslations("publisher");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState<UpdatePublisherData>({
    name: "",
    description: "",
    is_active: true,
    photo: null,
  });
  const [photoPreview, setPhotoPreview] = useState<string>("");
  const [isDragging, setIsDragging] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (publisher) {
      setFormData({
        name: publisher.name,
        description: publisher.description ?? "",
        is_active: publisher.is_active,
        photo: null,
      });
      setPhotoPreview(publisher.photo ?? "");
    }
    setIsEditMode(false);
    setPhotoError(null);
    setIsDragging(false);
  }, [publisher, open]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, is_active: checked }));
  };

  const handleCancelEdit = () => {
    if (publisher) {
      setFormData({
        name: publisher.name,
        description: publisher.description ?? "",
        is_active: publisher.is_active,
        photo: null,
      });
      setPhotoPreview(publisher.photo ?? "");
      setPhotoError(null);
      setIsDragging(false);
    }
    setIsEditMode(false);
  };

  const handleFileSelect = (file: File) => {
    const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) {
      const msg = "Only JPG, PNG or WEBP images are allowed";
      setPhotoError(msg);
      toast.error(msg);
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      const msg = "Image must be less than 2MB";
      setPhotoError(msg);
      toast.error(msg);
      return;
    }
    setPhotoError(null);
    setFormData((prev) => ({ ...prev, photo: file }));
    const reader = new FileReader();
    reader.onloadend = () => setPhotoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  };

  const handleRemovePhoto = () => {
    setFormData((prev) => ({ ...prev, photo: null }));
    setPhotoPreview(publisher?.photo ?? "");
    setPhotoError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSave = async () => {
    if (!publisher) return;
    if (!formData.name.trim()) {
      toast.error(t("nameRequired"));
      return;
    }
    setIsLoading(true);
    try {
      await publisherService.update(publisher.id, formData);
      toast.success(t("updateSuccess"));
      setIsEditMode(false);
      onSuccess();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update publisher");
    } finally {
      setIsLoading(false);
    }
  };

  if (!publisher) return null;

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!isLoading) {
          setOpen(v);
          if (!v) handleCancelEdit();
        }
      }}
    >
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center justify-between pr-6">
            <DialogTitle>
              {isEditMode ? t("editPublisher") : t("publisherDetails")}
            </DialogTitle>
            {!isEditMode && (
              <Button
                size="sm"
                variant="brand"
                onClick={() => setIsEditMode(true)}
                className="h-7 gap-1"
              >
                <Edit className="h-3.5 w-3.5" />
                Edit
              </Button>
            )}
          </div>
        </DialogHeader>

        <div className="space-y-5">
          <div className="space-y-2">
            <Label variant={isEditMode ? "required" : "default"}>{t("photo")}</Label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              className="hidden"
              onChange={handlePhotoChange}
            />
            <div
              className={cn(
                "relative flex flex-col items-center gap-3 p-5 rounded-xl border-2 border-dashed transition-all duration-200",
                !isEditMode && "opacity-60 cursor-default",
                isEditMode && isDragging &&
                  "border-brand-primary bg-brand-primary/5 dark:bg-brand-primary/10",
                isEditMode && photoError
                  ? "border-red-400 bg-red-50 dark:border-red-700 dark:bg-red-950/30"
                  : isEditMode && !photoPreview
                    ? "border-muted-foreground/30 hover:border-muted-foreground/50 cursor-pointer"
                    : "border-muted",
              )}
              onDragOver={(e) => {
                if (!isEditMode) return;
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={(e) => {
                if (!isEditMode) return;
                e.preventDefault();
                setIsDragging(false);
              }}
              onDrop={(e) => {
                if (!isEditMode) return;
                e.preventDefault();
                setIsDragging(false);
                const file = e.dataTransfer.files?.[0];
                if (file) handleFileSelect(file);
              }}
              onClick={() => {
                if (!isEditMode || photoPreview) return;
                fileInputRef.current?.click();
              }}
            >
              {photoPreview ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="relative">
                    <div className="h-24 w-24 rounded-full overflow-hidden ring-4 ring-muted">
                      <Image
                        src={photoPreview}
                        alt="Preview"
                        width={96}
                        height={96}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    {isEditMode && (
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute -top-1 -right-1 h-6 w-6 rounded-full"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemovePhoto();
                        }}
                      >
                                              <Trash className="w-4 h-4 mr-2" /> <X className="h-3 w-3" />
                                          </Button>
                    )}
                  </div>
                  {isEditMode && (
                    <p className="text-xs text-muted-foreground">
                      Click X to revert or drag a new photo
                    </p>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 py-2 text-center">
                  <div
                    className={cn(
                      "p-3 rounded-full",
                      photoError ? "bg-red-100 dark:bg-red-900/50" : "bg-muted",
                    )}
                  >
                    {photoError ? (
                      <FileWarning className="h-7 w-7 text-red-600 dark:text-red-400" />
                    ) : (
                      <Upload className="h-7 w-7 text-muted-foreground" />
                    )}
                  </div>
                  <p
                    className={cn(
                      "text-sm font-medium",
                      photoError && "text-red-600 dark:text-red-400",
                    )}
                  >
                    {photoError ? photoError : t("dragDropUpload")}
                  </p>
                </div>
              )}
            </div>
            <div className="space-y-1.5 pt-1">
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="w-full gap-2"
                disabled={!isEditMode}
              >
                              <Eye className="w-4 h-4 mr-2" /> <Upload className="h-4 w-4" />{photoPreview ? t("changePhoto") : t("browseFiles")}
                          </Button>
              <p className="text-xs text-muted-foreground text-center">
                {t("formatHint")}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="detail-name"
              variant={isEditMode ? "required" : "default"}
            >
              {t("name")}
            </Label>
            <Input
              id="detail-name"
              name="name"
              placeholder={t("namePlaceholder")}
              value={formData.name}
              onChange={handleInputChange}
              disabled={!isEditMode}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="detail-description">{t("descriptionLabel")}</Label>
            <Textarea
              id="detail-description"
              name="description"
              placeholder={t("descriptionPlaceholder")}
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              disabled={!isEditMode}
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <Label htmlFor="detail-active" className="font-medium">
                {t("active")}
              </Label>
              <p className="text-xs text-muted-foreground">
                {t("activeDesc")}
              </p>
            </div>
            <Switch
              id="detail-active"
              checked={formData.is_active}
              onCheckedChange={handleSwitchChange}
              disabled={!isEditMode}
            />
          </div>

          {isEditMode && (
            <div className="flex gap-2 pt-1">
              <Button
                variant="brand"
                onClick={handleCancelEdit}
                disabled={isLoading}
                className="flex-1 h-9"
              >
                <X className="h-3.5 w-3.5 mr-1.5" />
                Cancel
              </Button>
              <Button
                variant="submit"
                onClick={handleSave}
                disabled={isLoading || !formData.name.trim()}
                loading={isLoading}
                className="flex-1 h-9"
              >
                <Save className="h-3.5 w-3.5 mr-1.5" />
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
