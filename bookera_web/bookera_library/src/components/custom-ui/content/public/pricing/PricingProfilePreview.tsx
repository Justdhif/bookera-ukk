"use client";

import { useTranslations } from "next-intl";
import { Crown } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import MemberBadge, { MemberBadgeIcon } from "@/components/custom-ui/badge/MemberBadge";
import DataLoading from "@/components/custom-ui/DataLoading";
import { getOccupationLabelKey } from "@/constants/user-occupation";
import { User } from "@/types/user";

interface PricingProfilePreviewProps {
  fullUser: User | null;
  isUserLoading: boolean;
}

export default function PricingProfilePreview({ fullUser, isUserLoading }: PricingProfilePreviewProps) {
  const tp = useTranslations("pricing");
  const t = useTranslations("profile");

  return (
    <div className="relative overflow-hidden rounded-2xl border border-amber-400/30 bg-linear-to-br from-amber-50/60 via-yellow-50/40 to-orange-50/60 dark:from-amber-900/20 dark:via-yellow-900/10 dark:to-orange-900/20 dark:border-amber-500/20 hover:border-amber-400/60 hover:shadow-lg hover:shadow-amber-400/10 backdrop-blur-sm p-6 transition-all duration-300 flex flex-col">
      <div className="pointer-events-none absolute inset-0 rounded-2xl bg-linear-to-br from-white/20 via-transparent to-transparent dark:from-white/5" />
      <div className="pointer-events-none absolute -top-10 -right-10 w-48 h-48 rounded-full bg-amber-400/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-orange-400/10 blur-3xl" />

      <div className="relative z-10 flex flex-col h-full">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-xl bg-amber-400/20 border border-amber-400/30 flex items-center justify-center shrink-0">
            <Crown className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <div className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-widest mb-0.5">
              Eksklusif
            </div>
            <p className="text-sm font-bold text-foreground leading-snug">
              {tp("exclusiveBadgeTitle")}
            </p>
          </div>
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed mb-4">
          {tp("exclusiveBadgeDesc")}
        </p>

        <div className="flex-1 flex flex-col gap-3">
          <div className="flex-1 flex flex-col">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              {tp("afterUpgrade")}
            </p>
            <div className="rounded-xl border border-border/60 bg-card/80 dark:bg-card/60 backdrop-blur-md p-3.5 shadow-sm flex-1 min-h-27.5 flex flex-col justify-center">
              {isUserLoading ? (
                <DataLoading variant="inline" size="sm" />
              ) : fullUser ? (
                <>
                  <div className="flex items-center gap-3">
                    <div className="relative shrink-0">
                      <Avatar className="w-11 h-11 border-2 border-brand-primary/30">
                        <AvatarImage
                          src={fullUser.profile?.avatar}
                          alt={fullUser.profile?.full_name}
                          className="object-cover"
                        />
                        <AvatarFallback className="bg-brand-primary/10 text-brand-primary text-sm font-black">
                          {fullUser.profile?.full_name?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <MemberBadgeIcon className="absolute -top-1.5 -right-1.5 w-5 h-5 border-2 border-card shadow-md" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                        <span className="text-xs font-bold text-foreground truncate max-w-30">
                          {fullUser.profile?.full_name}
                        </span>
                        <MemberBadge />
                      </div>
                      <p className="text-[10px] text-brand-primary font-semibold truncate">
                        {fullUser.profile?.occupation
                          ? t(getOccupationLabelKey(fullUser.profile.occupation))
                          : t("roleUser")}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2.5 pt-2.5 border-t border-border/50 grid grid-cols-3 gap-1 text-center">
                    <div>
                      <p className="text-xs font-bold text-foreground">{fullUser.complaints_count || 0}</p>
                      <p className="text-[9px] text-muted-foreground truncate">{t("complaints")}</p>
                    </div>
                    <div className="border-l border-border/50">
                      <p className="text-xs font-bold text-foreground">{fullUser.followers_count || 0}</p>
                      <p className="text-[9px] text-muted-foreground truncate">{t("followers")}</p>
                    </div>
                    <div className="border-l border-border/50">
                      <p className="text-xs font-bold text-foreground">{fullUser.following_count || 0}</p>
                      <p className="text-[9px] text-muted-foreground truncate">{t("following")}</p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-4">
                  <p className="text-[10px] text-muted-foreground italic leading-relaxed">
                    {tp("loginToPreview")}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 flex flex-col">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              {tp("withoutBadge")}
            </p>
            <div className="rounded-xl border border-border/40 bg-muted/20 p-3.5 opacity-60 flex-1 min-h-27.5 flex flex-col justify-center">
              {isUserLoading ? (
                <DataLoading variant="inline" size="sm" />
              ) : fullUser ? (
                <>
                  <div className="flex items-center gap-3 grayscale-[0.5]">
                    <Avatar className="w-11 h-11 border-2 border-border/50">
                      <AvatarImage
                        src={fullUser.profile?.avatar}
                        alt={fullUser.profile?.full_name}
                        className="object-cover"
                      />
                      <AvatarFallback className="bg-muted text-muted-foreground text-sm font-black">
                        {fullUser.profile?.full_name?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-foreground truncate">
                        {fullUser.profile?.full_name}
                      </p>
                      <p className="text-[10px] text-muted-foreground truncate">
                        {fullUser.profile?.occupation
                          ? t(getOccupationLabelKey(fullUser.profile.occupation))
                          : t("roleUser")}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2.5 pt-2.5 border-t border-border/50 grid grid-cols-3 gap-1 text-center grayscale-[0.5]">
                    <div>
                      <p className="text-xs font-bold text-foreground">{fullUser.complaints_count || 0}</p>
                      <p className="text-[9px] text-muted-foreground truncate">{t("complaints")}</p>
                    </div>
                    <div className="border-l border-border/50">
                      <p className="text-xs font-bold text-foreground">{fullUser.followers_count || 0}</p>
                      <p className="text-[9px] text-muted-foreground truncate">{t("followers")}</p>
                    </div>
                    <div className="border-l border-border/50">
                      <p className="text-xs font-bold text-foreground">{fullUser.following_count || 0}</p>
                      <p className="text-[9px] text-muted-foreground truncate">{t("following")}</p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-4">
                  <p className="text-[10px] text-muted-foreground italic leading-relaxed opacity-50">
                    {tp("loginToPreview")}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-amber-400/15 border border-amber-400/25 px-2.5 py-1 text-[10px] font-semibold text-amber-600 dark:text-amber-400 dark:bg-amber-400/20">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
          {tp("exclusiveCommunity")}
        </div>
      </div>
    </div>
  );
}
