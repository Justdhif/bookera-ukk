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
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Settings, FileText, Shield } from "lucide-react";
import { useTranslations } from "next-intl";
import AppHeader from "./AppHeader";
export default function AdminHeader() {
  const pathname = usePathname();
  const t = useTranslations("navbar");
  const segments = pathname.replace("/admin", "").split("/").filter(Boolean);
  const formatSegment = (seg: string) => {
    const formatted = seg.charAt(0).toUpperCase() + seg.slice(1);
    return formatted;
  };
  const breadcrumbs = (
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
  );
  return <AppHeader leftContent={breadcrumbs} isAuthenticated={true} />;
}
