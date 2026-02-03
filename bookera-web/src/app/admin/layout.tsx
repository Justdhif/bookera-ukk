"use client";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/custom-ui/sidebar/AdminSidebar";
import AdminHeader from "@/components/custom-ui/navbar/AdminHeader";
import { useAuthStore } from "@/store/auth.store";
import { ContentLoadingScreen } from "@/components/ui/ContentLoadingScreen";
import "@/app/globals.css";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const initialLoading = useAuthStore((s) => s.initialLoading);

  return (
    <SidebarProvider>
      <AdminSidebar />

      <SidebarInset>
        <AdminHeader />
        <main
          className={`p-6 relative ${initialLoading ? "h-[80vh]" : "min-h-screen"}`}
        >
          {initialLoading ? <ContentLoadingScreen /> : children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
