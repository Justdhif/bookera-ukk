"use client";

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

  return (
    <header className="flex h-14 items-center gap-4 border-b px-4">
      {/* TOGGLE SIDEBAR */}
      <SidebarTrigger />

      {/* BREADCRUMB */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/admin">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>

          {segments.map((seg, idx) => (
            <BreadcrumbItem key={idx}>
              <BreadcrumbSeparator />
              {idx === segments.length - 1 ? (
                <BreadcrumbPage className="capitalize">{seg}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink href={`/admin/${seg}`}>{seg}</BreadcrumbLink>
              )}
            </BreadcrumbItem>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
    </header>
  );
}
