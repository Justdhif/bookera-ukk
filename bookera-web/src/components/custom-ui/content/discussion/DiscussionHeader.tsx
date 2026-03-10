"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { PlusSquare } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { useAuthStore } from "@/store/auth.store";
import NotificationDropdown from "@/components/custom-ui/navbar/NotificationDropdown";
import CreatePostModal from "@/components/custom-ui/content/discussion/CreatePostModal";
import { DiscussionPost } from "@/types/discussion";
import { toast } from "sonner";

export default function DiscussionHeader() {
  const t = useTranslations("discussion");
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated } = useAuthStore();
  const [showCreateModal, setShowCreateModal] = useState(false);

  const handlePostCreated = (_newPost: DiscussionPost) => {
    setShowCreateModal(false);
    toast.success(t("postCreatedSuccess"));
    if (pathname === "/discussion") {
      router.refresh();
    } else {
      router.push("/discussion");
    }
  };

  return (
    <>
      <header className="sticky top-0 z-20 shrink-0 bg-background/80 backdrop-blur-sm border-b border-border/60 flex items-center justify-between px-3 h-14">
        <SidebarTrigger className="h-8 w-8" />

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-xl text-muted-foreground hover:text-foreground"
            onClick={() => {
              if (!isAuthenticated) {
                router.push("/login");
                return;
              }
              setShowCreateModal(true);
            }}
          >
            <PlusSquare className="h-5 w-5" />
          </Button>

          <NotificationDropdown isAuthenticated={isAuthenticated} />
        </div>
      </header>

      {showCreateModal && (
        <CreatePostModal
          onClose={() => setShowCreateModal(false)}
          onCreated={handlePostCreated}
        />
      )}
    </>
  );
}
