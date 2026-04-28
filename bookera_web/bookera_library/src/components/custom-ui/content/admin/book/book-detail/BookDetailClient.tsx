"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { usePathnameCondition } from "@/hooks/usePathnameCondition";
import { bookService } from "@/services/book.service";
import { publicService } from "@/services/public.service";
import { categoryService } from "@/services/category.service";
import { genreService } from "@/services/genre.service";
import { authorService } from "@/services/author.service";
import { publisherService } from "@/services/publisher.service";
import { Book, CreateBookData } from "@/types/book";
import { Category } from "@/types/category";
import { Genre } from "@/types/genre";
import { Author } from "@/types/author";
import { Publisher } from "@/types/publisher";
import BookCopyList from "./BookCopyList";
import BookSideCard from "../BookSideCard";
import BookForm from "../BookForm";
import AuthorFormDialog from "@/components/custom-ui/content/admin/author/AuthorFormDialog";
import PublisherFormDialog from "@/components/custom-ui/content/admin/publisher/PublisherFormDialog";
import FavoriteButton from "@/components/custom-ui/content/public/book-detail/FavoriteButton";
import AddToRequestButton from "@/components/custom-ui/content/public/book-detail/AddToRequestButton";
import BookReviewSection from "@/components/custom-ui/content/public/book-detail/BookReviewSection";
import BookCopyStatusBadge from "@/components/custom-ui/badge/BookCopyStatusBadge";
import ActiveStatusBadge from "@/components/custom-ui/badge/ActiveStatusBadge";
import ContentHeader from "@/components/custom-ui/content/ContentHeader";
import PublicBookGrid from "@/components/custom-ui/content/public/PublicBookGrid";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import DataLoading from "@/components/custom-ui/DataLoading";
import { toast } from "sonner";
import {
  BookOpen,
  ArrowLeft,
  UserSquare,
  Building2,
  Star,
  X,
  Edit,
} from "lucide-react";

