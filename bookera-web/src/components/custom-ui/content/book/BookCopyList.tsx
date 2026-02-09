"use client";

import { Book } from "@/types/book";
import { bookCopyService } from "@/services/book-copy.service";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useState } from "react";
import DeleteConfirmDialog from "@/components/custom-ui/DeleteConfirmDialog";

export default function BookCopyList({
  book,
  onChange,
}: {
  book: Book;
  onChange: () => void;
}) {
  const [copyCode, setCopyCode] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const handleAdd = async (copy_code: string) => {
    await bookCopyService.create(book.id, copy_code);
    toast.success("Salinan ditambahkan");
    setCopyCode(""); // Reset input setelah berhasil
    onChange();
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    
    try {
      await bookCopyService.delete(deleteId);
      toast.success("Salinan dihapus");
      onChange();
      setDeleteId(null);
    } catch (error) {
      toast.error("Gagal menghapus salinan");
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="font-semibold">Salinan Buku</h2>

      <div className="flex gap-2">
        <Input 
          placeholder="Kode salinan" 
          value={copyCode}
          onChange={(e) => setCopyCode(e.target.value)}
        />
        <Button variant="submit" onClick={() => handleAdd(copyCode)}>Tambah Salinan</Button>
      </div>

      <ul className="space-y-2">
        {book.copies.map((copy) => (
          <li key={copy.id} className="flex justify-between border p-2 rounded">
            <span>
              {copy.copy_code} ({copy.status})
            </span>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => setDeleteId(copy.id)}
            >
              Hapus
            </Button>
          </li>
        ))}
      </ul>
      
      <DeleteConfirmDialog
        open={deleteId !== null}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Hapus Salinan Buku"
        description="Apakah kamu yakin ingin menghapus salinan buku ini? Data yang dihapus tidak dapat dikembalikan."
        onConfirm={confirmDelete}
      />
    </div>
  );
}
