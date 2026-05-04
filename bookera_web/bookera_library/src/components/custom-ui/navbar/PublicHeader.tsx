"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useAuthStore } from "@/store/auth.store";
import { usePathname } from "next/navigation";
import { ChevronRight, Smartphone } from "lucide-react";
import { cn } from "@/lib/utils";
import AppHeader from "./AppHeader";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function PublicHeader() {
  const { isAuthenticated } = useAuthStore();
  const pathname = usePathname();
  const t = useTranslations("navbar");
  
  const isComplaintsActive = pathname.startsWith("/complaints");
  const isNewsActive = pathname.startsWith("/news");

  return (
    <AppHeader
      topLeftContent={
        <span className="text-2xl font-black tracking-tighter text-primary">
          Bookera
        </span>
      }
      topRightContent={null}
      bottomLeftContent={
        <div className="flex items-center gap-6">
          <Link
            href="/complaints"
            aria-current={isComplaintsActive ? "page" : undefined}
            className={cn(
              "group inline-flex items-center text-sm font-semibold transition-colors",
              isComplaintsActive
                ? "text-foreground underline decoration-2 underline-offset-8"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <span className="transition-all group-hover:underline decoration-2 underline-offset-8">
              {t("complaints")}
            </span>
          </Link>
          <Link
            href="/news"
            aria-current={isNewsActive ? "page" : undefined}
            className={cn(
              "group inline-flex items-center text-sm font-semibold transition-colors",
              isNewsActive
                ? "text-foreground underline decoration-2 underline-offset-8"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <span className="transition-all group-hover:underline decoration-2 underline-offset-8">
              {t("news")}
            </span>
          </Link>
        </div>
      }
      bottomRightContent={
        <div className="flex items-center gap-4">
          <Link
            href="https://wa.me/6281234567890"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center text-sm font-semibold text-muted-foreground hover:text-brand-primary transition-colors"
          >
            <span className="transition-all group-hover:underline decoration-2 underline-offset-8">
              {t("whatsappSupport")}
            </span>
          </Link>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link href="/download">
                  <div className="flex items-center gap-2 rounded-full bg-brand-primary p-2 sm:px-3 sm:py-1.5 text-white transition-all hover:bg-brand-primary-dark cursor-pointer shadow-sm active:scale-95">
                    <Smartphone className="h-4 w-4" />
                    <div className="hidden items-center gap-1 text-[11px] font-bold tracking-tight sm:flex">
                      <span>{t("getTheApp")}</span>
                      <ChevronRight className="h-3 w-3" />
                    </div>
                  </div>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="sm:hidden font-bold text-[11px] bg-brand-primary border-none text-white rounded-xl shadow-lg">
                {t("getTheApp")}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      }
      isAuthenticated={isAuthenticated}
    />
  );
}
