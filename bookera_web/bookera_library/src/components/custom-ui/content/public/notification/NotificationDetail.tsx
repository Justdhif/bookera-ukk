"use client";

import { useTranslations, useFormatter } from "next-intl";
import { Notification } from "@/types/notification";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import DetailButton from "@/components/custom-ui/button/DetailButton";
import DeleteButton from "@/components/custom-ui/button/DeleteButton";
import {
  Bell,
  CheckCheck,
  X,
  ExternalLink,
  Trash2,
  Clock,
  Eye,
} from "lucide-react";
import {
  NotificationIconBadge,
  getModuleBadgeStyle,
  getNotificationIconConfig,
} from "./notification-utils";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Book as BookIcon, Receipt, History, MessageSquare, Info as InfoIcon, AlertCircle } from "lucide-react";

interface NotificationDetailProps {
  notification: Notification | null;
  onClose: () => void;
  onDelete: (id: number) => void;
  className?: string;
}

import { StaggerContainer, SlideIn, ScaleIn } from "@/components/custom-ui/motion";

export default function NotificationDetail({
  notification,
  onClose,
  onDelete,
  className,
}: NotificationDetailProps) {
  const t = useTranslations("notification");
  const format = useFormatter();

  if (!notification) {
    return (
      <SlideIn
        direction="right"
        className={cn(
          "flex flex-col items-center justify-center h-full rounded-xl border border-dashed border-border/70 bg-muted/20",
          className
        )}
      >
        <div className="text-center space-y-4 p-8 max-w-xs">
          <ScaleIn>
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/60 mx-auto">
              <Bell className="h-8 w-8 text-muted-foreground/50" />
            </div>
          </ScaleIn>
          <SlideIn direction="right" delay={0.1}>
            <div>
              <h3 className="text-base font-semibold text-foreground/80">
                {t("selectNotification")}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {t("clickToView")}
              </p>
            </div>
          </SlideIn>
          <SlideIn direction="right" delay={0.2}>
            <p className="text-xs text-muted-foreground/60 bg-muted/40 rounded-lg px-3 py-2">
              {t("pressEsc")}
            </p>
          </SlideIn>
        </div>
      </SlideIn>
    );
  }

  const config = getNotificationIconConfig(
    notification.type,
    notification.module,
  );
  const detailHref =
    notification.module === "loan" && notification.data?.loan_id
      ? "/admin/loans"
      : notification.module === "return" && notification.data?.return_id
        ? "/admin/returns"
        : null;

  return (
    <div className={cn(
      "flex flex-col h-full bg-card overflow-hidden",
      className
    )}>
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-sm">{t("notificationDetail")}</h3>
          {notification.read_at && (
            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800 font-medium">
              <CheckCheck className="h-3 w-3" />
              {t("read")}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          {detailHref && (
            <Link href={detailHref}>
              <DetailButton
                label={t("viewFullDetail")}
                className="h-7 text-xs border-border/60 px-2.5"
              />
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className={cn("px-5 py-5 border-b border-border/50", config.bg)}>
          <div className="flex items-start gap-4">
            <NotificationIconBadge
              type={notification.type}
              module={notification.module}
              size="lg"
            />
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold text-foreground leading-tight mb-2">
                {notification.title}
              </h2>
              <div className="flex items-center flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {format.dateTime(new Date(notification.created_at), {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "numeric",
                  })}
                </span>
                <span className="text-muted-foreground/40">·</span>
                <span className="text-muted-foreground/70">
                  {format.relativeTime(new Date(notification.created_at), { now: new Date() })}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="px-5 py-5 space-y-5">
          {notification.message && (
            <div className="rounded-lg border border-border/60 bg-muted/30 p-4">
              <p className="text-sm leading-relaxed text-foreground/90">
                {notification.message}
              </p>
            </div>
          )}
          {(notification.module || notification.type) && (
            <div className="flex flex-wrap gap-2">
              {notification.module && (
                <div className="flex flex-col gap-1">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                    {t("module")}
                  </p>
                  <span
                    className={cn(
                      "inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold border",
                      getModuleBadgeStyle(notification.module),
                    )}
                  >
                    {t(`modules.${notification.module}`, { defaultValue: notification.module })}
                  </span>
                </div>
              )}
              {notification.type && (
                <div className="flex flex-col gap-1">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                    {t("type")}
                  </p>
                  <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border border-border bg-background text-foreground/80">
                    {t(`types.${notification.type}`, { defaultValue: notification.type.replace(/_/g, " ") })}
                  </span>
                </div>
              )}
            </div>
          )}
          {notification.data && Object.keys(notification.data).length > 0 && (
            <div className="space-y-4">
              {/* User Snapshot if available (typically for admin notifications) */}
              {notification.data.user && (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-primary/5 border border-primary/10">
                  <Avatar className="h-10 w-10 border-2 border-background shadow-sm">
                    <AvatarImage src={notification.data.user.avatar} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      <User className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] uppercase font-bold tracking-wider text-primary/70 mb-0.5">{t("user")}</p>
                    <p className="text-sm font-bold text-foreground truncate">{notification.data.user.name}</p>
                  </div>
                </div>
              )}

              {/* Books Section */}
              {(notification.data.books || notification.data.returned || notification.data.lost) && (
                <div className="space-y-3">
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <BookIcon className="h-3 w-3" />
                    {t("relatedBooks")}
                  </p>
                  <div className="grid gap-2">
                    {/* Standard books array */}
                    {notification.data.books?.map((book: any, idx: number) => (
                      <div key={idx} className="flex items-center gap-3 p-2.5 rounded-xl border border-border/50 bg-background/50 hover:bg-background transition-colors shadow-sm">
                        <div className="relative h-14 w-10 shrink-0 overflow-hidden rounded-lg bg-muted border border-border/40">
                          <Image
                            src={book.cover || "/placeholder-book.png"}
                            alt={book.title}
                            fill
                            className="object-cover"
                            sizes="40px"
                            unoptimized
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold text-foreground line-clamp-1">{book.title}</p>
                          <p className="text-[11px] text-muted-foreground truncate">{book.author || t("noAuthor")}</p>
                        </div>
                      </div>
                    ))}

                    {/* Returned books array */}
                    {notification.data.returned?.map((item: any, idx: number) => (
                      <div key={`ret-${idx}`} className="flex items-center gap-3 p-2.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 transition-colors shadow-sm">
                        <div className="min-w-10 h-10 flex items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600">
                          <History className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold text-foreground line-clamp-1">{item.book_title}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-emerald-500 text-white leading-none">
                              {item.condition === 'good' ? t("conditionGood") : t("conditionDamaged")}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Lost books array */}
                    {notification.data.lost?.map((item: any, idx: number) => (
                      <div key={`lost-${idx}`} className="flex items-center gap-3 p-2.5 rounded-xl border border-rose-500/20 bg-rose-500/5 transition-colors shadow-sm text-rose-600">
                        <div className="min-w-10 h-10 flex items-center justify-center rounded-lg bg-rose-500/10 text-rose-600">
                          <AlertCircle className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold text-foreground line-clamp-1">{item.book_title}</p>
                          <p className="text-[10px] uppercase font-bold mt-0.5">{t("statusLost")}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* General Technical Data Table (Filtering out handled keys) */}
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-2">
                  <InfoIcon className="h-3 w-3" />
                  {t("additionalInfo")}
                </p>
                <div className="rounded-xl border border-border/40 bg-muted/20 overflow-hidden divide-y divide-border/20">
                  {Object.entries(notification.data)
                    .filter(([key]) => !['user', 'books', 'returned', 'lost'].includes(key))
                    .map(([key, value]) => (
                      <div key={key} className="flex items-start gap-4 px-4 py-2.5 text-sm hover:bg-muted/30 transition-colors">
                        <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider min-w-28 pt-0.5">
                          {key.replace(/_/g, " ")}
                        </span>
                        <span className="font-bold text-foreground/90 flex-1 break-all">
                          {typeof value === "object"
                            ? JSON.stringify(value, null, 2)
                            : String(value)}
                        </span>
                      </div>
                    ))}
                </div>
              </div>

              {/* Fine Info Shortcut */}
              {notification.data.total_fine > 0 && (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 shadow-sm animate-pulse">
                  <Receipt className="h-6 w-6 shrink-0" />
                  <div>
                    <p className="text-[10px] uppercase font-black tracking-widest leading-none mb-1 opacity-70">{t("totalFine")}</p>
                    <p className="text-2xl font-black">
                      {format.number(notification.data.total_fine, {
                        style: "currency",
                        currency: "IDR",
                        minimumFractionDigits: 0,
                      })}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <div className="px-5 py-3.5 border-t border-border bg-muted/20">
        <DeleteButton
          label={t("deleteNotification")}
          onClick={() => onDelete(notification.id)}
          className="h-8 text-xs"
        />
      </div>
    </div>
  );
}
