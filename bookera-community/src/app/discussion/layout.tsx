"use client";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import DiscussionSidebar from "@/components/custom-ui/sidebar/DiscussionSidebar";
import DiscussionHeader from "@/components/custom-ui/content/discussion/DiscussionHeader";
import DiscussionBottomBar from "@/components/custom-ui/navbar/DiscussionBottomBar";
import { useAuthStore } from "@/store/auth.store";
import { ContentLoadingScreen } from "@/components/custom-ui/ContentLoadingScreen";
import { useRealTimeDiscussion } from "@/hooks/useRealTimeDiscussion";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function DiscussionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const initialLoading = useAuthStore((s) => s.initialLoading);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  
  // Initialize real-time discussion updates
  useRealTimeDiscussion();

  useEffect(() => {
    if (!initialLoading && !isAuthenticated) {
      const next = pathname || "/discussion";
      router.replace(`/login?next=${encodeURIComponent(next)}`);
    }
  }, [initialLoading, isAuthenticated, router, pathname]);

  if (!initialLoading && !isAuthenticated) {
    return <ContentLoadingScreen />;
  }

  return (
    <SidebarProvider>
      <DiscussionSidebar />
      <SidebarInset className="h-screen flex flex-col overflow-hidden min-w-0">
        <DiscussionHeader />
        <div className="flex flex-1 overflow-hidden">
          <main className="flex-1 overflow-y-auto bg-background pb-20 md:pb-0">
            {initialLoading ? (
              <ContentLoadingScreen />
            ) : (
              <div className="p-4 md:p-6">{children}</div>
            )}
          </main>
        </div>

        <DiscussionBottomBar />
      </SidebarInset>
    </SidebarProvider>
  );
}
