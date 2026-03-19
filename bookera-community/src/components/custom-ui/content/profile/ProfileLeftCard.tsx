"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { User } from "@/types/user";
import { UpdateUserData } from "@/types/user";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload } from "lucide-react";
import RoleBadge from "@/components/custom-ui/badge/RoleBadge";
import ActiveStatusBadge from "@/components/custom-ui/badge/ActiveStatusBadge";

interface ProfileLeftCardProps {
  user: User;
  avatarPreview: string;
  isEditMode: boolean;
  onOpenAvatarModal: () => void;
}

export default function ProfileLeftCard({
  user,
  avatarPreview,
  isEditMode,
  onOpenAvatarModal,
}: ProfileLeftCardProps) {
  const t = useTranslations("profile");

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("profilePhoto")}</CardTitle>
        <CardDescription>
          {isEditMode ? t("uploadYourPicture") : t("yourProfilePhoto")}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4">
        {/* Avatar */}
        <div className="relative h-32 w-32">
          <div className="relative h-full w-full rounded-full overflow-hidden ring-4 ring-gray-100 dark:ring-gray-800">
            {avatarPreview ? (
              <Image
                src={avatarPreview}
                alt={user.profile.full_name}
                fill
                sizes="128px"
                className="object-cover"
              />
            ) : (
              <div className="h-full w-full bg-linear-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center">
                <span className="text-4xl font-medium text-gray-600 dark:text-gray-400">
                  {user.profile.full_name?.[0]?.toUpperCase() ?? "U"}
                </span>
              </div>
            )}
          </div>
        </div>

        <Button
          type="button"
          variant="brand"
          onClick={onOpenAvatarModal}
          className="w-full"
          disabled={!isEditMode}
        >
          <Upload className="h-4 w-4 mr-2" />
          {t("uploadAvatar")}
        </Button>

        {/* Role & Status */}
        <div className="w-full border-t pt-3 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">{t("roleLabel")}</span>
            <RoleBadge role={user.role} />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">{t("statusLabel")}</span>
            <ActiveStatusBadge isActive={user.is_active} />
          </div>
          {user.profile.identification_number && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{t("idLabel")}</span>
              <span className="text-sm font-medium font-mono">
                {user.profile.identification_number}
              </span>
            </div>
          )}
        </div>

        {/* Email & Phone — always read-only */}
        <div className="w-full border-t pt-3 space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="lc-email" className="text-sm">
              {t("emailLabel")}
            </Label>
            <Input
              id="lc-email"
              type="email"
              value={user.email}
              disabled
              className="opacity-60 h-8 text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="lc-phone" className="text-sm">
              {t("phoneNumberLabel")}
            </Label>
            <Input
              id="lc-phone"
              type="tel"
              value={user.profile.phone_number ?? ""}
              disabled
              className="opacity-60 h-8 text-sm"
              placeholder="—"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
