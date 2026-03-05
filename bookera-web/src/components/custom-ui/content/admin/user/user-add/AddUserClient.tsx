"use client";
import { useRouter } from "next/navigation";

import { useState } from "react";
import { userService, CreateUserData } from "@/services/user.service";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { isPasswordValid } from "@/components/custom-ui/content/admin/auth/PasswordRequirements";
import UserSideCard from "../UserSideCard";
import UserProfileForm from "../UserProfileForm";

interface FormData {
  email: string;
  password: string;
  full_name: string;
  identification_number: string;
  phone_number: string;
  gender: string;
  birth_date: string;
  occupation: string;
  institution: string;
  address: string;
  bio: string;
  role: string;
  is_active: boolean;
  avatar?: string | File;
}

export default function AddUserClient() {
  const router = useRouter();

  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
    full_name: "",
    identification_number: "",
    phone_number: "",
    gender: "",
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
      await userService.create(formData as CreateUserData);
      toast.success("User added successfully");
      router.push("/admin/users");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to add user");
    } finally {
      setSubmitting(false);
    }
  };

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
            <h1 className="text-3xl font-bold">Add User</h1>
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
          {submitting ? "Saving..." : "Add User"}
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
