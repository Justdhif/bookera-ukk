"use client";
import { useRouter } from "next/navigation";

import { useState } from "react";
import { userService, CreateUserData } from "@/services/user.service";
import { Button } from "@/components/ui/button";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Upload } from "lucide-react";
import { toast } from "sonner";
import { DatePicker } from "@/components/ui/date-picker";
import AvatarUploadModal from "./AvatarUploadModal";

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

interface FormErrors {
  full_name: boolean;
  identification_number: boolean;
  phone_number: boolean;
  occupation: boolean;
  institution: boolean;
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

  const [errors, setErrors] = useState<FormErrors>({
    full_name: false,
    identification_number: false,
    phone_number: false,
    occupation: false,
    institution: false,
  });

  const [avatarPreview, setAvatarPreview] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [avatarModalOpen, setAvatarModalOpen] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarSave = (avatar: string | File) => {
    if (typeof avatar === "string") {
      setAvatarPreview(avatar);
      setFormData((prev) => ({ ...prev, avatar }));
    } else {
      setFormData((prev) => ({ ...prev, avatar }));
      const reader = new FileReader();
      reader.onloadend = () => setAvatarPreview(reader.result as string);
      reader.readAsDataURL(avatar);
    }
  };

  const isFormValid = (): boolean => {
    if (
      !formData.email.trim() ||
      !formData.password.trim() ||
      !formData.full_name.trim()
    )
      return false;

    const hasValidationErrors = Object.values(errors).some(
      (error) => error === true,
    );
    if (hasValidationErrors) return false;

    return true;
  };

  const isSubmitDisabled = (): boolean => submitting || !isFormValid();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const hasErrors = Object.values(errors).some((error) => error === true);
    if (hasErrors) {
      toast.error("Please complete all required fields correctly");
      return;
    }

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
          
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Avatar</CardTitle>
              <CardDescription>
                Upload a profile photo for the user
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
              <Avatar className="h-32 w-32">
                <AvatarImage src={avatarPreview || undefined} />
                <AvatarFallback className="text-2xl">
                  {formData.full_name?.[0]?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <Button
                type="button"
                variant="outline"
                onClick={() => setAvatarModalOpen(true)}
                className="w-full"
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Avatar
              </Button>

              <div className="space-y-2 w-full">
                <div className="flex items-center gap-2">
                  <Label className="text-muted-foreground text-xs w-16">
                    Role:
                  </Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, role: value }))
                    }
                  >
                    <SelectTrigger className="h-7 flex-1 text-xs">
                      <SelectValue>
                        {formData.role === "admin"
                          ? "Admin"
                          : formData.role === "officer:catalog"
                            ? "Catalog Officer"
                            : formData.role === "officer:management"
                              ? "Management Officer"
                              : "User"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="officer:catalog">
                        Catalog Officer
                      </SelectItem>
                      <SelectItem value="officer:management">
                        Management Officer
                      </SelectItem>
                      <SelectItem value="user">User</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <Label className="text-muted-foreground text-xs w-16">
                    Status:
                  </Label>
                  <Select
                    value={formData.is_active ? "active" : "inactive"}
                    onValueChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        is_active: value === "active",
                      }))
                    }
                  >
                    <SelectTrigger className="h-7 flex-1 text-xs">
                      <SelectValue>
                        {formData.is_active ? "Active" : "Inactive"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>User Information</CardTitle>
              <CardDescription>
                Enter the user's details correctly
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Account</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="email" variant="required">
                      Email
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Enter email address"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" variant="required">
                      Password
                    </Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      required
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Minimum 6 characters"
                    />
                  </div>
                </div>
              </div>

              
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Profile</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="full_name" variant="required">
                      Full Name
                    </Label>
                    <Input
                      id="full_name"
                      name="full_name"
                      required
                      value={formData.full_name}
                      onChange={handleInputChange}
                      placeholder="Enter full name"
                      validationType="letters-only"
                      onValidationChange={(isValid: boolean) =>
                        setErrors((prev) => ({ ...prev, full_name: !isValid }))
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
                      value={formData.identification_number}
                      onChange={handleInputChange}
                      placeholder="Enter ID number"
                      validationType="numbers-only"
                      onValidationChange={(isValid: boolean) =>
                        setErrors((prev) => ({
                          ...prev,
                          identification_number: !isValid,
                        }))
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone_number">Phone Number</Label>
                    <Input
                      id="phone_number"
                      name="phone_number"
                      value={formData.phone_number}
                      onChange={handleInputChange}
                      placeholder="Enter phone number"
                      validationType="numbers-only"
                      onValidationChange={(isValid: boolean) =>
                        setErrors((prev) => ({
                          ...prev,
                          phone_number: !isValid,
                        }))
                      }
                    />
                  </div>

                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="gender">Gender</Label>
                    <Select
                      value={formData.gender}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, gender: value }))
                      }
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
                          const month = String(date.getMonth() + 1).padStart(
                            2,
                            "0",
                          );
                          const day = String(date.getDate()).padStart(2, "0");
                          setFormData((prev) => ({
                            ...prev,
                            birth_date: `${year}-${month}-${day}`,
                          }));
                        } else {
                          setFormData((prev) => ({ ...prev, birth_date: "" }));
                        }
                      }}
                      placeholder="Select birth date"
                      dateMode="past"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="occupation">Occupation</Label>
                    <Input
                      id="occupation"
                      name="occupation"
                      value={formData.occupation}
                      onChange={handleInputChange}
                      placeholder="Enter occupation"
                      validationType="letters-only"
                      onValidationChange={(isValid: boolean) =>
                        setErrors((prev) => ({ ...prev, occupation: !isValid }))
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="institution">Class</Label>
                    <Input
                      id="institution"
                      name="institution"
                      value={formData.institution}
                      onChange={handleInputChange}
                      placeholder="Enter class"
                      validationType="alphanumeric"
                      onValidationChange={(isValid: boolean) =>
                        setErrors((prev) => ({
                          ...prev,
                          institution: !isValid,
                        }))
                      }
                    />
                  </div>

                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="address">Address</Label>
                    <Textarea
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="Enter address"
                      rows={2}
                    />
                  </div>

                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      name="bio"
                      value={formData.bio}
                      onChange={handleInputChange}
                      placeholder="Enter bio"
                      rows={3}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </form>

      <AvatarUploadModal
        open={avatarModalOpen}
        onOpenChange={setAvatarModalOpen}
        currentAvatar={avatarPreview}
        onSave={handleAvatarSave}
        userName={formData.full_name || "User"}
      />
    </div>
  );
}
