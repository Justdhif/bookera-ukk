"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { authService } from "@/services/auth.service";
import { userService } from "@/services/user.service";
import { User, UpdateUserData } from "@/types/user";
import DataLoading from "@/components/custom-ui/DataLoading";
import { toast } from "sonner";
import AvatarUploadModal from "@/components/custom-ui/content/admin/user/AvatarUploadModal";
import ProfileLeftCard from "./ProfileLeftCard";
import ProfileRightCard from "./ProfileRightCard";
import { normalizeOccupationValue } from "@/constants/user-occupation";

import { StaggerContainer, FadeUp } from "@/components/custom-ui/motion";

export default function MyProfileClient() {
  const router = useRouter();
  const t = useTranslations("profile");
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
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
        username: userData.profile?.username || "",
        full_name: userData.profile?.full_name || "",
        gender: userData.profile?.gender || undefined,
        birth_date: userData.profile?.birth_date || undefined,
        phone_number: userData.profile?.phone_number || undefined,
        address: userData.profile?.address || undefined,
        bio: userData.profile?.bio || undefined,
        identification_number:
          userData.profile?.identification_number || undefined,
        occupation:
          normalizeOccupationValue(userData.profile?.occupation) || undefined,
        institution: userData.profile?.institution || undefined,
      });
      setAvatarPreview(userData.profile?.avatar ?? "");
      return userData;
    } catch (error: any) {
      toast.error(error.response?.data?.message || t("failedLoad"));
      router.push("/home");
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!user) return;
    if (!formData.username?.trim()) {
      toast.error(t("usernameRequired", { fallback: "Username is required" }));
      return;
    }
    if (!formData.full_name?.trim()) {
      toast.error(t("fullNameRequired"));
      return;
    }
    try {
      setSubmitting(true);
      await userService.update(user.id, formData as UpdateUserData);
      toast.success(t("updateSuccess"));
      fetchUser();
    } catch (error: any) {
      toast.error(error.response?.data?.message || t("failedUpdate"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <StaggerContainer className="space-y-8">
      {loading ? (
        <div className="flex justify-center py-20">
          <DataLoading variant="inline" size="lg" />
        </div>
      ) : (
        user && (
          <FadeUp delay={0.1}>
            <div className="w-full max-w-4xl mx-auto space-y-6">
              <ProfileRightCard
                user={user}
                formData={formData}
                setFormData={setFormData}
                setIsFullNameValid={setIsFullNameValid}
                onSubmit={handleSubmit}
                submitting={submitting}
                isSubmitDisabled={
                  submitting || !formData.full_name?.trim() || !isFullNameValid
                }
              />
            </div>
          </FadeUp>
        )
      )}

      {user && (
        <AvatarUploadModal
          open={avatarModalOpen}
          onOpenChange={setAvatarModalOpen}
          currentAvatar={avatarPreview}
          onSave={(avatar) => {
            if (typeof avatar === "string") {
              setAvatarPreview(avatar);
              setFormData((prev) => ({ ...prev, avatar }));
            } else {
              setFormData((prev) => ({ ...prev, avatar }));
              const reader = new FileReader();
              reader.onloadend = () =>
                setAvatarPreview(reader.result as string);
              reader.readAsDataURL(avatar);
            }
          }}
          userName={user.profile?.full_name || "User"}
        />
      )}
    </StaggerContainer>
  );
}
