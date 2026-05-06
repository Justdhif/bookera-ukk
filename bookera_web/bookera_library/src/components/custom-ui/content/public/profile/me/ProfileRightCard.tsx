"use client";
import { useTranslations } from "next-intl";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ContentHeader from "@/components/custom-ui/content/ContentHeader";
import { DatePicker } from "@/components/ui/date-picker";
import {
  OCCUPATION_OPTIONS,
  normalizeOccupationValue,
} from "@/constants/user-occupation";
import type { UserOccupation } from "@/types/user";
import {
  AtSign,
  User,
  CreditCard,
  Target,
  Calendar as CalendarIcon,
  Briefcase as BriefcaseIcon,
  Building,
  MapPin,
  FileText,
  Save,
} from "lucide-react";

interface ProfileRightCardProps {
  formData: Partial<UpdateUserData>;
  setFormData: (data: Partial<UpdateUserData>) => void;
  setIsFullNameValid: (valid: boolean) => void;
  onSubmit?: (e: React.FormEvent) => void;
  submitting?: boolean;
  isSubmitDisabled?: boolean;
}

export default function ProfileRightCard({
  formData,
  setFormData,
  setIsFullNameValid,
  onSubmit,
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
    <div className="space-y-6">
      <ContentHeader
        title={t("profileInformation")}
        description={t("editProfileDetails")}
        className="px-0"
      />

      <div className="space-y-8">
        <div className="grid gap-6 sm:grid-cols-2">
          {/* Username */}
          <div className="space-y-2">
            <Label
              htmlFor="p-username"
              variant="required"
              className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground"
            >
              <AtSign className="h-3.5 w-3.5" />
              {t("usernameLabel", { fallback: "Username" })}
            </Label>
            <Input
              id="p-username"
              name="username"
              required={true}
              value={formData.username || ""}
              onChange={handleInputChange}
              placeholder={t("usernamePlaceholder", { fallback: "Enter username" })}
              className="rounded-xl bg-muted/30 border-muted/60 focus:bg-background transition-all"
              validationType="alphanumeric"
            />
          </div>

          {/* Full Name */}
          <div className="space-y-2">
            <Label
              htmlFor="p-full-name"
              variant="required"
              className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground"
            >
              <Target className="h-3.5 w-3.5" />
              {t("fullNameLabel")}
            </Label>
            <Input
              id="p-full-name"
              name="full_name"
              required={true}
              value={formData.full_name || ""}
              onChange={handleInputChange}
              placeholder={t("fullNamePlaceholder")}
              className="rounded-xl bg-muted/30 border-muted/60 focus:bg-background transition-all"
              validationType="letters-only"
              onValidationChange={setIsFullNameValid}
            />
          </div>

          {/* ID Number */}
          <div className="space-y-2">
            <Label
              htmlFor="p-id-number"
              className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground"
            >
              <CreditCard className="h-3.5 w-3.5" />
              {t("identificationNumberLabel")}
            </Label>
            <Input
              id="p-id-number"
              name="identification_number"
              value={formData.identification_number || ""}
              onChange={handleInputChange}
              placeholder={t("idNumberPlaceholder")}
              className="rounded-xl bg-muted/30 border-muted/60 focus:bg-background transition-all"
              validationType="numbers-only"
            />
          </div>

          {/* Gender */}
          <div className="space-y-2">
            <Label
              htmlFor="p-gender"
              className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground"
            >
              <BriefcaseIcon className="h-3.5 w-3.5" />
              {t("genderLabel")}
            </Label>
            <Select
              value={formData.gender || ""}
              onValueChange={(value: any) =>
                setFormData({ ...formData, gender: value })
              }
            >
              <SelectTrigger className="w-full rounded-xl bg-muted/30 border-muted/60 transition-all">
                <SelectValue placeholder={t("selectGender")} />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="male">{t("male")}</SelectItem>
                <SelectItem value="female">{t("female")}</SelectItem>
                <SelectItem value="prefer_not_to_say">
                  {t("preferNotToSay")}
                </SelectItem>
                <SelectItem value="croissant">{t("croissant", { fallback: "Croissant" })}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Birth Date */}
          <div className="space-y-2">
            <Label
              htmlFor="p-birth-date"
              className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground"
            >
              <CalendarIcon className="h-3.5 w-3.5" />
              {t("birthDateLabel")}
            </Label>
            <DatePicker
              value={
                formData.birth_date
                  ? new Date(formData.birth_date + "T00:00:00")
                  : undefined
              }
              onChange={handleBirthDateChange}
              placeholder={t("selectBirthDate")}
              className="w-full"
              dateMode="past"
            />
          </div>

          {/* Occupation */}
          <div className="space-y-2">
            <Label
              htmlFor="p-occupation"
              className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground"
            >
              <BriefcaseIcon className="h-3.5 w-3.5" />
              {t("occupationLabel")}
            </Label>
            <Select
              value={normalizeOccupationValue(formData.occupation) || ""}
              onValueChange={(value) =>
                setFormData({
                  ...formData,
                  occupation: value as UserOccupation,
                })
              }
            >
              <SelectTrigger className="w-full rounded-xl bg-muted/30 border-muted/60 transition-all">
                <SelectValue placeholder={t("occupationPlaceholder")} />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {OCCUPATION_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {common(option.labelKey)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Institution */}
          <div className="space-y-2 sm:col-span-2">
            <Label
              htmlFor="p-institution"
              className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground"
            >
              <Building className="h-3.5 w-3.5" />
              {t("institutionLabel")}
            </Label>
            <Input
              id="p-institution"
              name="institution"
              value={formData.institution || ""}
              onChange={handleInputChange}
              placeholder={t("institutionPlaceholder")}
              className="rounded-xl bg-muted/30 border-muted/60 focus:bg-background transition-all"
              validationType="alphanumeric"
            />
          </div>

          {/* Address */}
          <div className="space-y-2 sm:col-span-2">
            <Label
              htmlFor="p-address"
              className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground"
            >
              <MapPin className="h-3.5 w-3.5" />
              {t("addressLabel")}
            </Label>
            <Textarea
              id="p-address"
              name="address"
              value={formData.address || ""}
              onChange={handleInputChange}
              placeholder={t("addressPlaceholder")}
              rows={2}
              className="rounded-xl bg-muted/30 border-muted/60 focus:bg-background transition-all resize-none"
            />
          </div>

          {/* Bio */}
          <div className="space-y-2 sm:col-span-2">
            <Label
              htmlFor="p-bio"
              className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground"
            >
              <FileText className="h-3.5 w-3.5" />
              {t("bioLabel")}
            </Label>
            <Textarea
              id="p-bio"
              name="bio"
              value={formData.bio || ""}
              onChange={handleInputChange}
              placeholder={t("bioPlaceholder")}
              rows={3}
              className="rounded-xl bg-muted/30 border-muted/60 focus:bg-background transition-all resize-none"
            />
          </div>
        </div>

        {onSubmit && (
          <div className="flex justify-end pt-6 border-t border-border/50">
            <Button
              onClick={onSubmit}
              variant="brand"
              className="h-11 px-8 rounded-xl font-bold shadow-lg shadow-brand-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
              disabled={isSubmitDisabled || submitting}
              loading={submitting}
            >
              {!submitting && <Save className="w-4 h-4 mr-2" />}
              {submitting ? t("saving") : t("saveChanges")}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
