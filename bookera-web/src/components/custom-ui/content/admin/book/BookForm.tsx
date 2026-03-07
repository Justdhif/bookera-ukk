"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { Book } from "@/types/book";
import { Category } from "@/types/category";
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
import { Plus, UserSquare, Building2, X } from "lucide-react";
import YearPicker from "@/components/custom-ui/YearPicker";

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
  onAuthorChange?: (authorIds: number[]) => void;
  onPublisherChange?: (publisherIds: number[]) => void;
  onAddAuthor?: () => void;
  onAddPublisher?: () => void;
  categories: Category[];
  authors: Author[];
  publishers: Publisher[];
  onValidationChange?: (hasErrors: boolean) => void;
}

export default function BookForm({
  book,
  isEditMode,
  formData,
  setFormData,
  onInputChange,
  onYearChange,
  onCategoryChange,
  onAuthorChange,
  onPublisherChange,
  onAddAuthor,
  onAddPublisher,
  categories,
  authors,
  publishers,
  onValidationChange,
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
        <CardTitle>Book Information</CardTitle>
        <CardDescription>
          {isEditMode
            ? "Edit book information correctly"
            : t("bookDetailsComplete")}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Basic Information</h3>
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
        </div>

        {/* Authors Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <UserSquare className="h-5 w-5" /> Authors
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
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                  disabled={!isEditMode}
                >
                  {formData.author_ids.length > 0
                    ? `${formData.author_ids.length} author(s) selected`
                    : "Select authors"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="p-0" style={{ width: 'var(--radix-popover-trigger-width)' }}>
                <Command>
                  <CommandInput placeholder={t("searchAuthors")} />
                  <CommandEmpty>{t("noAuthorsFound")}</CommandEmpty>
                  <CommandGroup>
                    {authors.map((author) => (
                      <CommandItem
                        key={author.id}
                        onSelect={() => isEditMode && handleAuthorSelect(author.id)}
                        className="cursor-pointer"
                      >
                        <Checkbox
                          checked={formData.author_ids.includes(author.id)}
                          className="mr-2"
                          disabled={!isEditMode}
                        />
                        {author.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
            {formData.author_ids.length > 0 ? (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.author_ids.map((id) => {
                  const author = authors.find((a) => a.id === id);
                  return author ? (
                    <Badge key={id} variant="secondary" className="gap-1">
                      {author.name}
                      {isEditMode && (
                        <Button
                          type="button"
                          variant="ghost"
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
        </div>

        {/* Publishers Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Building2 className="h-5 w-5" /> Publishers
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
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                  disabled={!isEditMode}
                >
                  {formData.publisher_ids.length > 0
                    ? `${formData.publisher_ids.length} publisher(s) selected`
                    : "Select publishers"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="p-0" style={{ width: 'var(--radix-popover-trigger-width)' }}>
                <Command>
                  <CommandInput placeholder={t("searchPublishers")} />
                  <CommandEmpty>{t("noPublishersFound")}</CommandEmpty>
                  <CommandGroup>
                    {publishers.map((publisher) => (
                      <CommandItem
                        key={publisher.id}
                        onSelect={() => isEditMode && handlePublisherSelect(publisher.id)}
                        className="cursor-pointer"
                      >
                        <Checkbox
                          checked={formData.publisher_ids.includes(
                            publisher.id,
                          )}
                          className="mr-2"
                          disabled={!isEditMode}
                        />
                        {publisher.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
            {formData.publisher_ids.length > 0 ? (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.publisher_ids.map((id) => {
                  const publisher = publishers.find((p) => p.id === id);
                  return publisher ? (
                    <Badge key={id} variant="secondary" className="gap-1">
                      {publisher.name}
                      {isEditMode && (
                        <Button
                          type="button"
                          variant="ghost"
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
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Publication Details</h3>
          <div className="space-y-2">
            <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="publication_year">Publication Year</Label>
              <YearPicker
                value={formData.publication_year || ""}
                onChange={handleYearChange}
                placeholder={t("selectYear")}
                searchPlaceholder={t("searchYear")}
                emptyText="Year not found"
                disabled={!isEditMode}
              />
            </div>
            </div>
          </div>

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
              <Label htmlFor="language">Language</Label>
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
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Categories</h3>
          <div className="space-y-2">
            <Label>Select Categories</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                  disabled={!isEditMode}
                >
                  {formData.category_ids && formData.category_ids.length > 0
                    ? `${formData.category_ids.length} categories selected`
                    : "Select categories"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="p-0" style={{ width: 'var(--radix-popover-trigger-width)' }}>
                <Command>
                  <CommandInput placeholder={t("searchCategoriesPlaceholder")} />
                  <CommandEmpty>{t("noCategoriesFound")}</CommandEmpty>
                  <CommandGroup>
                    {categories.map((cat) => (
                      <CommandItem
                        key={cat.id}
                        onSelect={() =>
                          isEditMode && handleCategorySelect(cat.id)
                        }
                        className="cursor-pointer"
                      >
                        <Checkbox
                          checked={formData.category_ids.includes(cat.id)}
                          className="mr-2"
                          disabled={!isEditMode}
                        />
                        {cat.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>

            {formData.category_ids && formData.category_ids.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.category_ids.map((id: number) => {
                  const category = categories.find((c) => c.id === id);
                  return category ? (
                    <Badge key={id} variant="secondary" className="gap-1">
                      {category.name}
                      {isEditMode && (
                        <Button
                          type="button"
                          variant="ghost"
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
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Description</h3>
          <div className="space-y-2">
            <Label htmlFor="description">Book Description</Label>
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
        </div>
      </CardContent>
    </Card>
  );
}
