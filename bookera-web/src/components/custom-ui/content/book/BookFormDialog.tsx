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
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { BookOpen, Upload, X } from "lucide-react";

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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <BookOpen className="h-5 w-5" />
            {book ? "Edit Buku" : "Tambah Buku Baru"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* INFORMASI DASAR */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Informasi Dasar
            </h3>
            
            {/* TITLE */}
            <div>
              <Label htmlFor="title">
                Judul <span className="text-destructive">*</span>
              </Label>
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
              <Label htmlFor="author">
                Penulis <span className="text-destructive">*</span>
              </Label>
              <Input
                id="author"
                value={form.author}
                onChange={(e) => setForm({ ...form, author: e.target.value })}
                placeholder="Masukkan nama penulis"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* PUBLISHER */}
              <div>
                <Label htmlFor="publisher">Penerbit</Label>
                <Input
                  id="publisher"
                  value={form.publisher}
                  onChange={(e) =>
                    setForm({ ...form, publisher: e.target.value })
                  }
                  placeholder="Nama penerbit"
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
          </div>

          <Separator />

          {/* KATEGORI */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Kategori
            </h3>
            
            <div>
              <Label>Pilih Kategori</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start text-left font-normal"
                  >
                    {form.category_ids.length > 0
                      ? `${form.category_ids.length} kategori dipilih`
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
                <div className="mt-2 flex flex-wrap gap-2">
                  {form.category_ids.map((id) => {
                    const category = categories.find((c) => c.id === id);
                    return category ? (
                      <Badge
                        key={id}
                        variant="secondary"
                        className="gap-1"
                      >
                        {category.name}
                        <X
                          className="h-3 w-3 cursor-pointer"
                          onClick={() =>
                            setForm((prev) => ({
                              ...prev,
                              category_ids: prev.category_ids.filter(
                                (cId) => cId !== id
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

          <Separator />

          {/* DESKRIPSI & COVER */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Detail Tambahan
            </h3>

            {/* DESCRIPTION */}
            <div>
              <Label htmlFor="description">Deskripsi</Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                placeholder="Masukkan deskripsi atau sinopsis buku"
                rows={4}
                className="resize-none"
              />
            </div>

            {/* COVER IMAGE */}
            <div>
              <Label htmlFor="cover_image">Cover Buku</Label>
              <div className="mt-2">
                {preview ? (
                  <div className="relative group">
                    <img
                      src={preview}
                      alt="Preview cover buku"
                      className="h-48 w-full rounded-lg object-cover border"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => {
                        setFile(null);
                        setPreview(null);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                    <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground mb-2">
                      Belum ada gambar dipilih
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        document.getElementById("cover_image")?.click()
                      }
                    >
                      Pilih Gambar
                    </Button>
                  </div>
                )}
              </div>
              <Input
                id="cover_image"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const selectedFile = e.target.files?.[0];
                  if (selectedFile) {
                    setFile(selectedFile);
                    setPreview(URL.createObjectURL(selectedFile));
                  }
                }}
              />
              <p className="text-xs text-muted-foreground mt-2">
                Format: JPG, PNG, atau WEBP (Maks. 2MB)
              </p>
            </div>
          </div>

          <Separator />

          {/* ACTIVE STATUS */}
          <div className="flex items-center justify-between rounded-lg border p-4 bg-muted/30">
            <div className="space-y-0.5">
              <Label htmlFor="is_active" className="text-base font-medium cursor-pointer">
                Status Buku
              </Label>
              <p className="text-sm text-muted-foreground">
                {form.is_active 
                  ? "Buku aktif dan dapat dipinjam oleh anggota" 
                  : "Buku nonaktif dan tidak dapat dipinjam"}
              </p>
            </div>
            <Switch
              id="is_active"
              checked={form.is_active}
              onCheckedChange={(v) => setForm({ ...form, is_active: v })}
            />
          </div>

          {/* SUBMIT BUTTON */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setOpen(false);
                resetForm();
              }}
              className="flex-1"
              disabled={loading}
            >
              Batal
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={loading || !form.title.trim() || !form.author.trim()}
              className="flex-1"
            >
              {loading ? (
                <>
                  <span className="animate-spin mr-2">⟳</span>
                  Menyimpan...
                </>
              ) : (
                <>
                  <BookOpen className="h-4 w-4 mr-2" />
                  {book ? "Perbarui Buku" : "Simpan Buku"}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
