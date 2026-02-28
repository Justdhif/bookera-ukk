"use client";
import { useRouter } from "next/navigation";

import { useEffect, useState } from "react";
import { saveService } from "@/services/save.service";
import { bookService } from "@/services/book.service";
import { Save } from "@/types/save";
import { Book } from "@/types/book";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth.store";
import SaveHeader from "./SaveHeader";
import SaveBookList from "./SaveBookList";
import EditSaveDialog from "./EditSaveDialog";
import DeleteConfirmDialog from "@/components/custom-ui/DeleteConfirmDialog";
import { BorrowFromCollectionDialog } from "./BorrowFromCollectionDialog";
import { Loader2, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import SaveDetailSkeleton from "./SaveDetailSkeleton";

interface SaveDetailClientProps {
  saveIdentifier: string;
}

export default function SaveDetailClient({ saveIdentifier }: SaveDetailClientProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [save, setSave] = useState<Save | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedBooks, setSelectedBooks] = useState<number[]>([]);
  const [showBorrowDialog, setShowBorrowDialog] = useState(false);
  const [booksWithCopies, setBooksWithCopies] = useState<Book[]>([]);
  const [loadingCopies, setLoadingCopies] = useState(false);

  const fetchSave = async () => {
    try {
      const res = await saveService.getOne(saveIdentifier);
      setSave(res.data.data);
    } catch (error) {
      toast.error("Failed to load collection");
      router.push("/");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSave();
  }, [saveIdentifier]);

  const handleRemoveBook = async (bookId: number) => {
    if (!save) return;

    try {
      await saveService.removeBook(save.id, bookId);
      toast.success("Book removed from collection");
      fetchSave();
      window.dispatchEvent(new Event('refreshSavesList'));
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to remove book");
    }
  };

  const toggleBookSelection = (bookId: number) => {
    setSelectedBooks((prev) =>
      prev.includes(bookId)
        ? prev.filter((id) => id !== bookId)
        : [...prev, bookId]
    );
  };

  const handleBorrowClick = async () => {
    if (!isAuthenticated) {
      toast.error("Please login to borrow books");
      router.push("/login");
      return;
    }

    if (selectedBooks.length === 0) {
      toast.error("Please select at least one book");
      return;
    }

    setLoadingCopies(true);
    try {
      const booksData = await Promise.all(
        selectedBooks.map((bookId) => bookService.show(bookId))
      );
      setBooksWithCopies(booksData.map((res) => res.data.data));
      setShowBorrowDialog(true);
    } catch (error) {
      toast.error("Failed to load book details");
    } finally {
      setLoadingCopies(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!save) return;

    try {
      await saveService.delete(save.id);
      toast.success("Collection deleted successfully");
      window.dispatchEvent(new Event('refreshSavesList'));
      router.push("/");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete collection");
      throw error;
    }
  };

  if (loading) {
    return <SaveDetailSkeleton />;
  }

  if (!save) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6 max-w-7xl">
      <SaveHeader
        save={save}
        onEdit={() => setShowEditDialog(true)}
        onDelete={() => setShowDeleteDialog(true)}
        onBack={() => router.back()}
      />

      <SaveBookList
        books={save.books || []}
        selectedBooks={selectedBooks}
        onToggleBookSelection={toggleBookSelection}
        onRemoveBook={handleRemoveBook}
        borrowButton={
          save.books && save.books.length > 0 ? (
            <Button
              onClick={handleBorrowClick}
              disabled={selectedBooks.length === 0 || loadingCopies}
              size="sm"
            >
              {loadingCopies ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {"Loading..."}
                </>
              ) : (
                <>
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  {"Borrow Selected"} ({selectedBooks.length})
                </>
              )}
            </Button>
          ) : undefined
        }
      />

      <EditSaveDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        save={save}
        onSuccess={() => {
          fetchSave();
          window.dispatchEvent(new Event('refreshSavesList'));
        }}
      />

      <DeleteConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title={"Delete Collection"}
        description={`${"This will permanently delete the collection"} "${save.name}". ${"Failed to delete collection".includes('cannot') ? 'This action cannot be undone.' : ''}`}
        onConfirm={handleDeleteConfirm}
      />

      <BorrowFromCollectionDialog
        open={showBorrowDialog}
        onOpenChange={setShowBorrowDialog}
        selectedBooks={booksWithCopies}
        onSuccess={() => {
          setSelectedBooks([]);
          toast.success("Loan request created successfully");
        }}
      />
    </div>
  );
}
