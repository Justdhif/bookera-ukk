"use client";
import { useRouter } from "next/navigation";

import { useState, useEffect, useMemo, useCallback } from "react";
import { loanService } from "@/services/loan.service";
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
import UserSelectorCard from "./UserSelectorCard";

export default function CreateLoanClient() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [books, setBooks] = useState<Book[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  const [selectedBooks, setSelectedBooks] = useState<Book[]>([]);
  const [selectedCopyIds, setSelectedCopyIds] = useState<number[]>([]);
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [userPopoverOpen, setUserPopoverOpen] = useState(false);

  useEffect(() => {
    fetchBooks();
    fetchUsers();
    const defaultDate = new Date();
    defaultDate.setDate(defaultDate.getDate() + 7);
    setDueDate(defaultDate);
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

  const handleDueDateChange = useCallback((date: Date | undefined) => {
    setDueDate(date);
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

    if (!dueDate) {
      toast.error("Please select a due date");
      return;
    }

    try {
      setLoading(true);
      const response = await loanService.createAdminLoan({
        user_id: selectedUserId,
        book_copy_ids: selectedCopyIds,
        due_date: dueDate.toISOString().split("T")[0],
      });

      toast.success(response.data.message || "Loan created successfully");
      router.push("/admin/loans");
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to create loan";
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
            onClick={() => router.push("/admin/loans")}
            className="h-8 w-8"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Create New Loan</h1>
            <p className="text-muted-foreground">
              Select a user and books to create a new loan
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
            !dueDate
          }
          loading={loading}
          className="h-8"
        >
          Create Loan
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

          <DueDateCard value={dueDate} onChange={handleDueDateChange} />
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
