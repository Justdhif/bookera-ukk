"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/auth.store";
import { saveService } from "@/services/save.service";
import { SaveListItem } from "@/types/save";
import { Button } from "@/components/ui/button";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { BookMarked, Plus, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface AddToSaveButtonProps {
  bookId: number;
}

export default function AddToSaveButton({ bookId }: AddToSaveButtonProps) {
  const { isAuthenticated } = useAuthStore();
  const [showDialog, setShowDialog] = useState(false);
  const [saves, setSaves] = useState<SaveListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateNew, setShowCreateNew] = useState(false);
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [isCreating, setIsCreating] = useState(false);

  const fetchSaves = async () => {
    setLoading(true);
    try {
      const res = await saveService.getAll({ per_page: 50 });
      setSaves(res.data.data.data);
    } catch (error) {
      console.error("Failed to fetch saves:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (showDialog && isAuthenticated) {
      fetchSaves();
    }
  }, [showDialog, isAuthenticated]);

  const handleAddToSave = async (saveId: number) => {
    try {
      await saveService.addBook(saveId, bookId);
      toast.success("Book added to collection");
      setShowDialog(false);
      // Emit event to refresh SavesList
      window.dispatchEvent(new Event('refreshSavesList'));
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to add book to collection");
    }
  };

  const handleCreateAndAdd = async () => {
    if (!formData.name.trim()) {
      toast.error("Please enter a name for your collection");
      return;
    }

    setIsCreating(true);
    try {
      const res = await saveService.create(formData);
      const newSaveId = res.data.data.id;
      await saveService.addBook(newSaveId, bookId);
      toast.success("Collection created and book added");
      setShowDialog(false);
      setShowCreateNew(false);
      setFormData({ name: "", description: "" });
      // Emit event to refresh SavesList
      window.dispatchEvent(new Event('refreshSavesList'));
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create collection");
    } finally {
      setIsCreating(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowDialog(true)}
        className="gap-2"
      >
        <BookMarked className="h-4 w-4" />
        Add to Collection
      </Button>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add to Collection</DialogTitle>
          </DialogHeader>

          {!showCreateNew ? (
            <>
              <div className="py-4">
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2"
                  onClick={() => setShowCreateNew(true)}
                >
                  <Plus className="h-4 w-4" />
                  Create New Collection
                </Button>
              </div>

              <ScrollArea className="h-75 pr-4">
                <div className="space-y-2">
                  {loading ? (
                    <div className="text-center py-8 text-muted-foreground">
                      Loading collections...
                    </div>
                  ) : saves.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <BookMarked className="h-12 w-12 mx-auto mb-2 opacity-30" />
                      <p>No collections yet</p>
                      <Button
                        variant="link"
                        size="sm"
                        onClick={() => setShowCreateNew(true)}
                        className="mt-2"
                      >
                        Create your first collection
                      </Button>
                    </div>
                  ) : (
                    saves.map((save) => (
                      <button
                        key={save.id}
                        onClick={() => handleAddToSave(save.id)}
                        className={cn(
                          "w-full p-3 rounded-lg border text-left transition-all hover:border-primary hover:bg-accent",
                          "flex items-center justify-between gap-2"
                        )}
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{save.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {save.total_books} books
                          </p>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </ScrollArea>
            </>
          ) : (
            <>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    placeholder="e.g., My Favorites, To Read, etc."
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Optional description..."
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
                  onClick={() => setShowCreateNew(false)}
                  disabled={isCreating}
                >
                  Back
                </Button>
                <Button
                  variant="submit"
                  onClick={handleCreateAndAdd}
                  disabled={isCreating}
                >
                  {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isCreating ? "Creating..." : "Create & Add Book"}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
