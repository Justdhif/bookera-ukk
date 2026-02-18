"use client";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import PublicHeader from "@/components/custom-ui/navbar/PublicHeader";
import PublicSidebar from "@/components/custom-ui/sidebar/PublicSidebar";
import "@/app/globals.css";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="hidden lg:block">
        <PublicSidebar />
      </div>

      <SidebarInset className="h-screen flex flex-col overflow-hidden">
        <PublicHeader />
        
        <main className="flex-1 overflow-y-auto bg-linear-to-b from-background to-muted/20">
          <div className="p-4 md:p-6">
            {children}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
