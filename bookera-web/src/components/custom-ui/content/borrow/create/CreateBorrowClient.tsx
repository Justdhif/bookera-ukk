"use client";
import { useRouter } from "next/navigation";

import { useState, useEffect, useMemo, useCallback } from "react";
import { borrowService } from "@/services/borrow.service";
import { bookService } from "@/services/book.service";
import { userService } from "@/services/user.service";
import { Book } from "@/types/book";
import { BookCopy } from "@/types/book-copy";
import { User } from "@/types/user";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import BookSelectorCard from "./BookSelectorCard";
import BookCopySelectorCard from "./BookCopySelectorCard";
import DueDateCard from "./DueDateCard";
import BorrowDateCard from "./BorrowDateCard";
import UserSelectorCard from "./UserSelectorCard";

export default function CreateBorrowClient() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [books, setBooks] = useState<Book[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  const [selectedBooks, setSelectedBooks] = useState<Book[]>([]);
  const [selectedCopyIds, setSelectedCopyIds] = useState<number[]>([]);
  const [borrowDate, setBorrowDate] = useState<Date | undefined>(undefined);
  const [returnDate, setReturnDate] = useState<Date | undefined>(undefined);
  const [userPopoverOpen, setUserPopoverOpen] = useState(false);

  useEffect(() => {
    fetchBooks();
    fetchUsers();
    const today = new Date();
    setBorrowDate(today);
    const defaultReturn = new Date();
    defaultReturn.setDate(defaultReturn.getDate() + 7);
    setReturnDate(defaultReturn);
  }, []);

  const fetchBooks = async () => {
    try {
      const response = await bookService.getAll();
      const booksData = response.data.data?.data || response.data.data;
      setBooks(Array.isArray(booksData) ? booksData : []);
    } catch {
      toast.error("Failed to load book list");
      setBooks([]);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await userService.getAll();
      const usersData = response.data.data;
      setUsers(Array.isArray(usersData) ? usersData : []);
    } catch {
      toast.error("Failed to load user list");
      setUsers([]);
    }
  };

  const handleBookToggle = useCallback((book: Book) => {
    setSelectedBooks((prev) => {
      const exists = prev.some((b) => b.id === book.id);
      return exists ? prev.filter((b) => b.id !== book.id) : [...prev, book];
    });
  }, []);

  useEffect(() => {
    setSelectedCopyIds((prev) => {
      const allowedCopyIds = new Set(
        selectedBooks.flatMap((b) => b.copies?.map((c) => c.id) ?? []),
      );
      return prev.filter((id) => allowedCopyIds.has(id));
    });
  }, [selectedBooks]);

  const handleCopyToggle = useCallback((copyId: number) => {
    setSelectedCopyIds((prev) =>
      prev.includes(copyId)
        ? prev.filter((id) => id !== copyId)
        : [...prev, copyId],
    );
  }, []);

  const handleReturnDateChange = useCallback((date: Date | undefined) => {
    setReturnDate(date);
  }, []);

  const handleBorrowDateChange = useCallback((date: Date | undefined) => {
    setBorrowDate(date);
  }, []);

  const handleUserSelect = useCallback((userId: number) => {
    setSelectedUserId(userId);
    setUserPopoverOpen(false);
  }, []);

  const handleSubmit = async () => {
    if (!selectedUserId) {
      toast.error("Please select a user to borrow books");
      return;
    }

    if (selectedCopyIds.length === 0) {
      toast.error("Please select at least one book copy");
      return;
    }

    if (!borrowDate) {
      toast.error("Please select a borrow date");
      return;
    }

    if (!returnDate) {
      toast.error("Please select a return date");
      return;
    }

    try {
      setLoading(true);
      const response = await borrowService.createAdminBorrow({
        user_id: selectedUserId,
        book_copy_ids: selectedCopyIds,
        borrow_date: borrowDate.toISOString().split("T")[0],
        return_date: returnDate.toISOString().split("T")[0],
      });

      toast.success(response.data.message || "Borrow created successfully");
      router.push("/admin/borrows");
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to create borrow";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const availableBooks = useMemo(
    () =>
      books.filter(
        (book) =>
          book.copies &&
          book.copies.some((copy: BookCopy) => copy.status === "available"),
      ),
    [books],
  );

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)]">
      <div className="flex items-center justify-between pb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/admin/borrows")}
            className="h-8 w-8"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Create New Borrow</h1>
            <p className="text-muted-foreground">
              Select a user and books to create a new borrow
            </p>
          </div>
        </div>

        <Button
          onClick={handleSubmit}
          variant="submit"
          disabled={
            loading ||
            !selectedUserId ||
            selectedCopyIds.length === 0 ||
            !borrowDate ||
            !returnDate
          }
          loading={loading}
          className="h-8"
        >
          Create Borrow
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3 flex-1 overflow-hidden min-h-0">
        <div className="lg:col-span-1 space-y-6 overflow-y-auto scrollbar-hide">
          <UserSelectorCard
            users={users}
            selectedUserId={selectedUserId}
            onSelectUser={handleUserSelect}
            popoverOpen={userPopoverOpen}
            onPopoverOpenChange={setUserPopoverOpen}
          />

          <BookSelectorCard
            books={availableBooks}
            selectedBooks={selectedBooks}
            onBookToggle={handleBookToggle}
          />

          <BorrowDateCard value={borrowDate} onChange={handleBorrowDateChange} />

          <DueDateCard value={returnDate} onChange={handleReturnDateChange} />
        </div>

        <div className="lg:col-span-2 min-h-0">
          <BookCopySelectorCard
            selectedBooks={selectedBooks}
            selectedCopyIds={selectedCopyIds}
            onCopyToggle={handleCopyToggle}
          />
        </div>
      </div>
    </div>
  );
}
