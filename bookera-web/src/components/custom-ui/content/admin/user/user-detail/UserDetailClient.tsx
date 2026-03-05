"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { userService, UpdateUserData } from "@/services/user.service";
import { User } from "@/types/user";
import { Button } from "@/components/ui/button";
import { ArrowLeft, X, Edit } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import UserSideCard from "../UserSideCard";
import UserProfileForm from "../UserProfileForm";

export default function UserDetailClient() {
  const router = useRouter();
  const params = useParams();
  const identificationNumber = params.identificationNumber as string;

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState<Partial<UpdateUserData>>({});
  const [avatarPreview, setAvatarPreview] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [isFullNameValid, setIsFullNameValid] = useState(true);

  useEffect(() => {
    fetchUser();
  }, [identificationNumber]);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const res = await userService.showByIdentification(identificationNumber);
      setUser(res.data.data);
      setFormData({
        email: res.data.data.email,
        role: res.data.data.role,
        is_active: res.data.data.is_active,
        full_name: res.data.data.profile.full_name,
        gender: res.data.data.profile.gender || undefined,
        birth_date: res.data.data.profile.birth_date || undefined,
        phone_number: res.data.data.profile.phone_number || undefined,
        address: res.data.data.profile.address || undefined,
        bio: res.data.data.profile.bio || undefined,
        identification_number:
          res.data.data.profile.identification_number || undefined,
        occupation: res.data.data.profile.occupation || undefined,
        institution: res.data.data.profile.institution || undefined,
      });
      setAvatarPreview(res.data.data.profile.avatar);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to load user data");
      router.push("/admin/users");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (
      !formData.email?.trim() ||
      !formData.full_name?.trim() ||
      !formData.role
    ) {
      toast.error("Please complete all required fields");
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
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/admin/users")}
            className="h-8 w-8"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">User Details</h1>
            <p className="text-muted-foreground">
              {isEditMode ? "Edit user information" : "View user details"}
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
              Cancel
            </Button>
            <Button
              type="submit"
              form="user-form"
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
            <Edit className="h-3.5 w-3.5" />
            Edit User
          </Button>
        )}
      </div>

      <form id="user-form" onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-1 lg:self-start lg:sticky lg:top-4">
            <UserSideCard
              mode="detail"
              user={user}
              avatarPreview={avatarPreview}
              isEditMode={isEditMode}
              formData={formData}
              setFormData={setFormData}
              setAvatarPreview={setAvatarPreview}
            />
          </div>

          <UserProfileForm
            user={user}
            isEditMode={isEditMode}
            formData={formData}
            setFormData={setFormData}
            onFullNameValidChange={setIsFullNameValid}
            hideAccount={true}
          />
        </div>
      </form>
    </div>
  );
}
