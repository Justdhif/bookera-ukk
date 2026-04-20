"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import ContentHeader from "@/components/custom-ui/content/ContentHeader";
import { Book } from "@/types/book";
import BorrowRequestDialog from "@/components/custom-ui/content/book/BorrowRequestDialog";
import PublicBookGrid from "@/components/custom-ui/content/book/PublicBookGrid";

export default function FavoritesPageClient() {
  const t = useTranslations("public.favorites");
  const [selectedBookIds, setSelectedBookIds] = useState<number[]>([]);
  const [showBorrowModal, setShowBorrowModal] = useState(false);
  const [visibleBooks, setVisibleBooks] = useState<Book[]>([]);

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

  return (
    <div className="container space-y-6">
      <div className="space-y-6">
        <ContentHeader
          title={t("title")}
          description={t("description")}
        />
      </div>
      
      <div className="space-y-3">
          <PublicBookGrid 
            fetchMode="favorites"
            onSelectAll={handleSelectAll}
            onBorrowRequest={() => setShowBorrowModal(true)}
            selectedBookIds={selectedBookIds}
            onSelectionChange={handleSelectBook}
            onVisibleBooksChange={setVisibleBooks}
          />
      </div>

      <BorrowRequestDialog
        bookIds={selectedBookIds}
        initialBooks={visibleBooks.filter((book) => selectedBookIds.includes(book.id))}
        isOpen={showBorrowModal}
        onClose={() => setShowBorrowModal(false)}
        onSuccess={() => {
          setShowBorrowModal(false);
          setSelectedBookIds([]);
        }}
      />
    </div>
  );
}
