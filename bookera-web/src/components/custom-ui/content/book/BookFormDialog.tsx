"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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
import { toast } from "sonner";

import { Book } from "@/types/book";
import { Category } from "@/types/category";
import { bookService } from "@/services/book.service";
import { categoryService } from "@/services/category.service";

interface Props {
  open: boolean;
  setOpen: (v: boolean) => void;
  book: Book | null;
  onSuccess: () => void;
}

export function BookFormDialog({ open, setOpen, book, onSuccess }: Props) {
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);

  const [form, setForm] = useState({
    title: "",
    author: "",
    publisher: "",
    publication_year: "",
    language: "",
    description: "",
    is_active: true,
    category_ids: [] as number[],
  });

  /* ================= FETCH CATEGORIES ================= */
  const fetchCategories = async () => {
    try {
      const res = await categoryService.getAll();
      setCategories(res.data.data);
    } catch (error) {
      console.error("Gagal mengambil kategori:", error);
    }
  };

  /* ================= INIT FORM ================= */
  useEffect(() => {
    fetchCategories();

    if (book) {
      setForm({
        title: book.title,
        author: book.author,
        publisher: book.publisher ?? "",
        publication_year: book.publication_year?.toString() ?? "",
        language: book.language ?? "",
        description: book.description ?? "",
        is_active: book.is_active,
        category_ids: book.categories?.map((c) => c.id) ?? [],
      });

      setPreview(book.cover_image_url ?? null);
      setFile(null);
    } else {
      resetForm();
    }
  }, [book, open]);

  /* ================= RESET FORM ================= */
  const resetForm = () => {
    setForm({
      title: "",
      author: "",
      publisher: "",
      publication_year: "",
      language: "",
      description: "",
      is_active: true,
      category_ids: [],
    });
    setFile(null);
    setPreview(null);
  };

  /* ================= HANDLE SUBMIT ================= */
  const handleSubmit = async () => {
    // Validasi wajib
    if (!form.title.trim() || !form.author.trim()) {
      toast.error("Judul dan Penulis wajib diisi");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();

      // Text fields
      formData.append("title", form.title.trim());
      formData.append("author", form.author.trim());
      formData.append("publisher", form.publisher.trim());
      formData.append("language", form.language.trim());
      formData.append("description", form.description.trim());
      formData.append("is_active", form.is_active ? "1" : "0");

      if (form.publication_year) {
        formData.append("publication_year", form.publication_year);
      }

      // Categories
      form.category_ids.forEach((id) =>
        formData.append("category_ids[]", String(id)),
      );

      // File upload
      if (file) {
        formData.append("cover_image", file);
      }

      // Create or Update
      if (book) {
        await bookService.update(book.id, formData);
      } else {
        await bookService.create(formData);
      }

      toast.success("Buku berhasil disimpan");
      onSuccess();
      setOpen(false);
      resetForm();
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? "Gagal menyimpan buku");
    } finally {
      setLoading(false);
    }
  };

  /* ================= RENDER UI ================= */
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{book ? "Edit Buku" : "Tambah Buku"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* TITLE */}
          <div>
            <Label htmlFor="title">Judul *</Label>
            <Input
              id="title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Masukkan judul buku"
              required
            />
          </div>

          {/* AUTHOR */}
          <div>
            <Label htmlFor="author">Penulis *</Label>
            <Input
              id="author"
              value={form.author}
              onChange={(e) => setForm({ ...form, author: e.target.value })}
              placeholder="Masukkan nama penulis"
              required
            />
          </div>

          {/* CATEGORIES MULTI-SELECT */}
          <div>
            <Label>Kategori</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start">
                  {form.category_ids.length > 0
                    ? `${form.category_ids.length} kategori dipilih`
                    : "Pilih kategori"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandEmpty>Kategori tidak ditemukan</CommandEmpty>
                  <CommandGroup>
                    {categories.map((cat) => (
                      <CommandItem
                        key={cat.id}
                        onSelect={() => {
                          setForm((prev) => ({
                            ...prev,
                            category_ids: prev.category_ids.includes(cat.id)
                              ? prev.category_ids.filter((id) => id !== cat.id)
                              : [...prev.category_ids, cat.id],
                          }));
                        }}
                        className="cursor-pointer"
                      >
                        <Checkbox
                          checked={form.category_ids.includes(cat.id)}
                          className="mr-2"
                        />
                        {cat.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
            {form.category_ids.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {form.category_ids.map((id) => {
                  const category = categories.find((c) => c.id === id);
                  return category ? (
                    <span
                      key={id}
                      className="bg-primary/10 text-primary text-xs px-2 py-1 rounded"
                    >
                      {category.name}
                    </span>
                  ) : null;
                })}
              </div>
            )}
          </div>

          {/* PUBLISHER */}
          <div>
            <Label htmlFor="publisher">Penerbit</Label>
            <Input
              id="publisher"
              value={form.publisher}
              onChange={(e) => setForm({ ...form, publisher: e.target.value })}
              placeholder="Masukkan nama penerbit"
            />
          </div>

          {/* PUBLICATION YEAR */}
          <div>
            <Label htmlFor="publication_year">Tahun Terbit</Label>
            <Input
              id="publication_year"
              type="number"
              min="1000"
              max={new Date().getFullYear()}
              value={form.publication_year}
              onChange={(e) =>
                setForm({ ...form, publication_year: e.target.value })
              }
              placeholder="YYYY"
            />
          </div>

          {/* LANGUAGE */}
          <div>
            <Label htmlFor="language">Bahasa</Label>
            <Input
              id="language"
              value={form.language}
              onChange={(e) => setForm({ ...form, language: e.target.value })}
              placeholder="Contoh: Indonesia, English"
            />
          </div>

          {/* DESCRIPTION */}
          <div>
            <Label htmlFor="description">Deskripsi</Label>
            <Textarea
              id="description"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              placeholder="Masukkan deskripsi buku"
              rows={4}
            />
          </div>

          {/* COVER IMAGE */}
          <div>
            <Label htmlFor="cover_image">Cover Image</Label>
            <Input
              id="cover_image"
              type="file"
              accept="image/*"
              onChange={(e) => {
                const selectedFile = e.target.files?.[0];
                if (selectedFile) {
                  setFile(selectedFile);
                  setPreview(URL.createObjectURL(selectedFile));
                }
              }}
            />
            {preview && (
              <div className="mt-2">
                <p className="text-sm text-muted-foreground mb-1">Preview:</p>
                <img
                  src={preview}
                  alt="Preview cover buku"
                  className="h-40 w-full rounded-md object-cover border"
                />
              </div>
            )}
          </div>

          {/* ACTIVE STATUS */}
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <Label htmlFor="is_active" className="font-medium">
                Status Aktif
              </Label>
              <p className="text-sm text-muted-foreground">
                Buku {form.is_active ? "dapat" : "tidak dapat"} dipinjam
              </p>
            </div>
            <Switch
              id="is_active"
              checked={form.is_active}
              onCheckedChange={(v) => setForm({ ...form, is_active: v })}
            />
          </div>

          {/* SUBMIT BUTTON */}
          <Button
            onClick={handleSubmit}
            disabled={loading || !form.title.trim() || !form.author.trim()}
            className="w-full"
            size="lg"
          >
            {loading ? (
              <>
                <span className="animate-spin mr-2">⟳</span>
                Menyimpan...
              </>
            ) : (
              "Simpan Buku"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
