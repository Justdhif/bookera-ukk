"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { saveService } from "@/services/save.service";
import { Save } from "@/types/save";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Edit, Trash2, BookMarked } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ContentLoadingScreen } from "@/components/ui/ContentLoadingScreen";

export default function SaveDetailPage() {
  const params = useParams();
  const router = useRouter();
  const saveId = Number(params.id);

  const [save, setSave] = useState<Save | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchSave = async () => {
    try {
      const res = await saveService.getOne(saveId);
      setSave(res.data.data);
      setFormData({
        name: res.data.data.name,
        description: res.data.data.description || "",
      });
    } catch (error) {
      toast.error("Failed to load collection");
      router.push("/");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSave();
  }, [saveId]);

  const handleUpdate = async () => {
    if (!formData.name.trim()) {
      toast.error("Please enter a name");
      return;
    }

    setIsUpdating(true);
    try {
      await saveService.update(saveId, formData);
      toast.success("Collection updated successfully");
      setShowEditDialog(false);
      fetchSave();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update collection");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await saveService.delete(saveId);
      toast.success("Collection deleted successfully");
      router.push("/");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete collection");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRemoveBook = async (bookId: number) => {
    try {
      await saveService.removeBook(saveId, bookId);
      toast.success("Book removed from collection");
      fetchSave();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to remove book");
    }
  };

  if (loading) {
    return <ContentLoadingScreen />;
  }

  if (!save) {
    return null;
  }

  return (
    <>
      <div className="container mx-auto px-6 py-6 max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          <Card>
            <CardHeader className="flex flex-row items-start justify-between space-y-0">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <BookMarked className="h-6 w-6 text-primary" />
                  <h1 className="text-3xl font-bold">{save.name}</h1>
                </div>
                {save.description && (
                  <p className="text-muted-foreground">{save.description}</p>
                )}
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>{save.total_books} books</span>
                  <span>•</span>
                  <span>
                    Created {format(new Date(save.created_at), "MMM d, yyyy")}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowEditDialog(true)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDeleteDialog(true)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </CardHeader>
          </Card>
        </div>

        {/* Books Grid */}
        <div>
          {save.books && save.books.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {save.books.map((book) => (
                <Card key={book.id} className="overflow-hidden">
                  <div className="aspect-2/3 relative">
                    <img
                      src={book.cover_image_url || "/placeholder-book.png"}
                      alt={book.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardContent className="p-4">
                    <h3
                      className="font-semibold line-clamp-2 cursor-pointer hover:text-primary"
                      onClick={() => router.push(`/books/${book.slug}`)}
                    >
                      {book.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {book.author}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full mt-3"
                      onClick={() => handleRemoveBook(book.id)}
                    >
                      Remove
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-12">
              <div className="text-center text-muted-foreground">
                <BookMarked className="h-16 w-16 mx-auto mb-4 opacity-30" />
                <p>No books in this collection yet</p>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Collection</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Name *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowEditDialog(false)}
              disabled={isUpdating}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdate} disabled={isUpdating}>
              {isUpdating ? "Updating..." : "Update"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the collection "{save.name}". This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
