"use client";

import PublicHeader from "@/components/custom-ui/navbar/PublicHeader";
import PublicSidebar from "@/components/custom-ui/sidebar/PublicSidebar";
import SavesList from "@/components/custom-ui/content/public/SavesList";
import { useSidebarStore } from "@/store/sidebar.store";
import { cn } from "@/lib/utils";
import "@/app/globals.css";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isCollapsed } = useSidebarStore();

  return (
    <div className="h-screen flex overflow-hidden bg-background">
      <div className="hidden lg:block">
        <PublicSidebar />
      </div>

      {/* Main Content Area */}
      <div
        className={cn(
          "flex-1 flex flex-col overflow-hidden transition-all duration-300",
          isCollapsed ? "lg:ml-20" : "lg:ml-72"
        )}
      >
        <PublicHeader />
        
        <main className="flex-1 overflow-y-auto bg-linear-to-b from-background to-muted/20">
          <div className="p-4 md:p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
