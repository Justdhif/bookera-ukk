"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

import { bookService } from "@/services/book.service";
import { categoryService } from "@/services/category.service";
import { authorService } from "@/services/author.service";
import { publisherService } from "@/services/publisher.service";
import { Book } from "@/types/book";
import { Category } from "@/types/category";
import { Author } from "@/types/author";
import { Publisher } from "@/types/publisher";
import BookCopyList from "./BookCopyList";
import BookSideCard from "../BookSideCard";
import BookForm from "../BookForm";
import AuthorFormDialog from "@/components/custom-ui/content/admin/author/author-add/AuthorFormDialog";
import PublisherFormDialog from "@/components/custom-ui/content/admin/publisher/publisher-add/PublisherFormDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, X, Edit } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

interface FormData {
  title: string;
  author_ids: number[];
  publisher_ids: number[];
  publication_year: string;
  isbn: string;
  language: string;
  description: string;
  is_active: boolean;
  category_ids: number[];
  cover_image?: File | null;
}

export default function BookDetailClient() {
    const t = useTranslations("book");
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;

  const [book, setBook] = useState<Book | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [publishers, setPublishers] = useState<Publisher[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [authorDialogOpen, setAuthorDialogOpen] = useState(false);
  const [publisherDialogOpen, setPublisherDialogOpen] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    title: "",
    author_ids: [],
    publisher_ids: [],
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
    fetchAuthors();
    fetchPublishers();
  }, [slug]);

  const fetchCategories = async () => {
    try {
      const res = await categoryService.getAll();
      setCategories(res.data.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchAuthors = async () => {
    try {
      const res = await authorService.getAll();
      setAuthors(res.data.data);
    } catch (error) {
      console.error("Error fetching authors:", error);
    }
  };

  const fetchPublishers = async () => {
    try {
      const res = await publisherService.getAll();
      setPublishers(res.data.data);
    } catch (error) {
      console.error("Error fetching publishers:", error);
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
        author_ids: bookData.authors?.map((a: Author) => a.id) || [],
        publisher_ids: bookData.publishers?.map((p: Publisher) => p.id) || [],
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
    if (!formData.title?.trim()) return false;
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
    setFormData((prev) => ({ ...prev, category_ids: categoryIds }));
  };

  const handleAuthorChange = (authorIds: number[]) => {
    setFormData((prev) => ({ ...prev, author_ids: authorIds }));
  };

  const handlePublisherChange = (publisherIds: number[]) => {
    setFormData((prev) => ({ ...prev, publisher_ids: publisherIds }));
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

    if (!formData.title?.trim()) {
      toast.error("Title is required");
      return;
    }

    try {
      setSubmitting(true);

      await bookService.update(book.id, formData);
      toast.success(t("updateSuccess"));
      setIsEditMode(false);
      fetchBook();
    } catch (error: any) {
      toast.error(error.response?.data?.message || t("updateError"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelEdit = () => {
    if (book) {
      setFormData({
        title: book.title,
        author_ids: book.authors?.map((a) => a.id) || [],
        publisher_ids: book.publishers?.map((p) => p.id) || [],
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => router.back()}
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
              {submitting ? t("saving") : t("saveChanges")}
            </Button>
          </div>
        ) : (
          <Button
            onClick={() => setIsEditMode(true)}
            variant="brand"
            className="h-8 gap-1"
            disabled={loading}
          >
            <Edit className="h-3.5 w-3.5" />
            {t("editBook")}
          </Button>
        )}
      </div>

      {loading ? (
        <div className="grid gap-6 lg:grid-cols-3">
          <Skeleton className="h-96" />
          <Skeleton className="lg:col-span-2 h-96" />
        </div>
      ) : book && (
        <>
          <form id="book-form" onSubmit={handleSubmit}>
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:self-start lg:sticky lg:top-4">
                <BookSideCard
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
              </div>

              <BookForm
                book={book}
                isEditMode={isEditMode}
                formData={formData}
                setFormData={setFormData}
                onInputChange={handleInputChange}
                onYearChange={handleYearChange}
                onCategoryChange={handleCategoryChange}
                onAuthorChange={handleAuthorChange}
                onPublisherChange={handlePublisherChange}
                onAddAuthor={() => setAuthorDialogOpen(true)}
                onAddPublisher={() => setPublisherDialogOpen(true)}
                categories={categories}
                authors={authors}
                publishers={publishers}
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
        </>
      )}

      <AuthorFormDialog
        open={authorDialogOpen}
        setOpen={setAuthorDialogOpen}
        onSuccess={() => fetchAuthors()}
      />
      <PublisherFormDialog
        open={publisherDialogOpen}
        setOpen={setPublisherDialogOpen}
        onSuccess={() => fetchPublishers()}
      />
    </div>
  );
}
