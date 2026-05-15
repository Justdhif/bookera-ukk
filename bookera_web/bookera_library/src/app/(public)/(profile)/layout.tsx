"use client";

import ProfileSidebar from "@/components/custom-ui/content/public/profile/ProfileSidebar";
import { useParams, usePathname } from "next/navigation";

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const pathname = usePathname();
  
  // Determine the slug for ProfileSidebar
  // For my-* routes, we use "me"
  // For [slug] route, we use params.slug
  const isMyRoute = pathname.startsWith("/my-");
  const slug = isMyRoute ? "me" : (params.slug as string);

  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6 items-start">
        <aside className="lg:sticky lg:top-6 h-fit">
          <ProfileSidebar slug={slug} />
        </aside>
        <main className="flex-1 min-w-0 bg-card/30 backdrop-blur-sm border border-border/50 rounded-2xl p-4 md:p-6 shadow-sm">
          {children}
        </main>
      </div>
    </div>
  );
}
