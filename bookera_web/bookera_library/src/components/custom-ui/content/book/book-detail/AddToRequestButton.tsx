"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { useAuthStore } from "@/store/auth.store";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { BookPlus } from "lucide-react";
import BorrowRequestDialog from "@/components/custom-ui/content/book/BorrowRequestDialog";

interface AddToRequestButtonProps {
  bookId: number;
}

export default function AddToRequestButton({
  bookId,
}: AddToRequestButtonProps) {
  const t = useTranslations("public");
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [showDialog, setShowDialog] = useState(false);

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
        bookIds={[bookId]}
        isOpen={showDialog}
        onClose={() => setShowDialog(false)}
        onSuccess={() => setShowDialog(false)}
      />
    </>
  );
}
