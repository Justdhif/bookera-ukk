"use client";

import { useEffect, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import LoadMoreButton from "@/components/custom-ui/button/LoadMoreButton";
import { Search, UserSquare, Building2, BookText, Users } from "lucide-react";
import { publicService } from "@/services/public.service";
import { followService } from "@/services/follow.service";
import { Author } from "@/types/author";
import { Publisher } from "@/types/publisher";
import { User } from "@/types/user";
import Link from "next/link";
import {
  useSidebar,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import DataLoading from "@/components/custom-ui/DataLoading";
import EmptyState from "@/components/custom-ui/EmptyState";
import { cn } from "@/lib/utils";
import { ITEMS_PER_PAGE_OPTIONS } from "@/constants/pagination";
import { useAuthStore } from "@/store/auth.store";
import { StaggerContainer, SlideIn } from "@/components/custom-ui/motion";
import { usePathname } from "next/navigation";

type TabAction = "author" | "publisher" | "user";

export default function AuthorPublisherSidebarSearch() {
  const pathname = usePathname();
  const t = useTranslations("public");
  const tNavbar = useTranslations("navbar");
  const { user: currentUser } = useAuthStore();
  const { open, setOpen } = useSidebar();
  const [activeTab, setActiveTab] = useState<TabAction>("user");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [authors, setAuthors] = useState<Author[]>([]);
  const [publishers, setPublishers] = useState<Publisher[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    if (pathname.includes("/authors/")) setActiveTab("author");
    else if (pathname.includes("/publishers/")) setActiveTab("publisher");
    else if (pathname.includes("/profile")) setActiveTab("user");
  }, [pathname]);

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
        if (activeTab === "user") setUsers([]);
      } else {
        setLoadingMore(true);
      }
      try {
        if (activeTab === "author") {
          const res = await publicService.getAuthors({
            search: debouncedSearchTerm,
            per_page: ITEMS_PER_PAGE_OPTIONS[1],
            page: currentPage,
          });
          const data = res.data.data;
          let fetchedData = data.data;

          if (!isLoadMore && pathname.startsWith("/authors/")) {
            const activeSlug = pathname.split("/authors/")[1];
            if (
              activeSlug &&
              !fetchedData.some((a: Author) => a.slug === activeSlug)
            ) {
              try {
                const activeRes =
                  await publicService.getAuthorBySlug(activeSlug);
                if (activeRes.data?.data)
                  fetchedData = [activeRes.data.data, ...fetchedData];
              } catch (e) {}
            }
          }

          if (isLoadMore) {
            setAuthors((prev) => {
              const newItems = fetchedData.filter(
                (newItem: Author) => !prev.some((p) => p.id === newItem.id),
              );
              return [...prev, ...newItems];
            });
          } else {
            setAuthors(fetchedData);
          }
          setLastPage(data.last_page);
        } else if (activeTab === "publisher") {
          const res = await publicService.getPublishers({
            search: debouncedSearchTerm,
            per_page: ITEMS_PER_PAGE_OPTIONS[1],
            page: currentPage,
          });
          const data = res.data.data;
          let fetchedData = data.data;

          if (!isLoadMore && pathname.startsWith("/publishers/")) {
            const activeSlug = pathname.split("/publishers/")[1];
            if (
              activeSlug &&
              !fetchedData.some((p: Publisher) => p.slug === activeSlug)
            ) {
              try {
                const activeRes =
                  await publicService.getPublisherBySlug(activeSlug);
                if (activeRes.data?.data)
                  fetchedData = [activeRes.data.data, ...fetchedData];
              } catch (e) {}
            }
          }

          if (isLoadMore) {
            setPublishers((prev) => {
              const newItems = fetchedData.filter(
                (newItem: Publisher) => !prev.some((p) => p.id === newItem.id),
              );
              return [...prev, ...newItems];
            });
          } else {
            setPublishers(fetchedData);
          }
          setLastPage(data.last_page);
        } else {
          const res = await publicService.getUsers({
            search: debouncedSearchTerm,
            per_page: ITEMS_PER_PAGE_OPTIONS[1],
            page: currentPage,
          });
          const response = res.data.data;
          let fetchedData = response.data.filter(
            (u: User) => Number(u.id) !== Number(currentUser?.id),
          );

          if (!isLoadMore && pathname.includes("/profile")) {
            const activeSlug = pathname.split("/")[1];
            if (
              activeSlug &&
              activeSlug !== "me" &&
              !fetchedData.some((u: User) => u.slug === activeSlug)
            ) {
              try {
                const activeRes =
                  await followService.getUserPublicProfile(activeSlug);
                if (
                  activeRes.data?.data &&
                  Number(activeRes.data.data.id) !== Number(currentUser?.id)
                ) {
                  fetchedData = [activeRes.data.data, ...fetchedData];
                }
              } catch (e) {}
            }
          }

          if (isLoadMore) {
            setUsers((prev) => {
              const newItems = fetchedData.filter(
                (newItem: User) => !prev.some((p) => p.id === newItem.id),
              );
              return [...prev, ...newItems];
            });
          } else {
            setUsers(fetchedData);
          }
          setLastPage(response.last_page);
        }
        setPage(currentPage);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [debouncedSearchTerm, activeTab, page, currentUser?.id],
  );

  useEffect(() => {
    fetchData(false);
  }, [debouncedSearchTerm, activeTab, currentUser?.id]);

  return (
    <TooltipProvider delayDuration={0}>
      <div className="flex flex-col h-full overflow-hidden">
        <SlideIn direction="down" delay={0.2}>
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
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
                  <Badge
                    variant={activeTab === "user" ? "default" : "secondary"}
                    className="cursor-pointer whitespace-nowrap"
                    onClick={() => {
                      if (activeTab !== "user") {
                        setLoading(true);
                        setActiveTab("user");
                      }
                    }}
                  >
                    {tNavbar("users")}
                  </Badge>
                  <Badge
                    variant={activeTab === "author" ? "default" : "secondary"}
                    className="cursor-pointer whitespace-nowrap"
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
                    variant={
                      activeTab === "publisher" ? "default" : "secondary"
                    }
                    className="cursor-pointer whitespace-nowrap"
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
        </SlideIn>

        <div className="flex-1 overflow-y-auto p-2 scrollbar-hide">
          {loading ? (
            <div className="flex justify-center py-6">
              <DataLoading variant="inline" size="md" />
            </div>
          ) : (
            <StaggerContainer as={SidebarMenu} staggerDelay={0.03}>
              {activeTab === "author" && authors.length === 0 && (
                <SlideIn direction="up">
                  <EmptyState
                    variant="compact"
                    icon={<UserSquare className="h-5 w-5" />}
                    title="Tidak ada author ditemukan"
                    description="Coba gunakan kata kunci lain."
                  />
                </SlideIn>
              )}
              {activeTab === "publisher" && publishers.length === 0 && (
                <SlideIn direction="up">
                  <EmptyState
                    variant="compact"
                    icon={<Building2 className="h-5 w-5" />}
                    title="Tidak ada publisher ditemukan"
                    description="Coba gunakan kata kunci lain."
                  />
                </SlideIn>
              )}
              {activeTab === "user" && users.length === 0 && (
                <SlideIn direction="up">
                  <EmptyState
                    variant="compact"
                    icon={<Users className="h-5 w-5" />}
                    title="Tidak ada user ditemukan"
                    description="Coba gunakan kata kunci lain."
                  />
                </SlideIn>
              )}

              {/* ── AUTHOR LIST ── */}
              {activeTab === "author" &&
                authors.map((author, index) => {
                  const isActive = pathname === `/authors/${author.slug}`;
                  return (
                    <SlideIn
                      key={author.id}
                      direction="left"
                      delay={index * 0.02}
                    >
                      <SidebarMenuItem className="w-full flex justify-center">
                        {open ? (
                          // OPEN STATE — sama seperti sebelumnya
                          <SidebarMenuButton
                            asChild
                            className={cn(
                              "h-auto py-2 px-3 flex items-center gap-2 transition-all duration-300 rounded-xl w-full",
                              isActive
                                ? "bg-brand-primary/10 dark:bg-brand-primary/15 text-brand-primary border border-brand-primary/20 dark:border-brand-primary/30"
                                : "text-muted-foreground hover:text-foreground hover:bg-accent",
                            )}
                          >
                            <Link
                              href={`/authors/${author.slug}`}
                              className="w-full"
                            >
                              <div className="flex items-center gap-2 w-full">
                                <div className="relative shrink-0">
                                  <Avatar
                                    className={cn(
                                      "h-8 w-8 ring-2 transition-all shadow-sm",
                                      isActive
                                        ? "ring-brand-primary/50"
                                        : "ring-brand-primary/20",
                                    )}
                                  >
                                    <AvatarImage
                                      src={author.photo ?? undefined}
                                      alt={author.name}
                                    />
                                    <AvatarFallback className="bg-linear-to-br from-brand-primary to-brand-primary-dark text-white font-semibold text-xs">
                                      {author.name?.[0]?.toUpperCase()}
                                    </AvatarFallback>
                                  </Avatar>
                                  {isActive && (
                                    <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-linear-to-br from-green-400 to-emerald-500 border-2 border-background shadow-sm" />
                                  )}
                                </div>
                                <div className="flex flex-col overflow-hidden flex-1">
                                  <span className="text-sm font-medium truncate">
                                    {author.name}
                                  </span>
                                  <span className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5 leading-none">
                                    <BookText className="w-3 h-3" />
                                    {author.books_count || 0} Buku
                                  </span>
                                </div>
                                {isActive && (
                                  <div className="ml-auto shrink-0 h-2 w-2 rounded-full bg-brand-primary animate-pulse" />
                                )}
                              </div>
                            </Link>
                          </SidebarMenuButton>
                        ) : (
                          // CLOSED STATE — struktur identik dengan SidebarUserFooter collapsed
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Link
                                href={`/authors/${author.slug}`}
                                className="flex justify-center"
                              >
                                <div className="relative">
                                  <Avatar
                                    className={cn(
                                      "h-9 w-9 ring-2 transition-all shadow-sm cursor-pointer",
                                      isActive
                                        ? "ring-brand-primary/50 scale-105"
                                        : "ring-brand-primary/20 hover:ring-brand-primary/50 hover:scale-105",
                                    )}
                                  >
                                    <AvatarImage
                                      src={author.photo ?? undefined}
                                      alt={author.name}
                                    />
                                    <AvatarFallback className="bg-linear-to-br from-brand-primary to-brand-primary-dark text-white font-semibold text-sm">
                                      {author.name?.[0]?.toUpperCase()}
                                    </AvatarFallback>
                                  </Avatar>
                                  {isActive && (
                                    <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-linear-to-br from-green-400 to-emerald-500 border-2 border-background shadow-sm" />
                                  )}
                                </div>
                              </Link>
                            </TooltipTrigger>
                            <TooltipContent side="right">
                              {author.name}
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </SidebarMenuItem>
                    </SlideIn>
                  );
                })}

              {/* ── PUBLISHER LIST ── */}
              {activeTab === "publisher" &&
                publishers.map((publisher, index) => {
                  const isActive = pathname === `/publishers/${publisher.slug}`;
                  return (
                    <SlideIn
                      key={publisher.id}
                      direction="left"
                      delay={index * 0.02}
                    >
                      <SidebarMenuItem className="w-full flex justify-center">
                        {open ? (
                          // OPEN STATE
                          <SidebarMenuButton
                            asChild
                            className={cn(
                              "h-auto py-2 px-3 flex items-center gap-2 transition-all duration-300 rounded-xl w-full",
                              isActive
                                ? "bg-brand-primary/10 dark:bg-brand-primary/15 text-brand-primary border border-brand-primary/20 dark:border-brand-primary/30"
                                : "text-muted-foreground hover:text-foreground hover:bg-accent",
                            )}
                          >
                            <Link
                              href={`/publishers/${publisher.slug}`}
                              className="w-full"
                            >
                              <div className="flex items-center gap-2 w-full">
                                <div className="relative shrink-0">
                                  <Avatar
                                    className={cn(
                                      "h-8 w-8 ring-2 transition-all shadow-sm",
                                      isActive
                                        ? "ring-brand-primary/50"
                                        : "ring-brand-primary/20",
                                    )}
                                  >
                                    <AvatarImage
                                      src={publisher.photo ?? undefined}
                                      alt={publisher.name}
                                    />
                                    <AvatarFallback className="bg-linear-to-br from-brand-primary to-brand-primary-dark text-white font-semibold text-xs">
                                      {publisher.name?.[0]?.toUpperCase()}
                                    </AvatarFallback>
                                  </Avatar>
                                  {isActive && (
                                    <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-linear-to-br from-green-400 to-emerald-500 border-2 border-background shadow-sm" />
                                  )}
                                </div>
                                <div className="flex flex-col overflow-hidden flex-1">
                                  <span className="text-sm font-medium truncate">
                                    {publisher.name}
                                  </span>
                                  <span className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5 leading-none">
                                    <BookText className="w-3 h-3" />
                                    {publisher.books_count || 0} Buku
                                  </span>
                                </div>
                                {isActive && (
                                  <div className="ml-auto shrink-0 h-2 w-2 rounded-full bg-brand-primary animate-pulse" />
                                )}
                              </div>
                            </Link>
                          </SidebarMenuButton>
                        ) : (
                          // CLOSED STATE — identik dengan SidebarUserFooter collapsed
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Link
                                href={`/publishers/${publisher.slug}`}
                                className="flex justify-center"
                              >
                                <div className="relative">
                                  <Avatar
                                    className={cn(
                                      "h-9 w-9 ring-2 transition-all shadow-sm cursor-pointer",
                                      isActive
                                        ? "ring-brand-primary/50 scale-105"
                                        : "ring-brand-primary/20 hover:ring-brand-primary/50 hover:scale-105",
                                    )}
                                  >
                                    <AvatarImage
                                      src={publisher.photo ?? undefined}
                                      alt={publisher.name}
                                    />
                                    <AvatarFallback className="bg-linear-to-br from-brand-primary to-brand-primary-dark text-white font-semibold text-sm">
                                      {publisher.name?.[0]?.toUpperCase()}
                                    </AvatarFallback>
                                  </Avatar>
                                  {isActive && (
                                    <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-linear-to-br from-green-400 to-emerald-500 border-2 border-background shadow-sm" />
                                  )}
                                </div>
                              </Link>
                            </TooltipTrigger>
                            <TooltipContent side="right">
                              {publisher.name}
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </SidebarMenuItem>
                    </SlideIn>
                  );
                })}

              {/* ── USER LIST ── */}
              {activeTab === "user" &&
                users.map((item, index) => {
                  const isActive = pathname === `/${item.slug}/profile`;
                  const displayName =
                    item.profile?.full_name || item.email.split("@")[0];
                  return (
                    <SlideIn
                      key={item.id}
                      direction="left"
                      delay={index * 0.02}
                    >
                      <SidebarMenuItem className="w-full flex justify-center">
                        {open ? (
                          // OPEN STATE
                          <SidebarMenuButton
                            asChild
                            className={cn(
                              "h-auto py-2 px-3 flex items-center gap-2 transition-all duration-300 rounded-xl w-full",
                              isActive
                                ? "bg-brand-primary/10 dark:bg-brand-primary/15 text-brand-primary border border-brand-primary/20 dark:border-brand-primary/30"
                                : "text-muted-foreground hover:text-foreground hover:bg-accent",
                            )}
                          >
                            <Link
                              href={`/${item.slug}/profile`}
                              className="w-full"
                            >
                              <div className="flex items-center gap-2 w-full">
                                <div className="relative shrink-0">
                                  <Avatar
                                    className={cn(
                                      "h-8 w-8 ring-2 transition-all shadow-sm",
                                      isActive
                                        ? "ring-brand-primary/50"
                                        : "ring-brand-primary/20",
                                    )}
                                  >
                                    <AvatarImage
                                      src={item.profile?.avatar}
                                      alt={
                                        item.profile?.full_name || item.email
                                      }
                                    />
                                    <AvatarFallback className="bg-linear-to-br from-brand-primary to-brand-primary-dark text-white font-semibold text-xs">
                                      {item.profile?.full_name?.[0]?.toUpperCase() ||
                                        item.email?.[0]?.toUpperCase() ||
                                        "U"}
                                    </AvatarFallback>
                                  </Avatar>
                                  {isActive && (
                                    <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-linear-to-br from-green-400 to-emerald-500 border-2 border-background shadow-sm" />
                                  )}
                                </div>
                                <div className="flex flex-col overflow-hidden flex-1">
                                  <span className="text-sm font-medium truncate">
                                    {displayName}
                                  </span>
                                  <span className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5 leading-none">
                                    @{item.email.split("@")[0]}
                                  </span>
                                </div>
                                {isActive && (
                                  <div className="ml-auto shrink-0 h-2 w-2 rounded-full bg-brand-primary animate-pulse" />
                                )}
                              </div>
                            </Link>
                          </SidebarMenuButton>
                        ) : (
                          // CLOSED STATE — identik dengan SidebarUserFooter collapsed
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Link
                                href={`/${item.slug}/profile`}
                                className="flex justify-center"
                              >
                                <div className="relative">
                                  <Avatar
                                    className={cn(
                                      "h-9 w-9 ring-2 transition-all shadow-sm cursor-pointer",
                                      isActive
                                        ? "ring-brand-primary/50 scale-105"
                                        : "ring-brand-primary/20 hover:ring-brand-primary/50 hover:scale-105",
                                    )}
                                  >
                                    <AvatarImage
                                      src={item.profile?.avatar}
                                      alt={
                                        item.profile?.full_name || item.email
                                      }
                                    />
                                    <AvatarFallback className="bg-linear-to-br from-brand-primary to-brand-primary-dark text-white font-semibold text-sm">
                                      {item.profile?.full_name?.[0]?.toUpperCase() ||
                                        item.email?.[0]?.toUpperCase() ||
                                        "U"}
                                    </AvatarFallback>
                                  </Avatar>
                                  {isActive && (
                                    <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-linear-to-br from-green-400 to-emerald-500 border-2 border-background shadow-sm" />
                                  )}
                                </div>
                              </Link>
                            </TooltipTrigger>
                            <TooltipContent side="right">
                              {item.profile?.full_name || item.email}
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </SidebarMenuItem>
                    </SlideIn>
                  );
                })}

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
            </StaggerContainer>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}
