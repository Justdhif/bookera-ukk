import type { Metadata } from "next";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/custom-ui/sidebar/AdminSidebar";
import AdminHeader from "@/components/custom-ui/navbar/AdminHeader";

export const metadata: Metadata = {
  title: "Bookera | Admin",
};

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
        <main className="p-6 flex-1 overflow-y-auto overflow-x-hidden">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
