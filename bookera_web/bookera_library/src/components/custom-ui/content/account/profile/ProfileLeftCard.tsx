"use client";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useState } from "react";
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
import { Upload, KeyRound } from "lucide-react";
import { PhoneInput } from "@/components/custom-ui/PhoneInput";
import RoleBadge from "@/components/custom-ui/badge/RoleBadge";
import ActiveStatusBadge from "@/components/custom-ui/badge/ActiveStatusBadge";
import ChangePhoneModal from "@/components/custom-ui/modal/ChangePhoneModal";
import ChangeEmailModal from "@/components/custom-ui/modal/ChangeEmailModal";
import ChangePasswordModal from "@/components/custom-ui/modal/ChangePasswordModal";
interface ProfileLeftCardProps {
  user: User;
  avatarPreview: string;
  isEditMode: boolean;
  onOpenAvatarModal: () => void;
  onPhoneChanged?: (newPhone: string) => void;
  onEmailChanged?: (newEmail: string) => void;
}
export default function ProfileLeftCard({
  user,
  avatarPreview,
  isEditMode,
  onOpenAvatarModal,
  onPhoneChanged,
  onEmailChanged,
}: ProfileLeftCardProps) {
  const t = useTranslations("profile");
  const [changePhoneOpen, setChangePhoneOpen] = useState(false);
  const [changeEmailOpen, setChangeEmailOpen] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>{t("profilePhoto")}</CardTitle>
          <CardDescription>
            {isEditMode ? t("uploadYourPicture") : t("yourProfilePhoto")}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
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
          <div className="w-full border-t pt-3 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {t("statusLabel")}
              </span>
              <ActiveStatusBadge isActive={user.is_active} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {t("passwordLabel")}
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setChangePasswordOpen(true)}
                className="h-8 border-brand-primary/20 hover:border-brand-primary/50 text-brand-primary hover:bg-brand-primary/5 font-semibold text-xs rounded-lg transition-all"
              >
                <KeyRound className="h-3.5 w-3.5 mr-1.5" />
                {t("changePassword")}
              </Button>
            </div>
          </div>
          <div className="w-full border-t pt-3 space-y-3">
            <div className="space-y-1.5 flex flex-col items-stretch">
              <div className="flex items-center justify-between">
                <Label htmlFor="lc-email" className="text-sm">
                  {t("emailLabel")}
                </Label>
                {isEditMode && (
                  <Button
                    type="button"
                    onClick={() => setChangeEmailOpen(true)}
                    className="text-xs text-brand-primary hover:text-brand-primary/80 font-medium transition-colors"
                  >
                    Ganti Email
                  </Button>
                )}
              </div>
              <Input
                id="lc-email"
                type="email"
                value={user.email}
                disabled
                className="opacity-60 h-8 text-sm"
              />
            </div>
            <div className="space-y-1.5 flex flex-col items-stretch">
              <div className="flex items-center justify-between">
                <Label htmlFor="lc-phone" className="text-sm">
                  {t("phoneNumberLabel")}
                </Label>
                {isEditMode && (
                  <Button
                    type="button"
                    onClick={() => setChangePhoneOpen(true)}
                    className="text-xs text-brand-primary hover:text-brand-primary/80 font-medium transition-colors"
                  >
                    Ganti Nomor
                  </Button>
                )}
              </div>
              <PhoneInput
                id="lc-phone"
                value={user.profile.phone_number ?? ""}
                disabled
                className="opacity-70"
              />
            </div>
          </div>
        </CardContent>
      </Card>
      <ChangePhoneModal
        open={changePhoneOpen}
        onOpenChange={setChangePhoneOpen}
        currentPhone={user.profile.phone_number || ""}
        onSuccess={onPhoneChanged || (() => {})}
      />
      <ChangeEmailModal
        open={changeEmailOpen}
        onOpenChange={setChangeEmailOpen}
        currentEmail={user.email}
        onSuccess={onEmailChanged}
      />
      <ChangePasswordModal
        open={changePasswordOpen}
        onOpenChange={setChangePasswordOpen}
      />
    </>
  );
}
