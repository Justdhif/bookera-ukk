"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

import { useEffect, useState } from "react";
import { saveService } from "@/services/save.service";
import { bookService } from "@/services/book.service";
import { Save } from "@/types/save";
import { Book } from "@/types/book";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth.store";
import SaveHeader from "./SaveHeader";
import BookList from "@/components/custom-ui/content/public/book/BookList";
import { Card } from "@/components/ui/card";
import EditSaveDialog from "./EditSaveDialog";
import DeleteConfirmDialog from "@/components/custom-ui/DeleteConfirmDialog";
import { BorrowFromCollectionDialog } from "./BorrowFromCollectionDialog";
import AddBooksToCollectionDialog from "./AddBooksToCollectionDialog";
import { Loader2, ShoppingCart, Plus, BookMarked, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import SaveDetailSkeleton from "./SaveDetailSkeleton";

interface SaveDetailClientProps {
  saveIdentifier: string;
}

export default function SaveDetailClient({
  saveIdentifier,
}: SaveDetailClientProps) {
    const t = useTranslations("public");
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [save, setSave] = useState<Save | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showBorrowDialog, setShowBorrowDialog] = useState(false);
  const [booksWithCopies, setBooksWithCopies] = useState<Book[]>([]);
  const [loadingCopies, setLoadingCopies] = useState(false);
  const [showAddBooksDialog, setShowAddBooksDialog] = useState(false);

  const fetchSave = async () => {
    try {
      const res = await saveService.getByIdentifier(saveIdentifier);
      setSave(res.data.data);
    } catch (error) {
      toast.error(t("detail.failedToLoad"));
      router.push("/");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSave();
  }, [saveIdentifier]);

  const handleBorrowClick = async () => {
    if (!isAuthenticated) {
      toast.error(t("detail.pleaseLogin"));
      router.push("/login");
      return;
    }

    if (!save?.books || save.books.length === 0) return;

    setLoadingCopies(true);
    try {
      const booksData = await Promise.all(
        save.books.map((book) => bookService.getById(book.id)),
      );
      setBooksWithCopies(booksData.map((res) => res.data.data));
      setShowBorrowDialog(true);
    } catch (error) {
      toast.error(t("detail.failedToLoadBooks"));
    } finally {
      setLoadingCopies(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!save) return;

    try {
      await saveService.delete(save.id);
      toast.success(t("detail.deleted"));
      window.dispatchEvent(new Event("refreshSavesList"));
      router.push("/");
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || t("detail.failedToDelete"),
      );
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

      <div className="space-y-4">
        <div className="flex gap-2">
          <Button
            onClick={() => setShowAddBooksDialog(true)}
            size="sm"
            variant="submit"
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Books
          </Button>
          {save.books && save.books.length > 0 && (
            <Button
              onClick={handleBorrowClick}
              disabled={loadingCopies}
              size="sm"
              variant="outline"
            >
                          <Eye className="w-4 h-4 mr-2" /> {loadingCopies ? (
                                          <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            {t("detail.loading")}
                                          </>
                                        ) : (
                                          <>
                                            <ShoppingCart className="h-4 w-4 mr-2" />
                                            {t("detail.borrowSelected")}
                                          </>
                                        )}
                      </Button>
          )}
        </div>

        {!save.books || save.books.length === 0 ? (
          <Card className="p-8 sm:p-12">
            <div className="text-center text-muted-foreground">
              <BookMarked className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-4 opacity-30" />
              <p className="text-sm sm:text-base mb-4">{t("detail.noBooksYet")}</p>
              <div className="flex justify-center">
                <Button
                  onClick={() => setShowAddBooksDialog(true)}
                  size="sm"
                  variant="submit"
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Books
                </Button>
              </div>
            </div>
          </Card>
        ) : (
          <BookList books={save.books} loading={false} />
        )}
      </div>

      <EditSaveDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        save={save}
        onSuccess={() => {
          fetchSave();
          window.dispatchEvent(new Event("refreshSavesList"));
        }}
      />

      <DeleteConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title={t("detail.deleteTitle")}
        description={`${t("detail.deleteConfirm")} "${save.name}". ${t("detail.failedToDelete").includes("cannot") ? "This action cannot be undone." : ""}`}
        onConfirm={handleDeleteConfirm}
      />

      <BorrowFromCollectionDialog
        open={showBorrowDialog}
        onOpenChange={setShowBorrowDialog}
        selectedBooks={booksWithCopies}
        onSuccess={() => {
          toast.success("Loan request created successfully");
        }}
      />

      <AddBooksToCollectionDialog
        open={showAddBooksDialog}
        onOpenChange={setShowAddBooksDialog}
        saveId={save.id}
        onSuccess={() => {
          fetchSave();
          window.dispatchEvent(new Event("refreshSavesList"));
        }}
      />
    </div>
  );
}
