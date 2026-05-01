"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { useAuthStore } from "@/store/auth.store";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { BookPlus } from "lucide-react";
import { Book } from "@/types/book";
import BorrowRequestDialog from "./BorrowRequestDialog";

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
  const [showDialog, setShowDialog] = useState(false);

  const user = useAuthStore((state) => state.user);
  if (!isAuthenticated || !user || user.role === 'user') return null;

  const handleOpen = () => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=${pathname}`);
      return;
    }
    setShowDialog(true);
  };

  return (
    <>
      <Button variant="submit" size="sm" onClick={handleOpen} className="gap-2">
        <BookPlus className="h-4 w-4" />
        {t("addToRequest")}
      </Button>

      <BorrowRequestDialog
        bookIds={[book.id]}
        initialBooks={[book]}
        isOpen={showDialog}
        onClose={() => setShowDialog(false)}
        onSuccess={() => setShowDialog(false)}
      />
    </>
  );
}
