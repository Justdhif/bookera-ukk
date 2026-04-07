"use client";
import Image from "next/image";
import { useEffect, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import LoadMoreButton from "@/components/custom-ui/LoadMoreButton";
import { Search, Loader2, UserSquare, Building2, BookText } from "lucide-react";
import { authorService } from "@/services/author.service";
import { publisherService } from "@/services/publisher.service";
import { Author } from "@/types/author";
import { Publisher } from "@/types/publisher";
import { useRouter } from "next/navigation";
import {
  useSidebar,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import EmptyState from "@/components/custom-ui/EmptyState";
import { cn } from "@/lib/utils";
type TabAction = "author" | "publisher";
export default function AuthorPublisherSidebarSearch() {
  const t = useTranslations("public");
  const router = useRouter();
  const { open, setOpen } = useSidebar();
  const [activeTab, setActiveTab] = useState<TabAction>("author");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [authors, setAuthors] = useState<Author[]>([]);
  const [publishers, setPublishers] = useState<Publisher[]>([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);
  const fetchData = useCallback(
    async (isLoadMore = false) => {
      const currentPage = isLoadMore ? page + 1 : 1;
      if (!isLoadMore) {
        setLoading(true);
        if (activeTab === "author") setAuthors([]);
        if (activeTab === "publisher") setPublishers([]);
      } else {
        setLoadingMore(true);
      }
      try {
        if (activeTab === "author") {
          const res = await authorService.getAll({
            search: debouncedSearchTerm,
            per_page: 10,
            page: currentPage,
            is_active: true,
          });
          const data = res.data.data;
          if (isLoadMore) {
            setAuthors((prev) => [...prev, ...data.data]);
          } else {
            setAuthors(data.data);
          }
          setLastPage(data.last_page);
        } else {
          const res = await publisherService.getAll({
            search: debouncedSearchTerm,
            per_page: 10,
            page: currentPage,
            is_active: true,
          });
          const data = res.data.data;
          if (isLoadMore) {
            setPublishers((prev) => [...prev, ...data.data]);
          } else {
            setPublishers(data.data);
          }
          setLastPage(data.last_page);
        }
        setPage(currentPage);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [debouncedSearchTerm, activeTab, page],
  );
  useEffect(() => {
    fetchData(false);
  }, [debouncedSearchTerm, activeTab]);
  const handleEntityClick = (name: string, type: TabAction) => {
    router.push(`/search?q=${encodeURIComponent(name)}`);
  };
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div
        className={cn(
          "border-b border-border/40 shrink-0",
          !open ? "p-2 py-4" : "p-4 pt-0 space-y-4",
        )}
      >
        {open ? (
          <>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t("searchAuthorPublisher")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-9 bg-muted/50 text-sm"
              />
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant={activeTab === "author" ? "default" : "secondary"}
                className="cursor-pointer"
                onClick={() => {
                  if (activeTab !== "author") {
                    setLoading(true);
                    setActiveTab("author");
                  }
                }}
              >
                Authors
              </Badge>
              <Badge
                variant={activeTab === "publisher" ? "default" : "secondary"}
                className="cursor-pointer"
                onClick={() => {
                  if (activeTab !== "publisher") {
                    setLoading(true);
                    setActiveTab("publisher");
                  }
                }}
              >
                Publishers
              </Badge>
            </div>
          </>
        ) : (
          <SidebarMenu>
            <SidebarMenuItem className="w-full flex justify-center">
              <SidebarMenuButton
                onClick={() => setOpen(true)}
                className="justify-center px-0 mx-auto"
                tooltip={t("searchAuthorPublisher")}
              >
                <Search className="h-5 w-5 shrink-0" />
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        )}
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        {loading ? (
          <SidebarMenu>
            {[...Array(5)].map((_, i) => (
              <SidebarMenuItem
                key={`skeleton-${i}`}
                className={!open ? "w-full flex justify-center" : ""}
              >
                <SidebarMenuButton
                  disabled
                  className={cn(
                    "h-auto py-2 flex items-center gap-3 pointer-events-none",
                    !open && "justify-center px-0 mx-auto",
                  )}
                >
                  <Skeleton className="h-8 w-8 rounded-full shrink-0" />
                  {open && (
                    <div className="flex flex-col gap-1.5 w-full overflow-hidden py-0.5">
                      <Skeleton className="h-3.5 w-30" />
                      <Skeleton className="h-2.5 w-20" />
                    </div>
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        ) : (
          <SidebarMenu>
            {activeTab === "author" && authors.length === 0 && (
              <EmptyState
                variant="compact"
                icon={<UserSquare className="h-5 w-5" />}
                title="Tidak ada author ditemukan"
                description="Coba gunakan kata kunci lain."
              />
            )}
            {activeTab === "publisher" && publishers.length === 0 && (
              <EmptyState
                variant="compact"
                icon={<Building2 className="h-5 w-5" />}
                title="Tidak ada publisher ditemukan"
                description="Coba gunakan kata kunci lain."
              />
            )}
            {activeTab === "author" &&
              authors.map((author) => (
                <SidebarMenuItem
                  key={author.id}
                  className={!open ? "w-full flex justify-center" : ""}
                >
                  <SidebarMenuButton
                    onClick={() => handleEntityClick(author.name, "author")}
                    className={cn(
                      "h-auto py-2 flex items-center gap-3",
                      !open && "justify-center px-0 mx-auto",
                    )}
                    tooltip={!open ? author.name : undefined}
                  >
                    <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 bg-muted flex items-center justify-center">
                      {author.photo ? (
                        <Image
                          src={author.photo}
                          alt={author.name}
                          className="w-full h-full object-cover"
                          width={300}
                          height={400}
                          unoptimized
                        />
                      ) : (
                        <UserSquare className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                    {open && (
                      <div className="flex flex-col overflow-hidden">
                        <span className="text-sm font-medium truncate">
                          {author.name}
                        </span>
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                          <BookText className="w-3 h-3" />
                          {author.books_count || 0} Buku
                        </span>
                      </div>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            {activeTab === "publisher" &&
              publishers.map((publisher) => (
                <SidebarMenuItem
                  key={publisher.id}
                  className={!open ? "w-full flex justify-center" : ""}
                >
                  <SidebarMenuButton
                    onClick={() =>
                      handleEntityClick(publisher.name, "publisher")
                    }
                    className={cn(
                      "h-auto py-2 flex items-center gap-3",
                      !open && "justify-center px-0 mx-auto",
                    )}
                    tooltip={!open ? publisher.name : undefined}
                  >
                    <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 bg-muted flex items-center justify-center">
                      {publisher.photo ? (
                        <Image
                          src={publisher.photo}
                          alt={publisher.name}
                          className="w-full h-full object-cover"
                          width={300}
                          height={400}
                          unoptimized
                        />
                      ) : (
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                    {open && (
                      <div className="flex flex-col overflow-hidden">
                        <span className="text-sm font-medium truncate">
                          {publisher.name}
                        </span>
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                          <BookText className="w-3 h-3" />
                          {publisher.books_count || 0} Buku
                        </span>
                      </div>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            {page < lastPage && open && (
              <div className="p-2 mt-2">
                <LoadMoreButton
                  variant="outline"
                  size="sm"
                  className="w-full text-xs"
                  onClick={() => fetchData(true)}
                  loading={loadingMore}
                />
              </div>
            )}
          </SidebarMenu>
        )}
      </div>
    </div>
  );
}
