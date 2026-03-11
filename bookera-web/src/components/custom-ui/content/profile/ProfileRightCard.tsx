"use client";

import { useTranslations } from "next-intl";
import { format } from "date-fns";
import { UpdateUserData } from "@/services/user.service";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";

interface ProfileRightCardProps {
  isEditMode: boolean;
  formData: Partial<UpdateUserData>;
  setFormData: (data: Partial<UpdateUserData>) => void;
  setIsFullNameValid: (valid: boolean) => void;
}

export default function ProfileRightCard({
  isEditMode,
  formData,
  setFormData,
  setIsFullNameValid,
}: ProfileRightCardProps) {
  const t = useTranslations("profile");

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
            <div className="space-y-2 sm:col-span-2">
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
              <Label htmlFor="p-id-number">{t("identificationNumberLabel")}</Label>
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
              <Input
                id="p-occupation"
                name="occupation"
                value={formData.occupation || ""}
                onChange={handleInputChange}
                placeholder={t("occupationPlaceholder")}
                disabled={!isEditMode}
                validationType={!isEditMode ? undefined : "letters-only"}
              />
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
      </CardContent>
    </Card>
  );
}
