"use client";

import { useRouter } from "next/navigation";
import ContentHeader from "@/components/custom-ui/content/ContentHeader";
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
import { useTranslations } from "next-intl";

export default function CreateBorrowClient() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [books, setBooks] = useState<Book[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [booksPage, setBooksPage] = useState(1);
  const [usersPage, setUsersPage] = useState(1);
  const [hasMoreBooks, setHasMoreBooks] = useState(true);
  const [hasMoreUsers, setHasMoreUsers] = useState(true);
  const [isLoadingBooks, setIsLoadingBooks] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [selectedBooks, setSelectedBooks] = useState<Book[]>([]);
  const [selectedCopyIds, setSelectedCopyIds] = useState<number[]>([]);
  const [borrowDate, setBorrowDate] = useState<Date | undefined>(undefined);
  const [returnDate, setReturnDate] = useState<Date | undefined>(undefined);
  const [userPopoverOpen, setUserPopoverOpen] = useState(false);

  const t = useTranslations("borrow");
  const tCommon = useTranslations("common");

  useEffect(() => {
    fetchBooks();
    fetchUsers();
    const today = new Date();
    setBorrowDate(today);
    const defaultReturn = new Date();
    defaultReturn.setDate(defaultReturn.getDate() + 7);
    setReturnDate(defaultReturn);
  }, []);

  const fetchBooks = async (page = 1) => {
    try {
      setIsLoadingBooks(true);
      const response = await bookService.getAll({ per_page: 10, page });
      const meta = response.data.data;
      const booksData = meta?.data || response.data.data;

      const newBooks = Array.isArray(booksData) ? booksData : [];
      setBooks((prev) => (page === 1 ? newBooks : [...prev, ...newBooks]));
      setHasMoreBooks(meta.current_page < meta.last_page);
      setBooksPage(page);
    } catch {
      toast.error(tCommon("failedToLoadBookList"));
    } finally {
      setIsLoadingBooks(false);
    }
  };

  const fetchUsers = async (page = 1) => {
    try {
      setIsLoadingUsers(true);
      const response = await userService.getAll({ per_page: 10, page });
      const meta = response.data.data;
      const usersData = meta?.data || response.data.data;

      const newUsers = Array.isArray(usersData) ? usersData : [];
      setUsers((prev) => (page === 1 ? newUsers : [...prev, ...newUsers]));
      setHasMoreUsers(meta.current_page < meta.last_page);
      setUsersPage(page);
    } catch {
      toast.error(tCommon("failedToLoadUserList"));
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const handleLoadMoreBooks = useCallback(() => {
    if (hasMoreBooks && !isLoadingBooks) {
      fetchBooks(booksPage + 1);
    }
  }, [hasMoreBooks, isLoadingBooks, booksPage]);

  const handleLoadMoreUsers = useCallback(() => {
    if (hasMoreUsers && !isLoadingUsers) {
      fetchUsers(usersPage + 1);
    }
  }, [hasMoreUsers, isLoadingUsers, usersPage]);

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
      toast.error(tCommon("userRequired"));
      return;
    }
    if (selectedCopyIds.length === 0) {
      toast.error(tCommon("selectAtLeastOneBookCopy"));
      return;
    }
    if (!borrowDate) {
      toast.error(tCommon("selectDate"));
      return;
    }
    if (!returnDate) {
      toast.error(tCommon("selectReturnDate"));
      return;
    }

    try {
      setLoading(true);
      const response = await borrowService.create(
        {
          user_id: selectedUserId,
          book_copy_ids: selectedCopyIds,
          borrow_date: borrowDate.toISOString().split("T")[0],
          return_date: returnDate.toISOString().split("T")[0],
        },
        true,
      );
      toast.success(response.data.message || tCommon("loanCreatedSuccessfully"));
      router.push("/admin/borrows");
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || tCommon("failedToCreateLoan");
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
    <div className="flex flex-col h-[calc(100vh-7rem)] space-y-6 pb-6">
      <ContentHeader
        title={t("createBorrowTitle")}
        description={t("createBorrowDesc")}
        showBackButton
        isAdmin
        rightActions={
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
            {t("createBorrow")}
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3 flex-1 overflow-hidden min-h-0">
        <div className="lg:col-span-1 space-y-6 overflow-y-auto scrollbar-hide">
          <UserSelectorCard
            users={users}
            selectedUserId={selectedUserId}
            onSelectUser={handleUserSelect}
            popoverOpen={userPopoverOpen}
            onPopoverOpenChange={setUserPopoverOpen}
            hasMore={hasMoreUsers}
            onLoadMore={handleLoadMoreUsers}
            isLoading={isLoadingUsers}
          />
          <BookSelectorCard
            books={availableBooks}
            selectedBooks={selectedBooks}
            onBookToggle={handleBookToggle}
            hasMore={hasMoreBooks}
            onLoadMore={handleLoadMoreBooks}
            isLoading={isLoadingBooks}
          />
          <BorrowDateCard
            value={borrowDate}
            onChange={handleBorrowDateChange}
          />
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
