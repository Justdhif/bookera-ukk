"use client";

import { Book } from "@/types/book";
import { Category } from "@/types/category";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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
  CommandItem,
} from "@/components/ui/command";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useTranslations } from "next-intl";
import YearPicker from "@/components/custom-ui/YearPicker";

interface BookDetailFormProps {
  book: Book;
  isEditMode: boolean;
  formData: any;
  setFormData: (data: any) => void;
  categories: Category[];
}

export default function BookDetailForm({
  book,
  isEditMode,
  formData,
  setFormData,
  categories,
}: BookDetailFormProps) {
  const t = useTranslations('common');

  if (!isEditMode) {
    return (
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>{t('bookInfo')}</CardTitle>
          <CardDescription>{t('detailsBookComplete')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">{t('basicInfo')}</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">{t('title')}</p>
                <p className="font-medium">{book.title}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('author')}</p>
                <p className="font-medium">{book.author}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('publisher')}</p>
                <p className="font-medium">{book.publisher || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('publicationYear')}</p>
                <p className="font-medium">{book.publication_year || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('isbn')}</p>
                <p className="font-medium">{book.isbn || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('language')}</p>
                <p className="font-medium">{book.language || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Slug</p>
                <p className="font-medium font-mono text-sm">{book.slug}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('totalCopies')}</p>
                <p className="font-medium">{book.copies?.length || 0}</p>
              </div>
            </div>
          </div>

          {/* Categories */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">{t('selectCategory')}</h3>
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
    );
  }

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>{t('editBookInfo')}</CardTitle>
        <CardDescription>
          {t('updateBookInfo')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">{t('basicInfo')}</h3>
          <div className="space-y-2">
            <Label htmlFor="title" variant="required">
              {t('title')}
            </Label>
            <Input
              id="title"
              required
              value={formData.title || ""}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder={t('enterTitle')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="author" variant="required">
              {t('author')}
            </Label>
            <Input
              id="author"
              required
              value={formData.author || ""}
              onChange={(e) =>
                setFormData({ ...formData, author: e.target.value })
              }
              placeholder={t('enterAuthor')}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="publisher">{t('publisher')}</Label>
              <Input
                id="publisher"
                value={formData.publisher || ""}
                onChange={(e) =>
                  setFormData({ ...formData, publisher: e.target.value })
                }
                placeholder={t('publisherName')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="publication_year">{t('publicationYear')}</Label>
              <YearPicker
                value={formData.publication_year || ""}
                onChange={(year) =>
                  setFormData({
                    ...formData,
                    publication_year: year,
                  })
                }
                placeholder={t('selectYear')}
                searchPlaceholder={t('searchYear')}
                emptyText={t('yearNotFound')}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="isbn">{t('isbn')}</Label>
              <Input
                id="isbn"
                value={formData.isbn || ""}
                onChange={(e) =>
                  setFormData({ ...formData, isbn: e.target.value })
                }
                placeholder={t('isbnNumber')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="language">{t('language')}</Label>
              <Input
                id="language"
                value={formData.language || ""}
                onChange={(e) =>
                  setFormData({ ...formData, language: e.target.value })
                }
                placeholder={t('languageExample')}
              />
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">{t('selectCategory')}</h3>
          <div className="space-y-2">
            <Label>{t('selectCategory')}</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  {formData.category_ids && formData.category_ids.length > 0
                    ? `${formData.category_ids.length} ${t('categoriesSelected')}`
                    : t('selectPlaceholder')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0" align="start">
                <Command>
                  <CommandEmpty>{t('categoryNotFound')}</CommandEmpty>
                  <CommandGroup>
                    {categories.map((cat) => (
                      <CommandItem
                        key={cat.id}
                        onSelect={() => {
                          setFormData((prev: any) => ({
                            ...prev,
                            category_ids: prev.category_ids.includes(cat.id)
                              ? prev.category_ids.filter((id: number) => id !== cat.id)
                              : [...prev.category_ids, cat.id],
                          }));
                        }}
                        className="cursor-pointer"
                      >
                        <Checkbox
                          checked={formData.category_ids.includes(cat.id)}
                          className="mr-2"
                        />
                        {cat.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>

            {formData.category_ids && formData.category_ids.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.category_ids.map((id: number) => {
                  const category = categories.find((c) => c.id === id);
                  return category ? (
                    <Badge key={id} variant="secondary" className="gap-1">
                      {category.name}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() =>
                          setFormData((prev: any) => ({
                            ...prev,
                            category_ids: prev.category_ids.filter(
                              (cId: number) => cId !== id
                            ),
                          }))
                        }
                      />
                    </Badge>
                  ) : null;
                })}
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">{t('bookDescription')}</h3>
          <div className="space-y-2">
            <Label htmlFor="description">{t('bookDescription')}</Label>
            <Textarea
              id="description"
              value={formData.description || ""}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder={t('enterDescription')}
              rows={4}
              className="resize-none"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
