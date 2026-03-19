"use client";

import { useEffect } from "react";
import { initializeEcho } from "@/lib/echo";
import { getCookie } from "cookies-next";

let isSubscribed = false;
let echoInstance: any = null;

interface PostUpdateEvent {
  slug: string;
  likes_count: number;
  comments_count: number;
  user_id?: number;
  action?: 'liked' | 'unliked';
}

export const useRealTimeDiscussion = () => {
  const token = getCookie("token") as string | undefined;

  useEffect(() => {
    if (typeof window === "undefined" || !token || isSubscribed) return;

    try {
      echoInstance = initializeEcho(token);
      isSubscribed = true;

      // Subscribe to public discussion-posts channel
      const channel = echoInstance.channel("discussion-posts");

      channel.listen(".post.updated", (event: PostUpdateEvent) => {
        // Dispatch custom event for components to listen to
        window.dispatchEvent(
          new CustomEvent("discussion-post-updated", {
            detail: {
              slug: event.slug,
              likesCount: event.likes_count,
              commentsCount: event.comments_count,
              userId: event.user_id,
              action: event.action,
            },
          })
        );
      });

      console.log("✅ Subscribed to discussion-posts channel");
    } catch (error) {
      console.error("❌ Failed to subscribe to discussion channel:", error);
    }

    return () => {
      if (echoInstance && isSubscribed) {
        try {
          echoInstance.leave("discussion-posts");
          isSubscribed = false;
          console.log("🔌 Left discussion-posts channel");
        } catch (error) {
          console.error("Failed to leave discussion channel:", error);
        }
      }
    };
  }, [token]);
};
