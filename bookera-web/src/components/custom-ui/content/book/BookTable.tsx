"use client";
import { useRouter } from "next/navigation";

import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Book } from "@/types/book";
import EmptyState from "@/components/custom-ui/EmptyState";
import { BookOpen, Eye, Trash } from "lucide-react";
interface Props {
  data: Book[];
  onDelete: (id: number) => void;
}

export function BookTable({ data, onDelete }: Props) {
  const router = useRouter();

  if (data.length === 0) {
    return (
      <EmptyState
        title="No books found"
        description="Get started by adding your first book"
        icon={<BookOpen className="h-10 w-10" />}
      />
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 hover:bg-muted/50">
            <TableHead className="w-16 text-center font-semibold">#</TableHead>
            <TableHead className="w-24 font-semibold">Cover</TableHead>
            <TableHead className="font-semibold">Title</TableHead>
            <TableHead className="font-semibold">Author</TableHead>
            <TableHead className="font-semibold">ISBN</TableHead>
            <TableHead className="font-semibold">Publisher</TableHead>
            <TableHead className="font-semibold">Year</TableHead>
            <TableHead className="font-semibold">Status</TableHead>
            <TableHead className="font-semibold text-right pr-6">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {data.map((book, index) => (
            <TableRow
              key={book.id}
              className="group hover:bg-primary/5 transition-colors border-b last:border-b-0"
            >
              <TableCell className="font-medium text-center text-muted-foreground">
                {index + 1}
              </TableCell>
              <TableCell>
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
              </TableCell>
              <TableCell>
                <div className="flex flex-col gap-2">
                  <span className="font-medium text-foreground">
                    {book.title}
                  </span>
                  <Badge
                    variant={
                      book.available_copies && book.available_copies > 0
                        ? "default"
                        : "secondary"
                    }
                    className={
                      book.available_copies && book.available_copies > 0
                        ? "bg-brand-primary hover:bg-brand-primary-dark text-white text-xs"
                        : "text-xs"
                    }
                  >
                    {book.available_copies || 0}/{book.total_copies || 0}{" "}
                    available
                  </Badge>
                </div>
              </TableCell>
              <TableCell>
                <span className="text-muted-foreground">{book.author}</span>
              </TableCell>
              <TableCell>
                <span className="text-muted-foreground font-mono text-sm">
                  {book.isbn || "-"}
                </span>
              </TableCell>
              <TableCell>
                <span className="text-muted-foreground">
                  {book.publisher || "-"}
                </span>
              </TableCell>
              <TableCell>
                <span className="text-muted-foreground">
                  {book.publication_year || "-"}
                </span>
              </TableCell>
              <TableCell>
                <Badge
                  variant={book.is_active ? "default" : "secondary"}
                  className={`text-white ${
                    book.is_active
                      ? "bg-green-600 hover:bg-green-700"
                      : "bg-gray-500 hover:bg-gray-600"
                  }`}
                >
                  {book.is_active ? "Active" : "Inactive"}
                </Badge>
              </TableCell>
              <TableCell className="pr-6">
                <div className="flex justify-end items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => router.push(`/admin/books/${book.slug}`)}
                    className="h-8 gap-1"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">View</span>
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => onDelete(book.id)}
                    className="h-8 gap-1"
                  >
                    <Trash className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Delete</span>
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
