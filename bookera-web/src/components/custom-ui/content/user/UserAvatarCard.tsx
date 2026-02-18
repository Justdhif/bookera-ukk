"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { User } from "@/types/user";
import { Loan } from "@/types/loan";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload } from "lucide-react";
import AvatarUploadModal from "./AvatarUploadModal";
import { useTranslations } from "next-intl";

interface UserAvatarCardProps {
  user: User;
  avatarPreview: string;
  isEditMode: boolean;
  formData: any;
  setFormData: (data: any) => void;
  setAvatarPreview: (preview: string) => void;
  recentLoans: Loan[];
}

export default function UserAvatarCard({
  user,
  avatarPreview,
  isEditMode,
  formData,
  setFormData,
  setAvatarPreview,
  recentLoans,
}: UserAvatarCardProps) {
  const router = useRouter();
  const t = useTranslations('common');
  const tAdmin = useTranslations('admin.common');
  const tLoans = useTranslations('loans');
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

  return (
    <>
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle>Avatar</CardTitle>
          <CardDescription>
            {isEditMode ? t('uploadUserProfile') : t('userPhoto')}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          <Avatar className="h-32 w-32">
            <AvatarImage src={avatarPreview} />
            <AvatarFallback className="text-2xl">
              {user.profile.full_name[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          {isEditMode && (
            <Button
              type="button"
              variant="outline"
              onClick={() => setAvatarModalOpen(true)}
              className="w-full"
            >
              <Upload className="h-4 w-4 mr-2" />
              {t('uploadAvatar')}
            </Button>
          )}

          <div className="space-y-2 w-full">
            <div className="flex items-center gap-2">
              <Label className="text-muted-foreground text-xs w-16">{t('role')}:</Label>
              <Select
                value={formData.role}
                onValueChange={(value) =>
                  setFormData({ ...formData, role: value as any })
                }
                disabled={!isEditMode}
              >
                <SelectTrigger className="h-7 flex-1 text-xs">
                  <SelectValue>
                    {formData.role === "admin"
                      ? t('admin')
                      : formData.role === "officer:catalog"
                        ? t('officerCatalog')
                        : formData.role === "officer:management"
                          ? t('officerManagement')
                          : formData.role === "user"
                            ? t('userRole')
                            : t('selectRole')}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">{t('admin')}</SelectItem>
                  <SelectItem value="officer:catalog">{t('officerCatalog')}</SelectItem>
                  <SelectItem value="officer:management">{t('officerManagement')}</SelectItem>
                  <SelectItem value="user">{t('userRole')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Label className="text-muted-foreground text-xs w-16">{t('status')}:</Label>
              <Select
                value={formData.is_active ? "active" : "inactive"}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    is_active: value === "active",
                  })
                }
                disabled={!isEditMode}
              >
                <SelectTrigger className="h-7 flex-1 text-xs">
                  <SelectValue>
                    {formData.is_active ? tAdmin('active') : t('inactive')}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">{tAdmin('active')}</SelectItem>
                  <SelectItem value="inactive">{t('inactive')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="border-t pt-4 mt-4 w-full">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-sm">{t('recentLoans')}</h4>
              <Button
                variant="link"
                className="h-auto p-0 text-xs cursor-pointer"
                onClick={() => router.push("/admin/loans")}
              >
                {t('viewAll')}
              </Button>
            </div>
            {recentLoans.length > 0 ? (
              <div className="space-y-2">
                {recentLoans.map((loan) => (
                  <div
                    key={loan.id}
                    className="flex items-center justify-between p-2 rounded-md bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                    onClick={() => router.push(`/admin/loans/${loan.id}`)}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">
                        {tAdmin('booksCount', { count: loan.loan_details.length })}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(loan.loan_date).toLocaleDateString("id-ID")}
                      </p>
                    </div>
                    <Badge
                      variant={
                        loan.status === "borrowed"
                          ? "secondary"
                          : loan.status === "returned"
                            ? "default"
                            : "destructive"
                      }
                      className={`text-xs ${
                        loan.status === "returned"
                          ? "bg-green-600 hover:bg-green-700 text-white"
                          : ""
                      }`}
                    >
                      {loan.status === "borrowed"
                        ? "Dipinjam"
                        : loan.status === "returned"
                          ? "Dikembalikan"
                          : "Terlambat"}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  {tLoans('noLoans')}
                </p>
            )}
          </div>
        </CardContent>
      </Card>

      <AvatarUploadModal
        open={avatarModalOpen}
        onOpenChange={setAvatarModalOpen}
        currentAvatar={avatarPreview}
        onSave={handleAvatarSave}
        userName={user.profile.full_name}
      />
    </>
  );
}