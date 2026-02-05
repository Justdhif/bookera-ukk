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
  if (!isEditMode) {
    return (
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Informasi Buku</CardTitle>
          <CardDescription>Detail lengkap buku</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Informasi Dasar</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">Judul</p>
                <p className="font-medium">{book.title}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Penulis</p>
                <p className="font-medium">{book.author}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Penerbit</p>
                <p className="font-medium">{book.publisher || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tahun Terbit</p>
                <p className="font-medium">{book.publication_year || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">ISBN</p>
                <p className="font-medium">{book.isbn || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Bahasa</p>
                <p className="font-medium">{book.language || "-"}</p>
              </div>
            </div>
          </div>

          {/* Categories */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Kategori</h3>
            {book.categories && book.categories.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {book.categories.map((category) => (
                  <Badge key={category.id} variant="secondary">
                    {category.name}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">Tidak ada kategori</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Deskripsi</h3>
            <p className="whitespace-pre-line text-muted-foreground leading-relaxed">
              {book.description || "Tidak ada deskripsi tersedia"}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>Edit Informasi Buku</CardTitle>
        <CardDescription>
          Perbarui informasi buku
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Informasi Dasar</h3>
          <div className="space-y-2">
            <Label htmlFor="title">
              Judul <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              required
              value={formData.title || ""}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="Masukkan judul buku"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="author">
              Penulis <span className="text-red-500">*</span>
            </Label>
            <Input
              id="author"
              required
              value={formData.author || ""}
              onChange={(e) =>
                setFormData({ ...formData, author: e.target.value })
              }
              placeholder="Masukkan nama penulis"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="publisher">Penerbit</Label>
              <Input
                id="publisher"
                value={formData.publisher || ""}
                onChange={(e) =>
                  setFormData({ ...formData, publisher: e.target.value })
                }
                placeholder="Nama penerbit"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="publication_year">Tahun Terbit</Label>
              <Input
                id="publication_year"
                type="number"
                min="1000"
                max={new Date().getFullYear()}
                value={formData.publication_year || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    publication_year: e.target.value,
                  })
                }
                placeholder="YYYY"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="isbn">ISBN</Label>
              <Input
                id="isbn"
                value={formData.isbn || ""}
                onChange={(e) =>
                  setFormData({ ...formData, isbn: e.target.value })
                }
                placeholder="Nomor ISBN"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="language">Bahasa</Label>
              <Input
                id="language"
                value={formData.language || ""}
                onChange={(e) =>
                  setFormData({ ...formData, language: e.target.value })
                }
                placeholder="Contoh: Indonesia, English"
              />
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Kategori</h3>
          <div className="space-y-2">
            <Label>Pilih Kategori</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  {formData.category_ids && formData.category_ids.length > 0
                    ? `${formData.category_ids.length} kategori dipilih`
                    : "Pilih kategori..."}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0" align="start">
                <Command>
                  <CommandEmpty>Kategori tidak ditemukan</CommandEmpty>
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
          <h3 className="font-semibold text-lg">Deskripsi</h3>
          <div className="space-y-2">
            <Label htmlFor="description">Deskripsi Buku</Label>
            <Textarea
              id="description"
              value={formData.description || ""}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Masukkan deskripsi atau sinopsis buku"
              rows={4}
              className="resize-none"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
