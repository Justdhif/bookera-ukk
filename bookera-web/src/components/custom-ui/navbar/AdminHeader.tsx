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
import { usePathname } from "next/navigation";

export default function AdminHeader() {
  const pathname = usePathname();
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
            <BreadcrumbLink href="/admin">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>

          {segments.map((seg, idx) => {
            const href = `/admin/${segments.slice(0, idx + 1).join("/")}`;

            return (
              <React.Fragment key={idx}>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  {idx === segments.length - 1 ? (
                    <BreadcrumbPage>
                      {formatSegment(seg)}
                    </BreadcrumbPage>
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
    </header>
  );
}
