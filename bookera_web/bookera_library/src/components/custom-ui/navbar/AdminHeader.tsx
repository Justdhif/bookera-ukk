"use client";
import React from "react";
import {
  Breadcrumb,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import AppHeader from "./AppHeader";
import { useAuthStore } from "@/store/auth.store";
import { motion } from "framer-motion";
import { SlideIn, StaggerContainer } from "@/components/custom-ui/motion";

export default function AdminHeader() {
  const pathname = usePathname();
  const t = useTranslations("navbar");
  const { user } = useAuthStore();
  const segments = pathname.replace("/admin", "").split("/").filter(Boolean);
  const formatSegment = (seg: string) => {
    const formatted = seg.charAt(0).toUpperCase() + seg.slice(1);
    return formatted;
  };

  const dashboardHref =
    user?.role === "officer:catalog"
      ? "/admin/categories"
      : user?.role === "officer:management"
      ? "/admin/users"
      : "/admin";

  const breadcrumbItems = [
    {
      label: t("dashboard"),
      href: dashboardHref,
      current: segments.length === 0,
    },
    ...segments.map((seg, idx) => ({
      label: formatSegment(seg),
      href: `/admin/${segments.slice(0, idx + 1).join("/")}`,
      current: idx === segments.length - 1,
    })),
  ];

  const breadcrumbs = (
    <StaggerContainer
      key={pathname}
      as={motion.nav}
      staggerDelay={0.08}
      delayChildren={0.05}
      className="min-w-0"
    >
      <Breadcrumb>
        <BreadcrumbList>
          {breadcrumbItems.map((item, index) => (
            <React.Fragment key={item.href}>
              {index > 0 ? (
                <SlideIn
                  as={motion.li}
                  direction="up"
                  distance={8}
                  duration={0.35}
                  delay={0.04 * index}
                  className="flex items-center text-muted-foreground"
                  role="presentation"
                  aria-hidden="true"
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </SlideIn>
              ) : null}
              <SlideIn
                as={motion.li}
                direction="left"
                distance={18}
                duration={0.55}
                delay={0.05 + index * 0.05}
                className="inline-flex items-center gap-1.5"
              >
                {item.current ? (
                  <BreadcrumbPage>{item.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink href={item.href}>{item.label}</BreadcrumbLink>
                )}
              </SlideIn>
            </React.Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
    </StaggerContainer>
  );

  return (
    <AppHeader
      topLeftContent={
        <span className="text-2xl font-black tracking-tighter text-primary">
          Bookera Admin
        </span>
      }
      bottomLeftContent={breadcrumbs}
      isAuthenticated={true}
    />
  );
}
