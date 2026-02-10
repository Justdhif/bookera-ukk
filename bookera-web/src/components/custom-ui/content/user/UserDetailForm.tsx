"use client";

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
import { useTranslations } from "next-intl";

interface UserDetailFormProps {
  user: User;
  isEditMode: boolean;
  formData: any;
  setFormData: (data: any) => void;
}

export default function UserDetailForm({
  user,
  isEditMode,
  formData,
  setFormData,
}: UserDetailFormProps) {
  const t = useTranslations('common');
  const tAdmin = useTranslations('admin.common');
  
  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>{t('userInfo')}</CardTitle>
        <CardDescription>
          {isEditMode
            ? t('editUserCorrectly')
            : t('fullUserDetail')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">{t('account')}</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="email">
                Email {isEditMode && <span className="text-red-500">*</span>}
              </Label>
              <Input
                id="email"
                type="email"
                required={isEditMode}
                value={formData.email || ""}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder={t('emailPlaceholder')}
                disabled={!isEditMode}
              />
            </div>
            {isEditMode && (
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
                  placeholder={t('passwordPlaceholder')}
                />
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold text-lg">{t('profile')}</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="full_name">
                Nama Lengkap{" "}
                {isEditMode && <span className="text-red-500">*</span>}
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
                placeholder={t('namePlaceholder')}
                disabled={!isEditMode}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="identification_number">Nomor Identitas</Label>
              <Input
                id="identification_number"
                value={formData.identification_number || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    identification_number: e.target.value,
                  })
                }
                placeholder={t('idNumberPlaceholder')}
                disabled={!isEditMode}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone_number">Nomor Telepon</Label>
              <Input
                id="phone_number"
                value={formData.phone_number || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    phone_number: e.target.value,
                  })
                }
                placeholder={t('phonePlaceholder')}
                disabled={!isEditMode}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="gender">Jenis Kelamin</Label>
              <Select
                value={formData.gender || ""}
                onValueChange={(value: any) =>
                  setFormData({ ...formData, gender: value })
                }
                disabled={!isEditMode}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('selectGender')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">{t('male')}</SelectItem>
                  <SelectItem value="female">{t('female')}</SelectItem>
                  <SelectItem value="prefer_not_to_say">
                    {t('preferNotToSay')}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="birth_date">Tanggal Lahir</Label>
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
                placeholder={t('selectBirthDate')}
                disabled={!isEditMode}
                dateMode="past"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="occupation">Pekerjaan</Label>
              <Input
                id="occupation"
                value={formData.occupation || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    occupation: e.target.value,
                  })
                }
                placeholder={t('occupationPlaceholder')}
                disabled={!isEditMode}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="institution">Institusi</Label>
              <Input
                id="institution"
                value={formData.institution || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    institution: e.target.value,
                  })
                }
                placeholder={t('classPlaceholder')}
                disabled={!isEditMode}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="address">{t('address')}</Label>
              <Textarea
                id="address"
                value={formData.address || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    address: e.target.value,
                  })
                }
                placeholder={t('addressPlaceholder')}
                rows={2}
                disabled={!isEditMode}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="bio">{t('bio')}</Label>
              <Textarea
                id="bio"
                value={formData.bio || ""}
                onChange={(e) =>
                  setFormData({ ...formData, bio: e.target.value })
                }
                placeholder={t('bioPlaceholder')}
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
