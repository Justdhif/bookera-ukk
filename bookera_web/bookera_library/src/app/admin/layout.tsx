"use client";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/custom-ui/sidebar/AdminSidebar";
import AdminHeader from "@/components/custom-ui/navbar/AdminHeader";
import { useAuthStore } from "@/store/auth.store";
import "@/app/globals.css";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AdminSidebar />

      <SidebarInset className="h-screen flex flex-col overflow-hidden">
        <AdminHeader />
        <main className="p-6 flex-1 overflow-y-auto">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
