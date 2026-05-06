"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname, useParams } from "next/navigation";
import ContentHeader from "@/components/custom-ui/content/ContentHeader";
import { useTranslations } from "next-intl";
import { followService } from "@/services/follow.service";
import { useChatStore } from "@/store/chat.store";
import { User } from "@/types/user";
import { Button } from "@/components/ui/button";
import DataLoading from "@/components/custom-ui/DataLoading";
import {
  User as UserIcon,
  UserPlus,
  UserMinus,
  MessageSquareText,
  Loader2,
  Crown,
  History,
} from "lucide-react";
import { toast } from "sonner";
import { getOccupationLabelKey } from "@/constants/user-occupation";
import Image from "next/image";
import Link from "next/link";
import ProfileActivityTabs from "./ProfileActivityTabs";
import ImagePreviewDialog from "@/components/custom-ui/ImagePreviewDialog";
import { cn } from "@/lib/utils";
import AdminBadge from "@/components/custom-ui/badge/AdminBadge";
import MemberBadge from "@/components/custom-ui/badge/MemberBadge";
import CroissantBadge from "@/components/custom-ui/badge/CroissantBadge";
import {
  StaggerContainer,
  FadeUp,
  FadeIn,
} from "@/components/custom-ui/motion";

export default function OtherProfileClient() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const slug = params.slug as string;
  const t = useTranslations("profile");
  const { openChat } = useChatStore();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [avatarPreview, setAvatarPreview] = useState<string>("");
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const fetchUser = async () => {
    try {
      setLoading(true);

      const response = await followService.getUserPublicProfile(slug);
      const userData = response.data.data;

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
        setUser((prev) =>
          prev
            ? { ...prev, followers_count: (prev.followers_count ?? 1) - 1 }
            : null,
        );
        toast.success(t("unfollowedSuccess"));
      } else {
        await followService.follow("user", user.id);
        setIsFollowing(true);
        setUser((prev) =>
          prev
            ? { ...prev, followers_count: (prev.followers_count ?? 0) + 1 }
            : null,
        );
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
    <StaggerContainer className="pt-1 md:pt-2 px-0">
      <ContentHeader
        title={t("userProfile")}
        description={t("userProfileDesc")}
        showBackButton={true}
        className="mb-8"
      />
      {loading ? (
        <FadeIn key="loading" className="flex justify-center py-16">
          <DataLoading variant="inline" size="lg" />
        </FadeIn>
      ) : (
        user && (
          <FadeIn key="content" className="w-full">
            <FadeUp delay={0.1}>
              <div className="flex flex-col gap-6 items-start mb-6 w-full pt-4">
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
                          <span className="text-white text-xs font-medium">
                            {t("view")}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col justify-center flex-1">
                    {user.profile?.username && (
                      <span className="text-xs md:text-sm text-brand-primary font-bold mb-1 opacity-80">
                        @{user.profile.username}
                      </span>
                    )}
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-xl md:text-3xl font-bold tracking-tight text-foreground">
                        {user.profile?.full_name}
                      </h2>
                      <div className="flex items-center gap-1 shrink-0">
                        {user.role === "admin" && <AdminBadge />}
                        {user.role === "member" && <MemberBadge />}
                        {user.profile?.gender === "croissant" && (
                          <CroissantBadge />
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-6 md:gap-8 mt-3">
                      <div className="flex items-end gap-1">
                        <span className="font-bold text-lg text-foreground">
                          {user.followers_count ?? 0}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {t("followers")}
                        </span>
                      </div>
                      <div className="flex items-end gap-1">
                        <span className="font-bold text-lg text-foreground">
                          {user.following_count ?? 0}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {t("following")}
                        </span>
                      </div>
                      <div className="flex items-end gap-1">
                        <span className="font-bold text-lg text-foreground">
                          {user.complaints_count ?? 0}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {t("reports")}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-8 w-fit mt-5 p-4 py-3 rounded-2xl bg-muted/30 border border-border/50">
                      <div className="flex items-center gap-3 text-xs">
                        <div className="p-2 rounded-lg bg-brand-primary/10 text-brand-primary">
                          <UserIcon className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] uppercase tracking-wider text-muted-foreground/60 font-bold">
                            {t("role")}
                          </span>
                          <span className="font-semibold capitalize text-foreground/90 text-sm">
                            {user.role}
                          </span>
                        </div>
                      </div>

                      <div className="w-px h-8 bg-border/50" />

                      <div className="flex items-center gap-3 text-xs pl-2">
                        <div className="p-2 rounded-lg bg-brand-primary/10 text-brand-primary">
                          <History className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] uppercase tracking-wider text-muted-foreground/60 font-bold">
                            {t("gender")}
                          </span>
                          <span className="font-semibold capitalize text-foreground/90 text-sm">
                            {user.profile?.gender || t("noData")}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {user.profile?.bio && (
                  <div className="w-full pt-4 border-t border-border/50">
                    <h3 className="text-sm font-semibold text-muted-foreground mb-2">
                      {t("bioLabel")}
                    </h3>
                    <div className="text-sm text-foreground/80 leading-relaxed italic">
                      <p className="whitespace-pre-wrap">
                        "{user.profile.bio}"
                      </p>
                    </div>
                  </div>
                )}

                <div className="w-full pt-2 flex flex-wrap gap-3 items-center">
                  <div className="flex items-center gap-3">
                    <Button
                      variant={isFollowing ? "outline" : "default"}
                      className={cn(
                        "transition-all font-medium rounded-lg px-6",
                        isFollowing
                          ? "border-brand-primary/20 hover:bg-brand-primary/10 hover:text-brand-primary"
                          : "bg-brand-primary hover:bg-brand-primary/90 text-white shadow-md shadow-brand-primary/20",
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
                </div>
              </div>
            </FadeUp>
            <FadeUp delay={0.2}>
              <ProfileActivityTabs user={user} />
            </FadeUp>

            <ImagePreviewDialog
              isOpen={isPreviewOpen}
              onOpenChange={setIsPreviewOpen}
              imageUrl={avatarPreview}
              alt={t("avatarPreview")}
              showCloseButton={false}
            />
          </FadeIn>
        )
      )}
    </StaggerContainer>
  );
}
