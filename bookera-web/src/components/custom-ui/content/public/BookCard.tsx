"use client";

import { Book } from "@/types/book";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BookOpen } from "lucide-react";
import { useTranslations } from 'next-intl';

export default function BookCard({ book }: { book: Book }) {
  const router = useRouter();
  const t = useTranslations('books');

  return (
    <div className="border rounded-lg p-3 space-y-3">
      <img
        src={book.cover_image_url ?? "/placeholder.png"}
        className="aspect-3/4 object-cover rounded"
      />

      <div>
        <h3 className="font-semibold line-clamp-2">{book.title}</h3>
        <p className="text-sm text-muted-foreground">{book.author}</p>
      </div>

      <Button
        size="sm"
        variant="outline"
        onClick={() => router.push(`/books/${book.slug}`)}
      >
        {t('detail')}
      </Button>
    </div>
  );
}
