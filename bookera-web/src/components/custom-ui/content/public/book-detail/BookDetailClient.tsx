"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { bookService } from "@/services/book.service";
import { Book } from "@/types/book";
import BookCopyList from "./BookCopyList";
import AddToSaveButton from "./AddToSaveButton";
import AddToRequestButton from "./AddToRequestButton";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, CheckCircle, XCircle, ArrowLeft, Heart, HeartOff, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { followService } from "@/services/follow.service";
import { useAuthStore } from "@/store/auth.store";
export default function BookDetailClient() {
    const t = useTranslations("public");
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const { isAuthenticated } = useAuthStore();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [followStatus, setFollowStatus] = useState<Record<string, boolean>>({});
  const [followLoadingIds, setFollowLoadingIds] = useState<Set<string>>(new Set());

  const fetchBook = async () => {
    try {
      setLoading(true);
      const res = await bookService.showBySlug(slug);
      setBook(res.data.data);
    } catch (error) {
      console.error("Error fetching book details:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!slug) return;
    fetchBook();
  }, [slug]);

  useEffect(() => {
    if (!isAuthenticated || !book) return;
    const checks: Promise<void>[] = [];
    (book.authors || []).forEach((author) => {
      checks.push(
        followService.check("author", author.id).then((res) => {
          setFollowStatus((prev) => ({ ...prev, [`author-${author.id}`]: res.data.data.is_following }));
        }).catch(() => {})
      );
    });
    (book.publishers || []).forEach((publisher) => {
      checks.push(
        followService.check("publisher", publisher.id).then((res) => {
          setFollowStatus((prev) => ({ ...prev, [`publisher-${publisher.id}`]: res.data.data.is_following }));
        }).catch(() => {})
      );
    });
  }, [book, isAuthenticated]);

  const handleToggleFollow = async (type: "author" | "publisher", id: number, name: string) => {
    const key = `${type}-${id}`;
    setFollowLoadingIds((prev) => new Set(prev).add(key));
    try {
      if (followStatus[key]) {
        await followService.unfollow(type, id);
        setFollowStatus((prev) => ({ ...prev, [key]: false }));
      } else {
        await followService.follow(type, id);
        setFollowStatus((prev) => ({ ...prev, [key]: true }));
      }
      window.dispatchEvent(new Event("refreshFollowsList"));
    } catch {
      // silently fail
    } finally {
      setFollowLoadingIds((prev) => { const s = new Set(prev); s.delete(key); return s; });
    }
  };

  return (
    <div className="container py-8 space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="h-8 w-8"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{t("bookDetailTitle")}</h1>
          <p className="text-muted-foreground">{t("completeBookDesc")}</p>
        </div>
        {book && (
          <>
            <AddToSaveButton bookId={book.id} />
            <AddToRequestButton bookId={book.id} />
          </>
        )}
      </div>

      {loading && (
        <div className="grid gap-6 lg:grid-cols-3">
          <Skeleton className="h-96" />
          <Skeleton className="lg:col-span-2 h-96" />
        </div>
      )}
      {book && (
      <div className="grid gap-6 lg:grid-cols-3">
        
        <Card className="flex flex-col h-full">
          <CardHeader>
            <CardTitle>{t("bookCoverTitle")}</CardTitle>
            <CardDescription>{t("currentBookCover")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 flex-1 flex flex-col">
            <div className="flex flex-col gap-4 flex-1">
              {book.cover_image_url ? (
                <div className="relative w-full flex-1">
                  <img
                    src={book.cover_image_url}
                    alt={book.title}
                    className="w-full h-full object-cover rounded-lg border"
                  />
                </div>
              ) : (
                <div className="w-full flex-1 border-2 border-dashed rounded-lg flex flex-col items-center justify-center gap-2 bg-muted/30">
                  <BookOpen className="h-12 w-12 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">{t("noCoverImage")}</p>
                </div>
              )}
            </div>

            
            <div className="rounded-lg border p-3 bg-muted/30">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="text-sm font-medium">{t("status")}</p>
                  <p className="text-xs text-muted-foreground">
                    {book.is_active ? t("activeStatus") : t("inactiveStatus")}
                  </p>
                </div>
                <Badge variant={book.is_active ? "default" : "secondary"}>
                  {book.is_active ? (
                    <>
                      <CheckCircle className="h-3 w-3 mr-1" />
                      {t("activeStatus")}
                    </>
                  ) : (
                    <>
                      <XCircle className="h-3 w-3 mr-1" />
                      {t("inactiveStatus")}
                    </>
                  )}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{t("bookInformationTitle")}</CardTitle>
            <CardDescription>{t("completeBookDetails")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">{t("basicInformation")}</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">{t("titleLabel")}</p>
                  <p className="font-medium">{book.title}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t("authorLabel")}</p>
                  <p className="font-medium">{book.author}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t("publisherLabel")}</p>
                  <p className="font-medium">{book.publisher || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t("publicationYear")}</p>
                  <p className="font-medium">{book.publication_year || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t("isbnLabel")}</p>
                  <p className="font-medium">{book.isbn || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t("languageLabel")}</p>
                  <p className="font-medium">{book.language || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t("totalCopies")}</p>
                  <p className="font-medium">{book.copies?.length || 0}</p>
                </div>
              </div>
            </div>

            
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">{t("categoriesSection")}</h3>
              {book.categories && book.categories.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {book.categories.map((category) => (
                    <Badge key={category.id} variant="secondary">
                      {category.name}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">{t("noCategoryPublic")}</p>
              )}
            </div>

            {book.authors && book.authors.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">{t("authorsSection")}</h3>
                <div className="flex flex-col gap-2">
                  {book.authors.map((author) => {
                    const key = `author-${author.id}`;
                    const isFollowing = followStatus[key] ?? false;
                    const isLoading = followLoadingIds.has(key);
                    return (
                      <div key={author.id} className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full overflow-hidden shrink-0">
                          {author.photo_url ? (
                            <img src={author.photo_url} alt={author.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-muted flex items-center justify-center text-xs font-medium">
                              {author.name.charAt(0)}
                            </div>
                          )}
                        </div>
                        <span className="flex-1 text-sm font-medium">{author.name}</span>
                        {isAuthenticated && (
                          <Button
                            variant={isFollowing ? "outline" : "brand"}
                            size="sm"
                            className="h-7 gap-1 text-xs"
                            disabled={isLoading}
                            onClick={() => handleToggleFollow("author", author.id, author.name)}
                          >
                            {isLoading ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : isFollowing ? (
                              <><HeartOff className="h-3 w-3" /> {t("unfollow")}</>
                            ) : (
                              <><Heart className="h-3 w-3" /> {t("follow")}</>
                            )}
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {book.publishers && book.publishers.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">{t("publishersSection")}</h3>
                <div className="flex flex-col gap-2">
                  {book.publishers.map((publisher) => {
                    const key = `publisher-${publisher.id}`;
                    const isFollowing = followStatus[key] ?? false;
                    const isLoading = followLoadingIds.has(key);
                    return (
                      <div key={publisher.id} className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full overflow-hidden shrink-0">
                          {publisher.photo_url ? (
                            <img src={publisher.photo_url} alt={publisher.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-muted flex items-center justify-center text-xs font-medium">
                              {publisher.name.charAt(0)}
                            </div>
                          )}
                        </div>
                        <span className="flex-1 text-sm font-medium">{publisher.name}</span>
                        {isAuthenticated && (
                          <Button
                            variant={isFollowing ? "outline" : "brand"}
                            size="sm"
                            className="h-7 gap-1 text-xs"
                            disabled={isLoading}
                            onClick={() => handleToggleFollow("publisher", publisher.id, publisher.name)}
                          >
                            {isLoading ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : isFollowing ? (
                              <><HeartOff className="h-3 w-3" /> {t("unfollow")}</>
                            ) : (
                              <><Heart className="h-3 w-3" /> {t("follow")}</>
                            )}
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">{t("descriptionSection")}</h3>
              <p className="whitespace-pre-line text-muted-foreground leading-relaxed">
                {book.description || t("noDescriptionAvailable")}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
      )}
      {book && (
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">{t("availableCopiesTitle")}</CardTitle>
          <CardDescription>{t("availableCopiesDesc")}</CardDescription>
        </CardHeader>
        <CardContent>
          <BookCopyList copies={book.copies || []} />
        </CardContent>
      </Card>
      )}
    </div>
  );
}
