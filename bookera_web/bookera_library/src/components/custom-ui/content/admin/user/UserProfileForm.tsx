"use client";

import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { User } from "@/types/user";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { PhoneInput } from "@/components/custom-ui/PhoneInput";
import { Edit, X } from "lucide-react";
import {
  OCCUPATION_OPTIONS,
  normalizeOccupationValue,
} from "@/constants/user-occupation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DatePicker } from "@/components/ui/date-picker";
import { format } from "date-fns";
import type { UserOccupation } from "@/types/user";
import { StaggerContainer, FadeUp } from "@/components/custom-ui/motion";

interface UserProfileFormProps {
  user?: User;
  isEditMode: boolean;
  formData: any;
  setFormData: (data: any) => void;
  onFullNameValidChange?: (valid: boolean) => void;
  isProfileView?: boolean;
  onSubmit?: (e: React.FormEvent) => void;
  onCancel?: () => void;
  onEdit?: () => void;
  submitting?: boolean;
  isSubmitDisabled?: boolean;
}

export default function UserProfileForm({
  user,
  isEditMode,
  formData,
  setFormData,
  onFullNameValidChange,
  isProfileView,
  onSubmit,
  onCancel,
  onEdit,
  submitting = false,
  isSubmitDisabled = false,
}: UserProfileFormProps) {
  const t = useTranslations("user");
  const common = useTranslations("common");

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleBirthDateChange = (date: Date | undefined) => {
    setFormData({
      ...formData,
      birth_date: date ? format(date, "yyyy-MM-dd") : undefined,
    });
  };

  useEffect(() => {
    if (isEditMode && onFullNameValidChange) {
      const val = formData.full_name || "";
      const valid = val === "" || /^[a-zA-Z\s]*$/.test(val);
      onFullNameValidChange(valid);
    }
  }, [isEditMode, formData.full_name, onFullNameValidChange]);
  
  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>{t("userInformation")}</CardTitle>
        <CardDescription>
          {isEditMode ? t("editInfoDesc") : t("fullUserDetails")}
        </CardDescription>
      </CardHeader>
      <StaggerContainer as={CardContent} className="space-y-6">
        <FadeUp delay={0.1} className="space-y-4">
          <h3 className="font-semibold text-lg">{t("profileSection")}</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label
                htmlFor="username"
                variant={isEditMode ? "required" : "default"}
              >
                {t("username", { fallback: "Username" })}
              </Label>
              <Input
                id="username"
                name="username"
                required={isEditMode}
                value={formData.username || ""}
                onChange={handleInputChange}
                placeholder={t("enterUsername", { fallback: "Enter username" })}
                disabled={!isEditMode}
                validationType={isEditMode ? "alphanumeric" : undefined}
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="full_name"
                variant={isEditMode ? "required" : "default"}
              >
                {t("fullName")}
              </Label>
              <Input
                id="full_name"
                name="full_name"
                required={isEditMode}
                value={formData.full_name || ""}
                onChange={handleInputChange}
                placeholder={t("enterFullName")}
                disabled={!isEditMode}
                validationType={isEditMode ? "letters-only" : undefined}
                onValidationChange={
                  isEditMode ? onFullNameValidChange : undefined
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone_number">{t("phoneNumber")}</Label>
              <PhoneInput
                id="phone_number"
                value={formData.phone_number || ""}
                onChange={(fullNumber: string) =>
                  setFormData({ ...formData, phone_number: fullNumber })
                }
                disabled={!isEditMode}
              />
            </div>
            <div className="space-y-2">
              <Label 
                htmlFor="identification_number"
                variant={isEditMode ? "required" : "default"}
              >
                {t("identificationNumber")}
              </Label>
              <Input
                id="identification_number"
                name="identification_number"
                required={isEditMode}
                value={formData.identification_number || ""}
                onChange={handleInputChange}
                placeholder={t("enterIdNumber")}
                disabled={!isEditMode}
                validationType={!isEditMode ? undefined : "numbers-only"}
              />
            </div>
            <div className="space-y-2 w-full">
              <Label htmlFor="gender">{t("gender")}</Label>
              <Select
                value={formData.gender || ""}
                onValueChange={(value: any) =>
                  setFormData({ ...formData, gender: value })
                }
                disabled={!isEditMode}
              >
                <SelectTrigger className="w-full">
                  <SelectValue
                    placeholder={t("selectGender")}
                    className="w-full"
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">{t("male")}</SelectItem>
                  <SelectItem value="female">{t("female")}</SelectItem>
                  <SelectItem value="prefer_not_to_say">
                    {t("preferNotToSay")}
                  </SelectItem>
                  <SelectItem value="croissant">{t("croissant", { fallback: "Croissant" })}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="birth_date">{t("birthDate")}</Label>
              <DatePicker
                value={
                  formData.birth_date
                    ? new Date(formData.birth_date + "T00:00:00")
                    : undefined
                }
                onChange={handleBirthDateChange}
                placeholder={t("selectBirthDate")}
                disabled={!isEditMode}
                dateMode="past"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="occupation">{t("occupation")}</Label>
              <Select
                value={normalizeOccupationValue(formData.occupation) || ""}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    occupation: value as UserOccupation,
                  })
                }
                disabled={!isEditMode}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t("enterOccupation")} />
                </SelectTrigger>
                <SelectContent>
                  {OCCUPATION_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {common(option.labelKey)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="institution">{t("institutionLabel")}</Label>
              <Input
                id="institution"
                name="institution"
                value={formData.institution || ""}
                onChange={handleInputChange}
                placeholder={t("enterInstitution")}
                disabled={!isEditMode}
                validationType={!isEditMode ? undefined : "alphanumeric"}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="address">{t("addressLabel")}</Label>
              <Textarea
                id="address"
                name="address"
                value={formData.address || ""}
                onChange={handleInputChange}
                placeholder={t("enterAddress")}
                rows={2}
                disabled={!isEditMode}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="bio">{t("bioLabel")}</Label>
              <Textarea
                id="bio"
                name="bio"
                value={formData.bio || ""}
                onChange={handleInputChange}
                placeholder={t("enterBio")}
                rows={3}
                disabled={!isEditMode}
              />
            </div>
          </div>
        </FadeUp>

        {isEditMode ? (
          onSubmit && (
            <div className="flex justify-end gap-3 mt-6 pt-6 border-t">
              {onCancel && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  disabled={submitting}
                  className="h-8"
                >
                  <X className="h-4 w-4 mr-1" />
                  {t("cancel")}
                </Button>
              )}
              <Button 
                onClick={onSubmit} 
                variant="submit" 
                className="h-8"
                disabled={isSubmitDisabled || submitting}
                loading={submitting}
              >
                {submitting ? t("saving") : (user ? t("saveChanges") : t("saveUser"))}
              </Button>
            </div>
          )
        ) : (
          onEdit && (
            <div className="flex justify-end gap-3 mt-6 pt-6 border-t">
              <Button
                type="button"
                variant="brand"
                onClick={onEdit}
                className="h-8 gap-1"
              >
                <Edit className="h-3.5 w-3.5" />
                {t("editUser")}
              </Button>
            </div>
          )
        )}
      </StaggerContainer>
    </Card>
  );
}
