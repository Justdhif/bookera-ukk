"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Bell, Mail, MessageCircle, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { userService } from "@/services/user.service";
import { NotificationSettings } from "@/types/user";
import { authService } from "@/services/auth.service";

export default function SettingsNotificationCard() {
  const t = useTranslations("settings");

  const profileHref = "/profile";

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState<string | null>(null);
  const [settings, setSettings] = useState<NotificationSettings>({
    notification_enabled: false,
    notification_email: false,
    notification_whatsapp: false,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [settingsRes, meRes] = await Promise.all([
          userService.getNotificationSettings(),
          authService.me(),
        ]);
        setSettings(settingsRes.data.data);
        setPhoneNumber(meRes.data.data.user.profile?.phone_number ?? null);
      } catch {
        // silently fail — use defaults
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const hasPhone = Boolean(phoneNumber);

  const handleMasterToggle = (checked: boolean) => {
    setSettings((prev) => ({ ...prev, notification_enabled: checked }));
  };

  const handleEmailToggle = (checked: boolean) => {
    setSettings((prev) => ({ ...prev, notification_email: checked }));
  };

  const handleWhatsappToggle = (checked: boolean) => {
    setSettings((prev) => ({ ...prev, notification_whatsapp: checked }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload: NotificationSettings = {
        notification_enabled: settings.notification_enabled,
        notification_email: settings.notification_enabled
          ? settings.notification_email
          : false,
        notification_whatsapp:
          settings.notification_enabled && hasPhone
            ? settings.notification_whatsapp
            : false,
      };
      await userService.updateNotificationSettings(payload);
      setSettings(payload);
      toast.success(t("notificationUpdated"));
    } catch {
      toast.error(t("notificationUpdateFailed"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="overflow-hidden border-none shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-2xl relative">
          {t("notificationTitle")}
          <div className="absolute -bottom-1 left-0 h-1 w-6 rounded-full bg-muted-foreground" />
        </CardTitle>
        <CardDescription className="text-base">
          {t("notificationDescription")}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-5 w-56" />
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>
        ) : (
          <>
            {/* Master toggle */}
            <div className="flex items-center justify-between rounded-xl border p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-brand-primary/10">
                  <Bell className="h-5 w-5 text-brand-primary" />
                </div>
                <div>
                  <Label
                    htmlFor="notif-master"
                    className="text-base font-semibold cursor-pointer"
                  >
                    {t("notificationEnabled")}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {t("notificationEnabledDescription")}
                  </p>
                </div>
              </div>
              <Switch
                id="notif-master"
                checked={settings.notification_enabled}
                onCheckedChange={handleMasterToggle}
              />
            </div>

            {/* Sub-options — only visible when master toggle is on */}
            <div
              className={`space-y-3 transition-opacity duration-200 ${
                settings.notification_enabled
                  ? "opacity-100"
                  : "opacity-40 pointer-events-none"
              }`}
            >
              <p className="text-sm font-medium text-muted-foreground px-1">
                {t("notificationChannels")}
              </p>

              {/* Email toggle */}
              <div className="flex items-center justify-between rounded-xl border p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/10">
                    <Mail className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <Label
                      htmlFor="notif-email"
                      className="text-base font-semibold cursor-pointer"
                    >
                      {t("notificationEmail")}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {t("notificationEmailDescription")}
                    </p>
                  </div>
                </div>
                <Switch
                  id="notif-email"
                  checked={
                    settings.notification_enabled && settings.notification_email
                  }
                  onCheckedChange={handleEmailToggle}
                  disabled={!settings.notification_enabled}
                />
              </div>

              {/* WhatsApp toggle */}
              <div className="rounded-xl border p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-green-500/10">
                      <MessageCircle className="h-5 w-5 text-green-500" />
                    </div>
                    <div>
                      <Label
                        htmlFor="notif-whatsapp"
                        className="text-base font-semibold cursor-pointer"
                      >
                        {t("notificationWhatsapp")}
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {t("notificationWhatsappDescription")}
                      </p>
                    </div>
                  </div>
                  <Switch
                    id="notif-whatsapp"
                    checked={
                      settings.notification_enabled &&
                      hasPhone &&
                      settings.notification_whatsapp
                    }
                    onCheckedChange={handleWhatsappToggle}
                    disabled={!settings.notification_enabled || !hasPhone}
                  />
                </div>
                {!hasPhone && (
                  <p className="text-xs text-muted-foreground pl-1">
                    {t("notificationWhatsappNoPhone")}{" "}
                    <Link
                      href={profileHref}
                      className="text-brand-primary underline underline-offset-2 hover:opacity-80"
                    >
                      {t("notificationWhatsappGoToProfile")}
                    </Link>
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                onClick={handleSave}
                disabled={saving}
                className="bg-brand-primary hover:bg-brand-primary/90 text-white min-w-30" variant="submit"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    {t("saving")}
                  </>
                ) : (
                  t("saveChanges")
                )}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
