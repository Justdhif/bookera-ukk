"use client";

import ContentHeader from "@/components/custom-ui/content/ContentHeader";
import { downloadBlobFile } from "@/lib/download";
import DataLoading from "@/components/custom-ui/DataLoading";
import DateRangeFilter from "@/components/custom-ui/DateRangeFilter";
import EmptyState from "@/components/custom-ui/EmptyState";
import PaginatedContent from "@/components/custom-ui/PaginatedContent";
import { ITEMS_PER_PAGE_OPTIONS } from "@/constants/pagination";
import { getCurrentMonthRange } from "@/lib/month-range";
import { lostBookService } from "@/services/lost-book.service";
import { LostBook, LostBookFilterParams } from "@/types/lost-book";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useTranslations } from "next-intl";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  AlertCircle,
  Building2,
  Calendar,
  Download,
  Eye,
  Hash,
  Search,
  Tag,
  User,
} from "lucide-react";
import { toast } from "sonner";

interface LostBookCardProps {
  borrow: LostBook["borrow"];
  items: LostBook[];
}

type LostEntry = {
  key: string;
  lost_date?: string;
  notes?: string;
  bookTitle?: string;
  authors: string;
  publishers: string[];
  categories: Array<{ id: number; name: string }>;
  isbn?: string;
  publicationYear?: number;
  coverImage?: string;
  copyCode?: string;
};

