"use client";

import { useTranslations } from "next-intl";
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
import { BookMarked, Plus, Loader2, Check } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import EmptyState from "@/components/custom-ui/EmptyState";

interface AddToSaveButtonProps {
  bookId: number;
}

export default function AddToSaveButton({ bookId }: AddToSaveButtonProps) {
  const t = useTranslations("public");
  const { isAuthenticated } = useAuthStore();
  const [showDialog, setShowDialog] = useState(false);
  const [saves, setSaves] = useState<SaveListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateNew, setShowCreateNew] = useState(false);
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [isCreating, setIsCreating] = useState(false);
  const [selectedSaveIds, setSelectedSaveIds] = useState<number[]>([]);
  const [isAdding, setIsAdding] = useState(false);

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

  const toggleSaveSelection = (saveId: number) =>
    setSelectedSaveIds((prev) =>
      prev.includes(saveId)
        ? prev.filter((id) => id !== saveId)
        : [...prev, saveId],
    );

  const handleConfirmAdd = async () => {
    if (selectedSaveIds.length === 0) return;
    setIsAdding(true);
    try {
      await Promise.all(
        selectedSaveIds.map((saveId) => saveService.addBook(saveId, bookId)),
      );
      toast.success(
        `${t("bookSaved")} ${selectedSaveIds.length} ${selectedSaveIds.length === 1 ? t("collection") : t("collections")}`,
      );
      setShowDialog(false);
      setSelectedSaveIds([]);
      window.dispatchEvent(new Event("refreshSavesList"));
    } catch (error: any) {
      toast.error(error.response?.data?.message || t("failedToAddBooks"));
    } finally {
      setIsAdding(false);
    }
  };

  const handleCreateAndAdd = async () => {
    if (!formData.name.trim()) {
      toast.error(t("nameRequired"));
      return;
    }

    setIsCreating(true);
    try {
      const res = await saveService.create(formData);
      const newSaveId = res.data.data.id;
      await saveService.addBook(newSaveId, bookId);
      toast.success(t("collectionCreatedAndAdded"));
      setShowDialog(false);
      setShowCreateNew(false);
      setFormData({ name: "", description: "" });
      window.dispatchEvent(new Event("refreshSavesList"));
    } catch (error: any) {
      toast.error(error.response?.data?.message || t("createFailed"));
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
        variant="submit"
        size="sm"
        onClick={() => setShowDialog(true)}
        className="gap-2"
      >
        <BookMarked className="h-4 w-4" />
        {t("addToCollection")}
      </Button>

      <Dialog
        open={showDialog}
        onOpenChange={(val) => {
          if (!val) setSelectedSaveIds([]);
          setShowDialog(val);
        }}
      >
        <DialogContent className="max-w-md p-0 flex flex-col max-h-[80vh]">
          <DialogHeader className="px-6 pt-5 pb-4 border-b shrink-0">
            <DialogTitle>{t("addToCollection")}</DialogTitle>
          </DialogHeader>

          {!showCreateNew ? (
            <div className="flex flex-col flex-1 min-h-0 px-6 py-4 gap-3 overflow-hidden">
              <Button
                variant="submit"
                className="w-full justify-start gap-2 shrink-0"
                onClick={() => setShowCreateNew(true)}
              >
                <Plus className="h-4 w-4" />
                {t("createNew")}
              </Button>

              <ScrollArea className="flex-1 min-h-0">
                <div className="space-y-1.5 pr-3">
                  {loading ? (
                    <div className="flex items-center justify-center py-10 text-muted-foreground gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm">{t("loadingCollections")}</span>
                    </div>
                  ) : saves.length === 0 ? (
                    <EmptyState
                      variant="compact"
                      icon={<BookMarked />}
                      title={t("noCollections")}
                      actionLabel={t("createFirst")}
                      onAction={() => setShowCreateNew(true)}
                    />
                  ) : (
                    saves.map((save) => {
                      const isSelected = selectedSaveIds.includes(save.id);
                      return (
                        <div
                          key={save.id}
                          role="button"
                          tabIndex={0}
                          onClick={() => toggleSaveSelection(save.id)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              toggleSaveSelection(save.id);
                            }
                          }}
                          className={cn(
                            "w-full p-3 rounded-lg border text-left transition-all cursor-pointer select-none",
                            "flex items-center gap-3",
                            isSelected
                              ? "border-primary bg-primary/5"
                              : "hover:border-primary/40 hover:bg-accent/40",
                          )}
                        >
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => toggleSaveSelection(save.id)}
                            onClick={(e) => e.stopPropagation()}
                            className="shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">
                              {save.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {save.total_books}{" "}
                              {save.total_books === 1 ? t("book") : t("books")}
                            </p>
                          </div>
                          {isSelected && (
                            <Check className="h-4 w-4 text-primary shrink-0" />
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </ScrollArea>

              {saves.length > 0 && (
                <DialogFooter className="gap-2 shrink-0 border-t pt-3">
                  <Button
                    variant="submit"
                    onClick={() => {
                      setSelectedSaveIds([]);
                      setShowDialog(false);
                    }}
                    disabled={isAdding}
                    className="flex-1"
                  >
                    {t("cancel")}
                  </Button>
                  <Button
                    variant="submit"
                    onClick={handleConfirmAdd}
                    disabled={selectedSaveIds.length === 0 || isAdding}
                    className="flex-1"
                  >
                    {isAdding ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t("saving")}
                      </>
                    ) : selectedSaveIds.length === 0 ? (
                      t("selectCollection")
                    ) : (
                      `${t("saveToCollectionsPrefix")} ${selectedSaveIds.length} ${selectedSaveIds.length === 1 ? t("collection") : t("collections")}`
                    )}
                  </Button>
                </DialogFooter>
              )}
            </div>
          ) : (
            <div className="px-6 pb-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">{t("name")} *</Label>
                <Input
                  id="name"
                  placeholder={t("namePlaceholder")}
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">{t("description")}</Label>
                <Textarea
                  id="description"
                  placeholder={t("descriptionPlaceholder")}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>

              <DialogFooter>
                <Button
                  variant="submit"
                  onClick={() => setShowCreateNew(false)}
                  disabled={isCreating}
                >
                  {t("detail.back")}
                </Button>
                <Button
                  variant="submit"
                  onClick={handleCreateAndAdd}
                  disabled={isCreating}
                >
                  {isCreating && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {isCreating ? t("creating") : t("createAndAdd")}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
