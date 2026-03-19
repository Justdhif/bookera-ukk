"use client";

import { useEffect, useState } from "react";
import BookList from "./book/BookList";
import BookListSkeleton from "./book/BookListSkeleton";
import { bookService } from "@/services/book.service";
import { categoryService } from "@/services/category.service";
import { Category } from "@/types/category";
import SavesList from "./saves/SavesList";
import BannerCarousel from "./BannerCarousel";
import SpeakerMarquee from "./SpeakerMarquee";
import RealTimeClock from "./RealTimeClock";
import QuickNavSection from "./QuickNavSection";
import { Skeleton } from "@/components/ui/skeleton";
import CategoryBookRow from "./book/CategoryBookRow";

export default function PublicPageClient() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryPage, setCategoryPage] = useState(1);
  const [categoryTotalPages, setCategoryTotalPages] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    const fetchInitial = async () => {
      setLoading(true);
      try {
        const catRes = await categoryService.getAll({ per_page: 10, page: 1 });
        setCategories(catRes.data.data.data);
        setCategoryTotalPages(catRes.data.data.last_page);
      } catch (error) {
        console.error(error);
      }
      setLoading(false);
    };
    fetchInitial();
  }, []);

  const loadMoreCategories = async () => {
    if (categoryPage >= categoryTotalPages) return;
    setLoadingMore(true);
    try {
      const nextPage = categoryPage + 1;
      const catRes = await categoryService.getAll({ per_page: 10, page: nextPage });
      setCategories((prev) => [...prev, ...catRes.data.data.data]);
      setCategoryPage(nextPage);
    } catch (error) {
      console.error(error);
    }
    setLoadingMore(false);
  };

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
            : categories.map((category) => (
                <CategoryBookRow key={category.id} category={category} />
              ))}

          {categoryPage < categoryTotalPages && (
            <div className="flex justify-center pt-8 pb-4">
               <button 
                 onClick={loadMoreCategories} 
                 disabled={loadingMore}
                 className="px-8 py-2.5 rounded-full border-2 border-brand-primary text-brand-primary font-semibold hover:bg-brand-primary hover:text-white transition disabled:opacity-50"
               >
                 {loadingMore ? "Memuat..." : "Muat lebih banyak"}
               </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