function LostBookCard({ borrow, items }: LostBookCardProps) {
  const t = useTranslations("lost-books");
  const tCommon = useTranslations("common");

  const borrowId = items[0]?.borrow_id;
  const detailLink = borrow?.borrow_code
    ? `/admin/borrows/${borrow.borrow_code}`
    : borrowId
      ? `/admin/borrows/${borrowId}`
      : null;

  const lostEntries: LostEntry[] = items.map((item) => {
    const book = item.book_copy?.book;

    return {
      key: `${item.id}`,
      lost_date: item.lost_date,
      notes: item.notes,
      bookTitle: book?.title,
      authors:
        book?.authors?.map((author: any) => author.name).join(", ") ||
        book?.author ||
        tCommon("noData"),
      publishers: book?.publishers?.map((publisher: any) => publisher.name) || [],
      categories: book?.categories ?? [],
      isbn: book?.isbn,
      publicationYear: book?.publication_year,
      coverImage: book?.cover_image,
      copyCode: item.book_copy?.copy_code,
    };
  });

  const latestLostDate = items
    .map((item) => item.lost_date)
    .filter((value): value is string => Boolean(value))
    .sort((left, right) => new Date(right).getTime() - new Date(left).getTime())[0];

  return (
    <Card className="group relative overflow-hidden border-2 transition-all duration-300 hover:shadow-premium">
      <CardHeader className="border-b border-border/50 bg-muted/30 pb-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle className="text-xl font-bold tracking-tight">
                {t("borrowLabel")} #{borrowId}
              </CardTitle>
              <Badge variant="outline" className="border-dashed text-[10px] font-mono">
                {borrow?.borrow_code}
              </Badge>
              {latestLostDate && (
                <Badge className="border-primary/20 bg-primary/10 text-primary">
                  <Calendar className="mr-1 h-3.5 w-3.5" />
                  {format(new Date(latestLostDate), "dd MMM yyyy")}
                </Badge>
              )}
            </div>

            <CardDescription className="flex flex-wrap items-center gap-4 text-xs font-medium">
              <span className="flex items-center gap-1.5 text-foreground/80">
                <User className="h-3.5 w-3.5 text-primary" />
                {t("borrowerLabel")}: {borrow?.user?.profile?.full_name || borrow?.user?.email || tCommon("noData")}
              </span>
              <span className="flex items-center gap-1.5 text-foreground/80">
                <Calendar className="h-3.5 w-3.5 text-primary" />
                {t("borrowDateLabel")}: {borrow?.borrow_date ? format(new Date(borrow.borrow_date), "dd MMM yyyy") : tCommon("noData")}
              </span>
              <span className="flex items-center gap-1.5 rounded-full bg-destructive/5 px-2 py-0.5 text-destructive">
                <Calendar className="h-3.5 w-3.5" />
                {t("dueDateLabel")}: {borrow?.return_date ? format(new Date(borrow.return_date), "dd MMM yyyy") : tCommon("noData")}
              </span>
            </CardDescription>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-end md:self-center">
            <Badge className="border-destructive/20 bg-destructive/10 text-destructive">
              <AlertCircle className="mr-1 h-3.5 w-3.5" />
              {lostEntries.length} {t("lostBooksCount")}
            </Badge>

            {detailLink && (
              <Link href={detailLink}>
                <Button size="sm" variant="outline" className="h-8 gap-1">
                  <Eye className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">{t("viewBtn")}</span>
                </Button>
              </Link>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 pt-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h4 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-muted-foreground/70">
              <AlertCircle className="h-4 w-4 text-destructive" />
              {t("lostBooksSection")} <span className="text-destructive">({lostEntries.length})</span>
            </h4>
          </div>

          <div className="grid gap-4">
            {lostEntries.map((entry) => (
              <div
                key={entry.key}
                className="group/item flex flex-col gap-4 rounded-xl border border-border/50 bg-card p-4 transition-all duration-300 hover:border-destructive/30 hover:shadow-premium sm:flex-row sm:items-start"
              >
                <div className="relative h-32 w-24 shrink-0 overflow-hidden rounded-lg shadow-lg transition-transform duration-300 group-hover/item:scale-105 sm:h-28 sm:w-20">
                  <Image
                    src={entry.coverImage || "/placeholder.png"}
                    alt={entry.bookTitle || "Book"}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>

                <div className="min-w-0 flex-1 space-y-2">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-base font-bold tracking-tight group-hover/item:text-destructive sm:text-lg">
                        {entry.bookTitle || tCommon("noData")}
                      </p>
                      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] font-bold uppercase text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          <span className="truncate max-w-30">{entry.authors}</span>
                        </div>
                        {entry.publishers.length > 0 && (
                          <div className="flex items-center gap-1">
                            <Building2 className="h-3 w-3" />
                            <span className="truncate max-w-30">{entry.publishers[0]}</span>
                          </div>
                        )}
                        {entry.isbn && (
                          <div className="flex items-center gap-1">
                            <Hash className="h-3 w-3" />
                            <span className="truncate max-w-25">{entry.isbn}</span>
                          </div>
                        )}
                        {entry.publicationYear && (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>{entry.publicationYear}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex shrink-0 flex-col items-end gap-1.5">
                      <Badge
                        variant="secondary"
                        className="h-6 border-border/50 bg-muted/80 px-2.5 text-[11px] font-mono backdrop-blur"
                      >
                        {entry.copyCode}
                      </Badge>
                      {entry.lost_date ? (
                        <Badge className="border-destructive/20 bg-destructive/10 text-destructive">
                          {format(new Date(entry.lost_date), "dd MMM yyyy")}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="border-dashed text-[10px] text-muted-foreground">
                          {t("unknownDate")}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {entry.categories.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {entry.categories.slice(0, 3).map((category) => (
                        <Badge
                          key={category.id}
                          variant="outline"
                          className="h-6 border-primary/20 bg-primary/5 px-2.5 py-0 text-[10px] font-medium text-primary/80"
                        >
                          <Tag className="mr-1.5 h-3 w-3" />
                          {category.name}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {entry.notes && (
                    <p className="border-l-2 border-destructive/30 pl-3 text-sm italic text-muted-foreground">
                      {entry.notes}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function LostBooksClient() {
  const t = useTranslations("lost-books");
  const defaultMonthRange = getCurrentMonthRange();
  const [lostBooks, setLostBooks] = useState<LostBook[]>([]);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [filters, setFilters] = useState<LostBookFilterParams>({
    per_page: ITEMS_PER_PAGE_OPTIONS[1],
    ...defaultMonthRange,
  });
  const [searchInput, setSearchInput] = useState("");
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    total: 0,
    from: 0,
    to: 0,
  });

  useEffect(() => {
    const timeout = setTimeout(() => {
      setFilters((prev) => ({
        ...prev,
        search: searchInput || undefined,
        page: 1,
      }));
    }, 500);

    return () => clearTimeout(timeout);
  }, [searchInput]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
  };

  const handleDateFilter = (start_date?: string, end_date?: string) => {
    setFilters((prev) => ({
      ...prev,
      start_date,
      end_date,
      page: 1,
    }));
  };

  const fetchLostBooks = async (activeFilters: LostBookFilterParams) => {
    setLoading(true);
    try {
      const res = await lostBookService.getAll(activeFilters);
      const paginatedData = res.data.data;
      setLostBooks(paginatedData.data ?? paginatedData);
      setPagination({
        current_page: paginatedData.current_page,
        last_page: paginatedData.last_page,
        total: paginatedData.total,
        from: paginatedData.from,
        to: paginatedData.to,
      });
    } catch (error) {
      toast.error(t("loadError"));
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const response = await lostBookService.exportData(filters);
      downloadBlobFile(
        response.data,
        `lost_books_data_${new Date().toISOString().split("T")[0]}.xlsx`,
      );
      toast.success(t("exportSuccess"));
    } catch (error: any) {
      toast.error(error.response?.data?.message || t("exportError"));
    } finally {
      setExporting(false);
    }
  };

  useEffect(() => {
    fetchLostBooks(filters);
  }, [filters]);

  const renderCards = (books: LostBook[]) => {
    if (books.length === 0) {
      return (
        <EmptyState
          icon={<AlertCircle />}
          title={t("noLostBooks")}
          description={t("noLostBooksDesc")}
        />
      );
    }

    return (
      <div className="grid gap-4">
        {books.map((lostBook) => (
          <LostBookCard
            key={lostBook.id}
            borrow={lostBook.borrow}
            items={[lostBook]}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <ContentHeader
        title={t("title")}
        description={t("description")}
        isAdmin
        rightActions={
          <Button
            variant="outline"
            className="h-8 gap-1 border-slate-200"
            onClick={handleExport}
            disabled={exporting}
          >
            <Download className="h-3.5 w-3.5" />
            {t("exportData")}
          </Button>
        }
      />

      <div className="space-y-4">
        <div className="mb-6 grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
          <div className="relative min-w-0 w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
            <Input
              placeholder={t("searchPlaceholder")}
              value={searchInput}
              onChange={handleSearchChange}
              className="h-11! w-full pl-9 shadow-sm transition-all duration-300"
            />
          </div>
          <DateRangeFilter
            onFilter={handleDateFilter}
            defaultStartDate={defaultMonthRange.startDate}
            defaultEndDate={defaultMonthRange.endDate}
            className="w-full lg:w-auto"
          />
        </div>

        <PaginatedContent
          currentPage={pagination.current_page}
          lastPage={pagination.last_page}
          total={pagination.total}
          from={pagination.from}
          to={pagination.to}
          onPageChange={(page) => setFilters((prev) => ({ ...prev, page }))}
        >
          {loading ? (
            <div className="grid gap-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <DataLoading key={index} size="lg" />
              ))}
            </div>
          ) : (
            renderCards(lostBooks)
          )}
        </PaginatedContent>
      </div>
    </div>
  );
}
