"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import BookeraLogo from "@/assets/logo/bookera-logo-hd.png";
import Image from "next/image";
import { Facebook, Instagram, Twitter, Bell, Moon, Sun, Search } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useState, useEffect, useTransition } from "react";
import { Badge } from "@/components/ui/badge";
import { useTranslations } from 'next-intl';
import { useTheme } from "next-themes";
import LocaleSwitcher from "../LocaleSwitcher";
import { Locale } from "@/i18n/config";
import { setUserLocale } from "@/services/locale";
import { Input } from "@/components/ui/input";

export default function PublicHeader() {
  const router = useRouter();
  const { user, logout, isAuthenticated, initialLoading } = useAuthStore();
  const t = useTranslations('header');
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [locale, setLocale] = useState<Locale | undefined>();
  const [isPending, startTransition] = useTransition();
  const [searchQuery, setSearchQuery] = useState("");

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

  const toggleDarkMode = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="border-b sticky top-0 bg-white dark:bg-gray-900 z-50 shadow-sm transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-6 py-4 space-y-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-sm hover:text-brand-primary hover:underline cursor-pointer">
              {t('termsOfService')}
            </h3>

            <div className="h-2 w-2 rounded-full bg-brand-primary "></div>

            <h3 className="font-semibold text-sm hover:text-brand-primary hover:underline cursor-pointer">
              {t('privacyPolicy')}
            </h3>

            <div className="h-2 w-2 rounded-full bg-brand-primary "></div>

            <h3 className="font-semibold text-sm">{t('followUs')}</h3>
            <Link
              href="https://www.facebook.com/bookera.library"
              target="_blank"
            >
              <Facebook className="w-4 h-4 text-brand-primary" />
            </Link>
            <Link
              href="https://www.instagram.com/bookera.library"
              target="_blank"
            >
              <Instagram className="h-4 w-4 text-brand-primary" />
            </Link>

            <Link href="https://www.twitter.com/@bookera.library" target="_blank">
              <Twitter className="h-4 w-4 text-brand-primary" />
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              className="relative flex items-center gap-2 h-9 px-3"
              title={t('notifications')}
            >
              <Bell className="h-4 w-4" />
              <span className="text-sm font-medium">{t('notifications')}</span>
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
              >
                3
              </Badge>
            </Button>

            <LocaleSwitcher setLocale={setLocale} />

            <Button
              variant="ghost"
              size="icon"
              onClick={toggleDarkMode}
              suppressHydrationWarning
            >
              {!mounted ? (
                <Moon className="h-5 w-5 transition-all duration-300" />
              ) : theme === "dark" ? (
                <Sun className="h-5 w-5 transition-all duration-300" />
              ) : (
                <Moon className="h-5 w-5 transition-all duration-300" />
              )}
            </Button>
          </div>
        </div>
        <div className="flex justify-between items-center space-x-7">
          <Link href="/" className="flex items-center shrink-0">
            <Image
              src={BookeraLogo}
              alt="Bookera Logo"
              className="h-15 w-15 object-cover"
            />
            <div>
              <span className="font-bold text-3xl">Bookera</span>
            </div>
          </Link>

          {/* Search Bar - Centered */}
          <form onSubmit={handleSearch} className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari buku..."
              className="pl-10 pr-4 h-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>

          {/* User Section */}
          <div className="shrink-0">
            {initialLoading ? (
              <Skeleton className="h-10 w-10 rounded-full" />
            ) : !isAuthenticated ? (
              <Button onClick={() => router.push("/login")}>{t('login')}</Button>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <Avatar>
                    <AvatarImage
                      src={user?.profile?.avatar}
                      alt={user?.profile?.full_name || user?.email || "User"}
                    />
                    <AvatarFallback>
                      {user?.profile?.full_name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end">
                  <DropdownMenuItem disabled>
                    {user?.profile?.full_name}
                  </DropdownMenuItem>

                  {(user?.role === "admin" || user?.role === "officer") && (
                    <DropdownMenuItem onClick={() => router.push("/admin")}>
                      {t('dashboard')}
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuItem className="text-red-600" onClick={logout}>
                    {t('logout')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
