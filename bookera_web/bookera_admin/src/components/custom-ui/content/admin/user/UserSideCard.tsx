"use client";
import { useTranslations } from "next-intl";
import { useState } from "react";
import Link from "next/link";
import { User } from "@/types/user";
import { Borrow } from "@/types/borrow";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BookOpen, Key, Mail, Smartphone, Upload, KeyRound } from "lucide-react";
import EmptyState from "@/components/custom-ui/EmptyState";
import { StaggerContainer, FadeUp } from "@/components/custom-ui/motion";
import ChangePasswordModal from "@/components/custom-ui/modal/ChangePasswordModal";
import ChangePhoneModal from "@/components/custom-ui/modal/ChangePhoneModal";
import ChangeEmailModal from "@/components/custom-ui/modal/ChangeEmailModal";
import RoleBadge from "@/components/custom-ui/badge/RoleBadge";
import ActiveStatusBadge from "@/components/custom-ui/badge/ActiveStatusBadge";
import { PhoneInput } from "@/components/custom-ui/PhoneInput";
import AvatarUploadModal from "./AvatarUploadModal";
import PasswordRequirements from "@/components/custom-ui/content/admin/auth/PasswordRequirements";
import BorrowStatusBadge from "@/components/custom-ui/badge/BorrowStatusBadge";
import Image from "next/image";

interface UserSideCardProps {
  mode?: "add" | "detail";
  user?: User;
  avatarPreview: string;
  isEditMode: boolean;
  formData: any;
  setFormData: (data: any) => void;
  setAvatarPreview: (preview: string) => void;
  recentBorrows?: Borrow[];
  isProfileView?: boolean;
  onPhoneChanged?: (newPhone: string) => void;
  onEmailChanged?: (newEmail: string) => void;
}

