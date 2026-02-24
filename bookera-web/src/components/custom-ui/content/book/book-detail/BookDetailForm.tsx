"use client";

import { useState } from "react";
import { Book } from "@/types/book";
import { Category } from "@/types/category";
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
  CommandItem,
} from "@/components/ui/command";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import YearPicker from "@/components/custom-ui/YearPicker";

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
}

interface BookDetailFormProps {
  book: Book;
  isEditMode: boolean;
  formData: FormData;
  onInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
  onYearChange: (year: string) => void;
  onCategoryChange: (categoryIds: number[]) => void;
  categories: Category[];
  onValidationChange?: (hasErrors: boolean) => void;
}

export default function BookDetailForm({
  book,
  isEditMode,
  formData,
  onInputChange,
  onYearChange,
  onCategoryChange,
  categories,
  onValidationChange,
}: BookDetailFormProps) {
  const [errors, setErrors] = useState<FormErrors>({
    title: false,
    author: false,
    publisher: false,
    isbn: false,
    language: false,
  });

  const handleValidationChange =
    (field: keyof FormErrors) => (isValid: boolean) => {
      const newErrors = { ...errors, [field]: !isValid };
      setErrors(newErrors);

      const hasErrors = Object.values(newErrors).some(
        (error) => error === true,
      );
      onValidationChange?.(hasErrors);
    };

  const handleCategorySelect = (categoryId: number) => {
    const newCategoryIds = formData.category_ids.includes(categoryId)
      ? formData.category_ids.filter((id) => id !== categoryId)
      : [...formData.category_ids, categoryId];
    onCategoryChange(newCategoryIds);
  };

  const handleRemoveCategory = (categoryId: number) => {
    onCategoryChange(formData.category_ids.filter((id) => id !== categoryId));
  };

  if (!isEditMode) {
    return (
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Book Information</CardTitle>
          <CardDescription>Complete book details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Basic Information</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">Title</p>
                <p className="font-medium">{book.title}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Author</p>
                <p className="font-medium">{book.author}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Publisher</p>
                <p className="font-medium">{book.publisher || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Publication Year
                </p>
                <p className="font-medium">{book.publication_year || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">ISBN</p>
                <p className="font-medium">{book.isbn || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Language</p>
                <p className="font-medium">{book.language || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Slug</p>
                <p className="font-medium font-mono text-sm">{book.slug}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Copies</p>
                <p className="font-medium">{book.copies?.length || 0}</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Categories</h3>
            {book.categories && book.categories.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {book.categories.map((category) => (
                  <Badge key={category.id} variant="secondary">
                    {category.name}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No categories</p>
            )}
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Description</h3>
            <p className="whitespace-pre-line text-muted-foreground leading-relaxed">
              {book.description || "No description available"}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>Edit Book Information</CardTitle>
        <CardDescription>Update book details</CardDescription>
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
              value={formData.title || ""}
              onChange={onInputChange}
              placeholder="Enter book title"
              validationType="alphanumeric"
              onValidationChange={handleValidationChange("title")}
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
              value={formData.author || ""}
              onChange={onInputChange}
              placeholder="Enter author name"
              validationType="letters-only"
              onValidationChange={handleValidationChange("author")}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="publisher">Publisher</Label>
              <Input
                id="publisher"
                name="publisher"
                value={formData.publisher || ""}
                onChange={onInputChange}
                placeholder="Enter publisher name"
                validationType="alphanumeric"
                onValidationChange={handleValidationChange("publisher")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="publication_year">Publication Year</Label>
              <YearPicker
                value={formData.publication_year || ""}
                onChange={onYearChange}
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
                value={formData.isbn || ""}
                onChange={onInputChange}
                placeholder="Enter ISBN number"
                validationType="alphanumeric"
                onValidationChange={handleValidationChange("isbn")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="language">Language</Label>
              <Input
                id="language"
                name="language"
                value={formData.language || ""}
                onChange={onInputChange}
                placeholder="e.g., English, Indonesian"
                validationType="letters-only"
                onValidationChange={handleValidationChange("language")}
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
                  {formData.category_ids && formData.category_ids.length > 0
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

            {formData.category_ids && formData.category_ids.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.category_ids.map((id: number) => {
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
                        <span className="sr-only">Remove {category.name}</span>
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
              value={formData.description || ""}
              onChange={onInputChange}
              placeholder="Enter book description"
              rows={10}
              className="resize-y"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
