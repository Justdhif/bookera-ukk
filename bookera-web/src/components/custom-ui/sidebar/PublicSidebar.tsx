"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import SavesList from "@/components/custom-ui/content/public/SavesList";
import BookeraLogo from "@/assets/logo/bookera-logo-hd.png";
import Image from "next/image";
import { Home, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useSidebarStore } from "@/store/sidebar.store";

export default function PublicSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const { isCollapsed } = useSidebarStore();

  useEffect(() => {
    setMounted(true);
  }, []);

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
    <TooltipProvider>
      <aside
        className={cn(
          "fixed left-0 top-0 h-screen bg-background border-r border-border flex flex-col shadow-lg transition-all duration-300",
          isCollapsed ? "w-20" : "w-72"
        )}
      >
        <div className="p-4 border-b border-border flex items-center justify-between">
          <Link href="/" className={cn("flex items-center", isCollapsed ? "justify-center w-full" : "gap-1")}>
            <Image
              src={BookeraLogo}
              alt="Bookera"
              className="h-12 w-12 object-cover"
            />
            {!isCollapsed && <span className="font-bold text-2xl">Bookera</span>}
          </Link>
        </div>

        <nav className={cn("px-3 py-4 space-y-1", isCollapsed && "flex flex-col items-center")}>
          {mainNavItems.map((item) => {
            const navItem = (
              <Link
                key={item.href}
                href={item.href}
                onClick={(e) => handleNavClick(e, item.href)}
                className={cn(
                  "flex items-center rounded-lg transition-colors text-muted-foreground",
                  isCollapsed ? "justify-center p-3" : "gap-4 px-3 py-3",
                  isActive(item.href)
                    ? "bg-primary text-primary-foreground font-semibold"
                    : "hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <item.icon className="h-6 w-6" />
                {!isCollapsed && <span className="text-base">{item.title}</span>}
              </Link>
            );

            if (isCollapsed) {
              return (
                <Tooltip key={item.href}>
                  <TooltipTrigger asChild>{navItem}</TooltipTrigger>
                  <TooltipContent side="right">
                    <p>{item.title}</p>
                  </TooltipContent>
                </Tooltip>
              );
            }

            return navItem;
          })}
        </nav>

        <div className={cn("flex-1 overflow-hidden", isCollapsed ? "px-2 pb-2" : "px-3 pb-3")}>
          <div className={cn("h-full rounded-lg overflow-hidden", !isCollapsed && "bg-muted/30")}>
            <SavesList mode="sidebar" isCollapsed={isCollapsed} />
          </div>
        </div>
      </aside>
    </TooltipProvider>
  );
}
