"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { authService } from "@/services/auth.service";
import { followService } from "@/services/follow.service";
import { useChatStore } from "@/store/chat.store";
import { User } from "@/types/user";
import { Button } from "@/components/ui/button";
import DataLoading from "@/components/custom-ui/DataLoading";
import { userService } from "@/services/user.service";
import AvatarUploadModal from "@/components/custom-ui/content/admin/user/AvatarUploadModal";
import { toast } from "sonner";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import AdminBadge from "@/components/custom-ui/badge/AdminBadge";
import MemberBadge from "@/components/custom-ui/badge/MemberBadge";
import CroissantBadge from "@/components/custom-ui/badge/CroissantBadge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PhoneInput } from "@/components/custom-ui/PhoneInput";
import ChangePhoneModal from "@/components/custom-ui/modal/ChangePhoneModal";
import ChangeEmailModal from "@/components/custom-ui/modal/ChangeEmailModal";
import ChangePasswordModal from "@/components/custom-ui/modal/ChangePasswordModal";
import {
  FadeUp,
  FadeIn,
  ScaleIn,
  SlideIn,
  StaggerContainer,
} from "@/components/custom-ui/motion";
import { AnimatePresence } from "framer-motion";
import {
  Edit,
  User as UserIcon,
  UserPlus,
  UserMinus,
  MessageSquareText,
  Loader2,
  FileText,
  BookOpen,
  History,
  Heart,
  LayoutDashboard,
  Check,
  X,
  Camera,
  Crown,
  KeyRound,
} from "lucide-react";

interface ProfileSidebarProps {
  slug: string;
}

