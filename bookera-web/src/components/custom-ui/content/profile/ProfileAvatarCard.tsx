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
      ? "Admin"
      : formData.role === "officer:catalog"
        ? "Catalog Officer"
        : formData.role === "officer:management"
          ? "Management Officer"
          : formData.role === "user"
            ? "User"
            : formData.role ?? "—";
  const statusLabel = formData.is_active ? "Active" : "Inactive";

  return (
    <>
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle>Avatar</CardTitle>
          <CardDescription>
            {isEditMode ? "Upload user profile photo" : "User profile photo"}
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
              {"Upload Avatar"}
            </Button>
          )}

          <div className="space-y-2 w-full">
            <div className="flex items-center gap-2">
              <Label className="text-muted-foreground text-xs w-16">
                {"Role"}:
              </Label>
              <span className="flex-1 text-xs font-medium">{roleLabel}</span>
            </div>
            <div className="flex items-center gap-2">
              <Label className="text-muted-foreground text-xs w-16">
                {"Status"}:
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
