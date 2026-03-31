"use client";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import AccountSidebar from "@/components/custom-ui/sidebar/AccountSidebar";
import PublicHeader from "@/components/custom-ui/navbar/PublicHeader";
import { useAuthStore } from "@/store/auth.store";

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AccountSidebar />

      <SidebarInset className="h-screen flex flex-col overflow-hidden min-w-0">
        <PublicHeader />
        <main className="flex-1 overflow-y-auto bg-linear-to-b from-background to-muted/20">
          <div className="p-4 md:p-6">{children}</div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
