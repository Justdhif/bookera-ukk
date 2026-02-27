"use client";

import { useState } from "react";
import { User } from "@/types/user";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Upload } from "lucide-react";
import { useTranslations } from "next-intl";
import AvatarUploadModal from "../user/AvatarUploadModal";

interface ProfileAvatarCardProps {
  user: User;
  avatarPreview: string;
  isEditMode: boolean;
  formData: any;
  setFormData: (data: any) => void;
  setAvatarPreview: (preview: string) => void;
}

export default function ProfileAvatarCard({
  user,
  avatarPreview,
  isEditMode,
  formData,
  setFormData,
  setAvatarPreview,
}: ProfileAvatarCardProps) {
  const t = useTranslations("common");
  const tAdmin = useTranslations("admin.common");
  const [avatarModalOpen, setAvatarModalOpen] = useState(false);

  const handleAvatarSave = (avatar: string | File) => {
    if (typeof avatar === "string") {
      setAvatarPreview(avatar);
      setFormData({ ...formData, avatar: avatar });
    } else {
      setFormData({ ...formData, avatar: avatar });
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(avatar);
    }
  };

  const roleLabel =
    formData.role === "admin"
      ? t("admin")
      : formData.role === "officer:catalog"
        ? t("officerCatalog")
        : formData.role === "officer:management"
          ? t("officerManagement")
          : formData.role === "user"
            ? t("userRole")
            : formData.role ?? "—";
  const statusLabel = formData.is_active ? tAdmin("active") : t("inactive");

  return (
    <>
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle>Avatar</CardTitle>
          <CardDescription>
            {isEditMode ? t("uploadUserProfile") : t("userPhoto")}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          <Avatar className="h-32 w-32">
            <AvatarImage src={avatarPreview} />
            <AvatarFallback className="text-2xl">
              {user.profile.full_name[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          {isEditMode && (
            <Button
              type="button"
              variant="outline"
              onClick={() => setAvatarModalOpen(true)}
              className="w-full"
            >
              <Upload className="h-4 w-4 mr-2" />
              {t("uploadAvatar")}
            </Button>
          )}

          <div className="space-y-2 w-full">
            <div className="flex items-center gap-2">
              <Label className="text-muted-foreground text-xs w-16">
                {t("role")}:
              </Label>
              <span className="flex-1 text-xs font-medium">{roleLabel}</span>
            </div>
            <div className="flex items-center gap-2">
              <Label className="text-muted-foreground text-xs w-16">
                {t("status")}:
              </Label>
              <span className="flex-1 text-xs font-medium">{statusLabel}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <AvatarUploadModal
        open={avatarModalOpen}
        onOpenChange={setAvatarModalOpen}
        currentAvatar={avatarPreview}
        onSave={handleAvatarSave}
        userName={user.profile.full_name}
      />
    </>
  );
}
