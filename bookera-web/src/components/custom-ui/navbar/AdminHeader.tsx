"use client";

import React from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Settings, FileText, Shield } from "lucide-react";
import { useTranslations } from "next-intl";
import NotificationDropdown from "./NotificationDropdown";

export default function AdminHeader() {
  const t = useTranslations('header');
  const pathname = usePathname();
  const router = useRouter();
  const segments = pathname.replace("/admin", "").split("/").filter(Boolean);

  // Format segment untuk breadcrumb
  const formatSegment = (seg: string) => {
    // Capitalize first letter
    const formatted = seg.charAt(0).toUpperCase() + seg.slice(1);
    return formatted;
  };

  return (
    <header className="flex h-14 items-center gap-4 border-b px-4">
      <SidebarTrigger />
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/admin">{t('dashboard')}</BreadcrumbLink>
          </BreadcrumbItem>

          {segments.map((seg, idx) => {
            const href = `/admin/${segments.slice(0, idx + 1).join("/")}`;

            return (
              <React.Fragment key={idx}>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  {idx === segments.length - 1 ? (
                    <BreadcrumbPage>{formatSegment(seg)}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink href={href}>
                      {formatSegment(seg)}
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </React.Fragment>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>

      <div className="ml-auto flex items-center gap-2">
        {/* Settings Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Settings className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => router.push("/admin/settings")}>
              <Settings className="h-4 w-4 mr-2" />
              {t('settings')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/admin/terms-of-service")}>
              <FileText className="h-4 w-4 mr-2" />
              {t('termsOfService')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/admin/privacy-policy")}>
              <Shield className="h-4 w-4 mr-2" />
              {t('privacyPolicy')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Notifications */}
        <NotificationDropdown isAuthenticated={true} />
      </div>
    </header>
  );
}
