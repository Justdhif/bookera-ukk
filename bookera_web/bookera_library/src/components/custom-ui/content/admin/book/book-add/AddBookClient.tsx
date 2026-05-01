"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import ContentHeader from "@/components/custom-ui/content/ContentHeader";
import { useState, useEffect } from "react";
import { bookService } from "@/services/book.service";
import { CreateBookData } from "@/types/book";
import { categoryService } from "@/services/category.service";
import { genreService } from "@/services/genre.service";
import { authorService } from "@/services/author.service";
import { publisherService } from "@/services/publisher.service";
import { Category } from "@/types/category";
import { Genre } from "@/types/genre";
import { Author } from "@/types/author";
import { Publisher } from "@/types/publisher";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import BookSideCard from "../BookSideCard";
import BookForm from "../BookForm";
import AuthorFormDialog from "@/components/custom-ui/content/admin/author/AuthorFormDialog";
import PublisherFormDialog from "@/components/custom-ui/content/admin/publisher/PublisherFormDialog";
import { StaggerContainer, FadeUp } from "@/components/custom-ui/motion";

export default function AddBookClient() {
  const t = useTranslations("book");
  const router = useRouter();
  const [formData, setFormData] = useState<CreateBookData>({
    title: "",
    author_ids: [],
    publisher_ids: [],
    publication_year: "",
    isbn: "",
    language: "",
    description: "",
    price: "",
    is_active: true,
    category_ids: [],
    genre_ids: [],
    cover_image: null,
  });
  const [coverError, setCoverError] = useState(false);
  const [formHasErrors, setFormHasErrors] = useState(false);
  const [coverPreview, setCoverPreview] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [publishers, setPublishers] = useState<Publisher[]>([]);
  const [authorDialogOpen, setAuthorDialogOpen] = useState(false);
  const [publisherDialogOpen, setPublisherDialogOpen] = useState(false);

  useEffect(() => {
    fetchCategories();
    fetchGenres();
    fetchAuthors();
    fetchPublishers();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await categoryService.getAll();
      setCategories(res.data.data.data || []);
    } catch {
      toast.error("Failed to load categories");
    }
  };

  const fetchGenres = async () => {
    try {
      const res = await genreService.getAll();
      setGenres(res.data.data.data || []);
    } catch {
      toast.error("Failed to load genres");
    }
  };

  const fetchAuthors = async () => {
    try {
      const res = await authorService.getAll({
        per_page: "all",
      });
      setAuthors(res.data.data.data || []);
    } catch {
      toast.error("Failed to load authors");
    }
  };

  const fetchPublishers = async () => {
    try {
      const res = await publisherService.getAll({
        per_page: "all",
      });
      setPublishers(res.data.data.data || []);
    } catch {
      toast.error("Failed to load publishers");
    }
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, is_active: checked }));
  };

  const handleCoverImageChange = (file: File | null, preview: string) => {
    setFormData((prev) => ({ ...prev, cover_image: file }));
    setCoverPreview(preview);
    if (file) {
      setCoverError(false);
    }
  };

  const handleCoverValidationChange = (isValid: boolean) => {
    setCoverError(!isValid);
  };

  const isFormValid = (): boolean => {
    if (!formData.title.trim()) return false;
    if (coverError || formHasErrors) return false;
    return true;
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (coverError || formHasErrors) {
      toast.error("Please fix all validation errors before submitting");
      return;
    }
    try {
      setSubmitting(true);
      await bookService.create(formData);
      toast.success("Book added successfully");
      router.push("/admin/books");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to add book");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <StaggerContainer className="space-y-6">
      <FadeUp>
        <ContentHeader
          title={t("addBook")}
          description={t("addBookDesc")}
          showBackButton
          isAdmin
        />
      </FadeUp>
      <div>
        <div className="grid gap-6 lg:grid-cols-3">
          <FadeUp delay={0.1} className="lg:self-start lg:sticky lg:top-4">
            <BookSideCard
              coverPreview={coverPreview}
              formData={{ is_active: formData.is_active }}
              onCoverImageChange={handleCoverImageChange}
              setFormData={setFormData}
              onSwitchChange={handleSwitchChange}
              isCoverRequired={false}
              coverError={coverError}
              onCoverValidationChange={handleCoverValidationChange}
            />
          </FadeUp>
          <FadeUp delay={0.2} className="lg:col-span-2">
            <BookForm
              isEditMode={true}
              formData={formData}
              setFormData={setFormData}
              genres={genres}
              categories={categories}
              authors={authors}
              publishers={publishers}
              onAddAuthor={() => setAuthorDialogOpen(true)}
              onAddPublisher={() => setPublisherDialogOpen(true)}
              onValidationChange={setFormHasErrors}
              onSubmit={handleSubmit}
              submitting={submitting}
              isSubmitDisabled={!isFormValid()}
            />
          </FadeUp>
        </div>
      </div>
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
    </StaggerContainer>
  );
}
