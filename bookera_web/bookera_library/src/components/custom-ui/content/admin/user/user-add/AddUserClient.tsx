"use client";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import ContentHeader from "@/components/custom-ui/content/ContentHeader";
import { useState } from "react";
import { userService } from "@/services/user.service";
import { CreateUserData } from "@/types/user";
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
  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
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
      <ContentHeader
        title={t("addUser")}
        description={t("addUserDesc")}
        showBackButton
        isAdmin
        rightActions={
          <Button
            onClick={handleSubmit}
            variant="submit"
            disabled={isSubmitDisabled()}
            loading={submitting}
            className="h-8"
          >
            {submitting ? t("saving") : t("addUser")}
          </Button>
        }
      />
      <div>
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
      </div>
    </div>
  );
}
