"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { bookService } from "@/services/book.service";
import { categoryService } from "@/services/category.service";
import { Category } from "@/types/category";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Upload, X, BookOpen } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import YearPicker from "@/components/custom-ui/YearPicker";

export default function AddBookClient() {
  const router = useRouter();
  const t = useTranslations("admin.books");
  const tCategories = useTranslations("admin.categories");
  const tCommon = useTranslations("admin.common");
  const tCommonRoot = useTranslations("common");
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    publisher: "",
    publication_year: "",
    isbn: "",
    language: "",
    description: "",
    is_active: true,
    category_ids: [] as number[],
  });
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isTitleValid, setIsTitleValid] = useState(true);
  const [isAuthorValid, setIsAuthorValid] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await categoryService.getAll();
      setCategories(res.data.data);
    } catch (error) {
      toast.error(tCategories("loadError"));
      console.error("Error fetching categories:", error);
    }
  };

  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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

      formData.category_ids.forEach((id) =>
        data.append("category_ids[]", String(id)),
      );

      if (coverImage) {
        data.append("cover_image", coverImage);
      }

      await bookService.create(data);
      toast.success(tCommon("bookAdded"));
      router.push("/admin/books");
    } catch (error: any) {
      toast.error(error.response?.data?.message || tCommon("failedToAddBook"));
    } finally {
      setSubmitting(false);
    }
  };

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
            <h1 className="text-3xl font-bold">{t("addBook")}</h1>
            <p className="text-muted-foreground">
              {tCommonRoot("addBookToSystem")}
            </p>
          </div>
        </div>
        <Button
          type="submit"
          form="book-form"
          variant="submit"
          disabled={
            submitting ||
            !formData.title.trim() ||
            !formData.author.trim() ||
            !isTitleValid ||
            !isAuthorValid
          }
          loading={submitting}
          className="h-8"
        >
          {submitting ? t("saving") : t("addBook")}
        </Button>
      </div>

      <form id="book-form" onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>{tCommonRoot("bookCover")}</CardTitle>
              <CardDescription>{tCommonRoot("uploadCover")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 flex-1 flex flex-col">
              <div className="flex flex-col gap-4 flex-1">
                {coverPreview ? (
                  <div className="relative w-full flex-1">
                    <img
                      src={coverPreview}
                      alt="Cover preview"
                      className="w-full h-full object-cover rounded-lg border"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={() => {
                        setCoverImage(null);
                        setCoverPreview("");
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="w-full flex-1 border-2 border-dashed rounded-lg flex flex-col items-center justify-center gap-2 bg-muted/30">
                    <BookOpen className="h-12 w-12 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      {tCommonRoot("noCover")}
                    </p>
                  </div>
                )}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    document.getElementById("cover_image")?.click()
                  }
                  className="w-full"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {tCommonRoot("uploadCover")}
                </Button>
                <Input
                  id="cover_image"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleCoverImageChange}
                />
              </div>

              <div className="flex items-center justify-between rounded-lg border p-4 bg-muted/30">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">
                    Status
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    {formData.is_active
                      ? "Active"
                      : "Inactive"}
                  </p>
                </div>
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(value) =>
                    setFormData({ ...formData, is_active: value })
                  }
                />
              </div>
            </CardContent>
          </Card>
\
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>{tCommonRoot("bookInfo")}</CardTitle>
              <CardDescription>
                {tCommonRoot("fullBookDetails")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">
                  {tCommonRoot("basicInformation")}
                </h3>
                <div className="space-y-2">
                  <Label htmlFor="title" variant="required">
                    {tCommonRoot("title")}
                  </Label>
                  <Input
                    id="title"
                    required
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    validationType="alphanumeric"
                    onValidationChange={setIsTitleValid}
                    placeholder={tCommonRoot("enterTitle")}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="author" variant="required">
                    {tCommonRoot("author")}
                  </Label>
                  <Input
                    id="author"
                    required
                    value={formData.author}
                    onChange={(e) =>
                      setFormData({ ...formData, author: e.target.value })
                    }
                    validationType="letters-only"
                    onValidationChange={setIsAuthorValid}
                    errorMessage={{
                      "letters-only": "Nama penulis hanya boleh berisi huruf",
                    }}
                    placeholder={tCommonRoot("enterAuthor")}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="publisher">
                      {tCommonRoot("publisher")}
                    </Label>
                    <Input
                      id="publisher"
                      value={formData.publisher}
                      onChange={(e) =>
                        setFormData({ ...formData, publisher: e.target.value })
                      }
                      placeholder={tCommonRoot("publisherName")}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="publication_year">
                      {tCommonRoot("publicationYear")}
                    </Label>
                    <YearPicker
                      value={formData.publication_year}
                      onChange={(year) =>
                        setFormData({
                          ...formData,
                          publication_year: year,
                        })
                      }
                      placeholder={tCommonRoot("selectYear")}
                      searchPlaceholder={tCommonRoot("searchYear")}
                      emptyText={tCommonRoot("yearNotFound")}
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="isbn">{tCommonRoot("isbn")}</Label>
                    <Input
                      id="isbn"
                      value={formData.isbn}
                      onChange={(e) =>
                        setFormData({ ...formData, isbn: e.target.value })
                      }
                      placeholder={tCommonRoot("isbnNumber")}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="language">{tCommonRoot("language")}</Label>
                    <Input
                      id="language"
                      value={formData.language}
                      onChange={(e) =>
                        setFormData({ ...formData, language: e.target.value })
                      }
                      placeholder={tCommonRoot("languageExample")}
                    />
                  </div>
                </div>
              </div>

              {/* Categories */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">
                  {tCategories("title")}
                </h3>
                <div className="space-y-2">
                  <Label>{tCommonRoot("selectCategory")}</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        {formData.category_ids.length > 0
                          ? tCommonRoot("categoriesSelected", {
                              count: formData.category_ids.length,
                            })
                          : tCommon("selectCategoryPlaceholder")}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0" align="start">
                      <Command>
                        <CommandEmpty>
                          {tCommonRoot("categoryNotFound")}
                        </CommandEmpty>
                        <CommandGroup>
                          {categories.map((cat) => (
                            <CommandItem
                              key={cat.id}
                              onSelect={() => {
                                setFormData((prev) => ({
                                  ...prev,
                                  category_ids: prev.category_ids.includes(
                                    cat.id,
                                  )
                                    ? prev.category_ids.filter(
                                        (id) => id !== cat.id,
                                      )
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

                  {formData.category_ids.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.category_ids.map((id) => {
                        const category = categories.find((c) => c.id === id);
                        return category ? (
                          <Badge key={id} variant="secondary" className="gap-1">
                            {category.name}
                            <X
                              className="h-3 w-3 cursor-pointer"
                              onClick={() =>
                                setFormData((prev) => ({
                                  ...prev,
                                  category_ids: prev.category_ids.filter(
                                    (cId) => cId !== id,
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
                <h3 className="font-semibold text-lg">
                  {tCommonRoot("bookDescription")}
                </h3>
                <div className="space-y-2">
                  <Label htmlFor="description">
                    {tCommonRoot("bookDescription")}
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder={tCommonRoot("enterDescription")}
                    rows={4}
                    className="resize-none"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
}
