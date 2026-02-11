"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import SavesList from "@/components/custom-ui/content/public/SavesList";
import BookeraLogo from "@/assets/logo/bookera-logo-hd.png";
import Image from "next/image";
import {
  Home,
  BookOpen,
  LayoutDashboard,
  Moon,
  Sun,
  Languages,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { useState, useEffect, useTransition } from "react";
import LocaleSwitcher from "@/components/custom-ui/LocaleSwitcher";
import { Locale } from "@/i18n/config";
import { setUserLocale } from "@/services/locale";

export default function PublicSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const t = useTranslations("header");
  const [mounted, setMounted] = useState(false);
  const [locale, setLocale] = useState<Locale | undefined>();
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (locale) {
      startTransition(() => {
        setUserLocale(locale);
      });
    }
  }, [locale]);

  const mainNavItems = [
    {
      title: "Home",
      href: "/",
      icon: Home,
    },
    {
      title: "My Loans",
      href: "/my-loans",
      icon: BookOpen,
    },
  ];

  const handleNavClick = (e: React.MouseEvent, href: string) => {
    if (href === "/my-loans" && !isAuthenticated) {
      e.preventDefault();
      router.push("/login");
      return;
    }
  };

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-72 bg-background text-card-foreground flex flex-col shadow-lg">
      <div className="p-4 border-b border-border">
        <Link href="/" className="flex items-center gap-1">
          <Image
            src={BookeraLogo}
            alt="Bookera"
            className="h-12 w-12 object-cover"
          />
          <span className="font-bold text-2xl">Bookera</span>
        </Link>
      </div>

      <nav className="px-3 py-4 space-y-1">
        {mainNavItems.map((item) => {
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={(e) => handleNavClick(e, item.href)}
              className={cn(
                "flex items-center gap-4 px-3 py-3 rounded-lg transition-colors text-muted-foreground",
                isActive(item.href)
                  ? "bg-primary text-primary-foreground font-semibold"
                  : "hover:bg-accent hover:text-accent-foreground",
              )}
            >
              <item.icon className="h-6 w-6" />
              <span className="text-base">{item.title}</span>
            </Link>
          );
        })}
      </nav>

      <div className="flex-1 overflow-hidden px-3 pb-3">
        <div className="h-full rounded-lg bg-muted/30 overflow-hidden">
          <SavesList mode="sidebar" />
        </div>
      </div>
    </aside>
  );
}
