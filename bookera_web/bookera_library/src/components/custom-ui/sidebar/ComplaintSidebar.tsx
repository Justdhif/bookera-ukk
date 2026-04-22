"use client";

import {
  useSidebar,
} from "@/components/ui/sidebar";
import { useTranslations } from "next-intl";
import ComplaintSidebarFilter from "./ComplaintSidebarFilter";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import AppSidebar from "./AppSidebar";

export default function ComplaintSidebar() {
  const { open } = useSidebar();
  const t = useTranslations("navbar");
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const currentCategory = searchParams.get("category") || "";

  const handleCategoryChange = (category: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (category) {
      params.set("category", category);
    } else {
      params.delete("category");
    }
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <AppSidebar subtitle={t("complaint")}>
        <ComplaintSidebarFilter 
            activeCategory={currentCategory} 
            onCategoryChange={handleCategoryChange} 
        />
    </AppSidebar>
  );
}
