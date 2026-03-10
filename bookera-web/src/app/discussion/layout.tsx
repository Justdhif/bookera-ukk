"use client";

import { usePathname } from "next/navigation";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import DiscussionSidebar from "@/components/custom-ui/sidebar/DiscussionSidebar";
import DiscussionHeader from "@/components/custom-ui/content/discussion/DiscussionHeader";
import DiscussionNotificationsPanel from "@/components/custom-ui/content/discussion/DiscussionNotificationsPanel";
import { useAuthStore } from "@/store/auth.store";
import { ContentLoadingScreen } from "@/components/custom-ui/ContentLoadingScreen";
import { useRealTimeDiscussion } from "@/hooks/useRealTimeDiscussion";

export default function DiscussionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const showNotificationsPanel = pathname === "/discussion";
  const initialLoading = useAuthStore((s) => s.initialLoading);
  
  // Initialize real-time discussion updates
  useRealTimeDiscussion();

  return (
    <SidebarProvider>
      <DiscussionSidebar />
      <SidebarInset className="h-screen flex flex-col overflow-hidden min-w-0">
        <DiscussionHeader />
        <div className="flex flex-1 overflow-hidden">
          <main className="flex-1 overflow-y-auto bg-background">
            {initialLoading ? (
              <ContentLoadingScreen />
            ) : (
              <div className="p-4 md:p-6">{children}</div>
            )}
          </main>
          {showNotificationsPanel && (
            <div className="hidden md:block">
              <DiscussionNotificationsPanel />
            </div>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
