"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { useTranslations } from "next-intl";

export default function AddUserClient() {
  const router = useRouter();
  const t = useTranslations('admin.users');
  const tCommon = useTranslations('common');
  const [formData, setFormData] = useState<Partial<CreateUserData>>({
    role: "user",
    is_active: true,
  });
  const [avatarPreview, setAvatarPreview] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [avatarModalOpen, setAvatarModalOpen] = useState(false);

  const handleAvatarSave = (avatar: string | File) => {
    if (typeof avatar === "string") {
      setAvatarPreview(avatar);
      setFormData({ ...formData, avatar: avatar });
    } else {
      setFormData({ ...formData, avatar: avatar });
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(avatar);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email?.trim() || !formData.full_name?.trim() || !formData.password?.trim()) {
      toast.error(tCommon('pleaseCompleteRequiredFields'));
      return;
    }

    try {
      setSubmitting(true);
      await userService.create(formData as CreateUserData);
      toast.success(t('addSuccess'));
      router.push("/admin/users");
    } catch (error: any) {
      toast.error(error.response?.data?.message || t('addError'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
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
            <h1 className="text-3xl font-bold">{t('addUser')}</h1>
            <p className="text-muted-foreground">{tCommon('addUserToSystem')}</p>
          </div>
        </div>
        <Button
          type="submit"
          form="user-form"
          variant="submit"
          disabled={submitting || !formData.email?.trim() || !formData.full_name?.trim() || !formData.password?.trim()}
          loading={submitting}
          className="h-8"
        >
          {submitting ? tCommon('saving') : t('addUser')}
        </Button>
      </div>

      <form id="user-form" onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Avatar Card */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Avatar</CardTitle>
              <CardDescription>{tCommon('uploadUserPhoto')}</CardDescription>
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
                {tCommon('uploadAvatar')}
              </Button>

              {/* Role & Status Selects */}
              <div className="space-y-2 w-full">
                <div className="flex items-center gap-2">
                  <Label className="text-muted-foreground text-xs w-16">{tCommon('role')}:</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value: any) =>
                      setFormData({ ...formData, role: value })
                    }
                  >
                    <SelectTrigger className="h-7 flex-1 text-xs">
                      <SelectValue>
                        {formData.role === "admin"
                          ? tCommon('admin')
                          : formData.role === "officer"
                            ? tCommon('officer')
                            : formData.role === "user"
                              ? tCommon('userRole')
                              : tCommon('selectRole')}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">{tCommon('admin')}</SelectItem>
                      <SelectItem value="officer">{tCommon('officer')}</SelectItem>
                      <SelectItem value="user">{tCommon('userRole')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <Label className="text-muted-foreground text-xs w-16">{tCommon('status')}:</Label>
                  <Select
                    value={formData.is_active ? "active" : "inactive"}
                    onValueChange={(value) =>
                      setFormData({
                        ...formData,
                        is_active: value === "active",
                      })
                    }
                  >
                    <SelectTrigger className="h-7 flex-1 text-xs">
                      <SelectValue>
                        {formData.is_active ? tCommon('active') : tCommon('inactive')}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">{tCommon('active')}</SelectItem>
                      <SelectItem value="inactive">{tCommon('inactive')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Form Card */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>{tCommon('userInfo')}</CardTitle>
              <CardDescription>
                {tCommon('editUserCorrectly')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Account Section */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">{tCommon('account')}</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="email" variant="required">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      value={formData.email || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      placeholder={tCommon('emailPlaceholder')}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" variant="required">
                      Password
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      required
                      value={formData.password || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      placeholder={tCommon('minPassword')}
                    />
                  </div>
                </div>
              </div>

              {/* Profile Section */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">{tCommon('profile')}</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="full_name" variant="required">
                      {tCommon('namePlaceholder')}
                    </Label>
                    <Input
                      id="full_name"
                      required
                      value={formData.full_name || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, full_name: e.target.value })
                      }
                      placeholder={tCommon('namePlaceholder')}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="identification_number">
                      {tCommon('identificationNumber')}
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
                      placeholder={tCommon('idNumberPlaceholder')}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone_number">{tCommon('phoneNumber')}</Label>
                    <Input
                      id="phone_number"
                      value={formData.phone_number || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          phone_number: e.target.value,
                        })
                      }
                      placeholder={tCommon('phonePlaceholder')}
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="gender">{tCommon('gender')}</Label>
                    <Select
                      value={formData.gender || ""}
                      onValueChange={(value: any) =>
                        setFormData({ ...formData, gender: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={tCommon('selectGender')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">{tCommon('male')}</SelectItem>
                        <SelectItem value="female">{tCommon('female')}</SelectItem>
                        <SelectItem value="prefer_not_to_say">
                          {tCommon('preferNotToSay')}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="birth_date">{tCommon('birthDate')}</Label>
                    <DatePicker
                      value={
                        formData.birth_date ? new Date(formData.birth_date + 'T00:00:00') : undefined
                      }
                      onChange={(date) => {
                        if (date) {
                          const year = date.getFullYear();
                          const month = String(date.getMonth() + 1).padStart(2, '0');
                          const day = String(date.getDate()).padStart(2, '0');
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
                      placeholder={tCommon('selectBirthDate')}
                      dateMode="past"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="occupation">{tCommon('occupation')}</Label>
                    <Input
                      id="occupation"
                      value={formData.occupation || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, occupation: e.target.value })
                      }
                      placeholder={tCommon('occupationPlaceholder')}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="institution">{tCommon('class')}</Label>
                    <Input
                      id="institution"
                      value={formData.institution || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          institution: e.target.value,
                        })
                      }
                      placeholder={tCommon('classPlaceholder')}
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="address">{tCommon('address')}</Label>
                    <Textarea
                      id="address"
                      value={formData.address || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, address: e.target.value })
                      }
                      placeholder={tCommon('addressPlaceholder')}
                      rows={2}
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="bio">{tCommon('bio')}</Label>
                    <Textarea
                      id="bio"
                      value={formData.bio || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, bio: e.target.value })
                      }
                      placeholder={tCommon('bioPlaceholder')}
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
