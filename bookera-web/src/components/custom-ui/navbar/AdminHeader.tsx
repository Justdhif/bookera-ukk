"use client";

import React from "react";
import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";
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
  const pathname = usePathname();
  const t = useTranslations("navbar");
  const segments = pathname.replace("/admin", "").split("/").filter(Boolean);

  const formatSegment = (seg: string) => {
    const formatted = seg.charAt(0).toUpperCase() + seg.slice(1);
    return formatted;
  };

  return (
    <header
      className="flex h-14 items-center gap-4 border-b px-4"
    >
      <SidebarTrigger />
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/admin">{t("dashboard")}</BreadcrumbLink>
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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="brand" size="icon" className="relative">
              <Settings className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href="/settings">
                <Settings className="h-4 w-4 mr-2" />
                {t("settings")}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/admin/terms-of-service">
                <FileText className="h-4 w-4 mr-2" />
                {t("termsOfService")}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/admin/privacy-policy">
                <Shield className="h-4 w-4 mr-2" />
                {t("privacyPolicy")}
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <NotificationDropdown isAuthenticated={true} />
      </div>
    </header>
  );
}
