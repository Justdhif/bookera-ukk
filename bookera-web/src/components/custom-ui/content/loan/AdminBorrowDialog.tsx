"use client";

import { useState, useEffect } from "react";
import { loanService } from "@/services/loan.service";
import { bookService } from "@/services/book.service";
import { userService } from "@/services/user.service";
import { Book } from "@/types/book";
import { User } from "@/types/user";
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
import {
  Check,
  ChevronsUpDown,
  BookOpen,
  Loader2,
  X,
  User as UserIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DatePicker } from "@/components/ui/date-picker";
import { useTranslations } from "next-intl";

interface AdminBorrowDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function AdminBorrowDialog({
  open,
  onOpenChange,
  onSuccess,
}: AdminBorrowDialogProps) {
  const t = useTranslations('common');
  const tAdmin = useTranslations('admin');
  const [loading, setLoading] = useState(false);
  const [books, setBooks] = useState<Book[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<number | null>(null);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [selectedCopies, setSelectedCopies] = useState<number[]>([]);
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [userPopoverOpen, setUserPopoverOpen] = useState(false);
  const [bookPopoverOpen, setBookPopoverOpen] = useState(false);

  useEffect(() => {
    if (open) {
      fetchBooks();
      fetchUsers();
      // Set default due date to 7 days from now
      const defaultDate = new Date();
      defaultDate.setDate(defaultDate.getDate() + 7);
      setDueDate(defaultDate);
    } else {
      // Reset form when dialog closes
      setSelectedUser(null);
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
      toast.error(t('failedToLoadBookList'));
      setBooks([]);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await userService.getAll();
      const usersData = response.data.data;
      setUsers(Array.isArray(usersData) ? usersData : []);
    } catch (error: any) {
      toast.error(t('failedToLoadUserList'));
      setUsers([]);
    }
  };

  const handleSubmit = async () => {
    if (!selectedUser) {
      toast.error(t('selectUserToBorrow'));
      return;
    }

    if (selectedCopies.length === 0) {
      toast.error(t('selectAtLeastOneBookCopy'));
      return;
    }

    if (!dueDate) {
      toast.error(t('selectDueDate'));
      return;
    }

    setLoading(true);
    try {
      const response = await loanService.createAdminLoan({
        user_id: selectedUser,
        book_copy_ids: selectedCopies,
        due_date: dueDate.toISOString().split("T")[0],
      });
      toast.success(
        response.data.message || t('loanCreatedSuccessfully')
      );
      onOpenChange(false);
      setSelectedUser(null);
      setSelectedBook(null);
      setSelectedCopies([]);
      setDueDate(undefined);
      onSuccess();
    } catch (error: any) {
      toast.error(error.response?.data?.message || t('failedToCreateLoan'));
    } finally {
      setLoading(false);
    }
  };

  const toggleCopy = (copyId: number) => {
    setSelectedCopies((prev) =>
      prev.includes(copyId)
        ? prev.filter((id) => id !== copyId)
        : [...prev, copyId],
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

  const getSelectedUserName = () => {
    if (!Array.isArray(users)) return null;
    const user = users.find((u) => u.id === selectedUser);
    return user ? user.profile.full_name || user.email : null;
  };

  const availableCopies =
    selectedBook?.copies?.filter((copy) => copy.status === "available") || [];

  const isFormValid = selectedUser && selectedCopies.length > 0 && dueDate;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            {t('requestLoan')} {t('admin')} (Admin)
          </DialogTitle>
          <DialogDescription>
            {t('createLoanDirectly')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* User Selection */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <UserIcon className="h-4 w-4" />
              {t('selectUser')}
            </Label>
            <Popover open={userPopoverOpen} onOpenChange={setUserPopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={userPopoverOpen}
                  className="w-full justify-between"
                >
                  <span className="truncate">
                    {selectedUser ? getSelectedUserName() : t('searchUser')}
                  </span>
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput placeholder={t('searchUser')} />
                  <CommandEmpty>{t('userNotFound')}</CommandEmpty>
                  <CommandList>
                    <CommandGroup>
                      {Array.isArray(users) &&
                        users
                          .filter(
                            (user) => user.is_active && user.role !== "admin",
                          )
                          .map((user) => (
                            <CommandItem
                              key={user.id}
                              value={`${user.profile.full_name}-${user.email}`}
                              onSelect={() => {
                                setSelectedUser(user.id);
                                setUserPopoverOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  selectedUser === user.id
                                    ? "opacity-100"
                                    : "opacity-0",
                                )}
                              />
                              <div className="flex-1">
                                <p className="font-medium">
                                  {user.profile.full_name || user.email}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {user.email} • {user.role}
                                </p>
                              </div>
                            </CommandItem>
                          ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* Book Selection */}
          <div className="space-y-2">
            <Label>{t('selectBook')}</Label>
            <Popover open={bookPopoverOpen} onOpenChange={setBookPopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={bookPopoverOpen}
                  className="w-full justify-between"
                >
                  <span className="truncate">
                    {selectedBook ? selectedBook.title : tAdmin('common.selectBookPlaceholder')}
                  </span>
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput placeholder={tAdmin('common.searchBookPlaceholder')} />
                  <CommandEmpty>{tAdmin('common.noBookFound')}</CommandEmpty>
                  <CommandList>
                    <CommandGroup>
                      {Array.isArray(books) &&
                        books.map((book) => {
                          const availableCopies = Array.isArray(book.copies)
                            ? book.copies.filter(
                                (copy) => copy.status === "available",
                              )
                            : [];

                          if (availableCopies.length === 0) return null;

                          return (
                            <CommandItem
                              key={book.id}
                              value={book.title}
                              onSelect={() => {
                                setSelectedBook(book);
                                setSelectedCopies([]);
                                setBookPopoverOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  selectedBook?.id === book.id
                                    ? "opacity-100"
                                    : "opacity-0",
                                )}
                              />
                              <div className="flex items-center">
                                {book.cover_image_url ? (
                                  <img
                                    src={book.cover_image_url}
                                    alt={book.title}
                                    className="w-12 h-16 object-cover rounded shadow-sm"
                                  />
                                ) : (
                                  <div className="w-12 h-16 bg-muted rounded flex items-center justify-center">
                                    <BookOpen className="h-5 w-5 text-muted-foreground" />
                                  </div>
                                )}
                                <div className="flex-1 ml-3">
                                  <p className="font-medium">{book.title}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {availableCopies.length} copy tersedia
                                  </p>
                                </div>
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
              <Label>{t('selectBookCopies', { count: availableCopies.length })}</Label>
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
                          • {t('available')}
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
              <Label>{t('selectedCopies', { count: selectedCopies.length })}</Label>
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
            <Label>{t('dueDate')}</Label>
            <DatePicker
              value={dueDate}
              onChange={setDueDate}
              placeholder={tAdmin('common.selectDueDatePlaceholder')}
              dateMode="future"
            />
            <p className="text-xs text-muted-foreground">
              {tAdmin('common.selectDueDateHint')}
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            {t('cancel')}
          </Button>
          <Button
            variant="submit"
            onClick={handleSubmit}
            disabled={loading || !isFormValid}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {t('processing')}
              </>
            ) : (
              t('createLoan')
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
