"use client";

import { useRouter } from "next/navigation";
import { Search, History, X, BookOpen } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useDebounce } from "@/hooks/useDebounce";
import { publicService } from "@/services/public.service";
import { Book } from "@/types/book";
import DataLoading from "@/components/custom-ui/DataLoading";
import { cn } from "@/lib/utils";

export interface SearchHistoryItem {
  id: string;
  type: "term" | "book";
  title: string;
  subtitle?: string;
  coverImage?: string | null;
  url: string;
}

export default function PublicHeaderSearch() {
  const t = useTranslations("navbar");
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedQuery = useDebounce(searchQuery, 300);
  const [isOpen, setIsOpen] = useState(false);
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);
  const [previewBooks, setPreviewBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const history = localStorage.getItem("recent_searches");
    if (history) {
      try {
        const parsed = JSON.parse(history);
        const migrated: SearchHistoryItem[] = parsed.map((item: any) => {
          if (typeof item === "string") {
            return {
              id: `term:${item}`,
              type: "term",
              title: item,
              url: `/search?q=${encodeURIComponent(item)}`,
            };
          }
          return item;
        });
        setSearchHistory(migrated);
      } catch (e) {
        console.error("Failed to parse search history", e);
      }
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setPreviewBooks([]);
      setIsLoading(false);
      return;
    }

    let active = true;
    setIsLoading(true);

    const fetchPreviews = async () => {
      try {
        const res = await publicService.getBooks({
          search: debouncedQuery,
          per_page: 5,
        });
        if (active) {
          setPreviewBooks(res.data.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch search previews", error);
      } finally {
        if (active) setIsLoading(false);
      }
    };

    fetchPreviews();
    return () => {
      active = false;
    };
  }, [debouncedQuery]);

  const saveHistoryItem = (item: SearchHistoryItem) => {
    const newHistory = [item, ...searchHistory.filter((h) => h.id !== item.id)].slice(0, 8);
    setSearchHistory(newHistory);
    localStorage.setItem("recent_searches", JSON.stringify(newHistory));
  };

  const removeHistoryItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newHistory = searchHistory.filter((h) => h.id !== id);
    setSearchHistory(newHistory);
    localStorage.setItem("recent_searches", JSON.stringify(newHistory));
  };

  const clearAllHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem("recent_searches");
  };

  const handleSearch = (query: string = searchQuery) => {
    if (!query.trim()) return;
    saveHistoryItem({
      id: `term:${query.trim()}`,
      type: "term",
      title: query.trim(),
      url: `/search?q=${encodeURIComponent(query.trim())}`
    });
    setIsOpen(false);
    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  const handleClickBook = (book: Book) => {
    const authorName = book.authors && book.authors.length > 0 
      ? book.authors.map(a => a.name).join(", ") 
      : book.author || t("unknownAuthor");

    saveHistoryItem({
      id: `book:${book.id}`,
      type: "book",
      title: book.title,
      subtitle: `${t("bookLabel")} • ${authorName}`,
      coverImage: book.cover_image,
      url: `/books/${book.slug}`
    });
    setIsOpen(false);
    router.push(`/books/${book.slug}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch();
    }
  };

  const handleFocus = () => {
    setIsOpen(true);
  };

  const highlightMatch = (text: string, query: string) => {
    if (!query.trim()) return text;
    const parts = text.split(new RegExp(`(${query})`, "gi"));
    return (
      <>
        {parts.map((part, i) =>
          part.toLowerCase() === query.toLowerCase() ? (
            <strong key={i} className="font-semibold text-foreground">
              {part}
            </strong>
          ) : (
            <span key={i} className="text-muted-foreground/80">{part}</span>
          )
        )}
      </>
    );
  };

  const showRecentSearches = isOpen && !debouncedQuery.trim();
  const showPreviews = isOpen && debouncedQuery.trim().length > 0;

  return (
    <div
      className="flex-1 max-w-md relative"
      ref={containerRef}
    >
      <div className="relative flex items-center">
        <Search className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 h-4 w-4 md:h-5 md:w-5 text-muted-foreground" />
        <Input
          placeholder={t("bookSearchPlaceholder")}
          className="pl-9 md:pl-12 pr-10 md:pr-4 h-10 md:h-12 bg-muted/30 border-border focus-visible:ring-1 focus-visible:ring-ring rounded-full text-sm md:text-base w-full transition-all"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          autoComplete="off"
        />
        {searchQuery && (
          <button 
            onClick={() => setSearchQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground md:hidden"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {isOpen && (showRecentSearches || showPreviews) && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-popover border border-border rounded-xl shadow-lg overflow-hidden flex flex-col z-50 transition-all animate-in fade-in slide-in-from-top-2">
          
          {showRecentSearches && searchHistory.length > 0 && (
            <div className="p-2 space-y-1">
              <div className="flex items-center justify-between px-3 py-2">
                <span className="text-sm font-semibold text-foreground/80">
                  {t("recentSearches")}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={clearAllHistory}
                  className="h-auto px-0 py-0 text-xs text-muted-foreground hover:bg-transparent hover:text-foreground"
                >
                  {t("clearAll")}
                </Button>
              </div>
              {searchHistory.map((item, index) => (
                <div
                  key={`${item?.id || 'hist'}-${index}`}
                  onClick={() => {
                    if (item.type === "term") {
                      setSearchQuery(item.title);
                    }
                    setIsOpen(false);
                    router.push(item.url);
                  }}
                  className="flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-muted/50 rounded-lg group transition-colors"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    {item.type === "book" ? (
                      <div className="relative h-10 w-7 rounded bg-muted shrink-0 overflow-hidden">
                        {item.coverImage ? (
                          <Image
                            src={item.coverImage}
                            alt={item.title}
                            fill
                            sizes="28px"
                            className="object-cover"
                            unoptimized
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-secondary">
                            <BookOpen className="h-3 w-3 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                    ) : (
                      <History className="h-4 w-4 text-muted-foreground shrink-0" />
                    )}
                    
                    <div className="flex flex-col truncate">
                      <span className="text-sm truncate font-medium text-foreground/90">
                        {item.title}
                      </span>
                      {item.type === "book" && item.subtitle && (
                        <span className="text-[10px] text-muted-foreground truncate">{item.subtitle}</span>
                      )}
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={(e) => removeHistoryItem(item.id, e)}
                    className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:bg-muted hover:text-foreground"
                    aria-label="Remove history item"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {showRecentSearches && searchHistory.length === 0 && (
            <div className="p-6 text-center text-sm text-muted-foreground">
              {t("noRecentSearches")}
            </div>
          )}

          {showPreviews && (
            <div className="p-2 space-y-1">
              {/* Text Match History mapping if it matches the current query */}
              {searchHistory
                .filter((item) => item.title.toLowerCase().includes(debouncedQuery.toLowerCase()))
                .slice(0, 3)
                .map((item, i) => (
                  <div
                    key={`hist-${item.id}-${i}`}
                    onClick={() => {
                      if (item.type === "term") {
                        setSearchQuery(item.title);
                      }
                      setIsOpen(false);
                      router.push(item.url);
                    }}
                    className="flex items-center px-3 py-2.5 cursor-pointer hover:bg-muted/50 rounded-lg transition-colors gap-3 group"
                  >
                    <Search className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="text-sm truncate">
                      {highlightMatch(item.title, debouncedQuery)}
                    </span>
                    <ArrowRightIcon className="ml-auto opacity-0 group-hover:opacity-100 h-4 w-4 text-muted-foreground" />
                  </div>
                ))}

              {isLoading && previewBooks.length === 0 ? (
                <div className="p-4 flex items-center justify-center min-h-25">
                  <DataLoading variant="inline" size="md" />
                </div>
              ) : previewBooks.length > 0 ? (
                <>
                  <div className="flex items-center justify-between px-3 pt-3 pb-1">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      {t("booksSuggestions")}
                    </span>
                  </div>
                  {previewBooks.map((book) => (
                    <div
                      key={book.id}
                      onClick={() => handleClickBook(book)}
                      className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-muted/50 rounded-lg transition-colors group"
                    >
                      <div className="h-12 w-9 md:h-14 md:w-10 bg-muted shrink-0 rounded overflow-hidden relative">
                        {book.cover_image ? (
                          <Image
                            src={book.cover_image}
                            alt={book.title}
                            fill
                            sizes="40px"
                            className="object-cover"
                            unoptimized
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-secondary">
                            <BookOpen className="h-4 w-4 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col overflow-hidden min-w-0">
                        <span className="text-sm font-medium truncate text-foreground group-hover:text-primary transition-colors">
                          {highlightMatch(book.title, debouncedQuery)}
                        </span>
                        <span className="text-xs text-muted-foreground truncate flex items-center gap-1.5">
                          {t("bookLabel")} • {book.authors && book.authors.length > 0 ? book.authors.map(a => a.name).join(", ") : book.author || t("unknownAuthor")}
                        </span>
                      </div>
                    </div>
                  ))}
                </>
              ) : (
                !isLoading && (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    {t("noBooksFoundFor", { query: debouncedQuery })}
                  </div>
                )
              )}
              
              {debouncedQuery && (
                <div 
                  onClick={() => handleSearch()}
                  className="mt-1 px-3 py-2.5 flex items-center text-sm font-medium text-primary hover:bg-primary/5 cursor-pointer rounded-lg transition-colors border-t border-border/50"
                >
                  <Search className="h-4 w-4 mr-2 opacity-70" />
                  {t("seeAllResultsFor", { query: searchQuery })}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ArrowRightIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      {...props}
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}
