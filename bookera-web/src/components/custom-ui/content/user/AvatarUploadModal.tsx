"use client";

import { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Upload, Check } from "lucide-react";
import { useTranslations } from "next-intl";

interface AvatarUploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentAvatar?: string;
  onSave: (avatarUrl: string | File) => void;
  userName: string;
}

const DEFAULT_AVATARS = [
  "https://api.dicebear.com/7.x/bottts/png?seed=1&backgroundColor=b6e3f4,c7d2fe,ddd6fe",
  "https://api.dicebear.com/7.x/bottts/png?seed=2&backgroundColor=fde68a,fcd34d,fbbf24",
  "https://api.dicebear.com/7.x/bottts/png?seed=3&backgroundColor=fbcfe8,f9a8d4,f472b6",
  "https://api.dicebear.com/7.x/bottts/png?seed=4&backgroundColor=a7f3d0,6ee7b7,34d399",
  "https://api.dicebear.com/7.x/bottts/png?seed=5&backgroundColor=fca5a5,f87171,ef4444",
];

export default function AvatarUploadModal({
  open,
  onOpenChange,
  currentAvatar = "",
  onSave,
  userName,
}: AvatarUploadModalProps) {
  const t = useTranslations('common');
  const tAdminCommon = useTranslations('admin.common');
  const tAdminUsers = useTranslations('admin.users');
  const [selectedAvatar, setSelectedAvatar] = useState<string | File>(
    currentAvatar,
  );
  const [previewUrl, setPreviewUrl] = useState<string>(currentAvatar);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset state ketika modal dibuka dengan currentAvatar
  useEffect(() => {
    if (open) {
      setSelectedAvatar(currentAvatar);
      setPreviewUrl(currentAvatar);
    }
  }, [open, currentAvatar]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedAvatar(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDefaultAvatarClick = (avatarUrl: string) => {
    setSelectedAvatar(avatarUrl);
    setPreviewUrl(avatarUrl);
  };

  const handleSave = () => {
    onSave(selectedAvatar);
    onOpenChange(false);
  };

  const handleCancel = () => {
    setSelectedAvatar(currentAvatar);
    setPreviewUrl(currentAvatar);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-125">
        <DialogHeader>
          <DialogTitle>{t('uploadAvatar')}</DialogTitle>
          <DialogDescription>
            {t('selectDefaultAvatar')} {t('orUploadImage').toLowerCase()}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex flex-col items-center gap-4">
            <Avatar className="h-32 w-32">
              <AvatarImage src={previewUrl || undefined} />
              <AvatarFallback className="text-2xl">
                {userName?.[0]?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <p className="text-sm text-muted-foreground">{t('previewAvatar')}</p>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold">{t('selectDefaultAvatar')}</h4>
            <div className="grid grid-cols-5 gap-2">
              {DEFAULT_AVATARS.map((avatarUrl, index) => {
                const isSelected = previewUrl === avatarUrl;

                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleDefaultAvatarClick(avatarUrl)}
                    className="relative flex items-center justify-center"
                  >
                    <div
                      className={`relative rounded-full transition-all duration-200 ${
                        isSelected
                          ? "ring-2 ring-offset-2 ring-brand-primary ring-offset-background scale-105"
                          : "hover:scale-105 hover:ring-1 hover:ring-gray-300"
                      }`}
                    >
                      <Avatar className="h-14 w-14 border-2 border-white">
                        <AvatarImage src={avatarUrl} />
                        <AvatarFallback className="text-xs">
                          A{index + 1}
                        </AvatarFallback>
                      </Avatar>

                      {isSelected && (
                        <div className="absolute inset-0 bg-primary/20 rounded-full animate-in zoom-in duration-200" />
                      )}
                    </div>

                    {/* Checkmark indicator */}
                    {isSelected && (
                      <div className="absolute -top-1 right-1 h-5 w-5 bg-brand-primary rounded-full flex items-center justify-center shadow-md border border-white z-10">
                        <Check className="h-3 w-3 text-white" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-semibold">{t('orUploadImage')}</h4>
            <div className="flex flex-col gap-2">
              <Input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="w-full"
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload dari Komputer
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                Format: JPG, PNG. Maksimal 2MB
              </p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleCancel}>
            {tAdminCommon('cancel')}
          </Button>
          <Button type="button" variant="submit" onClick={handleSave}>
            {tAdminUsers('saveAvatar')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
