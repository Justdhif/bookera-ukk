"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { discussionLikeService } from "@/services/discussion.service";
import { useAuthStore } from "@/store/auth.store";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

interface Props {
  slug: string;
  initialLiked: boolean;
  initialCount: number;
}

export default function LikeButton({ slug, initialLiked, initialCount }: Props) {
  const t = useTranslations("discussion");
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    if (loading) return;
    setLoading(true);

    // Optimistic update
    setLiked((prev) => !prev);
    setCount((prev) => (liked ? prev - 1 : prev + 1));

    try {
      const res = await discussionLikeService.toggleLike(slug);
      setLiked(res.data.data.liked);
      setCount(res.data.data.likes_count);
    } catch {
      // Revert optimistic update on error
      setLiked((prev) => !prev);
      setCount((prev) => (liked ? prev + 1 : prev - 1));
      toast.error(t("failedUpdateLike"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        "flex items-center gap-1.5 text-sm font-medium transition-all select-none",
        liked
          ? "text-pink-500 hover:text-pink-600"
          : "text-muted-foreground hover:text-pink-500",
        loading && "opacity-60 cursor-not-allowed"
      )}
      aria-label={liked ? t("removeLikeAriaLabel") : t("likePostAriaLabel")}
    >
      <Heart
        className={cn(
          "h-5 w-5 transition-all",
          liked && "fill-pink-500 stroke-pink-500",
          !liked && "stroke-current"
        )}
      />
      <span>{count}</span>
    </button>
  );
}
