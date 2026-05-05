"use client";

import { useTranslations } from "next-intl";
import { useAuthStore } from "@/store/auth.store";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { BookPlus } from "lucide-react";
import { Book } from "@/types/book";
import { useBorrowStore } from "@/store/borrow.store";

interface AddToRequestButtonProps {
  book: Book;
  variant?: "submit" | "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export default function AddToRequestButton({
  book,
  variant = "submit",
  size = "sm",
  className,
}: AddToRequestButtonProps) {
  const { isAuthenticated } = useAuthStore();
  const t = useTranslations("public");
  const router = useRouter();
  const pathname = usePathname();

  const user = useAuthStore((state) => state.user);
  if (!isAuthenticated || !user || user.role === 'user') return null;

  const setSelectedBookIds = useBorrowStore((s) => s.setSelectedBookIds);

  const handleOpen = () => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=${pathname}`);
      return;
    }
    setSelectedBookIds([book.id]);
    router.push("/borrow-request");
  };

  return (
    <Button variant="submit" size="sm" onClick={handleOpen} className="gap-2">
      <BookPlus className="h-4 w-4" />
      {t("addToRequest")}
    </Button>
  );
}
