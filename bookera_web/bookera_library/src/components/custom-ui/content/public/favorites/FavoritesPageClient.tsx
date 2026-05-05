"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import ContentHeader from "@/components/custom-ui/content/ContentHeader";
import { Book } from "@/types/book";
import PublicBookGrid from "@/components/custom-ui/content/public/PublicBookGrid";
import { useAuthStore } from "@/store/auth.store";
import { useBorrowStore } from "@/store/borrow.store";

export default function FavoritesPageClient() {
  const t = useTranslations("public.favorites");
  const user = useAuthStore((state) => state.user);
  const initialLoading = useAuthStore((state) => state.initialLoading);
  const router = useRouter();
  const [selectedBookIds, setSelectedBookIds] = useState<number[]>([]);
  const [visibleBooks, setVisibleBooks] = useState<Book[]>([]);

  if (initialLoading || !user || user.role === "user") {
    return null;
  }

  const handleSelectBook = (bookId: number, checked: boolean) => {
    if (checked) {
      setSelectedBookIds((prev) => [...prev, bookId]);
    } else {
      setSelectedBookIds((prev) => prev.filter((id) => id !== bookId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedBookIds(visibleBooks.map((b) => b.id));
    } else {
      setSelectedBookIds([]);
    }
  };

  const setBorrowBookIds = useBorrowStore((s) => s.setSelectedBookIds);

  const handleBorrowRequest = () => {
    setBorrowBookIds(selectedBookIds);
    router.push("/borrow-request");
  };

  return (
    <div className="container space-y-6">
      <div className="space-y-6">
        <ContentHeader title={t("title")} description={t("description")} />
      </div>

      <div className="space-y-3">
        <PublicBookGrid
          fetchMode="favorites"
          onSelectAll={handleSelectAll}
          onBorrowRequest={handleBorrowRequest}
          selectedBookIds={selectedBookIds}
          onSelectionChange={handleSelectBook}
          onVisibleBooksChange={setVisibleBooks}
        />
      </div>
    </div>
  );
}
