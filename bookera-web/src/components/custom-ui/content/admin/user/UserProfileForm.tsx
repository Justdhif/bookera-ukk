"use client";

import { useEffect } from "react";
import { User } from "@/types/user";
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DatePicker } from "@/components/ui/date-picker";
import { format } from "date-fns";

interface UserProfileFormProps {
  user?: User;
  isEditMode: boolean;
  formData: any;
  setFormData: (data: any) => void;
  onFullNameValidChange?: (valid: boolean) => void;
  isProfileView?: boolean;
  /** When true, hides the Account (email/password) section — use when UserSideCard handles it */
  hideAccount?: boolean;
}

export default function UserProfileForm({
  user,
  isEditMode,
  formData,
  setFormData,
  onFullNameValidChange,
  isProfileView,
  hideAccount = false,
}: UserProfileFormProps) {
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
        <CardTitle>User Information</CardTitle>
        <CardDescription>
          {isEditMode ? "Edit user information correctly" : "Full user details"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {!hideAccount && (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Account</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  variant={isEditMode ? "required" : "default"}
                >
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required={isEditMode}
                  value={formData.email || ""}
                  onChange={handleInputChange}
                  placeholder="Enter email"
                  disabled={!isEditMode || isProfileView}
                />
              </div>
              {isEditMode && !isProfileView && (
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password || ""}
                    onChange={handleInputChange}
                    placeholder="Enter password (leave empty to keep current)"
                  />
                </div>
              )}
            </div>
          </div>
        )}

        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Profile</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label
                htmlFor="full_name"
                variant={isEditMode ? "required" : "default"}
              >
                Full Name
              </Label>
              <Input
                id="full_name"
                name="full_name"
                required={isEditMode}
                value={formData.full_name || ""}
                onChange={handleInputChange}
                placeholder="Enter full name"
                disabled={!isEditMode}
                validationType={isEditMode ? "letters-only" : undefined}
                onValidationChange={
                  isEditMode ? onFullNameValidChange : undefined
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="identification_number">
                Identification Number
              </Label>
              <Input
                id="identification_number"
                name="identification_number"
                value={formData.identification_number || ""}
                onChange={handleInputChange}
                placeholder="Enter identification number"
                disabled={!isEditMode}
                validationType={!isEditMode ? undefined : "numbers-only"}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone_number">Phone Number</Label>
              <Input
                id="phone_number"
                name="phone_number"
                value={formData.phone_number || ""}
                onChange={handleInputChange}
                placeholder="Enter phone number"
                disabled={!isEditMode}
                validationType={!isEditMode ? undefined : "numbers-only"}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <Select
                value={formData.gender || ""}
                onValueChange={(value: any) =>
                  setFormData({ ...formData, gender: value })
                }
                disabled={!isEditMode}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" className="w-full" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="prefer_not_to_say">
                    Prefer not to say
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="birth_date">Birth Date</Label>
              <DatePicker
                value={
                  formData.birth_date
                    ? new Date(formData.birth_date + "T00:00:00")
                    : undefined
                }
                onChange={handleBirthDateChange}
                placeholder="Select birth date"
                disabled={!isEditMode}
                dateMode="past"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="occupation">Occupation</Label>
              <Input
                id="occupation"
                name="occupation"
                value={formData.occupation || ""}
                onChange={handleInputChange}
                placeholder="Enter occupation"
                disabled={!isEditMode}
                validationType={!isEditMode ? undefined : "letters-only"}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="institution">Institution</Label>
              <Input
                id="institution"
                name="institution"
                value={formData.institution || ""}
                onChange={handleInputChange}
                placeholder="Enter institution"
                disabled={!isEditMode}
                validationType={!isEditMode ? undefined : "alphanumeric"}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                name="address"
                value={formData.address || ""}
                onChange={handleInputChange}
                placeholder="Enter address"
                rows={2}
                disabled={!isEditMode}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                name="bio"
                value={formData.bio || ""}
                onChange={handleInputChange}
                placeholder="Enter bio"
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
