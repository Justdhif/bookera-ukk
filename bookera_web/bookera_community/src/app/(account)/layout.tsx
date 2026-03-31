"use client";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import AccountSidebar from "@/components/custom-ui/sidebar/AccountSidebar";
import { useAuthStore } from "@/store/auth.store";
import { ContentLoadingScreen } from "@/components/custom-ui/ContentLoadingScreen";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const initialLoading = useAuthStore((s) => s.initialLoading);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

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
      <AccountSidebar />

      <SidebarInset className="h-screen flex flex-col overflow-hidden min-w-0">
        <main className="flex-1 overflow-y-auto bg-linear-to-b from-background to-muted/20">
          {initialLoading ? (
            <ContentLoadingScreen />
          ) : (
            <div className="p-4 md:p-6">{children}</div>
          )}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
