"use client";
import { useTranslations } from "next-intl";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User } from "@/types/user";
import { MessageSquare, AlertCircle } from "lucide-react";
import PublicDiscussionGrid from "../../PublicDiscussionGrid";
import PublicComplaintGrid from "../../complaints/PublicComplaintGrid";

interface ProfileActivityTabsProps {
  user: User;
  isMe?: boolean;
}

export default function ProfileActivityTabs({ user, isMe = false }: ProfileActivityTabsProps) {
  const t = useTranslations("profile");

  return (
    <div className="mt-8">
      <Tabs defaultValue="discussions" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2 h-11 p-1 bg-muted/40 rounded-2xl border border-border/50">
          <TabsTrigger value="discussions" className="gap-2 rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <MessageSquare className="h-4 w-4" />
            {isMe ? t("myDiscussions") : t("userDiscussions")}
          </TabsTrigger>
          <TabsTrigger value="complaints" className="gap-2 rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <AlertCircle className="h-4 w-4" />
            {isMe ? t("myComplaints") : t("userComplaints")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="discussions" className="mt-6 outline-none">
          <PublicDiscussionGrid 
            showHeader={false} 
            userSlug={user.slug || user.id.toString()} 
          />
        </TabsContent>

        <TabsContent value="complaints" className="mt-6 outline-none">
          <PublicComplaintGrid 
            showFilters={false} 
            userId={user.id} 
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
