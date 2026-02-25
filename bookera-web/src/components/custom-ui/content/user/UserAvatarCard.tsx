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
import Image from "next/image";

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

  const getRoleDisplay = (role: string) => {
    switch (role) {
      case "admin":
        return "Admin";
      case "officer:catalog":
        return "Catalog Officer";
      case "officer:management":
        return "Management Officer";
      case "user":
        return "User";
      default:
        return "Select Role";
    }
  };

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case "borrowed":
        return "Borrowed";
      case "returned":
        return "Returned";
      case "overdue":
        return "Overdue";
      default:
        return status;
    }
  };

  return (
    <>
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle>Avatar</CardTitle>
          <CardDescription>
            {isEditMode ? "Upload user profile picture" : "User photo"}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          <div className="relative h-32 w-32">
            <div className="relative h-full w-full rounded-full overflow-hidden ring-4 ring-gray-100 dark:ring-gray-800">
              {avatarPreview ? (
                <Image
                  src={avatarPreview}
                  alt={user.profile.full_name}
                  fill
                  sizes="128px"
                  className="object-cover"
                  unoptimized={true}
                />
              ) : (
                <div className="h-full w-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center">
                  <span className="text-4xl font-medium text-gray-600 dark:text-gray-400">
                    {user.profile.full_name[0]?.toUpperCase()}
                  </span>
                </div>
              )}
            </div>
          </div>
          {isEditMode && (
            <Button
              type="button"
              variant="outline"
              onClick={() => setAvatarModalOpen(true)}
              className="w-full"
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload Avatar
            </Button>
          )}

          <div className="space-y-2 w-full">
            <div className="flex items-center gap-2">
              <Label className="text-muted-foreground text-xs w-16">
                Role:
              </Label>
              <Select
                value={formData.role}
                onValueChange={(value) =>
                  setFormData({ ...formData, role: value as any })
                }
                disabled={!isEditMode}
              >
                <SelectTrigger className="h-7 flex-1 text-xs">
                  <SelectValue>{getRoleDisplay(formData.role)}</SelectValue>
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
                  setFormData({
                    ...formData,
                    is_active: value === "active",
                  })
                }
                disabled={!isEditMode}
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

          <div className="border-t pt-4 mt-4 w-full">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-sm">Recent Loans</h4>
              <Button
                variant="link"
                className="h-auto p-0 text-xs cursor-pointer"
                onClick={() => router.push("/admin/loans")}
              >
                View All
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
                        {loan.loan_details.length} book
                        {loan.loan_details.length !== 1 ? "s" : ""}
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
                      {getStatusDisplay(loan.status)}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No recent loans
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
