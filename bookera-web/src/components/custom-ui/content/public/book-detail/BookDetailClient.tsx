"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { bookService } from "@/services/book.service";
import { Book } from "@/types/book";
import BookCopyList from "./BookCopyList";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, CheckCircle, XCircle, ArrowLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslations } from "next-intl";

export default function BookDetailClient() {
  const t = useTranslations('common');
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
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
          <div>
            <h1 className="text-3xl font-bold">{t('bookDetail')}</h1>
            <p className="text-muted-foreground">{t('loadingBookData')}</p>
          </div>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <Skeleton className="h-96" />
          <Skeleton className="lg:col-span-2 h-96" />
        </div>
      </div>
    );
  }
  
  if (!book) return null;

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
        <div>
          <h1 className="text-3xl font-bold">{t('bookDetail')}</h1>
          <p className="text-muted-foreground">{t('fullInfoAboutBook')}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Cover Card */}
        <Card className="flex flex-col h-full">
          <CardHeader>
            <CardTitle>{t('bookCover')}</CardTitle>
            <CardDescription>{t('currentCover')}</CardDescription>
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
                  <p className="text-sm text-muted-foreground">{t('noCoverImage')}</p>
                </div>
              )}
            </div>

            {/* Status Card */}
            <div className="rounded-lg border p-3 bg-muted/30">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="text-sm font-medium">Status</p>
                  <p className="text-xs text-muted-foreground">
                    {book.is_active ? "Aktif" : "Nonaktif"}
                  </p>
                </div>
                <Badge variant={book.is_active ? "default" : "secondary"}>
                  {book.is_active ? (
                    <>
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Aktif
                    </>
                  ) : (
                    <>
                      <XCircle className="h-3 w-3 mr-1" />
                      Tidak Aktif
                    </>
                  )}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Book Information */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Informasi Buku</CardTitle>
            <CardDescription>{t('bookDetailsComplete')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Informasi Dasar</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">Judul</p>
                  <p className="font-medium">{book.title}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Penulis</p>
                  <p className="font-medium">{book.author}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Penerbit</p>
                  <p className="font-medium">{book.publisher || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tahun Terbit</p>
                  <p className="font-medium">{book.publication_year || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">ISBN</p>
                  <p className="font-medium">{book.isbn || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Bahasa</p>
                  <p className="font-medium">{book.language || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Salinan</p>
                  <p className="font-medium">{book.copies?.length || 0}</p>
                </div>
              </div>
            </div>

            {/* Categories */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Kategori</h3>
              {book.categories && book.categories.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {book.categories.map((category) => (
                    <Badge key={category.id} variant="secondary">
                      {category.name}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">{t('noCategory')}</p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">{t('bookDescription')}</h3>
              <p className="whitespace-pre-line text-muted-foreground leading-relaxed">
                {book.description || t('noDescription')}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Book Copies Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">{t('availableBookCopies')}</CardTitle>
          <CardDescription>{t('copyListDesc')}</CardDescription>
        </CardHeader>
        <CardContent>
          <BookCopyList copies={book.copies || []} />
        </CardContent>
      </Card>
    </div>
  );
}
