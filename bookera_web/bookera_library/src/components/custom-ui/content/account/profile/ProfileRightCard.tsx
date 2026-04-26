"use client";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { format } from "date-fns";
import { UpdateUserData } from "@/types/user";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Edit, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import {
  OCCUPATION_OPTIONS,
  normalizeOccupationValue,
} from "@/constants/user-occupation";
import type { UserOccupation } from "@/types/user";
interface ProfileRightCardProps {
  isEditMode: boolean;
  formData: Partial<UpdateUserData>;
  setFormData: (data: Partial<UpdateUserData>) => void;
  setIsFullNameValid: (valid: boolean) => void;
  onSubmit?: (e: React.FormEvent) => void;
  onCancel?: () => void;
  onEdit?: () => void;
  submitting?: boolean;
  isSubmitDisabled?: boolean;
}
export default function ProfileRightCard({
  isEditMode,
  formData,
  setFormData,
  setIsFullNameValid,
  onSubmit,
  onCancel,
  onEdit,
  submitting = false,
  isSubmitDisabled = false,
}: ProfileRightCardProps) {
  const t = useTranslations("profile");
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
  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>{t("profileInformation")}</CardTitle>
        <CardDescription>
          {isEditMode ? t("editProfileDetails") : t("viewProfileDetails")}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label
                htmlFor="p-full-name"
                variant={isEditMode ? "required" : "default"}
              >
                {t("fullNameLabel")}
              </Label>
              <Input
                id="p-full-name"
                name="full_name"
                required={isEditMode}
                value={formData.full_name || ""}
                onChange={handleInputChange}
                placeholder={t("fullNamePlaceholder")}
                disabled={!isEditMode}
                validationType={isEditMode ? "letters-only" : undefined}
                onValidationChange={isEditMode ? setIsFullNameValid : undefined}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="p-id-number">
                {t("identificationNumberLabel")}
              </Label>
              <Input
                id="p-id-number"
                name="identification_number"
                value={formData.identification_number || ""}
                onChange={handleInputChange}
                placeholder={t("idNumberPlaceholder")}
                disabled={!isEditMode}
                validationType={!isEditMode ? undefined : "numbers-only"}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="p-gender">{t("genderLabel")}</Label>
              <Select
                value={formData.gender || ""}
                onValueChange={(value: any) =>
                  setFormData({ ...formData, gender: value })
                }
                disabled={!isEditMode}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t("selectGender")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">{t("male")}</SelectItem>
                  <SelectItem value="female">{t("female")}</SelectItem>
                  <SelectItem value="prefer_not_to_say">
                    {t("preferNotToSay")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="p-birth-date">{t("birthDateLabel")}</Label>
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
              <Label htmlFor="p-occupation">{t("occupationLabel")}</Label>
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
                  <SelectValue placeholder={t("occupationPlaceholder")} />
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
              <Label htmlFor="p-institution">{t("institutionLabel")}</Label>
              <Input
                id="p-institution"
                name="institution"
                value={formData.institution || ""}
                onChange={handleInputChange}
                placeholder={t("institutionPlaceholder")}
                disabled={!isEditMode}
                validationType={!isEditMode ? undefined : "alphanumeric"}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="p-address">{t("addressLabel")}</Label>
              <Textarea
                id="p-address"
                name="address"
                value={formData.address || ""}
                onChange={handleInputChange}
                placeholder={t("addressPlaceholder")}
                rows={2}
                disabled={!isEditMode}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="p-bio">{t("bioLabel")}</Label>
              <Textarea
                id="p-bio"
                name="bio"
                value={formData.bio || ""}
                onChange={handleInputChange}
                placeholder={t("bioPlaceholder")}
                rows={3}
                disabled={!isEditMode}
              />
            </div>
          </div>
        </div>

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
                  {t("cancelEdit")}
                </Button>
              )}
              <Button 
                onClick={onSubmit} 
                variant="submit" 
                className="h-8"
                disabled={isSubmitDisabled || submitting}
                loading={submitting}
              >
                {submitting ? t("saving") : t("saveChanges")}
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
                {t("editProfile")}
              </Button>
            </div>
          )
        )}
      </CardContent>
    </Card>
  );
}
