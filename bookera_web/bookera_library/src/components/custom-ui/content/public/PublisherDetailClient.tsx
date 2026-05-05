"use client";

import { useEffect, useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import Image from "next/image";
import { BookText, Building2 } from "lucide-react";
import { Publisher } from "@/types/publisher";
import { publicService } from "@/services/public.service";
import { Book } from "@/types/book";
import ContentHeader from "@/components/custom-ui/content/ContentHeader";
import PublicBookGrid from "@/components/custom-ui/content/public/PublicBookGrid";
import DataLoading from "@/components/custom-ui/DataLoading";
import EmptyState from "@/components/custom-ui/EmptyState";
import BorrowRequestDialog from "@/components/custom-ui/content/public/book-detail/BorrowRequestDialog";
import { WallpaperPattern } from "@/components/custom-ui/WallpaperPattern";


interface PublisherDetailClientProps {
  slug: string;
}

export default function PublisherDetailClient({ slug }: PublisherDetailClientProps) {
  const t = useTranslations("public.publisherDetail");
  const tPublic = useTranslations("public");
  const tCommon = useTranslations("common");
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const [publisher, setPublisher] = useState<Publisher | null>(null);
  const [loading, setLoading] = useState(true);

  const [selectedBookIds, setSelectedBookIds] = useState<number[]>([]);
  const [showBorrowModal, setShowBorrowModal] = useState(false);
  const [visibleBooks, setVisibleBooks] = useState<Book[]>([]);

  const publisherIdsArray = useMemo(() => publisher ? [publisher.id] : undefined, [publisher?.id]);

  useEffect(() => {
    const fetchPublisher = async () => {
      try {
        const res = await publicService.getPublisherBySlug(slug);
        setPublisher(res.data.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchPublisher();
  }, [slug]);

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

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center py-32">
          <DataLoading variant="inline" size="lg" />
        </div>
      );
    }

    if (!publisher) {
      return (
        <div className="py-20">
          <EmptyState
            icon={<Building2 className="h-12 w-12 text-muted-foreground/50" />}
            title={t("notFound")}
            description="The publisher you are looking for does not exist."
          />
        </div>
      );
    }

    return (
      <>
        <div className="bg-card rounded-3xl border border-border/40 overflow-hidden shadow-xs hover:shadow-md transition-shadow">
          <div className="relative h-32 sm:h-48 overflow-hidden">
            <WallpaperPattern 
              className="opacity-60"
              bgColor={isDark ? "rgba(var(--brand-primary-rgb), 0.1)" : "rgba(var(--brand-primary-rgb), 0.05)"}
            />
            <div className="absolute inset-0 bg-linear-to-b from-transparent to-card/50" />
            <div className="absolute -left-20 -top-20 w-64 h-64 bg-brand-primary/20 blur-3xl rounded-full opacity-50" />
            <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-primary/10 blur-3xl rounded-full opacity-50" />
          </div>

          <div className="px-6 sm:px-10 pb-8 relative">
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 sm:gap-8 -mt-16 sm:-mt-20">
              <div className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-3xl border-4 border-card bg-muted overflow-hidden shadow-lg shrink-0">
                {publisher.photo ? (
                  <Image
                    src={publisher.photo}
                    alt={publisher.name}
                    className="w-full h-full object-cover"
                    fill
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-muted/50">
                    <Building2 className="h-16 w-16 text-muted-foreground/40" />
                  </div>
                )}
              </div>
              
              <div className="flex-1 space-y-3 mb-2 text-center sm:text-left">
                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">{publisher.name}</h1>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full font-medium">
                    <BookText className="w-4 h-4" />
                    <span>{publisher.books_count || 0} {tPublic("search.booksFound", { count: publisher.books_count || 0 }).replace(/[0-9]+ /, '')}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-10 max-w-4xl mx-auto sm:mx-0">
              <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
                <span className="w-8 h-px bg-border"></span>
                {tCommon("description")}
              </h3>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap sm:text-lg">
                {publisher.description || "No description available for this publisher."}
              </p>
            </div>
          </div>
        </div>

        {/* Books Section */}
        <div className="space-y-6 pt-8">
          <PublicBookGrid 
              publisherIds={publisherIdsArray} 
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
      </>
    );
  };

  return (
    <div className="container space-y-8 pb-12">
      <ContentHeader 
        title={t("title")}
        description={t("description", { name: publisher?.name || "..." })}
        showBackButton={true}
      />

      {renderContent()}
    </div>
  );
}
