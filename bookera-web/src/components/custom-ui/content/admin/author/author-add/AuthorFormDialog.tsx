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
import { authorService } from "@/services/author.service";
import { toast } from "sonner";
import { FileWarning, Upload, X } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface FormData {
  name: string;
  bio: string;
  is_active: boolean;
}

export default function AuthorFormDialog({
  open,
  setOpen,
  onSuccess,
}: {
  open: boolean;
  setOpen: (v: boolean) => void;
  onSuccess: () => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    bio: "",
    is_active: true,
  });
  const [photoImage, setPhotoImage] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>("");
  const [isDragging, setIsDragging] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!open) {
      setFormData({ name: "", bio: "", is_active: true });
      setPhotoImage(null);
      setPhotoPreview("");
      setPhotoError(null);
      setIsDragging(false);
    }
  }, [open]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, is_active: checked }));
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
    setPhotoImage(file);
    const reader = new FileReader();
    reader.onloadend = () => setPhotoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  };

  const handleRemovePhoto = () => {
    setPhotoImage(null);
    setPhotoPreview("");
    setPhotoError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const isSubmitDisabled = () =>
    isLoading || !formData.name.trim() || !photoImage;

  const handleSubmit = async () => {
    if (!photoImage) {
      toast.error("Photo is required");
      return;
    }
    setIsLoading(true);
    try {
      await authorService.create({
        name: formData.name,
        bio: formData.bio || undefined,
        photo: photoImage,
        is_active: formData.is_active,
      });
      toast.success("Author added successfully");
      setOpen(false);
      onSuccess();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to add author");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Author</DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          <div className="space-y-2">
            <Label variant="required">Photo</Label>
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
                isDragging &&
                  "border-brand-primary bg-brand-primary/5 dark:bg-brand-primary/10",
                photoError
                  ? "border-red-400 bg-red-50 dark:border-red-700 dark:bg-red-950/30"
                  : !photoPreview
                    ? "border-muted-foreground/30 hover:border-muted-foreground/50 cursor-pointer"
                    : "border-muted",
              )}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                setIsDragging(false);
              }}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                const file = e.dataTransfer.files?.[0];
                if (file) handleFileSelect(file);
              }}
              onClick={() => {
                if (!photoPreview) fileInputRef.current?.click();
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
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Click X to remove or drag a new photo
                  </p>
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
                    {photoError ? photoError : "Drag and drop or click to upload"}
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
              >
                <Upload className="h-4 w-4" />
                {photoPreview ? "Change Photo" : "Browse Files"}
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                Format: JPG, PNG, WEBP. Max 2MB
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name" variant="required">
              Name
            </Label>
            <Input
              id="name"
              name="name"
              placeholder="Enter author name"
              value={formData.name}
              onChange={handleInputChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              name="bio"
              placeholder="Enter author bio (optional)"
              value={formData.bio}
              onChange={handleInputChange}
              rows={3}
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <Label htmlFor="is_active" className="font-medium">
                Active
              </Label>
              <p className="text-xs text-muted-foreground">
                Author will be visible and selectable when active
              </p>
            </div>
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={handleSwitchChange}
            />
          </div>

          <Button
            onClick={handleSubmit}
            variant="submit"
            disabled={isSubmitDisabled()}
            loading={isLoading}
            className="w-full"
          >
            {isLoading ? "Adding..." : "Add Author"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
