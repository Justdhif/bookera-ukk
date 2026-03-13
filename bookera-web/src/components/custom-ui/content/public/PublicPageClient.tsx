"use client";

import { useEffect, useState } from "react";
import BookList from "./book/BookList";
import BookListSkeleton from "./book/BookListSkeleton";
import { bookService } from "@/services/book.service";
import { categoryService } from "@/services/category.service";
import { Book } from "@/types/book";
import { Category } from "@/types/category";
import SavesList from "./saves/SavesList";
import BannerCarousel from "./BannerCarousel";
import SpeakerMarquee from "./SpeakerMarquee";
import RealTimeClock from "./RealTimeClock";
import QuickNavSection from "./QuickNavSection";
import { Skeleton } from "@/components/ui/skeleton";

export default function PublicPageClient() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [allBooks, setAllBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      const [catRes, bookRes] = await Promise.all([
        categoryService.getAll({ per_page: 100 }),
        bookService.getAll({ status: "active", per_page: 100 }),
      ]);
      setCategories(catRes.data.data.data);
      setAllBooks(bookRes.data.data.data);
      setLoading(false);
    };
    fetchAll();
  }, []);

  const booksByCategory = categories
    .map((cat) => ({
      category: cat,
      books: allBooks.filter((book) =>
        book.categories?.some((c) => c.id === cat.id),
      ),
    }))
    .filter((group) => group.books.length > 0);

  return (
    <div className="space-y-8 pb-10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 flex flex-col gap-2">
            <BannerCarousel />
            <SpeakerMarquee />
          </div>

          <div className="lg:col-span-1">
            <div className="flex h-full flex-col gap-2">
              <div className="flex-3">
                <RealTimeClock />
              </div>
              <div className="flex-2 pt-2">
                <QuickNavSection />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 space-y-6">
        <div className="lg:hidden">
          <SavesList mode="horizontal" />
        </div>

        <div className="space-y-10">
          {loading
            ? Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="h-7 w-40" />
                  <BookListSkeleton />
                </div>
              ))
            : booksByCategory.map(({ category, books }) => (
                <section key={category.id} className="space-y-3">
                  <h2 className="text-xl font-bold border-l-4 border-brand-primary pl-3">
                    {category.name}
                  </h2>
                  <BookList books={books} loading={false} />
                </section>
              ))}
        </div>
      </div>
    </div>
  );
}
