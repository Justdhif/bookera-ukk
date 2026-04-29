"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname, useParams } from "next/navigation";
import ContentHeader from "@/components/custom-ui/content/ContentHeader";
import { useTranslations } from "next-intl";
import { authService } from "@/services/auth.service";
import { followService } from "@/services/follow.service";
import { useChatStore } from "@/store/chat.store";
import { User } from "@/types/user";
import { Button } from "@/components/ui/button";
import DataLoading from "@/components/custom-ui/DataLoading";
import { Edit, Phone, Briefcase, User as UserIcon, UserPlus, UserMinus, MessageSquareText, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { normalizeOccupationValue, getOccupationLabelKey } from "@/constants/user-occupation";
import Image from "next/image";
import Link from "next/link";
import ProfileActivityTabs from "./ProfileActivityTabs";
import ImagePreviewDialog from "@/components/custom-ui/ImagePreviewDialog";
import { cn } from "@/lib/utils";

export default function ProfileClient() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const slug = params.slug as string;
  const t = useTranslations("profile");
  const { openChat } = useChatStore();
  
  const [user, setUser] = useState<User | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [avatarPreview, setAvatarPreview] = useState<string>("");
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const fetchUser = async () => {
    try {
      setLoading(true);
      
      let meData: User | null = null;
      try {
        const meRes = await authService.me();
        meData = meRes.data.data.user;
        setCurrentUser(meData);
      } catch (err) {
        setCurrentUser(null);
      }

      let userData: User;
      if (meData && (slug === meData.slug || slug === "me" || !slug)) {
        userData = meData;
      } else if (!meData && (slug === "me" || !slug)) {
        router.push("/login");
        return null;
      } else {
        const otherRes = await followService.getUserPublicProfile(slug);
        userData = otherRes.data.data;
      }

      setUser(userData);
      setIsFollowing(userData.is_following ?? false);
      setAvatarPreview(userData.profile?.avatar ?? "");
      return userData;
    } catch (error: any) {
      toast.error(error.response?.data?.message || t("failedLoad"));
      router.push("/home");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const handleFollowToggle = async () => {
    if (!user) return;
    try {
      setIsActionLoading(true);
      if (isFollowing) {
        await followService.unfollow("user", user.id);
        setIsFollowing(false);
        setUser(prev => prev ? { ...prev, followers_count: (prev.followers_count ?? 1) - 1 } : null);
        toast.success(t("unfollowedSuccess"));
      } else {
        await followService.follow("user", user.id);
        setIsFollowing(true);
        setUser(prev => prev ? { ...prev, followers_count: (prev.followers_count ?? 0) + 1 } : null);
        toast.success(t("followedSuccess"));
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || t("followActionFailed"));
    } finally {
      setIsActionLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, [slug]);

  return (
    <div className="space-y-6">
      <ContentHeader
        title={t("userProfile")}
        description={
          loading ? (
            <DataLoading variant="inline" size="sm" className="justify-start mt-1" />
          ) : (
            t("viewProfileDescription", {
              name: user?.profile?.full_name ?? "",
            })
          )
        }
        showBackButton
      />
      {loading ? (
        <div className="flex justify-center py-16">
          <DataLoading variant="inline" size="lg" />
        </div>
      ) : (
        user && (
          <>
            <div className="flex flex-col gap-6 items-start mb-10 w-full">
              <div className="flex flex-row gap-5 md:gap-8 items-center w-full">
                <div 
                  className="relative h-24 w-24 md:h-40 md:w-40 shrink-0 cursor-pointer group"
                  onClick={() => avatarPreview && setIsPreviewOpen(true)}
                >
                  <div className="relative h-full w-full rounded-full overflow-hidden ring-4 ring-brand-primary/10 dark:ring-brand-primary/20 shadow-xl transition-all group-hover:ring-brand-primary/30">
                    {avatarPreview ? (
                      <Image
                        src={avatarPreview}
                        alt={user.profile?.full_name || "Avatar"}
                        fill
                        sizes="160px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="h-full w-full bg-linear-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center">
                        <span className="text-4xl font-medium text-gray-600 dark:text-gray-400">
                          {user.profile?.full_name?.[0]?.toUpperCase() ?? "U"}
                        </span>
                      </div>
                    )}
                    {avatarPreview && (
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-white text-xs font-medium">{t("view")}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col justify-center flex-1">
                  <h2 className="text-xl md:text-3xl font-bold tracking-tight text-foreground">
                    {user.profile?.full_name}
                  </h2>
                  
                  <div className="flex items-center gap-6 md:gap-8 mt-3">
                    <div className="flex items-end gap-1">
                      <span className="font-bold text-lg text-foreground">{user.discussion_posts_count ?? 0}</span>
                      <span className="text-xs text-muted-foreground">{t("posts")}</span>
                    </div>
                    <div className="flex items-end gap-1">
                      <span className="font-bold text-lg text-foreground">{user.complaints_count ?? 0}</span>
                      <span className="text-xs text-muted-foreground">{t("complaints")}</span>
                    </div>
                    <div className="flex items-end gap-1">
                      <span className="font-bold text-lg text-foreground">{user.followers_count ?? 0}</span>
                      <span className="text-xs text-muted-foreground">{t("followers")}</span>
                    </div>
                    <div className="flex items-end gap-1">
                      <span className="font-bold text-lg text-foreground">{user.following_count ?? 0}</span>
                      <span className="text-xs text-muted-foreground">{t("following")}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 md:gap-x-6 gap-y-2 mt-4 text-xs md:text-sm">
                    {user.profile?.gender && (
                      <div className="flex items-center text-muted-foreground group">
                        <div className="p-1.5 md:p-2 bg-brand-primary/5 rounded-lg mr-2 group-hover:bg-brand-primary/10 transition-colors">
                          <UserIcon className="w-3.5 h-3.5 md:w-4 md:h-4 text-brand-primary" />
                        </div>
                        <span className="font-medium text-foreground/80">
                          {user.profile.gender === 'male' ? t('male') : user.profile.gender === 'female' ? t('female') : t('preferNotToSay')}
                        </span>
                      </div>
                    )}
                    {user.profile?.occupation && (
                      <div className="flex items-center text-muted-foreground group">
                        <div className="p-1.5 md:p-2 bg-brand-primary/5 rounded-lg mr-2 group-hover:bg-brand-primary/10 transition-colors">
                          <Briefcase className="w-3.5 h-3.5 md:w-4 md:h-4 text-brand-primary" />
                        </div>
                        <span className="font-semibold text-brand-primary">
                          {t(getOccupationLabelKey(user.profile.occupation))}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {user.profile?.bio && (
                <div className="w-full pt-4 border-t border-border/50">
                  <h3 className="text-sm font-semibold text-muted-foreground mb-2">{t("bioLabel")}</h3>
                  <div className="text-sm text-foreground/80 leading-relaxed">
                    <p className="whitespace-pre-wrap">{user.profile.bio}</p>
                  </div>
                </div>
              )}

              <div className="w-full pt-2">
                {currentUser && user?.id === currentUser?.id ? (
                  <Link href={`${pathname}/edit`} className="inline-block">
                    <Button variant="outline" className="border-brand-primary/20 hover:bg-brand-primary/10 hover:text-brand-primary transition-all font-medium rounded-lg px-6">
                      <Edit className="w-4 h-4 mr-2" />
                      {t("editProfile")}
                    </Button>
                  </Link>
                ) : currentUser ? (
                  <div className="flex items-center gap-3">
                    <Button 
                      variant={isFollowing ? "outline" : "default"}
                      className={cn(
                        "transition-all font-medium rounded-lg px-6",
                        isFollowing 
                          ? "border-brand-primary/20 hover:bg-brand-primary/10 hover:text-brand-primary" 
                          : "bg-brand-primary hover:bg-brand-primary/90 text-white shadow-md shadow-brand-primary/20"
                      )}
                      onClick={handleFollowToggle}
                      disabled={isActionLoading}
                    >
                      {isActionLoading ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : isFollowing ? (
                        <UserMinus className="w-4 h-4 mr-2" />
                      ) : (
                        <UserPlus className="w-4 h-4 mr-2" />
                      )}
                      {isFollowing ? t("unfollow") : t("follow")}
                    </Button>
                    <Button 
                      variant="outline" 
                      className="transition-all font-medium rounded-lg px-6 border-brand-primary/20 hover:bg-brand-primary/10 hover:text-brand-primary"
                      onClick={() => user && openChat(user)}
                    >
                      <MessageSquareText className="w-4 h-4 mr-2" />
                      Message
                    </Button>
                  </div>
                ) : null}
              </div>
            </div>
            <ProfileActivityTabs user={user} isMe={user.id === currentUser?.id} />
            
            <ImagePreviewDialog
              isOpen={isPreviewOpen}
              onOpenChange={setIsPreviewOpen}
              imageUrl={avatarPreview}
              alt={t("avatarPreview")}
              showCloseButton={false}
            />
          </>
        )
      )}
    </div>
  );
}
