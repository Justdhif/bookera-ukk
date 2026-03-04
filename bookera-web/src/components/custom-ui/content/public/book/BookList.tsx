"use client";

import { Book } from "@/types/book";
import BookCard from "./BookCard";
import EmptyState from "@/components/custom-ui/EmptyState";
import { BookOpen } from "lucide-react";
import BookListSkeleton from "./BookListSkeleton";
interface Props {
  books: Book[];
  loading: boolean;
}

export default function BookList({ books, loading }: Props) {
  if (loading) return <BookListSkeleton />;

  if (!books.length) {
    return (
      <EmptyState
        title={"Books not found"}
        description={"Try different keywords or categories"}
        icon={<BookOpen className="h-10 w-10" />}
      />
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      {books.map((book) => (
        <BookCard key={book.id} book={book} />
      ))}
    </div>
  );
}
