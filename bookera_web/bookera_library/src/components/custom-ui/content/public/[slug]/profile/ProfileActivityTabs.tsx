"use client";

import { useEffect, useState } from "react";
import { useTranslations, useFormatter } from "next-intl";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { discussionService } from "@/services/discussion.service";
import { complaintService } from "@/services/complaint.service";
import { DiscussionPost } from "@/types/discussion";
import { Complaint } from "@/types/complaint";
import { User } from "@/types/user";
import DataLoading from "@/components/custom-ui/DataLoading";
import { MessageSquare, AlertCircle, Heart, MessageCircle, Clock, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import EmptyState from "@/components/custom-ui/EmptyState";

interface ProfileActivityTabsProps {
  user: User;
  isMe?: boolean;
}

export default function ProfileActivityTabs({ user, isMe = false }: ProfileActivityTabsProps) {
  const t = useTranslations("profile");
  const tComplaint = useTranslations("complaint");
  const format = useFormatter();
  const [discussions, setDiscussions] = useState<DiscussionPost[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loadingDiscussions, setLoadingDiscussions] = useState(true);
  const [loadingComplaints, setLoadingComplaints] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoadingDiscussions(true);
        // Use slug if available, fallback to ID. Backend now handles both.
        const discRes = await discussionService.getByUser(user.slug || user.id.toString());
        setDiscussions(discRes.data.data.data);
      } catch (error) {
        console.error("Failed to fetch user discussions:", error);
      } finally {
        setLoadingDiscussions(false);
      }

      try {
        setLoadingComplaints(true);
        const compRes = await complaintService.getAll({ user_id: user.id });
        setComplaints(compRes.data.data.data);
      } catch (error) {
        console.error("Failed to fetch user complaints:", error);
      } finally {
        setLoadingComplaints(false);
      }
    };

    fetchActivities();
  }, [user.id, user.slug]);

  return (
    <div className="mt-8">
      <Tabs defaultValue="discussions" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="discussions" className="gap-2">
            <MessageSquare className="h-4 w-4" />
            {isMe ? t("myDiscussions") : t("userDiscussions")}
          </TabsTrigger>
          <TabsTrigger value="complaints" className="gap-2">
            <AlertCircle className="h-4 w-4" />
            {isMe ? t("myComplaints") : t("userComplaints")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="discussions" className="mt-6">
          {loadingDiscussions ? (
            <div className="flex justify-center py-12">
              <DataLoading variant="inline" size="lg" />
            </div>
          ) : discussions.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {discussions.map((post) => (
                <UserDiscussionCard key={post.id} post={post} t={t} format={format} />
              ))}
            </div>
          ) : (
            <EmptyState
              title={t("noDiscussions")}
              description={t("noDiscussionsDesc")}
              icon={<MessageSquare />}
            />
          )}
        </TabsContent>

        <TabsContent value="complaints" className="mt-6">
          {loadingComplaints ? (
            <div className="flex justify-center py-12">
              <DataLoading variant="inline" size="lg" />
            </div>
          ) : complaints.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {complaints.map((complaint) => (
                <UserComplaintCard key={complaint.id} complaint={complaint} tComplaint={tComplaint} format={format} />
              ))}
            </div>
          ) : (
            <EmptyState
              title={t("noComplaints")}
              description={t("noComplaintsDesc")}
              icon={<AlertCircle />}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function UserDiscussionCard({ post, t, format }: { post: DiscussionPost; t: any; format: any }) {
  return (
    <Card className="overflow-hidden border-muted/60 hover:border-primary/40 transition-all hover:shadow-md">
      <CardContent className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
            <Clock className="h-3 w-3" />
            {format.dateTime(new Date(post.created_at), {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            })}
          </div>
          {post.taken_down_at && (
            <Badge variant="destructive" className="text-[10px] px-1.5 py-0">{t("removed")}</Badge>
          )}
        </div>
        
        <p className="text-sm line-clamp-3 min-h-[60px] leading-relaxed">
          {post.caption}
        </p>

        <div className="flex items-center gap-4 pt-2 border-t border-muted/50">
          <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <Heart className="h-3.5 w-3.5 text-rose-500" />
            <span>{post.likes_count}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <MessageCircle className="h-3.5 w-3.5" />
            <span>{post.comments_count}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function UserComplaintCard({ complaint, tComplaint, format }: { complaint: Complaint; tComplaint: any; format: any }) {
  const statusColors: Record<string, string> = {
    pending: "bg-yellow-500/10 text-yellow-600 border-yellow-200",
    verified: "bg-blue-500/10 text-blue-600 border-blue-200",
    on_progress: "bg-purple-500/10 text-purple-600 border-purple-200",
    resolved: "bg-green-500/10 text-green-600 border-green-200",
    rejected: "bg-red-500/10 text-red-600 border-red-200",
  };

  return (
    <Card className="overflow-hidden border-muted/60 hover:border-primary/40 transition-all hover:shadow-md">
      <CardContent className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <Badge 
            variant="outline" 
            className={cn("text-[10px] capitalize font-semibold", statusColors[complaint.status])}
          >
            {tComplaint(`status.${complaint.status}`)}
          </Badge>
          <div className="text-[10px] text-muted-foreground flex items-center gap-1 font-medium">
            <Tag className="h-3 w-3" />
            {tComplaint(`category.${complaint.category}`)}
          </div>
        </div>

        <div className="space-y-1.5">
          <h4 className="font-bold text-sm line-clamp-1">{complaint.title}</h4>
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {complaint.description}
          </p>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-muted/50">
          <div className="text-[10px] text-muted-foreground font-medium">
            {format.dateTime(new Date(complaint.created_at), {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            })}
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-medium">
              <Heart className="h-3 w-3" />
              {complaint.votes_count}
            </div>
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-medium">
              <MessageCircle className="h-3 w-3" />
              {complaint.comments_count}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
