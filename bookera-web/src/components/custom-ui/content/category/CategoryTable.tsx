"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Category } from "@/types/category";
import EmptyState from "@/components/custom-ui/EmptyState";
import { FolderOpen } from "lucide-react";

export default function CategoryTable({
  data,
  loading,
  onEdit,
  onDelete,
}: {
  data: Category[];
  loading: boolean;
  onEdit: (category: Category) => void;
  onDelete: (id: number) => void;
}) {
  if (loading) return <p>Loading...</p>;

  if (!loading && data.length === 0) {
    return (
      <EmptyState
        title="Belum ada kategori"
        description="Kategori akan muncul setelah kamu menambahkannya."
        icon={<FolderOpen className="h-10 w-10" />}
        actionLabel="Tambah Kategori"
        onAction={() => onEdit(null as any)}
      />
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>No</TableHead>
          <TableHead>Nama</TableHead>
          <TableHead className="text-right">Aksi</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {data.map((item, index) => (
          <TableRow key={item.id}>
            <TableCell>{index + 1}</TableCell>
            <TableCell>{item.name}</TableCell>
            <TableCell className="text-right space-x-2">
              <Button size="sm" variant="outline" onClick={() => onEdit(item)}>
                Edit
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => onDelete(item.id)}
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
