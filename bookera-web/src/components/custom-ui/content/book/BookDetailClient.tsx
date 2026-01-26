"use client";

import { useEffect, useState } from "react";
import { bookService } from "@/services/book.service";
import { Book } from "@/types/book";
import { BookFormDialog } from "./BookFormDialog";
import BookCopyList from "./BookCopyList";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  CalendarDays,
  User,
  Building,
  Globe,
  BookOpen,
  Hash,
  CheckCircle,
  XCircle,
  Image as ImageIcon,
} from "lucide-react";
import { format } from "date-fns";
import { id as indonesianLocale } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";

export default function BookDetailClient({ id }: { id: number }) {
  const [book, setBook] = useState<Book | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchBook = async () => {
    try {
      setLoading(true);
      const res = await bookService.show(id);
      setBook(res.data.data);
    } catch (error) {
      console.error("Error fetching book details:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!id || isNaN(id)) return;
    fetchBook();
  }, [id]);

  if (loading) {
    return <BookDetailSkeleton />;
  }

  if (!book) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <BookOpen className="h-16 w-16 text-muted-foreground" />
        <p className="text-lg text-muted-foreground">Buku tidak ditemukan</p>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd MMMM yyyy HH:mm", { locale: indonesianLocale });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{book.title}</h1>
          <div className="flex items-center gap-2 mt-2">
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
            <Badge variant="outline" className="text-xs">
              {book.slug}
            </Badge>
          </div>
        </div>
        <Button onClick={() => setOpen(true)} className="gap-2">
          Edit Buku
        </Button>
      </div>

      <BookFormDialog
        open={open}
        setOpen={setOpen}
        book={book}
        onSuccess={fetchBook}
      />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Book Cover & Basic Info */}
        <div className="lg:col-span-1 space-y-6">
          {/* Book Cover */}
          <Card className="overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                Sampul Buku
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-[3/4] relative overflow-hidden rounded-lg border bg-muted">
                {book.cover_image_url ? (
                  <img
                    src={book.cover_image_url}
                    alt={`Sampul ${book.title}`}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <BookOpen className="h-16 w-16 text-muted-foreground" />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informasi Dasar</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Hash className="h-4 w-4" />
                  <span>ID Buku</span>
                </div>
                <p className="font-medium">{book.id}</p>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Hash className="h-4 w-4" />
                  <span>ISBN</span>
                </div>
                <p className="font-medium">{book.isbn || "-"}</p>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CalendarDays className="h-4 w-4" />
                  <span>Tahun Terbit</span>
                </div>
                <p className="font-medium">{book.publication_year}</p>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Globe className="h-4 w-4" />
                  <span>Bahasa</span>
                </div>
                <p className="font-medium capitalize">{book.language}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Detailed Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Author & Publisher */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Penulis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-medium">{book.author}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Penerbit
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-medium">{book.publisher}</p>
              </CardContent>
            </Card>
          </div>

          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Deskripsi</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none">
                <p className="whitespace-pre-line text-muted-foreground leading-relaxed">
                  {book.description || "Tidak ada deskripsi tersedia"}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Categories */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Kategori</CardTitle>
            </CardHeader>
            <CardContent>
              {book.categories && book.categories.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {book.categories.map((category) => (
                    <Badge key={category.id} variant="secondary">
                      {category.name}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">Tidak ada kategori</p>
              )}
            </CardContent>
          </Card>

          {/* Metadata */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Metadata</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Dibuat Pada</p>
                  <p className="font-medium">{formatDate(book.created_at)}</p>
                </div>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground">
                    Diperbarui Pada
                  </p>
                  <p className="font-medium">{formatDate(book.updated_at)}</p>
                </div>
              </CardContent>
            </Card>

            {/* Statistics */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Statistik</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Total Salinan</span>
                  <span className="text-2xl font-bold">
                    {book.copies?.length || 0}
                  </span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Kategori</span>
                  <span className="text-2xl font-bold">
                    {book.categories?.length || 0}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Book Copies Section */}
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Salinan Buku</CardTitle>
          </CardHeader>
          <CardContent>
            <BookCopyList book={book} onChange={fetchBook} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Skeleton Loader Component
function BookDetailSkeleton() {
  return (
    <div className="space-y-8">
      {/* Header Skeleton */}
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-6 w-32" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      {/* Main Content Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column Skeleton */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="aspect-[3/4] w-full rounded-lg" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-40" />
            </CardHeader>
            <CardContent className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-5 w-full" />
                  {i < 4 && <Separator />}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right Column Skeleton */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2].map((i) => (
              <Card key={i}>
                <CardHeader className="pb-3">
                  <Skeleton className="h-6 w-24" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-7 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-24" />
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-6 w-16 rounded-full" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