export default function ProfileSidebar({ slug }: ProfileSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations("profile");
  const { openChat } = useChatStore();

  const [user, setUser] = useState<User | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const [isEditingAvatar, setIsEditingAvatar] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [isAvatarSaving, setIsAvatarSaving] = useState(false);
  const [changePhoneOpen, setChangePhoneOpen] = useState(false);
  const [changeEmailOpen, setChangeEmailOpen] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);

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
      } else {
        const otherRes = await followService.getUserPublicProfile(slug);
        userData = otherRes.data.data;
      }

      setUser(userData);
      setIsFollowing(userData.is_following ?? false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || t("failedLoad"));
      router.push("/home");
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

  const handleAvatarEditStart = () => {
    setIsEditingAvatar(true);
    setAvatarPreview(user?.profile?.avatar || null);
  };

  const handleAvatarCancel = () => {
    setIsEditingAvatar(false);
    setAvatarPreview(null);
    setAvatarFile(null);
  };

  const handleAvatarSave = async () => {
    if (!user || !avatarFile) {
      handleAvatarCancel();
      return;
    }
    try {
      setIsAvatarSaving(true);
      await userService.update(user.id, {
        avatar: avatarFile,
        email: user.email,
        role: user.role,
        full_name: user.profile?.full_name || "",
      });
      toast.success(t("updateSuccess"));
      await fetchUser();
      handleAvatarCancel();
    } catch (error: any) {
      toast.error(error.response?.data?.message || t("failedUpdate"));
    } finally {
      setIsAvatarSaving(false);
    }
  };

  const onAvatarSelect = (avatar: string | File) => {
    if (typeof avatar === "string") {
      setAvatarPreview(avatar);
    } else {
      setAvatarFile(avatar);
      const reader = new FileReader();
      reader.onloadend = () => setAvatarPreview(reader.result as string);
      reader.readAsDataURL(avatar);
    }
  };

  useEffect(() => {
    fetchUser();
  }, [slug]);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center p-8 bg-card border border-border rounded-2xl">
        <DataLoading variant="inline" size="md" />
      </div>
    );
  }

  if (!user) return null;

  const isMe = currentUser?.id === user.id;
  const slugTarget = slug === "me" || !slug ? currentUser?.slug : slug;

  const navItems = isMe
    ? [
        {
          label: t("myProfile"),
          icon: UserIcon,
          href: `/my-profile`,
          active: pathname === `/my-profile`,
        },
        {
          label: t("myComplaint"),
          icon: FileText,
          href: `/my-complaint`,
          active: pathname === `/my-complaint`,
        },
        {
          label: t("myBorrow"),
          icon: BookOpen,
          href: `/my-borrow`,
          active: pathname.startsWith(`/my-borrow`),
        },
        {
          label: t("myFine"),
          icon: History,
          href: `/my-fine`,
          active: pathname === `/my-fine`,
        },
        ...(user.role !== "user"
          ? [
              {
                label: t("myFavorite"),
                icon: Heart,
                href: `/my-favorite`,
                active: pathname === `/my-favorite`,
              },
            ]
          : []),
      ]
    : [
        {
          label: t("myProfile"),
          icon: UserIcon,
          href: `/${slug}`,
          active: pathname === `/${slug}`,
        },
      ];

  return (
    <div className="relative flex flex-col h-full rounded-2xl overflow-hidden shadow-sm border-2 border-border bg-linear-to-br from-background via-background to-primary/5">
      <div className="p-6 pb-4 flex flex-col items-center text-center">
        <div className="relative h-24 w-24 mb-4">
          <div className="h-full w-full rounded-full overflow-hidden ring-4 ring-brand-primary/5 shadow-md">
            {avatarPreview || user.profile?.avatar ? (
              <Image
                src={avatarPreview || user.profile?.avatar || ""}
                alt={user.profile?.full_name || t("avatar")}
                fill
                className="object-cover rounded-full"
              />
            ) : (
              <div className="h-full w-full bg-linear-to-br from-brand-primary/10 to-brand-primary/5 flex items-center justify-center">
                <span className="text-3xl font-bold text-brand-primary">
                  {user.profile?.full_name?.[0]?.toUpperCase() ?? "U"}
                </span>
              </div>
            )}
          </div>
          {isMe && (
            <Button
              size="icon"
              variant="brand"
              onClick={
                isEditingAvatar
                  ? () => setIsAvatarModalOpen(true)
                  : handleAvatarEditStart
              }
              className="absolute bottom-0 right-0 h-8 w-8 rounded-full z-10 p-0"
            >
              {isEditingAvatar ? (
                <Camera className="w-3.5 h-3.5" />
              ) : (
                <Edit className="w-3.5 h-3.5" />
              )}
            </Button>
          )}
        </div>

        <AnimatePresence>
          {isEditingAvatar && (
            <ScaleIn className="flex gap-2 mb-4" duration={0.3}>
              <Button
                size="sm"
                variant="brand"
                className="h-8 rounded-lg px-3 text-xs shadow-md"
                onClick={handleAvatarSave}
                disabled={isAvatarSaving || !avatarFile}
              >
                {isAvatarSaving ? (
                  <Loader2 className="w-3 h-3 animate-spin mr-1.5" />
                ) : (
                  <Check className="w-3 h-3 mr-1.5" />
                )}
                {t("save")}
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-8 rounded-lg px-3 text-xs bg-white dark:bg-gray-800"
                onClick={handleAvatarCancel}
                disabled={isAvatarSaving}
              >
                <X className="w-3 h-3 mr-1.5" />
                {t("cancel")}
              </Button>
            </ScaleIn>
          )}
        </AnimatePresence>

        <div className="flex flex-col items-center gap-1">
          <h3 className="font-bold text-lg text-foreground line-clamp-1">
            {user.profile?.full_name}
          </h3>
          <div className="flex items-center gap-1">
            {user.role === "admin" && <AdminBadge />}
            {user.role === "member" && <MemberBadge />}
            {user.profile?.gender === "croissant" && <CroissantBadge />}
          </div>
        </div>

        {!isMe && (
          <div className="flex gap-2 w-full">
            <Button
              variant={isFollowing ? "outline" : "default"}
              size="sm"
              className={cn(
                "flex-1 h-9 rounded-xl transition-all",
                !isFollowing &&
                  "bg-brand-primary hover:bg-brand-primary/90 text-white",
              )}
              onClick={handleFollowToggle}
              disabled={isActionLoading}
            >
              {isActionLoading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : isFollowing ? (
                <UserMinus className="w-3.5 h-3.5 mr-1.5" />
              ) : (
                <UserPlus className="w-3.5 h-3.5 mr-1.5" />
              )}
              <span className="text-xs">
                {isFollowing ? t("unfollow") : t("follow")}
              </span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-9 rounded-xl border-border"
              onClick={() => openChat(user)}
            >
              <MessageSquareText className="w-3.5 h-3.5" />
            </Button>
          </div>
        )}
      </div>

      <FadeUp className="grid grid-cols-3" delay={0.1}>
        <div className="flex flex-col items-center">
          <span className="font-bold text-foreground">
            {user.followers_count ?? 0}
          </span>
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
            {t("followers")}
          </span>
        </div>
        <div className="flex flex-col items-center border-x border-border/50">
          <span className="font-bold text-foreground">
            {user.following_count ?? 0}
          </span>
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
            {t("following")}
          </span>
        </div>
        <div className="flex flex-col items-center">
          <span className="font-bold text-foreground">
            {user.complaints_count ?? 0}
          </span>
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
            {t("reports")}
          </span>
        </div>
      </FadeUp>

      {isMe && (
        <FadeUp className="p-4 border-b border-border/50 space-y-4" delay={0.2}>
          <div className="flex items-center justify-between gap-2">
            {user.role === "member" ? (
              <Link href="/payment/success?type=membership">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 border-brand-primary/20 hover:border-brand-primary/50 text-brand-primary hover:bg-brand-primary/5 font-bold rounded-lg px-2 group relative overflow-hidden text-[9px] uppercase tracking-wider"
                >
                  <div className="absolute inset-0 bg-linear-to-r from-transparent via-brand-primary/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  <FileText className="w-3 h-3 mr-1.5" />
                  {t("viewInvoice", { defaultValue: "Invoice" })}
                </Button>
              </Link>
            ) : user.role === "user" ? (
              <Link href="/pricing">
                <Button
                  variant="brand"
                  size="sm"
                  className="h-7 shadow-lg shadow-brand-primary/20 font-bold rounded-lg px-2 group relative overflow-hidden text-[9px] uppercase tracking-wider"
                >
                  <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  <Crown className="w-3 h-3 mr-1.5" />
                  {t("upgrade")}
                </Button>
              </Link>
            ) : (
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">
                {t("accountSection")}
              </span>
            )}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setChangePasswordOpen(true)}
              className="h-7 border-brand-primary/20 hover:border-brand-primary/50 text-brand-primary hover:bg-brand-primary/5 font-bold text-[10px] uppercase rounded-lg transition-all px-2"
            >
              <KeyRound className="h-3 w-3 mr-1.5" />
              {t("changePassword")}
            </Button>
          </div>

          <div className="space-y-3">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">
                  {t("emailLabel")}
                </Label>
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  onClick={() => setChangeEmailOpen(true)}
                  className="h-auto p-0 text-[10px] font-bold text-brand-primary uppercase"
                >
                  {t("changeEmail")}
                </Button>
              </div>
              <Input
                value={user.email}
                readOnly
                className="h-8 text-[11px] bg-muted/30 border-muted/50 opacity-70 rounded-lg"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">
                  {t("phoneNumberLabel")}
                </Label>
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  onClick={() => setChangePhoneOpen(true)}
                  className="h-auto p-0 text-[10px] font-bold text-brand-primary uppercase"
                >
                  {t("changePhone")}
                </Button>
              </div>
              <PhoneInput
                value={user.profile?.phone_number || ""}
                disabled
                className="opacity-70 w-full"
              />
            </div>
          </div>
        </FadeUp>
      )}


      <div className="flex-1 p-4 flex flex-col gap-1 overflow-y-auto custom-scrollbar">
        <StaggerContainer>
          {navItems.map((item, idx) => (
            <SlideIn key={item.href} direction="left" delay={idx * 0.05}>
              <Link href={item.href}>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start h-11 px-3 rounded-xl transition-all group",
                    item.active
                      ? "bg-brand-primary/10 text-brand-primary font-semibold border border-brand-primary/20"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/50",
                  )}
                >
                  <item.icon
                    className={cn(
                      "w-4 h-4 mr-3 transition-colors",
                      item.active
                        ? "text-brand-primary"
                        : "group-hover:text-foreground",
                    )}
                  />
                  <span className="text-sm">{item.label}</span>
                  {item.active && (
                    <div className="ml-auto h-1.5 w-1.5 rounded-full bg-brand-primary animate-pulse" />
                  )}
                </Button>
              </Link>
            </SlideIn>
          ))}
        </StaggerContainer>
      </div>

      {isMe && (
        <>
          <AvatarUploadModal
            open={isAvatarModalOpen}
            onOpenChange={setIsAvatarModalOpen}
            currentAvatar={avatarPreview || user.profile?.avatar || ""}
            onSave={onAvatarSelect}
            userName={user.profile?.full_name || t("user")}
          />
          <ChangePhoneModal
            open={changePhoneOpen}
            onOpenChange={setChangePhoneOpen}
            currentPhone={user.profile?.phone_number || ""}
            onSuccess={fetchUser}
          />
          <ChangeEmailModal
            open={changeEmailOpen}
            onOpenChange={setChangeEmailOpen}
            currentEmail={user.email}
            onSuccess={fetchUser}
          />
          <ChangePasswordModal
            open={changePasswordOpen}
            onOpenChange={setChangePasswordOpen}
          />
        </>
      )}
    </div>
  );
}
