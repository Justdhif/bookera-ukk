"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import ContentHeader from "@/components/custom-ui/content/ContentHeader";
import { useTranslations } from "next-intl";
import { authService } from "@/services/auth.service";
import { User } from "@/types/user";
import { Button } from "@/components/ui/button";
import DataLoading from "@/components/custom-ui/DataLoading";
import { Edit, Phone, Briefcase, User as UserIcon } from "lucide-react";
import { toast } from "sonner";
import { normalizeOccupationValue, getOccupationLabelKey } from "@/constants/user-occupation";
import Image from "next/image";
import Link from "next/link";
import ProfileActivityTabs from "./ProfileActivityTabs";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

export default function ProfileClient() {
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations("profile");
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [avatarPreview, setAvatarPreview] = useState<string>("");
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const res = await authService.me();
      const userData: User = res.data.data.user;
      setUser(userData);
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

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <div className="space-y-6">
      <ContentHeader
        title={t("myProfile")}
        description={
          loading ? (
            <DataLoading variant="inline" size="sm" className="justify-start mt-1" />
          ) : (
            t("viewProfileDescription", {
              name: user?.profile?.full_name ?? "",
            })
          )
        }
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
                <Link href={`${pathname}/edit`} className="inline-block">
                  <Button variant="outline" className="border-brand-primary/20 hover:bg-brand-primary/10 hover:text-brand-primary transition-all font-medium rounded-lg px-6">
                    <Edit className="w-4 h-4 mr-2" />
                    {t("editProfile")}
                  </Button>
                </Link>
              </div>
            </div>
            <ProfileActivityTabs user={user} />
            
            <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
              <DialogContent className="max-w-[90vw] md:max-w-2xl p-0 overflow-hidden border-none bg-transparent shadow-none flex items-center justify-center" showCloseButton={false}>
                <DialogTitle className="sr-only">{t("avatarPreview")}</DialogTitle>
                <div className="relative w-full aspect-square max-h-[80vh]">
                  <Image
                    src={avatarPreview}
                    alt={t("avatarPreview")}
                    fill
                    className="object-contain"
                    priority
                  />
                </div>
              </DialogContent>
            </Dialog>
          </>
        )
      )}
    </div>
  );
}
