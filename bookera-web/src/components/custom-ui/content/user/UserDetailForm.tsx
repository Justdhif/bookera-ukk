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

interface UserDetailFormProps {
  user: User;
  isEditMode: boolean;
  formData: any;
  setFormData: (data: any) => void;
  onFullNameValidChange?: (valid: boolean) => void;
  isProfileView?: boolean;
}

export default function UserDetailForm({
  user,
  isEditMode,
  formData,
  setFormData,
  onFullNameValidChange,
  isProfileView,
}: UserDetailFormProps) {
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
                type="email"
                required={isEditMode}
                value={formData.email || ""}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="Enter email"
                disabled={!isEditMode || isProfileView}
              />
            </div>
            {isEditMode && !isProfileView && (
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      password: e.target.value,
                    })
                  }
                  placeholder="Enter password (leave empty to keep current)"
                />
              </div>
            )}
          </div>
        </div>

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
                required={isEditMode}
                value={formData.full_name || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    full_name: e.target.value,
                  })
                }
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
                value={formData.identification_number || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    identification_number: e.target.value,
                  })
                }
                placeholder="Enter identification number"
                disabled={!isEditMode}
                validationType={!isEditMode ? undefined : "numbers-only"}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone_number">Phone Number</Label>
              <Input
                id="phone_number"
                value={formData.phone_number || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    phone_number: e.target.value,
                  })
                }
                placeholder="Enter phone number"
                disabled={!isEditMode}
                validationType={!isEditMode ? undefined : "numbers-only"}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="gender">Gender</Label>
              <Select
                value={formData.gender || ""}
                onValueChange={(value: any) =>
                  setFormData({ ...formData, gender: value })
                }
                disabled={!isEditMode}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
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
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="birth_date">Birth Date</Label>
              <DatePicker
                value={
                  formData.birth_date
                    ? new Date(formData.birth_date + "T00:00:00")
                    : undefined
                }
                onChange={(date) => {
                  if (date) {
                    const year = date.getFullYear();
                    const month = String(date.getMonth() + 1).padStart(2, "0");
                    const day = String(date.getDate()).padStart(2, "0");
                    setFormData({
                      ...formData,
                      birth_date: `${year}-${month}-${day}`,
                    });
                  } else {
                    setFormData({
                      ...formData,
                      birth_date: undefined,
                    });
                  }
                }}
                placeholder="Select birth date"
                disabled={!isEditMode}
                dateMode="past"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="occupation">Occupation</Label>
              <Input
                id="occupation"
                value={formData.occupation || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    occupation: e.target.value,
                  })
                }
                placeholder="Enter occupation"
                disabled={!isEditMode}
                validationType={!isEditMode ? undefined : "letters-only"}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="institution">Institution</Label>
              <Input
                id="institution"
                value={formData.institution || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    institution: e.target.value,
                  })
                }
                placeholder="Enter institution"
                disabled={!isEditMode}
                validationType={!isEditMode ? undefined : "alphanumeric"}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={formData.address || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    address: e.target.value,
                  })
                }
                placeholder="Enter address"
                rows={2}
                disabled={!isEditMode}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={formData.bio || ""}
                onChange={(e) =>
                  setFormData({ ...formData, bio: e.target.value })
                }
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
