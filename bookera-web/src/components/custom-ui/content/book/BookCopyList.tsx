"use client";

import { Book } from "@/types/book";
import { bookCopyService } from "@/services/book-copy.service";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useState } from "react";
import DeleteConfirmDialog from "@/components/custom-ui/DeleteConfirmDialog";
import { useTranslations } from "next-intl";

export default function BookCopyList({
  book,
  onChange,
}: {
  book: Book;
  onChange: () => void;
}) {
  const t = useTranslations('common');
  const [copyCode, setCopyCode] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const handleAdd = async (copy_code: string) => {
    await bookCopyService.create(book.id, copy_code);
    toast.success(t('copyAdded'));
    setCopyCode(""); // Reset input setelah berhasil
    onChange();
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    
    try {
      await bookCopyService.delete(deleteId);
      toast.success(t('copyDeleted'));
      onChange();
      setDeleteId(null);
    } catch (error) {
      toast.error(t('failedToDeleteCopy'));
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="font-semibold">{t('bookCopies')}</h2>

      <div className="flex gap-2">
        <Input 
          placeholder={t('copyCodePlaceholder')} 
          value={copyCode}
          onChange={(e) => setCopyCode(e.target.value)}
        />
        <Button variant="submit" onClick={() => handleAdd(copyCode)}>{t('addCopy')}</Button>
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
              {t('delete')}
            </Button>
          </li>
        ))}
      </ul>
      
      <DeleteConfirmDialog
        open={deleteId !== null}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title={t('deleteCopyTitle')}
        description={t('deleteCopyConfirm')}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
