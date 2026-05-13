"use client";

import { useTranslations } from "next-intl";
import ContentHeader from "@/components/custom-ui/content/ContentHeader";
import { useState, useEffect } from "react";
import { authService } from "@/services/auth.service";
import { userService } from "@/services/user.service";
import { User, UpdateUserData } from "@/types/user";
import { toast } from "sonner";
import DataLoading from "@/components/custom-ui/DataLoading";
import UserSideCard from "../user/UserSideCard";
import UserProfileForm from "../user/UserProfileForm";
import { StaggerContainer, FadeUp } from "@/components/custom-ui/motion";
import { normalizeOccupationValue } from "@/constants/user-occupation";
import { useAuthStore } from "@/store/auth.store";

export default function ProfileClient() {
  const t = useTranslations("user");
  const tp = useTranslations("profile");
  const { setUser: setAuthUser } = useAuthStore();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState<UpdateUserData>({
    email: "",
    role: "user",
    full_name: "",
  });
  const [avatarPreview, setAvatarPreview] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [isFullNameValid, setIsFullNameValid] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await authService.me();
      const userData = res.data.data.user;
      const profile = userData.profile;
      setUser(userData);
      setFormData({
        email: userData.email,
        role: userData.role,
        is_active: userData.is_active,
        username: profile?.username || "",
        full_name: profile?.full_name || "",
        gender: profile?.gender || undefined,
        birth_date: profile?.birth_date || undefined,
        phone_number: profile?.phone_number || undefined,
        address: profile?.address || undefined,
        bio: profile?.bio || undefined,
        identification_number: profile?.identification_number || undefined,
        occupation: profile?.occupation ? normalizeOccupationValue(profile.occupation) : undefined,
        institution: profile?.institution || undefined,
      });
      setAvatarPreview(profile?.avatar || "");
    } catch (error: any) {
      toast.error(error.response?.data?.message || t("loadError"));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!user) return;
    
    if (
      !formData.email?.trim() ||
      !formData.full_name?.trim() ||
      !formData.identification_number?.trim()
    ) {
      toast.error(t("requiredFields"));
      return;
    }

    try {
      setSubmitting(true);
      const res = await userService.update(user.id, formData);
      toast.success(t("updateSuccess"));
      setIsEditMode(false);
      
      // Update local state and auth store
      const updatedUser = res.data.data;
      setUser(updatedUser);
      setAuthUser(updatedUser);
      
      fetchProfile();
    } catch (error: any) {
      toast.error(error.response?.data?.message || t("updateError"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelEdit = () => {
    if (user) {
      const profile = user.profile;
      setFormData({
        email: user.email,
        role: user.role,
        is_active: user.is_active,
        username: profile?.username || "",
        full_name: profile?.full_name || "",
        gender: profile?.gender || undefined,
        birth_date: profile?.birth_date || undefined,
        phone_number: profile?.phone_number || undefined,
        address: profile?.address || undefined,
        bio: profile?.bio || undefined,
        identification_number: profile?.identification_number || undefined,
        occupation: profile?.occupation ? normalizeOccupationValue(profile.occupation) : undefined,
        institution: profile?.institution || undefined,
      });
      setAvatarPreview(profile?.avatar || "");
    }
    setIsEditMode(false);
  };

  return (
    <StaggerContainer className="space-y-6">
      <FadeUp>
        <ContentHeader
          title={tp("title")}
          description={tp("description")}
          showBackButton={false}
          isAdmin
        />
      </FadeUp>
      {loading ? (
        <div className="flex justify-center py-16">
          <DataLoading variant="inline" size="lg" />
        </div>
      ) : (
        user && (
          <div className="grid gap-6 lg:grid-cols-3">
            <FadeUp delay={0.1} className="lg:col-span-1 lg:self-start lg:sticky lg:top-4">
              <UserSideCard
                mode="detail"
                user={user}
                avatarPreview={avatarPreview}
                isEditMode={isEditMode}
                formData={formData}
                setFormData={setFormData}
                setAvatarPreview={setAvatarPreview}
                isProfileView={true}
                onPhoneChanged={fetchProfile}
                onEmailChanged={fetchProfile}
              />
            </FadeUp>
            <FadeUp delay={0.2} className="lg:col-span-2">
              <UserProfileForm
                user={user}
                isEditMode={isEditMode}
                formData={formData}
                setFormData={setFormData}
                onFullNameValidChange={setIsFullNameValid}
                onSubmit={handleSubmit}
                onCancel={handleCancelEdit}
                onEdit={() => setIsEditMode(true)}
                submitting={submitting}
                isSubmitDisabled={
                  !formData.email?.trim() ||
                  !formData.full_name?.trim() ||
                  !formData.identification_number?.trim() ||
                  !isFullNameValid
                }
                isProfileView={true}
                onRefresh={fetchProfile}
              />
            </FadeUp>
          </div>
        )
      )}
    </StaggerContainer>
  );
}
