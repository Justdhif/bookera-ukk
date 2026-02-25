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
  setFormData: (data: FormData) => void;
  onInputChange?: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
  onYearChange?: (year: string) => void;
  onCategoryChange?: (categoryIds: number[]) => void;
  categories: Category[];
  onValidationChange?: (hasErrors: boolean) => void;
}

export default function BookDetailForm({
  book,
  isEditMode,
  formData,
  setFormData,
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
            : "Complete book details"}
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
              Title
            </Label>
            <Input
              id="title"
              name="title"
              required={isEditMode}
              value={formData.title || ""}
              onChange={handleInputChange}
              placeholder="Enter book title"
              disabled={!isEditMode}
              validationType={isEditMode ? "alphanumeric" : undefined}
              onValidationChange={
                isEditMode ? handleValidationChange("title") : undefined
              }
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="author"
              variant={isEditMode ? "required" : "default"}
            >
              Author
            </Label>
            <Input
              id="author"
              name="author"
              required={isEditMode}
              value={formData.author || ""}
              onChange={handleInputChange}
              placeholder="Enter author name"
              disabled={!isEditMode}
              validationType={isEditMode ? "letters-only" : undefined}
              onValidationChange={
                isEditMode ? handleValidationChange("author") : undefined
              }
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="publisher">Publisher</Label>
              <Input
                id="publisher"
                name="publisher"
                value={formData.publisher || ""}
                onChange={handleInputChange}
                placeholder="Enter publisher name"
                disabled={!isEditMode}
                validationType={isEditMode ? "alphanumeric" : undefined}
                onValidationChange={
                  isEditMode ? handleValidationChange("publisher") : undefined
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="publication_year">Publication Year</Label>
              <YearPicker
                value={formData.publication_year || ""}
                onChange={handleYearChange}
                placeholder="Select year"
                searchPlaceholder="Search year..."
                emptyText="Year not found"
                disabled={!isEditMode}
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
                onChange={handleInputChange}
                placeholder="Enter ISBN number"
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
                placeholder="e.g., English, Indonesian"
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
              <PopoverContent className="w-full p-0" align="start">
                <Command>
                  <CommandEmpty>No categories found</CommandEmpty>
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
              placeholder="Enter book description"
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
