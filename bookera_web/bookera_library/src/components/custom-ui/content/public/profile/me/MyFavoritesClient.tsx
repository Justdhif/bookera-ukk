"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter, useParams } from "next/navigation";
import ContentHeader from "@/components/custom-ui/content/ContentHeader";
import { Book } from "@/types/book";
import PublicBookGrid from "@/components/custom-ui/content/public/PublicBookGrid";
import { useAuthStore } from "@/store/auth.store";
import { useBorrowStore } from "@/store/borrow.store";
import {
  StaggerContainer,
  FadeUp,
  SlideIn,
} from "@/components/custom-ui/motion";

export default function MyFavoritesClient() {
  const t = useTranslations("public.favorites");
  const tProfile = useTranslations("profile");
  const { user: currentUser, initialLoading } = useAuthStore();
  const isMe = true;
  const router = useRouter();
  const [selectedBookIds, setSelectedBookIds] = useState<number[]>([]);
  const [visibleBooks, setVisibleBooks] = useState<Book[]>([]);

  if (initialLoading) {
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
    <StaggerContainer className="pt-1 md:pt-2 px-0">
      <ContentHeader
        title={isMe ? t("title") : tProfile("favorite")}
        description={t("description")}
        showBackButton={false}
        className="mb-8"
      />

      <SlideIn direction="up" delay={0.1}>
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
      </SlideIn>
    </StaggerContainer>
  );
}
