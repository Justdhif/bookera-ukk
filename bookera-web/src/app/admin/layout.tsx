import type { Metadata } from "next";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/custom-ui/sidebar/AdminSidebar";
import AdminHeader from "@/components/custom-ui/navbar/AdminHeader";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: "Bookera - Admin Dashboard",
  description: "Admin Dashboard for Bookera Library Management System",
};

export default function AdminLayout({ children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AdminSidebar />

      <SidebarInset>
        <AdminHeader />
        <main className="p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
