"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { Book } from "@/types/book";
import { Category } from "@/types/category";
import { Genre } from "@/types/genre";
import { Author } from "@/types/author";
import { Publisher } from "@/types/publisher";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Plus, UserSquare, Building2, Bookmark, X, Trash, Edit } from "lucide-react";
import { cn } from "@/lib/utils";
import YearPicker from "@/components/custom-ui/YearPicker";
import { StaggerContainer, FadeUp } from "@/components/custom-ui/motion";

interface FormData {
  title: string;
  author_ids: number[];
  publisher_ids: number[];
  publication_year: string;
  isbn: string;
  language: string;
  description: string;
  price?: number | string;
  is_active: boolean;
  category_ids: number[];
  genre_ids: number[];
}

interface FormErrors {
  title: boolean;
  isbn: boolean;
  language: boolean;
}

interface BookFormProps {
  book?: Book;
  isEditMode: boolean;
  formData: FormData;
  setFormData: (data: FormData) => void;
  onInputChange?: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
  onYearChange?: (year: string) => void;
  onCategoryChange?: (categoryIds: number[]) => void;
  onGenreChange?: (genreIds: number[]) => void;
  onAuthorChange?: (authorIds: number[]) => void;
  onPublisherChange?: (publisherIds: number[]) => void;
  onAddAuthor?: () => void;
  onAddPublisher?: () => void;
  genres: Genre[];
  categories: Category[];
  authors: Author[];
  publishers: Publisher[];
  onValidationChange?: (hasErrors: boolean) => void;
  onSubmit?: (e: React.FormEvent) => void;
  onCancel?: () => void;
  onEdit?: () => void;
  submitting?: boolean;
  isSubmitDisabled?: boolean;
}
export default function BookForm({
  book,
  isEditMode,
  formData,
  setFormData,
  onInputChange,
  onYearChange,
  onCategoryChange,
  onGenreChange,
  onAuthorChange,
  onPublisherChange,
  onAddAuthor,
  onAddPublisher,
  genres,
  categories,
  authors,
  publishers,
  onValidationChange,
  onSubmit,
  onCancel,
  onEdit,
  submitting = false,
  isSubmitDisabled = false,
}: BookFormProps) {
  const t = useTranslations("book");
  const [errors, setErrors] = useState<FormErrors>({
    title: false,
    isbn: false,
    language: false,
  });
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    if (onInputChange) {
      onInputChange(e);
    } else {
      setFormData({
        ...formData,
        [e.target.name]: e.target.value,
      });
    }
  };
  const handleYearChange = (year: string) => {
    if (onYearChange) {
      onYearChange(year);
    } else {
      setFormData({
        ...formData,
        publication_year: year,
      });
    }
  };
  const handleCategorySelect = (categoryId: number) => {
    const newCategoryIds = formData.category_ids.includes(categoryId)
      ? formData.category_ids.filter((id) => id !== categoryId)
      : [...formData.category_ids, categoryId];
    if (onCategoryChange) {
      onCategoryChange(newCategoryIds);
    } else {
      setFormData({
        ...formData,
        category_ids: newCategoryIds,
      });
    }
  };
  const handleAuthorSelect = (authorId: number) => {
    const newIds = formData.author_ids.includes(authorId)
      ? formData.author_ids.filter((id) => id !== authorId)
      : [...formData.author_ids, authorId];
    if (onAuthorChange) {
      onAuthorChange(newIds);
    } else {
      setFormData({ ...formData, author_ids: newIds });
    }
  };
  const handleRemoveAuthor = (authorId: number) => {
    const newIds = formData.author_ids.filter((id) => id !== authorId);
    if (onAuthorChange) {
      onAuthorChange(newIds);
    } else {
      setFormData({ ...formData, author_ids: newIds });
    }
  };
  const handlePublisherSelect = (publisherId: number) => {
    const newIds = formData.publisher_ids.includes(publisherId)
      ? formData.publisher_ids.filter((id) => id !== publisherId)
      : [...formData.publisher_ids, publisherId];
    if (onPublisherChange) {
      onPublisherChange(newIds);
    } else {
      setFormData({ ...formData, publisher_ids: newIds });
    }
  };
  const handleRemovePublisher = (publisherId: number) => {
    const newIds = formData.publisher_ids.filter((id) => id !== publisherId);
    if (onPublisherChange) {
      onPublisherChange(newIds);
    } else {
      setFormData({ ...formData, publisher_ids: newIds });
    }
  };
  const handleGenreSelect = (genreId: number) => {
    const newGenreIds = formData.genre_ids.includes(genreId)
      ? formData.genre_ids.filter((id) => id !== genreId)
      : [...formData.genre_ids, genreId];
    if (onGenreChange) {
      onGenreChange(newGenreIds);
    } else {
      setFormData({
        ...formData,
        genre_ids: newGenreIds,
      });
    }
  };
  const handleRemoveGenre = (genreId: number) => {
    const newGenreIds = formData.genre_ids.filter((id) => id !== genreId);
    if (onGenreChange) {
      onGenreChange(newGenreIds);
    } else {
      setFormData({
        ...formData,
        genre_ids: newGenreIds,
      });
    }
  };
  const handleRemoveCategory = (categoryId: number) => {
    const newCategoryIds = formData.category_ids.filter(
      (id) => id !== categoryId,
    );
    if (onCategoryChange) {
      onCategoryChange(newCategoryIds);
    } else {
      setFormData({
        ...formData,
        category_ids: newCategoryIds,
      });
    }
  };
  const handleValidationChange =
    (field: keyof FormErrors) => (isValid: boolean) => {
      if (!isEditMode) return;
      const newErrors = { ...errors, [field]: !isValid };
      setErrors(newErrors);
      const hasErrors = Object.values(newErrors).some(
        (error) => error === true,
      );
      onValidationChange?.(hasErrors);
    };
  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>{t("bookInfo")}</CardTitle>
        <CardDescription>
          {isEditMode ? t("editBookInfoCorrectly") : t("bookDetailsComplete")}
        </CardDescription>
      </CardHeader>
      <StaggerContainer as={CardContent} className="space-y-6">
        <FadeUp delay={0.1} className="space-y-4">
          <h3 className="font-semibold text-lg">{t("basicInfo")}</h3>
          <div className="space-y-2">
            <Label
              htmlFor="title"
              variant={isEditMode ? "required" : "default"}
            >
              {t("title_col")}
            </Label>
            <Input
              id="title"
              name="title"
              required={isEditMode}
              value={formData.title || ""}
              onChange={handleInputChange}
              placeholder={t("enterBookTitle")}
              disabled={!isEditMode}
              validationType={isEditMode ? "alphanumeric" : undefined}
              onValidationChange={
                isEditMode ? handleValidationChange("title") : undefined
              }
            />
          </div>
        </FadeUp>
        <FadeUp delay={0.2} className="space-y-4">
          <h3 className="font-semibold text-lg">{t("publicationDetails")}</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="isbn">{t("isbn")}</Label>
              <Input
                id="isbn"
                name="isbn"
                value={formData.isbn || ""}
                onChange={handleInputChange}
                placeholder={t("enterIsbn")}
                disabled={!isEditMode}
                validationType={isEditMode ? "alphanumeric" : undefined}
                onValidationChange={
                  isEditMode ? handleValidationChange("isbn") : undefined
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="language">{t("language")}</Label>
              <Input
                id="language"
                name="language"
                value={formData.language || ""}
                onChange={handleInputChange}
                placeholder={t("languagePlaceholder")}
                disabled={!isEditMode}
                validationType={isEditMode ? "letters-only" : undefined}
                onValidationChange={
                  isEditMode ? handleValidationChange("language") : undefined
                }
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="publication_year">{t("publicationYear")}</Label>
              <YearPicker
                value={formData.publication_year || ""}
                onChange={handleYearChange}
                placeholder={t("selectYear")}
                searchPlaceholder={t("searchYear")}
                emptyText={t("yearNotFound")}
                disabled={!isEditMode}
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="price"
                variant={isEditMode ? "required" : "default"}
              >
                {t("price")}
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">
                  Rp
                </span>
                <Input
                  id="price"
                  name="price"
                  type={isEditMode ? "number" : "text"}
                  min="0"
                  required={isEditMode}
                  value={
                    !isEditMode && formData.price
                      ? Number(formData.price).toLocaleString("id-ID")
                      : formData.price || ""
                  }
                  onChange={handleInputChange}
                  placeholder={t("enterPrice")}
                  disabled={!isEditMode}
                  className="pl-8"
                />
              </div>
            </div>
          </div>
        </FadeUp>
        <FadeUp delay={0.3} className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <UserSquare className="h-5 w-5" /> {t("authorsSection")}
            </h3>
            {isEditMode && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onAddAuthor}
                className="gap-1"
              >
                <Plus className="h-4 w-4" /> {t("addAuthorBtn")}
              </Button>
            )}
          </div>
          <div className="space-y-2">
            {isEditMode && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                    disabled={!isEditMode}
                  >
                    {formData.author_ids.length > 0
                      ? t("authorsSelected", {
                          count: formData.author_ids.length,
                        })
                      : t("selectAuthors")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="p-0"
                  style={{ width: "var(--radix-popover-trigger-width)" }}
                >
                  <Command>
                    <CommandInput placeholder={t("searchAuthors")} />
                    <CommandEmpty>{t("noAuthorsFound")}</CommandEmpty>
                    <CommandGroup>
                      {authors.map((author) => (
                        <CommandItem
                          key={author.id}
                          onSelect={() =>
                            isEditMode && handleAuthorSelect(author.id)
                          }
                          className={cn(
                            "cursor-pointer transition-colors duration-200",
                            formData.author_ids.includes(author.id)
                              ? "bg-brand-primary/10 text-brand-primary font-medium"
                              : "hover:bg-accent",
                          )}
                        >
                          <Checkbox
                            checked={formData.author_ids.includes(author.id)}
                            variant="circle"
                            className="mr-2 border-brand-primary/40"
                            disabled={!isEditMode}
                          />
                          {author.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
            )}
            {formData.author_ids.length > 0 ? (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.author_ids.map((id) => {
                  const author = authors.find((a) => a.id === id);
                  return author ? (
                    <Badge
                      key={id}
                      variant="default"
                      className="gap-1 bg-brand-primary/10 text-brand-primary border-brand-primary/20 hover:bg-brand-primary/20 transition-all duration-300"
                    >
                      {author.name}
                      {isEditMode && (
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleRemoveAuthor(id);
                          }}
                          className="h-4 w-4 p-0 ml-1 hover:bg-muted rounded-full"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      )}
                    </Badge>
                  ) : null;
                })}
              </div>
            ) : null}
          </div>
        </FadeUp>
        <FadeUp delay={0.4} className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Bookmark className="h-5 w-5" /> {t("genresSection")}
            </h3>
          </div>
          <div className="space-y-2">
            {isEditMode ? (
              <>
                <Label>{t("selectGenresLabel")}</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                      disabled={!isEditMode}
                    >
                      {formData.genre_ids && formData.genre_ids.length > 0
                        ? t("genresSelected", {
                            count: formData.genre_ids.length,
                          })
                        : t("selectGenresBtn")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="p-0"
                    style={{ width: "var(--radix-popover-trigger-width)" }}
                  >
                    <Command>
                      <CommandInput placeholder={t("searchGenresPlaceholder")} />
                      <CommandEmpty>{t("noGenresFound")}</CommandEmpty>
                      <CommandGroup>
                        {genres.map((genre) => (
                          <CommandItem
                            key={genre.id}
                            onSelect={() =>
                              isEditMode && handleGenreSelect(genre.id)
                            }
                            className={cn(
                              "cursor-pointer transition-colors duration-200",
                              formData.genre_ids.includes(genre.id)
                                ? "bg-brand-primary/10 text-brand-primary font-medium"
                                : "hover:bg-accent",
                            )}
                          >
                            <Checkbox
                              checked={formData.genre_ids.includes(genre.id)}
                              variant="circle"
                              className="mr-2 border-brand-primary/40"
                              disabled={!isEditMode}
                            />
                            {genre.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
              </>
            ) : (
              formData.genre_ids &&
              formData.genre_ids.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  {t("noGenresFound")}
                </p>
              )
            )}
            {formData.genre_ids && formData.genre_ids.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.genre_ids.map((id: number) => {
                  const genre = genres.find((g) => g.id === id);
                  return genre ? (
                    <Badge
                      key={id}
                      variant="default"
                      className="gap-1 bg-brand-primary/10 text-brand-primary border-brand-primary/20 hover:bg-brand-primary/20 transition-all duration-300"
                    >
                      {genre.name}
                      {isEditMode && (
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleRemoveGenre(id);
                          }}
                          className="h-4 w-4 p-0 ml-1 hover:bg-muted rounded-full"
                        >
                          <X className="h-3 w-3" />
                          <span className="sr-only">Remove {genre.name}</span>
                        </Button>
                      )}
                    </Badge>
                  ) : null;
                })}
              </div>
            )}
          </div>
        </FadeUp>
        <FadeUp delay={0.5} className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Building2 className="h-5 w-5" /> {t("publishersSection")}
            </h3>
            {isEditMode && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onAddPublisher}
                className="gap-1"
              >
                <Plus className="h-4 w-4" /> {t("addPublisherBtn")}
              </Button>
            )}
          </div>
          <div className="space-y-2">
            {isEditMode && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                    disabled={!isEditMode}
                  >
                    {formData.publisher_ids.length > 0
                      ? t("publishersSelected", {
                          count: formData.publisher_ids.length,
                        })
                      : t("selectPublishers")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="p-0"
                  style={{ width: "var(--radix-popover-trigger-width)" }}
                >
                  <Command>
                    <CommandInput placeholder={t("searchPublishers")} />
                    <CommandEmpty>{t("noPublishersFound")}</CommandEmpty>
                    <CommandGroup>
                      {publishers.map((publisher) => (
                        <CommandItem
                          key={publisher.id}
                          onSelect={() =>
                            isEditMode && handlePublisherSelect(publisher.id)
                          }
                          className={cn(
                            "cursor-pointer transition-colors duration-200",
                            formData.publisher_ids.includes(publisher.id)
                              ? "bg-brand-primary/10 text-brand-primary font-medium"
                              : "hover:bg-accent",
                          )}
                        >
                          <Checkbox
                            checked={formData.publisher_ids.includes(
                              publisher.id,
                            )}
                            variant="circle"
                            className="mr-2 border-brand-primary/40"
                            disabled={!isEditMode}
                          />
                          {publisher.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
            )}
            {formData.publisher_ids.length > 0 ? (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.publisher_ids.map((id) => {
                  const publisher = publishers.find((p) => p.id === id);
                  return publisher ? (
                    <Badge
                      key={id}
                      variant="default"
                      className="gap-1 bg-brand-primary/10 text-brand-primary border-brand-primary/20 hover:bg-brand-primary/20 transition-all duration-300"
                    >
                      {publisher.name}
                      {isEditMode && (
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleRemovePublisher(id);
                          }}
                          className="h-4 w-4 p-0 ml-1 hover:bg-muted rounded-full"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      )}
                    </Badge>
                  ) : null;
                })}
              </div>
            ) : null}
          </div>
        </FadeUp>
        <FadeUp delay={0.6} className="space-y-4">
          <h3 className="font-semibold text-lg">{t("categoriesSection")}</h3>
          <div className="space-y-2">
            {isEditMode ? (
              <>
                <Label>{t("selectCategoriesLabel")}</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                      disabled={!isEditMode}
                    >
                      {formData.category_ids && formData.category_ids.length > 0
                        ? t("categoriesSelected", {
                            count: formData.category_ids.length,
                          })
                        : t("selectCategoriesBtn")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="p-0"
                    style={{ width: "var(--radix-popover-trigger-width)" }}
                  >
                    <Command>
                      <CommandInput
                        placeholder={t("searchCategoriesPlaceholder")}
                      />
                      <CommandEmpty>{t("noCategoriesFound")}</CommandEmpty>
                      <CommandGroup>
                        {categories.map((cat) => (
                          <CommandItem
                            key={cat.id}
                            onSelect={() =>
                              isEditMode && handleCategorySelect(cat.id)
                            }
                            className={cn(
                              "cursor-pointer transition-colors duration-200",
                              formData.category_ids.includes(cat.id)
                                ? "bg-brand-primary/10 text-brand-primary font-medium"
                                : "hover:bg-accent",
                            )}
                          >
                            <Checkbox
                              checked={formData.category_ids.includes(cat.id)}
                              variant="circle"
                              className="mr-2 border-brand-primary/40"
                              disabled={!isEditMode}
                            />
                            {cat.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
              </>
            ) : (
              formData.category_ids &&
              formData.category_ids.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  {t("noCategoriesFound")}
                </p>
              )
            )}
            {formData.category_ids && formData.category_ids.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.category_ids.map((id: number) => {
                  const category = categories.find((c) => c.id === id);
                  return category ? (
                    <Badge
                      key={id}
                      variant="default"
                      className="gap-1 bg-brand-primary/10 text-brand-primary border-brand-primary/20 hover:bg-brand-primary/20 transition-all duration-300"
                    >
                      {category.name}
                      {isEditMode && (
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleRemoveCategory(id);
                          }}
                          className="h-4 w-4 p-0 ml-1 hover:bg-muted rounded-full"
                        >
                          <X className="h-3 w-3" />
                          <span className="sr-only">
                            Remove {category.name}
                          </span>
                        </Button>
                      )}
                    </Badge>
                  ) : null;
                })}
              </div>
            )}
          </div>
        </FadeUp>
        <FadeUp delay={0.7} className="space-y-4">
          <h3 className="font-semibold text-lg">{t("descriptionSection")}</h3>
          <div className="space-y-2">
            <Label htmlFor="description">{t("bookDescLabel")}</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description || ""}
              onChange={handleInputChange}
              placeholder={t("enterDescription")}
              rows={10}
              className="resize-y"
              disabled={!isEditMode}
            />
          </div>
        </FadeUp>

        {isEditMode ? (
          onSubmit && (
            <div className="flex justify-end gap-3 mt-6 pt-6 border-t">
              {onCancel && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  disabled={submitting}
                  className="h-8"
                >
                  <X className="h-4 w-4 mr-1" />
                  {t("cancel")}
                </Button>
              )}
              <Button 
                onClick={onSubmit} 
                variant="submit" 
                className="h-8"
                disabled={isSubmitDisabled || submitting}
                loading={submitting}
              >
                {submitting ? t("saving") : (book ? t("saveChanges") : t("addBook"))}
              </Button>
            </div>
          )
        ) : (
          onEdit && (
            <div className="flex justify-end gap-3 mt-6 pt-6 border-t">
              <Button
                type="button"
                variant="brand"
                onClick={onEdit}
                className="h-8 gap-1"
              >
                <Edit className="h-3.5 w-3.5" />
                {t("editBook")}
              </Button>
            </div>
          )
        )}
      </StaggerContainer>
    </Card>
  );
}
