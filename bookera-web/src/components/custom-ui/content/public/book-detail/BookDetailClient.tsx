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
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import ActiveStatusBadge from "@/components/custom-ui/badge/ActiveStatusBadge";
import { BookOpen, ArrowLeft, Heart, HeartOff, Loader2, UserSquare, Building2 } from "lucide-react";
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
      const res = await bookService.getBySlug(slug);
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="brand"
            size="icon"
            onClick={() => router.back()}
            className="h-8 w-8"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{t("bookDetailTitle")}</h1>
            <p className="text-muted-foreground">{t("completeBookDesc")}</p>
          </div>
        </div>
        {book && (
          <div className="flex gap-2">
            <AddToSaveButton bookId={book.id} />
            <AddToRequestButton bookId={book.id} />
          </div>
        )}
      </div>

      {loading ? (
        <div className="grid gap-6 lg:grid-cols-3">
          <Skeleton className="h-96" />
          <Skeleton className="lg:col-span-2 h-96" />
        </div>
      ) : book && (
        <>
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Side Card */}
            <div className="lg:self-start lg:sticky lg:top-4">
              <Card className="flex flex-col">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{t("bookCoverTitle")}</CardTitle>
                      <CardDescription>{t("currentBookCover")}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 pt-0">
                  <div className="relative w-full rounded-xl overflow-hidden aspect-3/4">
                    {book.cover_image ? (
                      <img
                        src={book.cover_image}
                        alt={book.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl bg-gray-50/50 dark:bg-gray-800/30 flex flex-col items-center justify-center gap-3 p-6">
                        <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-full">
                          <BookOpen className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                        </div>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{t("noCoverImage")}</p>
                      </div>
                    )}
                  </div>

                  <div className="rounded-lg border p-4 bg-gray-50/50 dark:bg-gray-800/50 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label className="text-sm font-medium dark:text-gray-300">{t("status")}</Label>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {book.is_active ? t("activeStatus") : t("inactiveStatus")}
                        </p>
                      </div>
                      <ActiveStatusBadge isActive={book.is_active} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Info Card */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>{t("bookInformationTitle")}</CardTitle>
                <CardDescription>{t("completeBookDetails")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Basic Info */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">{t("basicInformation")}</h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1">
                      <Label className="text-muted-foreground">{t("titleLabel")}</Label>
                      <p className="font-medium">{book.title}</p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-muted-foreground">{t("isbnLabel")}</Label>
                      <p className="font-medium">{book.isbn || "-"}</p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-muted-foreground">{t("publicationYear")}</Label>
                      <p className="font-medium">{book.publication_year || "-"}</p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-muted-foreground">{t("languageLabel")}</Label>
                      <p className="font-medium">{book.language || "-"}</p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-muted-foreground">{t("totalCopies")}</Label>
                      <p className="font-medium">{book.copies?.length || 0}</p>
                    </div>
                  </div>
                </div>

                {/* Authors */}
                {book.authors && book.authors.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                      <UserSquare className="h-5 w-5" /> {t("authorsSection")}
                    </h3>
                    <div className="flex flex-col gap-2">
                      {book.authors.map((author) => {
                        const key = `author-${author.id}`;
                        const isFollowing = followStatus[key] ?? false;
                        const isLoading = followLoadingIds.has(key);
                        return (
                          <div key={author.id} className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full overflow-hidden shrink-0">
                              <img src={author.photo} alt={author.name} className="w-full h-full object-cover" />
                            </div>
                            <span className="flex-1 text-sm font-medium">{author.name}</span>
                            {isAuthenticated && (
                              <Button
                                variant="brand"
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

                {/* Publishers */}
                {book.publishers && book.publishers.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                      <Building2 className="h-5 w-5" /> {t("publishersSection")}
                    </h3>
                    <div className="flex flex-col gap-2">
                      {book.publishers.map((publisher) => {
                        const key = `publisher-${publisher.id}`;
                        const isFollowing = followStatus[key] ?? false;
                        const isLoading = followLoadingIds.has(key);
                        return (
                          <div key={publisher.id} className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full overflow-hidden shrink-0">
                              <img src={publisher.photo} alt={publisher.name} className="w-full h-full object-cover" />
                            </div>
                            <span className="flex-1 text-sm font-medium">{publisher.name}</span>
                            {isAuthenticated && (
                              <Button
                                variant="brand"
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

                {/* Categories */}
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

                {/* Description */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">{t("descriptionSection")}</h3>
                  <p className="whitespace-pre-line text-muted-foreground leading-relaxed">
                    {book.description || t("noDescriptionAvailable")}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl">{t("availableCopiesTitle")}</CardTitle>
              <CardDescription>{t("availableCopiesDesc")}</CardDescription>
            </CardHeader>
            <CardContent>
              <BookCopyList copies={book.copies || []} />
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
