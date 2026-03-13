"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

import { useState } from "react";
import { userService, CreateUserData } from "@/services/user.service";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { isPasswordValid } from "@/components/custom-ui/content/admin/auth/PasswordRequirements";
import UserSideCard from "../UserSideCard";
import UserProfileForm from "../UserProfileForm";


export default function AddUserClient() {
    const t = useTranslations("user");
  const router = useRouter();

  const [formData, setFormData] = useState<CreateUserData>({
    email: "",
    password: "",
    full_name: "",
    identification_number: "",
    phone_number: "",
    gender: undefined,
    birth_date: "",
    occupation: "",
    institution: "",
    address: "",
    bio: "",
    role: "user",
    is_active: true,
  });

  const [avatarPreview, setAvatarPreview] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [isFullNameValid, setIsFullNameValid] = useState(true);

  const isFormValid = (): boolean => {
    return (
      !!formData.email.trim() &&
      isPasswordValid(formData.password) &&
      !!formData.full_name.trim() &&
      isFullNameValid
    );
  };

  const isSubmitDisabled = (): boolean => submitting || !isFormValid();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSubmitting(true);
      await userService.create(formData);
      toast.success(t("addSuccess"));
      router.push("/admin/users");
    } catch (error: any) {
      toast.error(error.response?.data?.message || t("addError"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="brand"
            size="icon"
            className="h-8 w-8"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{t("addUser")}</h1>
            <p className="text-muted-foreground">
              Add a new user to the system
            </p>
          </div>
        </div>
        <Button
          type="submit"
          form="user-form"
          variant="submit"
          disabled={isSubmitDisabled()}
          loading={submitting}
          className="h-8"
        >
          {submitting ? "Saving..." : t("addUser")}
        </Button>
      </div>

      <form id="user-form" onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-1 lg:self-start lg:sticky lg:top-4">
            <UserSideCard
              mode="add"
              avatarPreview={avatarPreview}
              isEditMode={true}
              formData={formData}
              setFormData={setFormData}
              setAvatarPreview={setAvatarPreview}
            />
          </div>

          <UserProfileForm
            isEditMode={true}
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
