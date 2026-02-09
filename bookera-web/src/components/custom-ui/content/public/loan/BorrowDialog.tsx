"use client";

import { useState, useEffect } from "react";
import { loanService } from "@/services/loan.service";
import { bookService } from "@/services/book.service";
import { Book } from "@/types/book";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Check, ChevronsUpDown, BookOpen, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { DatePicker } from "@/components/ui/date-picker";

interface BorrowDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function BorrowDialog({
  open,
  onOpenChange,
  onSuccess,
}: BorrowDialogProps) {
  const [loading, setLoading] = useState(false);
  const [books, setBooks] = useState<Book[]>([]);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [selectedCopies, setSelectedCopies] = useState<number[]>([]);
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [popoverOpen, setPopoverOpen] = useState(false);

  useEffect(() => {
    if (open) {
      fetchBooks();
      // Set default due date to 7 days from now
      const defaultDate = new Date();
      defaultDate.setDate(defaultDate.getDate() + 7);
      setDueDate(defaultDate);
    } else {
      // Reset form
      setSelectedBook(null);
      setSelectedCopies([]);
      setDueDate(undefined);
    }
  }, [open]);

  const fetchBooks = async () => {
    try {
      const response = await bookService.getAll();
      // Handle paginated response: response.data.data.data
      const booksData = response.data.data?.data || response.data.data;
      setBooks(Array.isArray(booksData) ? booksData : []);
    } catch (error: any) {
      toast.error("Gagal memuat daftar buku");
      setBooks([]);
    }
  };

  const handleSubmit = async () => {
    if (selectedCopies.length === 0) {
      toast.error("Pilih minimal 1 copy buku untuk dipinjam");
      return;
    }

    if (!dueDate) {
      toast.error("Pilih tanggal jatuh tempo");
      return;
    }

    setLoading(true);
    try {
      const response = await loanService.create({
        book_copy_ids: selectedCopies,
        due_date: dueDate.toISOString().split("T")[0],
      });
      toast.success(
        response.data.message ||
          "Permintaan peminjaman berhasil dibuat dan menunggu persetujuan admin"
      );
      onOpenChange(false);
      setSelectedBook(null);
      setSelectedCopies([]);
      setDueDate(undefined);
      onSuccess();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Gagal membuat permintaan peminjaman"
      );
    } finally {
      setLoading(false);
    }
  };

  const toggleCopy = (copyId: number) => {
    setSelectedCopies((prev) =>
      prev.includes(copyId)
        ? prev.filter((id) => id !== copyId)
        : [...prev, copyId]
    );
  };

  const removeCopy = (copyId: number) => {
    setSelectedCopies((prev) => prev.filter((id) => id !== copyId));
  };

  const getSelectedCopyNames = () => {
    if (!selectedBook || !Array.isArray(selectedBook.copies)) return [];
    return selectedBook.copies
      .filter((copy) => selectedCopies.includes(copy.id))
      .map((copy) => `${selectedBook.title} (${copy.copy_code})`);
  };

  const availableCopies = selectedBook?.copies?.filter(
    (copy) => copy.status === "available"
  ) || [];

  const isFormValid = selectedCopies.length > 0 && dueDate;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Request Peminjaman Buku
          </DialogTitle>
          <DialogDescription>
            Pilih buku yang ingin dipinjam dan tentukan tanggal jatuh tempo.
            Permintaan akan diproses oleh admin.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Book Selection */}
          <div className="space-y-2">
            <Label>Pilih Buku</Label>
            <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={popoverOpen}
                  className="w-full justify-between"
                >
                  <span className="truncate">
                    {selectedBook
                      ? selectedBook.title
                      : "Pilih buku..."}
                  </span>
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput placeholder="Cari buku..." />
                  <CommandEmpty>Tidak ada buku ditemukan.</CommandEmpty>
                  <CommandList>
                    <CommandGroup>
                      {Array.isArray(books) && books.map((book) => {
                        const availableCopies = Array.isArray(book.copies) 
                          ? book.copies.filter((copy) => copy.status === "available")
                          : [];
                        
                        if (availableCopies.length === 0) return null;
                        
                        return (
                          <CommandItem
                            key={book.id}
                            value={book.title}
                            onSelect={() => {
                              setSelectedBook(book);
                              setSelectedCopies([]);
                              setPopoverOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedBook?.id === book.id
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                            <div className="flex-1">
                              <p className="font-medium">{book.title}</p>
                              <p className="text-xs text-muted-foreground">
                                {availableCopies.length} copy tersedia
                              </p>
                            </div>
                          </CommandItem>
                        );
                      })}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* Book Copies Selection (Checkbox) */}
          {selectedBook && availableCopies.length > 0 && (
            <div className="space-y-2">
              <Label>Pilih Copy Buku ({availableCopies.length} tersedia)</Label>
              <div className="border rounded-md p-4 space-y-3 max-h-50 overflow-y-auto">
                {availableCopies.map((copy) => (
                  <div key={copy.id} className="flex items-center space-x-3">
                    <Checkbox
                      id={`copy-${copy.id}`}
                      checked={selectedCopies.includes(copy.id)}
                      onCheckedChange={() => toggleCopy(copy.id)}
                    />
                    <label
                      htmlFor={`copy-${copy.id}`}
                      className="flex-1 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      <div>
                        <span>{copy.copy_code}</span>
                        <span className="ml-2 text-xs text-green-600 font-medium">
                          • Tersedia
                        </span>
                      </div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Selected Copies Display */}
          {selectedCopies.length > 0 && (
            <div className="space-y-2">
              <Label>Copy yang Dipilih ({selectedCopies.length})</Label>
              <div className="flex flex-wrap gap-2">
                {getSelectedCopyNames().map((name, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    <span className="text-xs">{name}</span>
                    <button
                      onClick={() => removeCopy(selectedCopies[index])}
                      className="ml-1 hover:bg-destructive/20 rounded-full"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Due Date */}
          <div className="space-y-2">
            <Label>Tanggal Jatuh Tempo</Label>
            <DatePicker
              value={dueDate}
              onChange={setDueDate}
              placeholder="Pilih tanggal jatuh tempo"
              dateMode="future"
            />
            <p className="text-xs text-muted-foreground">
              Pilih tanggal hari ini atau kedepan untuk jatuh tempo pengembalian
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Batal
          </Button>
          <Button 
            variant="submit" 
            onClick={handleSubmit} 
            disabled={loading || !isFormValid}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Memproses...
              </>
            ) : (
              "Submit Peminjaman"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
