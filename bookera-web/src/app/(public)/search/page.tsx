"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import BookList from "@/components/custom-ui/content/public/BookList";
import CategoryBubble from "@/components/custom-ui/content/public/CategoryBubble";
import { bookService } from "@/services/book.service";
import { Book } from "@/types/book";
import { Search } from "lucide-react";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryId, setCategoryId] = useState<number | null>(null);
  
  const query = searchParams.get("q") || "";

  const fetchBooks = async () => {
    setLoading(true);

    const res = await bookService.getAll({
      search: query,
      category_id: categoryId ?? undefined,
      status: "active",
    });

    setBooks(res.data.data.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchBooks();
  }, [query, categoryId]);

  return (
    <div className="container space-y-6 py-6">
      {/* Header Search Info */}
      <div className="flex items-center gap-3 pb-4 border-b">
        <Search className="h-6 w-6 text-brand-primary" />
        <div>
          <h1 className="text-2xl font-bold">Hasil Pencarian</h1>
          {query && (
            <p className="text-muted-foreground text-sm">
              Menampilkan hasil untuk: <span className="font-semibold text-foreground">&quot;{query}&quot;</span>
            </p>
          )}
        </div>
      </div>

      {/* Category Filter */}
      <CategoryBubble active={categoryId} onChange={setCategoryId} showFilterIcon />

      {/* Results */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-muted-foreground">
            {loading ? "Memuat..." : `${books.length} buku ditemukan`}
          </p>
        </div>
        <BookList books={books} loading={loading} />
      </div>
    </div>
  );
}
