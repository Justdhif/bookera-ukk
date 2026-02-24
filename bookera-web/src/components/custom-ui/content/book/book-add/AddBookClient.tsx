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
import { ArrowLeft, X } from "lucide-react";
import { toast } from "sonner";
import YearPicker from "@/components/custom-ui/YearPicker";
import BookCoverCard from "../BookCoverCard";

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
}

interface FormErrors {
  title: boolean;
  author: boolean;
  publisher: boolean;
  isbn: boolean;
  language: boolean;
  cover: boolean;
}

export default function AddBookClient() {
  const router = useRouter();
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
  });
  const [errors, setErrors] = useState<FormErrors>({
    title: false,
    author: false,
    publisher: false,
    isbn: false,
    language: false,
    cover: false,
  });
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await categoryService.getAll();
      setCategories(res.data.data);
    } catch (error) {
      toast.error("Failed to load categories");
    }
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

  const handleCoverImageChange = (file: File | null, preview: string) => {
    setCoverImage(file);
    setCoverPreview(preview);

    if (file) {
      setErrors((prev) => ({ ...prev, cover: false }));
    }
  };

  const handleCoverValidationChange = (isValid: boolean) => {
    setErrors((prev) => ({ ...prev, cover: !isValid }));
  };

  const handleCategorySelect = (categoryId: number) => {
    setFormData((prev) => ({
      ...prev,
      category_ids: prev.category_ids.includes(categoryId)
        ? prev.category_ids.filter((id) => id !== categoryId)
        : [...prev.category_ids, categoryId],
    }));
  };

  const handleRemoveCategory = (categoryId: number) => {
    setFormData((prev) => ({
      ...prev,
      category_ids: prev.category_ids.filter((id) => id !== categoryId),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!coverImage && !coverPreview) {
      setErrors((prev) => ({ ...prev, cover: true }));
      toast.error("Cover image is required");
      return;
    }

    const hasErrors = Object.values(errors).some((error) => error === true);
    if (hasErrors) {
      toast.error("Please fix all validation errors before submitting");
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

      formData.category_ids.forEach((id) =>
        data.append("category_ids[]", String(id)),
      );

      if (coverImage) {
        data.append("cover_image", coverImage);
      }

      await bookService.create(data);
      toast.success("Book added successfully");
      router.push("/admin/books");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to add book");
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
            <h1 className="text-3xl font-bold">Add Book</h1>
            <p className="text-muted-foreground">
              Add a new book to the system
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
            Object.values(errors).some((error) => error === true)
          }
          loading={submitting}
          className="h-8"
        >
          {submitting ? "Saving..." : "Add Book"}
        </Button>
      </div>

      <form id="book-form" onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-3">
          <BookCoverCard
            coverPreview={coverPreview}
            formData={{ is_active: formData.is_active }}
            onCoverImageChange={handleCoverImageChange}
            onSwitchChange={handleSwitchChange}
            isCoverRequired={true}
            coverError={errors.cover}
            onCoverValidationChange={handleCoverValidationChange}
          />

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Book Information</CardTitle>
              <CardDescription>Enter complete book details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Basic Information</h3>
                <div className="space-y-2">
                  <Label htmlFor="title" variant="required">
                    Title
                  </Label>
                  <Input
                    id="title"
                    name="title"
                    required
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Enter book title"
                    validationType="alphanumeric"
                    onValidationChange={(isValid: boolean) =>
                      setErrors((prev) => ({ ...prev, title: !isValid }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="author" variant="required">
                    Author
                  </Label>
                  <Input
                    id="author"
                    name="author"
                    required
                    value={formData.author}
                    onChange={handleInputChange}
                    placeholder="Enter author name"
                    validationType="letters-only"
                    onValidationChange={(isValid: boolean) =>
                      setErrors((prev) => ({ ...prev, author: !isValid }))
                    }
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="publisher">Publisher</Label>
                    <Input
                      id="publisher"
                      name="publisher"
                      value={formData.publisher}
                      onChange={handleInputChange}
                      placeholder="Enter publisher name"
                      validationType="alphanumeric"
                      onValidationChange={(isValid: boolean) =>
                        setErrors((prev) => ({ ...prev, publisher: !isValid }))
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="publication_year">Publication Year</Label>
                    <YearPicker
                      value={formData.publication_year}
                      onChange={handleYearChange}
                      placeholder="Select year"
                      searchPlaceholder="Search year..."
                      emptyText="Year not found"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="isbn">ISBN</Label>
                    <Input
                      id="isbn"
                      name="isbn"
                      value={formData.isbn}
                      onChange={handleInputChange}
                      placeholder="Enter ISBN number"
                      validationType="alphanumeric"
                      onValidationChange={(isValid: boolean) =>
                        setErrors((prev) => ({ ...prev, isbn: !isValid }))
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="language">Language</Label>
                    <Input
                      id="language"
                      name="language"
                      value={formData.language}
                      onChange={handleInputChange}
                      placeholder="e.g., English, Indonesian"
                      validationType="letters-only"
                      onValidationChange={(isValid: boolean) =>
                        setErrors((prev) => ({ ...prev, language: !isValid }))
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
                      >
                        {formData.category_ids.length > 0
                          ? `${formData.category_ids.length} categories selected`
                          : "Select categories"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0" align="start">
                      <Command>
                        <CommandEmpty>No categories found</CommandEmpty>
                        <CommandGroup>
                          {categories.map((cat) => (
                            <CommandItem
                              key={cat.id}
                              onSelect={() => handleCategorySelect(cat.id)}
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
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Enter book description"
                    rows={10}
                    className="resize-y"
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