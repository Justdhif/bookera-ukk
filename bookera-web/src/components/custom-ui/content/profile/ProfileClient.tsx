"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { authService } from "@/services/auth.service";
import { userService } from "@/services/user.service";
import { User, UpdateUserData } from "@/types/user";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { X, Edit, CircleUser } from "lucide-react";
import { toast } from "sonner";
import AvatarUploadModal from "@/components/custom-ui/content/admin/user/AvatarUploadModal";
import ProfileLeftCard from "./ProfileLeftCard";
import ProfileRightCard from "./ProfileRightCard";

export default function ProfileClient() {
  const router = useRouter();
  const t = useTranslations("profile");

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState<Partial<UpdateUserData>>({});
  const [avatarPreview, setAvatarPreview] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [isFullNameValid, setIsFullNameValid] = useState(true);
  const [avatarModalOpen, setAvatarModalOpen] = useState(false);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const res = await authService.me();
      const userData: User = res.data.data.user;
      setUser(userData);
      setFormData({
        email: userData.email,
        role: userData.role,
        is_active: userData.is_active,
        full_name: userData.profile.full_name,
        gender: userData.profile.gender || undefined,
        birth_date: userData.profile.birth_date || undefined,
        phone_number: userData.profile.phone_number || undefined,
        address: userData.profile.address || undefined,
        bio: userData.profile.bio || undefined,
        identification_number:
          userData.profile.identification_number || undefined,
        occupation: userData.profile.occupation || undefined,
        institution: userData.profile.institution || undefined,
      });
      setAvatarPreview(userData.profile.avatar ?? "");
      return userData;
    } catch (error: any) {
      toast.error(error.response?.data?.message || t("failedLoad"));
      router.push("/");
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!formData.full_name?.trim()) {
      toast.error(t("fullNameRequired"));
      return;
    }

    try {
      setSubmitting(true);
      await userService.update(user.id, formData as UpdateUserData);
      toast.success(t("updateSuccess"));
      setIsEditMode(false);
      fetchUser();
    } catch (error: any) {
      toast.error(error.response?.data?.message || t("failedUpdate"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelEdit = () => {
    if (user) {
      setFormData({
        email: user.email,
        role: user.role,
        is_active: user.is_active,
        full_name: user.profile.full_name,
        gender: user.profile.gender || undefined,
        birth_date: user.profile.birth_date || undefined,
        phone_number: user.profile.phone_number || undefined,
        address: user.profile.address || undefined,
        bio: user.profile.bio || undefined,
        identification_number: user.profile.identification_number || undefined,
        occupation: user.profile.occupation || undefined,
        institution: user.profile.institution || undefined,
      });
      setAvatarPreview(user.profile.avatar ?? "");
    }
    setIsEditMode(false);
  };

  const handleAvatarChange = (avatar: string | File) => {
    if (typeof avatar === "string") {
      setAvatarPreview(avatar);
      setFormData((prev) => ({ ...prev, avatar }));
    } else {
      setFormData((prev) => ({ ...prev, avatar }));
      const reader = new FileReader();
      reader.onloadend = () => setAvatarPreview(reader.result as string);
      reader.readAsDataURL(avatar);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-brand-primary rounded-lg">
            <CircleUser className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">{t("myProfile")}</h1>
            {loading ? (
              <Skeleton className="h-4 w-48 mt-1" />
            ) : (
              <p className="text-muted-foreground">
                {isEditMode
                  ? t("editProfileDescription", { name: user?.profile.full_name ?? "" })
                  : t("viewProfileDescription", { name: user?.profile.full_name ?? "" })}
              </p>
            )}
          </div>
        </div>
        {isEditMode ? (
          <div className="flex gap-2">
            <Button
              type="button"
              variant="submit"
              onClick={handleCancelEdit}
              disabled={submitting}
              className="h-8"
            >
              <X className="h-3.5 w-3.5 mr-1.5" />
              {t("cancelEdit")}
            </Button>
            <Button
              type="submit"
              form="profile-form"
              variant="submit"
              disabled={submitting || !formData.full_name?.trim() || !isFullNameValid}
              loading={submitting}
              className="h-8"
            >
              {submitting ? t("saving") : t("saveChanges")}
            </Button>
          </div>
        ) : (
          <Button
            onClick={() => setIsEditMode(true)}
            variant="brand"
            className="h-8 gap-1"
            disabled={loading}
          >
            <Edit className="h-3.5 w-3.5" />
            {t("editProfile")}
          </Button>
        )}
      </div>

      {loading ? (
        <div className="grid gap-6 lg:grid-cols-3">
          <Skeleton className="h-96" />
          <Skeleton className="lg:col-span-2 h-96" />
        </div>
      ) : (
        user && (
          <form id="profile-form" onSubmit={handleSubmit}>
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-1 lg:self-start lg:sticky lg:top-4 space-y-4">
                <ProfileLeftCard
                  user={user}
                  avatarPreview={avatarPreview}
                  isEditMode={isEditMode}
                  onOpenAvatarModal={() => setAvatarModalOpen(true)}
                />
              </div>

              <ProfileRightCard
                isEditMode={isEditMode}
                formData={formData}
                setFormData={setFormData}
                setIsFullNameValid={setIsFullNameValid}
              />
            </div>
          </form>
        )
      )}

      {user && (
        <AvatarUploadModal
          open={avatarModalOpen}
          onOpenChange={setAvatarModalOpen}
          currentAvatar={avatarPreview}
          onSave={handleAvatarChange}
          userName={user.profile.full_name}
        />
      )}
    </div>
  );
}
