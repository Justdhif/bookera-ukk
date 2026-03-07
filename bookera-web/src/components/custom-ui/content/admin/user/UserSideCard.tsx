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
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload } from "lucide-react";
import AvatarUploadModal from "./AvatarUploadModal";
import PasswordRequirements, {
  isPasswordValid,
} from "@/components/custom-ui/content/admin/auth/PasswordRequirements";
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
}: UserSideCardProps) {
  const t = useTranslations("user");
  const [avatarModalOpen, setAvatarModalOpen] = useState(false);

  const isAddMode = mode === "add";
  const canEdit = isAddMode || isEditMode;

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
      case "admin":
        return "Admin";
      case "officer:catalog":
        return t("officerCatalog");
      case "officer:management":
        return t("officerManagement");
      case "user":
        return t("user");
      default:
        return "Select Role";
    }
  };

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case "open":
        return "Open";
      case "close":
        return "Closed";
      default:
        return status;
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>{t("avatarTitle")}</CardTitle>
          <CardDescription>
            {isAddMode
              ? "Upload a profile photo for the user"
              : isEditMode
                ? "Upload user profile picture"
                : "User photo"}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          <div className="relative h-32 w-32">
            <div className="relative h-full w-full rounded-full overflow-hidden ring-4 ring-gray-100 dark:ring-gray-800">
              {avatarPreview ? (
                <Image
                  src={avatarPreview}
                  alt={
                    user?.profile.full_name || formData.full_name || t("user")
                  }
                  fill
                  sizes="128px"
                  className="object-cover"
                />
              ) : (
                <div className="h-full w-full bg-linear-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center">
                  <span className="text-4xl font-medium text-gray-600 dark:text-gray-400">
                    {(formData.full_name ||
                      user?.profile.full_name ||
                      "U")[0]?.toUpperCase()}
                  </span>
                </div>
              )}
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={() => setAvatarModalOpen(true)}
            className="w-full"
            disabled={!canEdit}
          >
            <Upload className="h-4 w-4 mr-2" />
            {t("uploadAvatar")}
          </Button>

          <div className="w-full border-t pt-3 space-y-3">
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
                disabled={!canEdit || isProfileView}
                required={canEdit}
              />
            </div>
            <div className="space-y-1.5">
              <Label
                htmlFor="sc-password"
                variant={isAddMode ? "required" : "default"}
              >
                Password{" "}
                {!isAddMode && (
                  <span className="text-xs font-normal text-muted-foreground">
                    (leave empty to keep)
                  </span>
                )}
              </Label>
              <Input
                id="sc-password"
                type="password"
                value={formData.password || ""}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                placeholder={
                  isAddMode
                    ? "Create a strong password"
                    : "New password (optional)"
                }
                required={isAddMode}
                disabled={!canEdit}
              />
              <PasswordRequirements
                password={formData.password || ""}
                visible={true}
              />
            </div>
          </div>

          <div className="space-y-2 w-full">
            <div className="flex items-center gap-2">
              <Label className="text-muted-foreground text-xs w-16">
                Role:
              </Label>
              <Select
                value={formData.role}
                onValueChange={(value) =>
                  setFormData({ ...formData, role: value as any })
                }
                disabled={!canEdit}
              >
                <SelectTrigger className="h-7 flex-1 text-xs">
                  <SelectValue>{getRoleDisplay(formData.role)}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">{t("admin")}</SelectItem>
                  <SelectItem value="officer:catalog">
                    {t("officerCatalog")}
                  </SelectItem>
                  <SelectItem value="officer:management">
                    {t("officerManagement")}
                  </SelectItem>
                  <SelectItem value="user">{t("user")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Label className="text-muted-foreground text-xs w-16">
                Status:
              </Label>
              <Select
                value={formData.is_active ? "active" : "inactive"}
                onValueChange={(value) =>
                  setFormData({ ...formData, is_active: value === "active" })
                }
                disabled={!canEdit}
              >
                <SelectTrigger className="h-7 flex-1 text-xs">
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
          </div>

          {recentBorrows !== undefined && (
            <div className="border-t pt-4 mt-2 w-full">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-sm">{t("recentBorrows")}</h4>
                <Link
                  href="/admin/borrows"
                  className="text-xs text-primary hover:underline"
                >
                  View All
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
                          {borrow.borrow_details.length} book
                          {borrow.borrow_details.length !== 1 ? "s" : ""}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(borrow.borrow_date).toLocaleDateString(
                            "id-ID",
                          )}
                        </p>
                      </div>
                      <Badge
                        variant={
                          borrow.status === "open"
                            ? "secondary"
                            : borrow.status === "close"
                              ? "default"
                              : "destructive"
                        }
                        className={`text-xs ${
                          borrow.status === "close"
                            ? "bg-green-600 hover:bg-green-700 text-white"
                            : ""
                        }`}
                      >
                        {getStatusDisplay(borrow.status)}
                      </Badge>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  {t("noRecentBorrows")}
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <AvatarUploadModal
        open={avatarModalOpen}
        onOpenChange={setAvatarModalOpen}
        currentAvatar={avatarPreview}
        onSave={handleAvatarImageChange}
        userName={formData.full_name || user?.profile.full_name || t("user")}
      />
    </>
  );
}