export default function UserSideCard({
  mode = "detail",
  user,
  avatarPreview,
  isEditMode,
  formData,
  setFormData,
  setAvatarPreview,
  recentBorrows,
  isProfileView,
  onPhoneChanged,
  onEmailChanged,
}: UserSideCardProps) {
  const t = useTranslations("user");
  const [avatarModalOpen, setAvatarModalOpen] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [changePhoneOpen, setChangePhoneOpen] = useState(false);
  const [changeEmailOpen, setChangeEmailOpen] = useState(false);
  const isAddMode = mode === "add";
  const canEdit = isAddMode || isEditMode;
  const tp = useTranslations("profile");

  const handleAvatarImageChange = (avatar: string | File) => {
    if (typeof avatar === "string") {
      setAvatarPreview(avatar);
      setFormData({ ...formData, avatar });
    } else {
      setFormData({ ...formData, avatar });
      const reader = new FileReader();
      reader.onloadend = () => setAvatarPreview(reader.result as string);
      reader.readAsDataURL(avatar);
    }
  };

  const getRoleDisplay = (role: string) => {
    switch (role) {
      case "member":
        return t("member", { fallback: "Member" });
      case "admin":
        return t("admin");
      case "officer:catalog":
        return t("officerCatalog");
      case "officer:management":
        return t("officerManagement");
      case "user":
        return t("user");
      default:
        return t("selectRole");
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>{t("avatarTitle")}</CardTitle>
          <CardDescription>
            {isAddMode
              ? t("addUserDesc")
              : isEditMode
                ? t("uploadAvatar")
                : t("avatarTitle")}
          </CardDescription>
        </CardHeader>
        <StaggerContainer as={CardContent} className="flex flex-col items-center gap-4">
          <FadeUp delay={0.1} className="relative h-32 w-32">
            <div className="relative h-full w-full rounded-full overflow-hidden ring-4 ring-gray-100 dark:ring-gray-800">
              {avatarPreview ? (
                <Image
                  src={avatarPreview}
                  alt={
                    user?.profile?.full_name || formData.full_name || t("user")
                  }
                  fill
                  sizes="128px"
                  className="object-cover"
                />
              ) : (
                <div className="h-full w-full bg-linear-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center">
                  <span className="text-4xl font-medium text-gray-600 dark:text-gray-400">
                    {(formData.full_name ||
                      user?.profile?.full_name ||
                      "U")[0]?.toUpperCase()}
                  </span>
                </div>
              )}
            </div>
          </FadeUp>
          <FadeUp delay={0.15} className="w-full">
            <Button
              type="button"
              variant={isProfileView ? "brand" : "submit"}
              onClick={() => setAvatarModalOpen(true)}
              className="w-full"
              disabled={!canEdit}
            >
              <Upload className="h-4 w-4 mr-2" />
              {t("uploadAvatar")}
            </Button>
          </FadeUp>
          {isProfileView ? (
            <>
              <FadeUp delay={0.2} className="w-full border-t pt-3 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {tp("statusLabel")}
                  </span>
                  <ActiveStatusBadge isActive={formData.is_active} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {tp("passwordLabel")}
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setPasswordModalOpen(true)}
                    className="h-8 border-brand-primary/20 hover:border-brand-primary/50 text-brand-primary hover:bg-brand-primary/5 font-semibold text-xs rounded-lg transition-all"
                  >
                    <KeyRound className="h-3.5 w-3.5 mr-1.5" />
                    {tp("changePassword")}
                  </Button>
                </div>
              </FadeUp>

              <FadeUp delay={0.25} className="w-full border-t pt-3 space-y-3">
                <div className="space-y-1.5 flex flex-col items-stretch">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="lc-email" className="text-sm">
                      {tp("emailLabel")}
                    </Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setChangeEmailOpen(true)}
                      className="h-8 border-brand-primary/20 hover:border-brand-primary/50 text-brand-primary hover:bg-brand-primary/5 font-semibold text-xs rounded-lg transition-all"
                    >
                      <Mail className="h-3.5 w-3.5 mr-1.5" />
                      {tp("changeEmail")}
                    </Button>
                  </div>
                  <Input
                    id="lc-email"
                    type="email"
                    value={formData.email}
                    disabled
                    className="opacity-60 h-8 text-sm"
                  />
                </div>
                <div className="space-y-1.5 flex flex-col items-stretch">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="lc-phone" className="text-sm">
                      {tp("phoneNumberLabel")}
                    </Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setChangePhoneOpen(true)}
                      className="h-8 border-brand-primary/20 hover:border-brand-primary/50 text-brand-primary hover:bg-brand-primary/5 font-semibold text-xs rounded-lg transition-all"
                    >
                      <Smartphone className="h-3.5 w-3.5 mr-1.5" />
                      {tp("changePhone")}
                    </Button>
                  </div>
                  <PhoneInput
                    id="lc-phone"
                    value={formData.phone_number ?? ""}
                    disabled
                    className="opacity-70"
                  />
                </div>
              </FadeUp>
            </>
          ) : (
            <FadeUp delay={0.2} className="w-full border-t pt-3 space-y-3">
              <h4 className="font-semibold text-sm">{t("accountSection")}</h4>
              <div className="space-y-1.5">
                <Label
                  htmlFor="sc-email"
                  variant={canEdit ? "required" : "default"}
                >
                  {t("email")}
                </Label>
                <Input
                  id="sc-email"
                  type="email"
                  value={formData.email || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder={t("enterEmailAddress")}
                  disabled={!canEdit}
                  required={canEdit}
                />
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label
                    htmlFor="sc-password"
                    variant={isAddMode ? "required" : "default"}
                  >
                    {t("passwordLabel")}
                    {!isAddMode && (
                      <span className="text-xs font-normal text-muted-foreground ml-1">
                        ({t("leaveEmptyToKeep")})
                      </span>
                    )}
                  </Label>
                  <Button
                    type="button"
                    variant="link"
                    size="sm"
                    onClick={() =>
                      setFormData({ ...formData, password: "Bookera09#" })
                    }
                    className="h-auto p-0 text-[10px] font-medium"
                  >
                    {t("defaultPassword")}
                  </Button>
                </div>
                <Input
                  id="sc-password"
                  type="password"
                  value={formData.password || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  placeholder={
                    isAddMode
                      ? t("createStrongPassword")
                      : t("newPasswordOptional")
                  }
                  required={isAddMode}
                  disabled={!canEdit}
                />
                <PasswordRequirements
                  password={formData.password || ""}
                  visible={true}
                />
              </div>
            </FadeUp>
          )}
          <FadeUp delay={0.25} className="w-full border-t pt-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {t("role")}
              </span>
              {isProfileView ? (
                <RoleBadge role={formData.role} />
              ) : (
                <Select
                  value={formData.role}
                  onValueChange={(value) =>
                    setFormData({ ...formData, role: value as any })
                  }
                  disabled={!canEdit}
                >
                  <SelectTrigger className="h-7 w-32 text-xs">
                    <SelectValue>{getRoleDisplay(formData.role)}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="member">{t("member", { fallback: "Member" })}</SelectItem>
                    <SelectItem value="user">{t("user", { fallback: "User" })}</SelectItem>
                    <SelectItem value="admin">{t("admin")}</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>
            {!isProfileView && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {t("status")}
                </span>
                <Select
                  value={formData.is_active ? "active" : "inactive"}
                  onValueChange={(value) =>
                    setFormData({ ...formData, is_active: value === "active" })
                  }
                  disabled={!canEdit}
                >
                  <SelectTrigger className="h-7 w-32 text-xs">
                    <SelectValue>
                      {formData.is_active ? t("active") : t("inactive")}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">{t("active")}</SelectItem>
                    <SelectItem value="inactive">{t("inactive")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </FadeUp>
          {recentBorrows !== undefined && (
            <FadeUp delay={0.3} className="border-t pt-4 mt-2 w-full">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-sm">{t("recentBorrows")}</h4>
                <Link
                  href="/borrows"
                  className="text-xs text-primary hover:underline"
                >
                  {t("viewAllBorrows")}
                </Link>
              </div>
              {recentBorrows.length > 0 ? (
                <div className="space-y-2">
                  {recentBorrows.map((borrow) => (
                    <Link
                      key={borrow.id}
                      href={`/admin/borrows/${borrow.borrow_code}`}
                      className="flex items-center justify-between p-2 rounded-md bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">
                          {t("bookCount", { count: borrow.borrow_details.length })}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(borrow.borrow_date).toLocaleDateString(
                            "id-ID",
                          )}
                        </p>
                      </div>
                      <BorrowStatusBadge
                        status={borrow.status as "open" | "close"}
                      />
                    </Link>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={<BookOpen />}
                  description={t("noRecentBorrows")}
                  variant="compact"
                  className="py-4 border-none"
                />
              )}
            </FadeUp>
          )}
        </StaggerContainer>

      </Card>
      <AvatarUploadModal
        open={avatarModalOpen}
        onOpenChange={setAvatarModalOpen}
        currentAvatar={avatarPreview}
        onSave={handleAvatarImageChange}
        userName={formData.full_name || user?.profile?.full_name || t("user")}
      />
      <ChangePasswordModal
        open={passwordModalOpen}
        onOpenChange={setPasswordModalOpen}
      />
      <ChangePhoneModal
        open={changePhoneOpen}
        onOpenChange={setChangePhoneOpen}
        currentPhone={formData.phone_number}
        onSuccess={(newPhone) => {
          setFormData({ ...formData, phone_number: newPhone });
          onPhoneChanged?.(newPhone);
        }}
      />
      <ChangeEmailModal
        open={changeEmailOpen}
        onOpenChange={setChangeEmailOpen}
        currentEmail={formData.email}
        onSuccess={(newEmail) => {
          setFormData({ ...formData, email: newEmail });
          onEmailChanged?.(newEmail);
        }}
      />
    </>
  );
}
