"use client";

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
import { BookOpen, Eye } from "lucide-react";
import { useRouter } from "next/navigation";

interface Props {
  data: Book[];
  loading: boolean;
  onEdit: (book: Book) => void;
  onDelete: (id: number) => void;
}

export function BookTable({ data, loading, onEdit, onDelete }: Props) {
  const router = useRouter();

  if (loading) return <p>Loading...</p>;

  if (!loading && data.length === 0) {
    return (
      <EmptyState
        title="Belum ada buku"
        description="Silakan tambahkan buku terlebih dahulu"
        actionLabel="Tambah Buku"
        onAction={() => onEdit({} as Book)}
        icon={<BookOpen className="h-10 w-10" />}
      />
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>No</TableHead>
          <TableHead>Cover</TableHead>
          <TableHead>ID</TableHead>
          <TableHead>Judul</TableHead>
          <TableHead>Penulis</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Aksi</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {data.map((book, index) => (
          <TableRow key={book.id}>
            <TableCell>{index + 1}</TableCell>
            <TableCell>
              {book.cover_image_url ? (
                <img
                  src={book.cover_image_url}
                  className="w-10 h-14 object-cover rounded"
                />
              ) : (
                "-"
              )}
            </TableCell>
            <TableCell>{book.id}</TableCell>
            <TableCell>{book.title}</TableCell>
            <TableCell>{book.author}</TableCell>
            <TableCell>
              <Badge variant={book.is_active ? "default" : "secondary"}>
                {book.is_active ? "Aktif" : "Nonaktif"}
              </Badge>
            </TableCell>
            <TableCell className="text-right space-x-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => router.push(`/admin/books/${book.id}`)}
              >
                <Eye className="h-4 w-4 mr-1" />
                Detail
              </Button>
              <Button size="sm" variant="outline" onClick={() => onEdit(book)}>
                Edit
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => onDelete(book.id)}
              >
                Hapus
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
