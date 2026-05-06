"use client";
import { useTranslations } from "next-intl";
import { User } from "@/types/user";
import { AlertCircle } from "lucide-react";
import PublicComplaintGrid from "../../complaints/PublicComplaintGrid";

interface ProfileActivityTabsProps {
  user: User;
  isMe?: boolean;
}

export default function ProfileActivityTabs({ user, isMe = false }: ProfileActivityTabsProps) {
  const t = useTranslations("profile");

  return (
    <div className="mt-8">
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-3 px-1">
          <div className="p-2 rounded-xl bg-orange-500/10 text-orange-600">
            <AlertCircle className="h-5 w-5" />
          </div>
          <h2 className="text-xl font-bold tracking-tight">
            {isMe ? t("myComplaints") : t("userComplaints")}
          </h2>
        </div>
        
        <PublicComplaintGrid 
          showFilters={false} 
          userId={user.id} 
        />
      </div>
    </div>
  );
}