export default function BookDetailClient() {
  const tAdmin = useTranslations("book");
  const tPublic = useTranslations("public");

  const { isAdmin } = usePathnameCondition();
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;

  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);

  const [categories, setCategories] = useState<Category[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [publishers, setPublishers] = useState<Publisher[]>([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [authorDialogOpen, setAuthorDialogOpen] = useState(false);
  const [publisherDialogOpen, setPublisherDialogOpen] = useState(false);
  const [formData, setFormData] = useState<CreateBookData>({
    title: "",
    author_ids: [],
    publisher_ids: [],
    publication_year: "",
    isbn: "",
    language: "",
    description: "",
    is_active: true,
    category_ids: [],
    genre_ids: [],
    cover_image: null,
  });
  const [coverPreview, setCoverPreview] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [coverError, setCoverError] = useState(false);
  const [formHasErrors, setFormHasErrors] = useState(false);
  const relatedGenreIds = useMemo(
    () => book?.genres?.map((genre) => genre.id) ?? [],
    [book?.genres],
  );

  useEffect(() => {
    if (!slug) return;
    fetchBook();
    if (isAdmin) {
      fetchCategories();
      fetchGenres();
      fetchAuthors();
      fetchPublishers();
    }
  }, [slug, isAdmin]);

  const fetchCategories = async () => {
    try {
      const res = await categoryService.getAll();
      setCategories(res.data.data.data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchGenres = async () => {
    try {
      const res = await genreService.getAll();
      setGenres(res.data.data.data || []);
    } catch (error) {
      console.error("Error fetching genres:", error);
    }
  };

  const fetchAuthors = async () => {
    try {
      const res = await authorService.getAll({
        per_page: "all",
      });
      setAuthors(res.data.data.data || []);
    } catch (error) {
      console.error("Error fetching authors:", error);
    }
  };

  const fetchPublishers = async () => {
    try {
      const res = await publisherService.getAll({
        per_page: "all",
      });
      setPublishers(res.data.data.data || []);
    } catch (error) {
      console.error("Error fetching publishers:", error);
    }
  };

  const fetchBook = async () => {
    try {
      setLoading(true);
      const res = isAdmin 
        ? await bookService.getBySlug(slug)
        : await publicService.getBookBySlug(slug);
      const bookData = res.data.data;
      setBook(bookData);

      if (isAdmin) {
        setFormData({
          title: bookData.title,
          author_ids: bookData.authors?.map((a: Author) => a.id) || [],
          publisher_ids: bookData.publishers?.map((p: Publisher) => p.id) || [],
          publication_year: bookData.publication_year?.toString() || "",
          isbn: bookData.isbn || "",
          language: bookData.language || "",
          description: bookData.description || "",
          price: bookData.price || "",
          is_active: bookData.is_active,
          category_ids: bookData.categories?.map((c: Category) => c.id) || [],
          genre_ids: bookData.genres?.map((g: Genre) => g.id) || [],
          cover_image: null,
        });
        setCoverPreview(bookData.cover_image || "");
      }
    } catch (error: any) {
      if (isAdmin) {
        toast.error(
          error.response?.data?.message || "Failed to load book data",
        );
        router.push("/admin/books");
      } else {
        console.error("Error fetching book details:", error);
      }
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
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, is_active: checked }));
  };

  const handleYearChange = (year: string) => {
    setFormData((prev) => ({ ...prev, publication_year: year }));
  };

  const handleCategoryChange = (categoryIds: number[]) => {
    setFormData((prev) => ({ ...prev, category_ids: categoryIds }));
  };

  const handleGenreChange = (genreIds: number[]) => {
    setFormData((prev) => ({ ...prev, genre_ids: genreIds }));
  };

  const handleAuthorChange = (authorIds: number[]) => {
    setFormData((prev) => ({ ...prev, author_ids: authorIds }));
  };

  const handlePublisherChange = (publisherIds: number[]) => {
    setFormData((prev) => ({ ...prev, publisher_ids: publisherIds }));
  };

  const handleCoverImageChange = (file: File | null, preview: string) => {
    setFormData((prev) => ({ ...prev, cover_image: file }));
    setCoverPreview(preview);
    setCoverError(false);
  };

  const handleCoverValidationChange = (isValid: boolean) => {
    setCoverError(!isValid);
  };

  const handleFormValidationChange = (hasErrors: boolean) => {
    setFormHasErrors(hasErrors);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!book) return;
    if (!formData.title?.trim()) {
      toast.error("Title is required");
      return;
    }
    try {
      setSubmitting(true);
      await bookService.update(book.id, formData);
      toast.success(tAdmin("updateSuccess"));
      setIsEditMode(false);
      fetchBook();
    } catch (error: any) {
      toast.error(error.response?.data?.message || tAdmin("updateError"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelEdit = () => {
    if (book) {
      setFormData({
        title: book.title,
        author_ids: book.authors?.map((a: Author) => a.id) || [],
        publisher_ids: book.publishers?.map((p: Publisher) => p.id) || [],
        publication_year: book.publication_year?.toString() || "",
        isbn: book.isbn || "",
        language: book.language || "",
        description: book.description || "",
        price: book.price || "",
        is_active: book.is_active,
        category_ids: book.categories?.map((c: Category) => c.id) || [],
        genre_ids: book.genres?.map((g: Genre) => g.id) || [],
        cover_image: null,
      });
      setCoverPreview(book.cover_image || "");
      setCoverError(false);
      setFormHasErrors(false);
    }
    setIsEditMode(false);
  };

  return (
    <div className="space-y-6">
      <ContentHeader
        title={isAdmin ? tAdmin("bookDetail") : tPublic("bookDetailTitle")}
        description={
          isAdmin
            ? isEditMode
              ? tAdmin("editBookInfo")
              : tAdmin("viewBookDetails")
            : tPublic("completeBookDesc")
        }
        showBackButton
        isAdmin={isAdmin}
        rightActions={
          isAdmin ? null : (
            book && (
              <div className="flex flex-wrap items-center gap-3">
                <FavoriteButton bookId={book.id} />
                <AddToRequestButton book={book} />
              </div>
            )
          )
        }
      />


      {loading ? (
        <div className="grid gap-6 lg:grid-cols-3">
          <DataLoading className="lg:col-span-1" size="lg" />
          <DataLoading className="lg:col-span-2" size="lg" />
        </div>
      ) : (
        book &&
        (isAdmin ? (
          <>
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
                onGenreChange={handleGenreChange}
                onAuthorChange={handleAuthorChange}
                onPublisherChange={handlePublisherChange}
                onAddAuthor={() => setAuthorDialogOpen(true)}
                onAddPublisher={() => setPublisherDialogOpen(true)}
                genres={genres}
                categories={categories}
                authors={authors}
                publishers={publishers}
                onValidationChange={handleFormValidationChange}
                onSubmit={handleSubmit}
                onCancel={handleCancelEdit}
                onEdit={() => setIsEditMode(true)}
                submitting={submitting}
                isSubmitDisabled={isSubmitDisabled()}
              />
            </div>
            {!isEditMode && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">
                    {tAdmin("bookCopies")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <BookCopyList book={book} onChange={fetchBook} />
                </CardContent>
              </Card>
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
          </>
        ) : (
          <>
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-1 lg:self-start lg:sticky lg:top-4">
                <Card className="flex flex-col">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">
                          {tPublic("bookCoverTitle")}
                        </CardTitle>
                        <CardDescription>
                          {tPublic("currentBookCover")}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-0">
                    <div className="relative w-full rounded-xl overflow-hidden aspect-3/4">
                      {book.cover_image ? (
                        <Image
                          src={book.cover_image}
                          alt={book.title}
                          className="w-full h-full object-cover"
                          width={300}
                          height={400}
                          unoptimized
                        />
                      ) : (
                        <div className="w-full h-full border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl bg-gray-50/50 dark:bg-gray-800/30 flex flex-col items-center justify-center gap-3 p-6">
                          <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-full">
                            <BookOpen className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                          </div>
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {tPublic("noCoverImage")}
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="rounded-lg border p-4 bg-gray-50/50 dark:bg-gray-800/50 dark:border-gray-700 mt-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label className="text-sm font-medium dark:text-gray-300">
                            {tPublic("status")}
                          </Label>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {book.is_active
                              ? tPublic("activeStatus")
                              : tPublic("inactiveStatus")}
                          </p>
                        </div>
                        <ActiveStatusBadge isActive={book.is_active} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="lg:col-span-2 flex flex-col gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>{tPublic("bookInformationTitle")}</CardTitle>
                    <CardDescription>
                      {tPublic("completeBookDetails")}
                    </CardDescription>
                    {book.average_rating !== undefined && (
                      <div
                        className="flex items-center gap-1.5 mt-2 bg-yellow-50 dark:bg-yellow-900/20 px-3 py-1.5 rounded-full w-fit"
                      >
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold text-sm">
                          {Number(book.average_rating).toFixed(1)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          ({book.reviews_count || 0} {tPublic("reviewsTotal")})
                        </span>
                      </div>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="font-semibold text-lg">
                        {tPublic("basicInformation")}
                      </h3>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-1">
                          <Label className="text-muted-foreground">
                            {tPublic("titleLabel")}
                          </Label>
                          <p className="font-medium">{book.title}</p>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-muted-foreground">
                            {tPublic("isbnLabel")}
                          </Label>
                          <p className="font-medium">{book.isbn || "-"}</p>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-muted-foreground">
                            {tPublic("publicationYear")}
                          </Label>
                          <p className="font-medium">
                            {book.publication_year || "-"}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-muted-foreground">
                            {tPublic("languageLabel")}
                          </Label>
                          <p className="font-medium">{book.language || "-"}</p>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-muted-foreground">
                            {tPublic("genresSection")}
                          </Label>
                          <p className="font-medium">
                            {book.genres?.map((g) => g.name).join(", ") || "-"}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-muted-foreground">
                            {tPublic("categoriesSection")}
                          </Label>
                          <p className="font-medium">
                            {book.categories?.map((c) => c.name).join(", ") || "-"}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-muted-foreground">
                            {tPublic("available")}
                          </Label>
                          <p className="font-medium">
                            {book.copies?.length || 0}
                          </p>
                        </div>
                      </div>
                    </div>

                    {book.authors && book.authors.length > 0 && (
                      <div className="space-y-4">
                        <h3 className="font-semibold text-lg flex items-center gap-2">
                          <UserSquare className="h-5 w-5" />{" "}
                          {tPublic("authorsSection")}
                        </h3>
                        <div className="flex flex-col gap-2">
                          {book.authors.map((author) => (
                            <Link
                              key={author.id}
                              href={`/authors/${author.slug}`}
                              className="flex items-center gap-3 w-fit hover:bg-muted/50 p-1.5 -m-1.5 rounded-lg transition-colors group"
                            >
                              <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 border border-border group-hover:border-brand-primary transition-colors">
                                <Image
                                  src={author.photo}
                                  alt={author.name}
                                  className="w-full h-full object-cover"
                                  width={300}
                                  height={400}
                                  unoptimized
                                />
                              </div>
                              <span className="text-sm font-medium group-hover:text-brand-primary transition-colors underline-offset-4 group-hover:underline">
                                {author.name}
                              </span>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}

                    {book.publishers && book.publishers.length > 0 && (
                      <div className="space-y-4">
                        <h3 className="font-semibold text-lg flex items-center gap-2">
                          <Building2 className="h-5 w-5" />
                          {tPublic("publishersSection")}
                        </h3>
                        <div className="flex flex-col gap-2">
                          {book.publishers.map((publisher) => (
                            <Link
                              key={publisher.id}
                              href={`/publishers/${publisher.slug}`}
                              className="flex items-center gap-3 w-fit hover:bg-muted/50 p-1.5 -m-1.5 rounded-lg transition-colors group"
                            >
                              <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 border border-border group-hover:border-brand-primary transition-colors">
                                <Image
                                  src={publisher.photo}
                                  alt={publisher.name}
                                  className="w-full h-full object-cover"
                                  width={300}
                                  height={400}
                                  unoptimized
                                />
                              </div>
                              <span className="text-sm font-medium group-hover:text-brand-primary transition-colors underline-offset-4 group-hover:underline">
                                {publisher.name}
                              </span>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="space-y-4">
                      <h3 className="font-semibold text-lg">
                        {tPublic("categoriesSection")}
                      </h3>
                      {book.categories && book.categories.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {book.categories.map((category) => (
                            <Badge key={category.id} variant="default">
                              {category.name}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted-foreground">
                          {tPublic("noCategoryPublic")}
                        </p>
                      )}
                    </div>

                    <div className="space-y-4">
                      <h3 className="font-semibold text-lg">
                        {tPublic("genresSection")}
                      </h3>
                      {book.genres && book.genres.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {book.genres.map((genre) => (
                            <Badge key={genre.id} variant="secondary">
                              {genre.name}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted-foreground">
                          {tPublic("noGenrePublic")}
                        </p>
                      )}
                    </div>

                    <div className="space-y-4">
                      <h3 className="font-semibold text-lg">
                        {tPublic("descriptionSection")}
                      </h3>
                      <p className="whitespace-pre-line text-muted-foreground leading-relaxed">
                        {book.description || tPublic("noDescriptionAvailable")}
                      </p>
                    </div>

                    <div className="space-y-4 pt-4 border-t">
                      <h3 className="font-semibold text-lg">
                        {tPublic("availableCopiesTitle")}
                      </h3>
                      {book.copies && book.copies.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {book.copies.map((copy) => (
                            <div
                              key={copy.id}
                              className="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-background border text-sm hover:shadow-sm transition-shadow"
                            >
                              <span className="font-medium text-xs">
                                #{copy.copy_code}
                              </span>
                              <BookCopyStatusBadge status={copy.status} />
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-8 text-muted-foreground text-sm border-2 border-dashed rounded-xl">
                          <BookOpen className="h-6 w-6 mb-2 opacity-30" />
                          <p>{tPublic("noCopies") || "No copies"}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl">
                  {tPublic("reviewsTitle")}
                </CardTitle>
                <CardDescription>{tPublic("reviewsDesc")}</CardDescription>
              </CardHeader>
              <CardContent>
                <BookReviewSection book={book} onReviewSubmit={fetchBook} />
              </CardContent>
            </Card>

            <div className="pt-6 border-t">
              <div className="mb-6">
                <h2 className="text-2xl font-bold tracking-tight">
                  {tPublic("exploreOtherBooks") || "Explore Other Books"}
                </h2>
                <p className="text-muted-foreground">
                  {tPublic("exploreOtherBooksDesc") || "Discover more books from our collection"}
                </p>
              </div>
              <PublicBookGrid
                showBorrowActions={false}
                genreIds={relatedGenreIds.length > 0 ? relatedGenreIds : undefined}
              />
            </div>
          </>
        ))
      )}
    </div>
  );
}
