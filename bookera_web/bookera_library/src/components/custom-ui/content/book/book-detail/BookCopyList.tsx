"use client";

import { Book } from "@/types/book";
import { bookCopyService } from "@/services/book-copy.service";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useState } from "react";
import { Trash } from "lucide-react";
import BookCopyStatusBadge from "@/components/custom-ui/badge/BookCopyStatusBadge";
import { useTranslations } from "next-intl";
import DeleteConfirmDialog from "@/components/custom-ui/modal/DeleteConfirmDialog";

export default function BookCopyList({
  book,
  onChange,
}: {
  book: Book;
  onChange: () => void;
}) {
  const t = useTranslations("book");
  const [copyCode, setCopyCode] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const handleAdd = async (copy_code: string) => {
    await bookCopyService.create(book.id, copy_code);
    toast.success(t("copyAddSuccess"));
    setCopyCode("");
    onChange();
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await bookCopyService.delete(deleteId);
      toast.success(t("copyDeleteSuccess"));
      onChange();
      setDeleteId(null);
    } catch (error) {
      toast.error(t("copyDeleteError"));
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="font-semibold">{t("bookCopies")}</h2>
      <div className="flex gap-2">
        <Input
          placeholder={t("enterCopyCodeShort")}
          value={copyCode}
          onChange={(e) => setCopyCode(e.target.value)}
        />
        <Button variant="brand" onClick={() => handleAdd(copyCode)}>
          {t("addCopy")}
        </Button>
      </div>
      <ul className="space-y-2">
        {book.copies?.map((copy) => (
          <li
            key={copy.id}
            className="flex items-center justify-between border rounded-xl p-3 bg-card/50 hover:bg-card transition-colors duration-200"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary font-bold text-xs">
                #{copy.copy_code.slice(-2)}
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-sm">{copy.copy_code}</span>
                <BookCopyStatusBadge status={copy.status} />
              </div>
            </div>
            <Button
              size="icon"
              variant="destructive"
              onClick={() => setDeleteId(copy.id)}
              className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash className="h-3.5 w-3.5" />
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => setDeleteId(copy.id)}
              className="h-8 gap-1 sm:flex hidden"
            >
              <Trash className="h-3.5 w-3.5" />
              {t("deleteCopy")}
            </Button>
          </li>
        ))}
      </ul>
      <DeleteConfirmDialog
        open={deleteId !== null}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title={t("deleteBookCopy")}
        description={t("deleteCopyDesc")}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
