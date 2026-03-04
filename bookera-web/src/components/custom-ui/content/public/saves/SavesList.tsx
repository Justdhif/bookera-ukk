"use client";
import { useRouter } from "next/navigation";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/auth.store";
import { saveService } from "@/services/save.service";
import { SaveListItem } from "@/types/save";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BookMarked, Plus, LogIn, Library, Loader2 } from "lucide-react";
import SaveCard from "./SaveCard";
import { Skeleton } from "@/components/ui/skeleton";
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
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SavesListProps {
  mode?: "sidebar" | "horizontal";
  isCollapsed?: boolean;
}

export default function SavesList({ mode = "sidebar", isCollapsed = false }: SavesListProps) {
  const { isAuthenticated } = useAuthStore();
  const [saves, setSaves] = useState<SaveListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [isCreating, setIsCreating] = useState(false);
  const router = useRouter();
  const fetchSaves = async () => {
    if (!isAuthenticated) {
      return;
    }

    setLoading(true);
    try {
      const res = await saveService.getAll({ per_page: 20 });
      setSaves(res.data.data.data);
    } catch (error) {
      console.error("Failed to fetch saves:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSaves();
    const handleRefreshSaves = () => {
      fetchSaves();
    };

    window.addEventListener('refreshSavesList', handleRefreshSaves);

    return () => {
      window.removeEventListener('refreshSavesList', handleRefreshSaves);
    };
  }, [isAuthenticated]);

  const handleCreateSave = async () => {
    if (!formData.name.trim()) {
      toast.error("Please enter a name for your collection");
      return;
    }

    setIsCreating(true);
    try {
      await saveService.create(formData);
      toast.success("Collection created successfully");
      setShowCreateDialog(false);
      setFormData({ name: "", description: "" });
      fetchSaves();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create collection");
    } finally {
      setIsCreating(false);
    }
  };

  if (!isAuthenticated) {
    if (mode === "horizontal") {
      return null;
    }

    if (isCollapsed) {
      return (
        <TooltipProvider>
          <div className="flex flex-col items-center py-6 gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => router.push("/login")}
                  className="h-14 w-14 rounded-lg hover:bg-muted/60 dark:hover:bg-white/10"
                >
                  <LogIn className="h-6 w-6 text-muted-foreground dark:text-white/60" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>Login Required</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      );
    }

    return (
      <div className="h-full flex flex-col justify-center items-center px-5 py-10 text-center">
        <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-primary/10 dark:bg-brand-primary/15 ring-1 ring-brand-primary/20 dark:ring-brand-primary/25">
          <BookMarked className="h-8 w-8 text-brand-primary dark:text-brand-primary-light" />
        </div>
        <h4 className="font-semibold text-foreground dark:text-white mb-1 text-sm">Login Required</h4>
        <p className="text-xs text-muted-foreground dark:text-white/60 mb-5 leading-relaxed">
          Sign in to create and manage your book collections
        </p>
        <Button
          onClick={() => router.push("/login")}
          className="gap-2 bg-brand-primary hover:bg-brand-primary-dark text-white rounded-xl px-6 h-9 text-sm font-semibold shadow-sm shadow-brand-primary/20"
        >
          <LogIn className="h-3.5 w-3.5" />
          Login to Continue
        </Button>
      </div>
    );
  }

  if (mode === "horizontal") {
    return (
      <div className="space-y-3 scrollbar-hide">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookMarked className="h-4 w-4 md:h-5 md:w-5 text-brand-primary" />
            <h3 className="font-semibold text-sm md:text-base">My Collections</h3>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setShowCreateDialog(true)}
            className="gap-1.5 h-8 text-xs md:text-sm hover:text-brand-primary hover:bg-brand-primary/10"
          >
            <Plus className="h-3 w-3 md:h-4 md:w-4" />
            <span className="hidden xs:inline">New</span>
          </Button>
        </div>

        {loading ? (
          <div className="flex gap-2 md:gap-3 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="shrink-0 w-40 md:w-48 p-2.5 md:p-3">
                <div className="space-y-2">
                  <Skeleton className="h-3.5 md:h-4 w-3/4" />
                  <Skeleton className="h-2.5 md:h-3 w-1/2" />
                </div>
              </Card>
            ))}
          </div>
        ) : saves.length === 0 ? (
          <Card className="p-3 md:p-4">
            <div className="text-center text-xs md:text-sm text-muted-foreground">
              <p>No collections yet</p>
              <Button
                variant="link"
                size="sm"
                className="mt-1 h-auto p-0 text-xs md:text-sm text-brand-primary hover:text-brand-primary-dark"
                onClick={() => setShowCreateDialog(true)}
              >
                Create your first collection
              </Button>
            </div>
          </Card>
        ) : (
          <ScrollArea className="w-full">
            <div className="flex gap-2 md:gap-3 pb-2 -mx-4 px-4 md:mx-0 md:px-0">
              {saves.map((save) => (
                <div
                  key={save.id}
                  onClick={() => router.push(`/saves/${save.slug}`)}
                  className="shrink-0 w-40 md:w-48 cursor-pointer"
                >
                  <Card className="p-2.5 md:p-3 hover:border-primary transition-colors">
                    <div className="space-y-1.5 md:space-y-2">
                      <p className="font-medium text-xs md:text-sm line-clamp-1">
                        {save.name}
                      </p>
                      <p className="text-[10px] md:text-xs text-muted-foreground">
                        {save.total_books} {save.total_books === 1 ? "book" : "books"}
                      </p>
                    </div>
                  </Card>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </div>
    );
  }
  if (isCollapsed) {
    return (
      <TooltipProvider>
        <div className="h-full flex flex-col items-center pt-4 pb-2">
          <ScrollArea className="flex-1 w-full">
            <div className="flex flex-col items-center gap-2 py-1">
            {loading ? (
              <>
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-12 w-12 rounded-lg" />
                ))}
              </>
            ) : saves.length === 0 ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    variant="brand"
                    onClick={() => setShowCreateDialog(true)}
                    className="h-8 w-8 rounded-lg"
                  >
                    <Plus className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>Create New Collection</p>
                </TooltipContent>
              </Tooltip>
            ) : (
              saves.map((save) => (
                <Tooltip key={save.id}>
                  <TooltipTrigger asChild>
                    {save.cover ? (
                      <div
                        onClick={() => router.push(`/saves/${save.slug}`)}
                        className="w-12 h-16 rounded-lg overflow-hidden shrink-0 cursor-pointer hover:ring-2 hover:ring-primary transition-all"
                      >
                        <img
                          src={save.cover}
                          alt={save.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div
                        onClick={() => router.push(`/saves/${save.slug}`)}
                        className="w-12 h-16 rounded-lg bg-linear-to-br from-brand-primary to-brand-primary-dark flex items-center justify-center shrink-0 cursor-pointer hover:ring-2 hover:ring-primary transition-all"
                      >
                        <BookMarked className="h-5 w-5 text-white" />
                      </div>
                    )}
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p className="font-medium">{save.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {save.total_books} {save.total_books === 1 ? "book" : "books"}
                    </p>
                  </TooltipContent>
                </Tooltip>
              ))
            )}
            </div>
          </ScrollArea>
        </div>
      </TooltipProvider>
    );
  }

  return (
    <>
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between px-4 pt-3 pb-2">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-brand-primary/10 dark:bg-brand-primary/20">
              <Library className="h-3.5 w-3.5 text-brand-primary dark:text-brand-primary-light" />
            </div>
            <h3 className="text-xs font-semibold text-foreground dark:text-white">Your Collections</h3>
          </div>

          <Button
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0 text-muted-foreground dark:text-white/70 hover:text-brand-primary dark:hover:text-brand-primary-light hover:bg-brand-primary/10 dark:hover:bg-brand-primary/20 rounded-lg transition-colors"
            onClick={() => setShowCreateDialog(true)}
          >
            <Plus className="h-3.5 w-3.5" />
          </Button>
        </div>

        <ScrollArea className="flex-1 px-3">
          <div className="space-y-1.5 pb-4 pt-1">
            {loading ? (
              <>
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-3 p-2.5 rounded-xl bg-muted/50 dark:bg-white/8">
                    <Skeleton className="w-12 h-16 rounded-lg shrink-0 bg-muted/80 dark:bg-white/20" />
                    <div className="flex-1 space-y-2 py-1">
                      <Skeleton className="h-3 w-3/4 bg-muted/80 dark:bg-white/20" />
                      <Skeleton className="h-2.5 w-1/3 bg-muted/60 dark:bg-white/15" />
                    </div>
                  </div>
                ))}
              </>
            ) : saves.length === 0 ? (
              <div className="py-10 text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-primary/10 dark:bg-brand-primary/15">
                  <BookMarked className="h-6 w-6 text-brand-primary/60 dark:text-brand-primary-light/60" />
                </div>
                <p className="text-xs font-medium text-muted-foreground dark:text-white/60 mb-1">No collections yet</p>
                <Button
                  variant="link"
                  size="sm"
                  className="h-auto p-0 text-xs text-brand-primary hover:text-brand-primary-dark dark:hover:text-brand-primary-light"
                  onClick={() => setShowCreateDialog(true)}
                >
                  {"Create your first collection"}
                </Button>
              </div>
            ) : (
              saves.map((save) => (
                <div
                  key={save.id}
                  onClick={() => router.push(`/saves/${save.slug}`)}
                  className="group flex gap-3 rounded-xl p-2.5 cursor-pointer transition-all bg-muted/40 dark:bg-white/8 hover:bg-brand-primary/5 dark:hover:bg-brand-primary/10 border border-border dark:border-white/10 hover:border-brand-primary/30 dark:hover:border-brand-primary/30 hover:shadow-sm"
                >
                  {save.cover ? (
                    <div className="w-12 h-16 rounded-lg overflow-hidden shrink-0 shadow-sm ring-1 ring-border dark:ring-white/15">
                      <img
                        src={save.cover}
                        alt={save.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-12 h-16 bg-linear-to-br from-brand-primary/15 to-brand-primary/5 dark:from-brand-primary/25 dark:to-brand-primary/10 rounded-lg flex items-center justify-center shrink-0 ring-1 ring-brand-primary/20 dark:ring-brand-primary/25">
                      <BookMarked className="h-5 w-5 text-brand-primary dark:text-brand-primary-light" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0 flex flex-col justify-center gap-0.5">
                    <p className="font-medium text-foreground dark:text-white text-[13px] line-clamp-2 leading-snug group-hover:text-foreground dark:group-hover:text-white transition-colors">
                      {save.name}
                    </p>
                    <div className="flex items-center gap-1">
                      <div className="h-1 w-1 rounded-full bg-muted-foreground/40 dark:bg-white/40" />
                      <p className="text-[11px] text-muted-foreground dark:text-white/55">
                        {save.total_books} {save.total_books === 1 ? "book" : "books"}
                      </p>
                    </div>
                  </div>
                  <div className="self-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <svg className="h-3.5 w-3.5 text-brand-primary dark:text-brand-primary-light" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Collection</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name" variant="required">
                Name
              </Label>
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
              onClick={() => setShowCreateDialog(false)}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button
              variant="submit"
              onClick={handleCreateSave}
              disabled={isCreating || !formData.name.trim()}
            >
              {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isCreating ? "Creating..." : "Create Collection"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
