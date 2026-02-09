"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { bookService } from "@/services/book.service";
import { categoryService } from "@/services/category.service";
import { Book } from "@/types/book";
import { Category } from "@/types/category";
import BookCopyList from "./BookCopyList";
import BookCoverCard from "./BookCoverCard";
import BookDetailForm from "./BookDetailForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Save, X, Edit2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

export default function BookDetailClient() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;

  const [book, setBook] = useState<Book | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [coverPreview, setCoverPreview] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchBook();
    fetchCategories();
  }, [slug]);

  const fetchCategories = async () => {
    try {
      const res = await categoryService.getAll();
      setCategories(res.data.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchBook = async () => {
    try {
      setLoading(true);
      const res = await bookService.showBySlug(slug);
      setBook(res.data.data);
      setFormData({
        title: res.data.data.title,
        author: res.data.data.author,
        publisher: res.data.data.publisher || "",
        publication_year: res.data.data.publication_year?.toString() || "",
        isbn: res.data.data.isbn || "",
        language: res.data.data.language || "",
        description: res.data.data.description || "",
        is_active: res.data.data.is_active,
        category_ids: res.data.data.categories?.map((c) => c.id) || [],
      });
      setCoverPreview(res.data.data.cover_image_url || "");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Gagal mengambil data buku");
      router.push("/admin/books");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!book) return;

    try {
      setSubmitting(true);
      const data = new FormData();

      data.append("title", formData.title.trim());
      data.append("author", formData.author.trim());
      data.append("publisher", formData.publisher.trim());
      data.append("language", formData.language.trim());
      data.append("description", formData.description.trim());
      data.append("is_active", formData.is_active ? "1" : "0");

      if (formData.isbn) {
        data.append("isbn", formData.isbn.trim());
      }

      if (formData.publication_year) {
        data.append("publication_year", formData.publication_year);
      }

      formData.category_ids.forEach((id: number) =>
        data.append("category_ids[]", String(id))
      );

      if (formData.cover_image) {
        data.append("cover_image", formData.cover_image);
      }

      await bookService.update(book.id, data);
      toast.success("Buku berhasil diupdate");
      setIsEditMode(false);
      fetchBook();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Gagal mengupdate buku");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelEdit = () => {
    if (book) {
      setFormData({
        title: book.title,
        author: book.author,
        publisher: book.publisher || "",
        publication_year: book.publication_year?.toString() || "",
        isbn: book.isbn || "",
        language: book.language || "",
        description: book.description || "",
        is_active: book.is_active,
        category_ids: book.categories?.map((c) => c.id) || [],
      });
      setCoverPreview(book.cover_image_url || "");
    }
    setIsEditMode(false);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/admin/books")}
            className="h-8 w-8"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Detail Buku</h1>
            <p className="text-muted-foreground">Memuat data buku...</p>
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/admin/books")}
            className="h-8 w-8"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Detail Buku</h1>
            <p className="text-muted-foreground">
              {isEditMode ? "Edit informasi buku" : "Lihat detail buku"}
            </p>
          </div>
        </div>
        {isEditMode ? (
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancelEdit}
              disabled={submitting}
              className="h-8"
            >
              <X className="h-3.5 w-3.5 mr-1.5" />
              Batal
            </Button>
            <Button
              type="submit"
              form="book-form"
              variant="submit"
              disabled={submitting || !formData.title || !formData.author}
              loading={submitting}
              className="h-8"
            >
              {submitting ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>
          </div>
        ) : (
          <Button
            onClick={() => setIsEditMode(true)}
            variant="brand"
            className="h-8 gap-1"
          >
            <Edit2 className="h-3.5 w-3.5" />
            Edit Buku
          </Button>
        )}
      </div>

      <form id="book-form" onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-3">
          <BookCoverCard
            book={book}
            coverPreview={coverPreview}
            isEditMode={isEditMode}
            formData={formData}
            setFormData={setFormData}
            setCoverPreview={setCoverPreview}
          />

          <BookDetailForm
            book={book}
            isEditMode={isEditMode}
            formData={formData}
            setFormData={setFormData}
            categories={categories}
          />
        </div>
      </form>

      {/* Book Copies Section */}
      {!isEditMode && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Salinan Buku</CardTitle>
          </CardHeader>
          <CardContent>
            <BookCopyList book={book} onChange={fetchBook} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
