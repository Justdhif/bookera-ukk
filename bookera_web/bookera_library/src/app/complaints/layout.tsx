import { Metadata } from "next";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import AppHeader from "@/components/custom-ui/navbar/AppHeader";
import ComplaintSidebar from "@/components/custom-ui/sidebar/ComplaintSidebar";
import React from "react";
import { MessageSquareQuote } from "lucide-react";

export const metadata: Metadata = {
  title: "Bookera | Complaint",
};

export default function ComplaintGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <React.Suspense>
        <ComplaintSidebar />
      </React.Suspense>
        
        <SidebarInset className="h-screen flex flex-col overflow-hidden min-w-0">
            <AppHeader 
              leftContent={
                <div className="flex items-center gap-2">
                  <MessageSquareQuote className="h-5 w-5 text-primary hidden sm:block" />
                  <span className="font-bold text-lg tracking-tight hidden sm:block">Bookera Complaints</span>
                </div>
              }
            />
            
            <main className="flex-1 overflow-y-auto bg-linear-to-b from-background to-muted/20">
                <div className="p-4 md:p-6">
                    <React.Suspense>
                        {children}
                    </React.Suspense>
                </div>
            </main>
        </SidebarInset>
    </SidebarProvider>
  );
}
