"use client";
import { useRouter } from "next/navigation";

import { useState, useEffect } from "react";
import { authService } from "@/services/auth.service";
import { userService, UpdateUserData } from "@/services/user.service";
import { User } from "@/types/user";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, X, Edit2 } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import ProfileAvatarCard from "./ProfileAvatarCard";
import UserDetailForm from "../user/UserDetailForm";

type ProfileVariant = "public" | "admin";

interface ProfileDetailClientProps {
  variant: ProfileVariant;
}

export default function ProfileDetailClient({ variant }: ProfileDetailClientProps) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState<Partial<UpdateUserData>>({});
  const [avatarPreview, setAvatarPreview] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [isFullNameValid, setIsFullNameValid] = useState(true);

  const backHref = variant === "admin" ? "/admin/users" : "/";

  const fetchUser = async () => {
    try {
      setLoading(true);
      const res = await authService.me();
      const userData = res.data.data.user;
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
        identification_number: userData.profile.identification_number || undefined,
        occupation: userData.profile.occupation || undefined,
        institution: userData.profile.institution || undefined,
      });
      setAvatarPreview(userData.profile.avatar);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to load users");
      if (error.response?.status === 401 && variant === "public") {
        router.push("/login");
      } else {
        router.push(variant === "admin" ? "/admin" : "/");
      }
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

    if (
      !formData.email?.trim() ||
      !formData.full_name?.trim() ||
      !formData.role
    ) {
      toast.error("pleaseCompleteRequiredFields");
      return;
    }

    try {
      setSubmitting(true);
      await userService.update(user.id, formData as UpdateUserData);
      toast.success("User updated successfully");
      setIsEditMode(false);
      fetchUser();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update user");
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
      setAvatarPreview(user.profile.avatar);
    }
    setIsEditMode(false);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-8 w-8" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <Skeleton className="h-96" />
          <Skeleton className="lg:col-span-2 h-96" />
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">My Profile</h1>
            <p className="text-muted-foreground">
              {isEditMode
                ? `Edit ${user.profile.full_name}'s profile`
                : `View ${user.profile.full_name}'s profile`}
            </p>
          </div>
        </div>
        {isEditMode ? (
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancelEdit}
              disabled={submitting}
              className="h-8"
            >
              <X className="h-3.5 w-3.5 mr-1.5" />
              {"Cancel"}
            </Button>
            <Button
              type="submit"
              form="profile-form"
              variant="submit"
              disabled={
                submitting ||
                !formData.email?.trim() ||
                !formData.full_name?.trim() ||
                !formData.role ||
                !isFullNameValid
              }
              loading={submitting}
              className="h-8"
            >
              {submitting ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        ) : (
          <Button
            onClick={() => setIsEditMode(true)}
            variant="brand"
            className="h-8 gap-1"
          >
            <Edit2 className="h-3.5 w-3.5" />
            {"Edit User"}
          </Button>
        )}
      </div>

      <form id="profile-form" onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-3">
          <ProfileAvatarCard
            user={user}
            avatarPreview={avatarPreview}
            isEditMode={isEditMode}
            formData={formData}
            setFormData={setFormData}
            setAvatarPreview={setAvatarPreview}
          />

          <UserDetailForm
            user={user}
            isEditMode={isEditMode}
            formData={formData}
            setFormData={setFormData}
            onFullNameValidChange={setIsFullNameValid}
            isProfileView={true}
          />
        </div>
      </form>
    </div>
  );
}
