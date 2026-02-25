"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { bookService } from "@/services/book.service";
import { categoryService } from "@/services/category.service";
import { Book } from "@/types/book";
import { Category } from "@/types/category";
import BookCopyList from "./BookCopyList";
import BookCoverCard from "../BookCoverCard";
import BookDetailForm from "./BookDetailForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, X, Edit } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

interface FormData {
  title: string;
  author: string;
  publisher: string;
  publication_year: string;
  isbn: string;
  language: string;
  description: string;
  is_active: boolean;
  category_ids: number[];
  cover_image?: File | null;
}

export default function BookDetailClient() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;

  const [book, setBook] = useState<Book | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    title: "",
    author: "",
    publisher: "",
    publication_year: "",
    isbn: "",
    language: "",
    description: "",
    is_active: true,
    category_ids: [],
    cover_image: null,
  });
  const [coverPreview, setCoverPreview] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [coverError, setCoverError] = useState(false);
  const [formHasErrors, setFormHasErrors] = useState(false);

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
      const bookData = res.data.data;
      setBook(bookData);
      setFormData({
        title: bookData.title,
        author: bookData.author,
        publisher: bookData.publisher || "",
        publication_year: bookData.publication_year?.toString() || "",
        isbn: bookData.isbn || "",
        language: bookData.language || "",
        description: bookData.description || "",
        is_active: bookData.is_active,
        category_ids: bookData.categories?.map((c) => c.id) || [],
        cover_image: null,
      });
      setCoverPreview(bookData.cover_image_url || "");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to load book data");
      router.push("/admin/books");
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = (): boolean => {
    const requiredFieldsFilled =
      formData.title?.trim() !== "" && formData.author?.trim() !== "";

    if (!requiredFieldsFilled) return false;

    if (coverError) return false;

    if (formHasErrors) return false;

    return true;
  };

  const isSubmitDisabled = (): boolean => {
    return submitting || !isFormValid();
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      is_active: checked,
    }));
  };

  const handleYearChange = (year: string) => {
    setFormData((prev) => ({
      ...prev,
      publication_year: year,
    }));
  };

  const handleCategoryChange = (categoryIds: number[]) => {
    setFormData((prev) => ({
      ...prev,
      category_ids: categoryIds,
    }));
  };

  const handleCoverImageChange = (file: File | null, preview: string) => {
    setFormData((prev) => ({
      ...prev,
      cover_image: file,
    }));
    setCoverPreview(preview);
    setCoverError(false);
  };

  const handleCoverValidationChange = (isValid: boolean) => {
    setCoverError(!isValid);
  };

  const handleFormValidationChange = (hasErrors: boolean) => {
    setFormHasErrors(hasErrors);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!book) return;

    if (!formData.title?.trim() || !formData.author?.trim()) {
      toast.error("Title and author are required");
      return;
    }

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
        data.append("category_ids[]", String(id)),
      );

      if (formData.cover_image) {
        data.append("cover_image", formData.cover_image);
      }

      await bookService.update(book.id, data);
      toast.success("Book updated successfully");
      setIsEditMode(false);
      fetchBook();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update book");
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
        cover_image: null,
      });
      setCoverPreview(book.cover_image_url || "");
      setCoverError(false);
      setFormHasErrors(false);
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
            <h1 className="text-3xl font-bold">Book Detail</h1>
            <p className="text-muted-foreground">Loading book data...</p>
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
            <h1 className="text-3xl font-bold">Book Detail</h1>
            <p className="text-muted-foreground">
              {isEditMode ? "Edit book information" : "View book details"}
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
              Cancel
            </Button>
            <Button
              type="submit"
              form="book-form"
              variant="submit"
              disabled={isSubmitDisabled()}
              loading={submitting}
              className="h-8"
            >
              {submitting ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        ) : (
          <Button
            onClick={() => setIsEditMode(true)}
            variant="brand"
            className="h-8 gap-1"
          >
            <Edit className="h-3.5 w-3.5" />
            Edit Book
          </Button>
        )}
      </div>

      <form id="book-form" onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-3">
          <BookCoverCard
            coverPreview={coverPreview}
            isEditMode={isEditMode}
            formData={{ is_active: formData.is_active }}
            setFormData={setFormData}
            onCoverImageChange={handleCoverImageChange}
            onSwitchChange={handleSwitchChange}
            isCoverRequired={false}
            coverError={coverError}
            onCoverValidationChange={handleCoverValidationChange}
          />

          <BookDetailForm
            book={book}
            isEditMode={isEditMode}
            formData={formData}
            setFormData={setFormData}
            onInputChange={handleInputChange}
            onYearChange={handleYearChange}
            onCategoryChange={handleCategoryChange}
            categories={categories}
            onValidationChange={handleFormValidationChange}
          />
        </div>
      </form>

      {!isEditMode && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Book Copies</CardTitle>
          </CardHeader>
          <CardContent>
            <BookCopyList book={book} onChange={fetchBook} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
