"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/auth.store";
import { favoriteService } from "@/services/favorite.service";
import { Button } from "@/components/ui/button";
import { Heart, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface FavoriteButtonProps {
  bookId: number;
}

export default function FavoriteButton({ bookId }: FavoriteButtonProps) {
  const t = useTranslations("public");
  const { isAuthenticated } = useAuthStore();
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !bookId) return;
    favoriteService
      .check(bookId)
      .then((res) => setIsFavorite(res.data.data.is_favorite))
      .catch(() => {});
  }, [bookId, isAuthenticated]);

  const handleToggle = async () => {
    setLoading(true);
    try {
      if (isFavorite) {
        await favoriteService.remove(bookId);
        setIsFavorite(false);
        toast.success(t("removedFromFavorites"));
      } else {
        await favoriteService.add(bookId);
        setIsFavorite(true);
        toast.success(t("addedToFavorites"));
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || t("actionFailed"));
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Button
      variant="brand"
      size="sm"
      onClick={handleToggle}
      disabled={loading}
      className={cn("gap-2", isFavorite && "text-red-400")}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Heart
          className={cn("h-4 w-4", isFavorite && "fill-red-400 text-red-400")}
        />
      )}
      {isFavorite ? t("unfavorite") : t("favorite")}
    </Button>
  );
}
