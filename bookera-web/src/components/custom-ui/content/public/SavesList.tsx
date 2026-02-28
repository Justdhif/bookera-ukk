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
                  className="h-14 w-14 rounded-lg"
                >
                  <LogIn className="h-6 w-6 text-muted-foreground" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>{"Login Required"}</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      );
    }

    return (
      <div className="h-full flex flex-col justify-center items-center px-6 py-8 text-center">
        <BookMarked className="h-16 w-16 mb-4 text-muted-foreground" />
        <h4 className="font-semibold text-foreground mb-2">{"Login Required"}</h4>
        <p className="text-sm text-muted-foreground mb-6">
          {"Sign in to create and manage your book collections"}
        </p>
        <Button
          onClick={() => router.push("/login")}
          className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-8"
        >
          <LogIn className="h-4 w-4" />
          {"Login to Continue"}
        </Button>
      </div>
    );
  }

  if (mode === "horizontal") {
    return (
      <div className="space-y-3 scrollbar-hide">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookMarked className="h-4 w-4 md:h-5 md:w-5 text-primary" />
            <h3 className="font-semibold text-sm md:text-base">{"My Collections"}</h3>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setShowCreateDialog(true)}
            className="gap-1.5 h-8 text-xs md:text-sm"
          >
            <Plus className="h-3 w-3 md:h-4 md:w-4" />
            <span className="hidden xs:inline">{"New"}</span>
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
              <p>{"No collections yet"}</p>
              <Button
                variant="link"
                size="sm"
                className="mt-1 h-auto p-0 text-xs md:text-sm"
                onClick={() => setShowCreateDialog(true)}
              >
                {"Create your first collection"}
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
                  <p>{"Create New Collection"}</p>
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
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-2">
            <Library className="h-5 w-5 text-muted-foreground" />
            <h3 className="font-semibold text-foreground">{"Your Library"}</h3>
          </div>

          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground hover:bg-accent rounded-full"
              onClick={() => setShowCreateDialog(true)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <ScrollArea className="flex-1 px-3">
          <div className="space-y-2 pb-4">
            {loading ? (
              <>
                {[1, 2, 3].map((i) => (
                  <div key={i} className="p-3 rounded-lg bg-muted/50">
                    <div className="flex gap-3">
                      <Skeleton className="w-12 h-16 rounded" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-3 w-3/4" />
                        <Skeleton className="h-2 w-1/2" />
                      </div>
                    </div>
                  </div>
                ))}
              </>
            ) : saves.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                <BookMarked className="h-12 w-12 mx-auto mb-2 opacity-30" />
                <p>{"No collections yet"}</p>
                <Button
                  variant="link"
                  size="sm"
                  className="mt-2"
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
                  className="p-3 rounded-lg bg-muted/50 hover:bg-accent cursor-pointer transition-colors group"
                >
                  <div className="flex gap-3">
                    {save.cover ? (
                      <div className="w-12 h-16 rounded overflow-hidden shrink-0">
                        <img
                          src={save.cover}
                          alt={save.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-12 h-16 bg-linear-to-br from-brand-primary to-brand-primary-dark rounded flex items-center justify-center shrink-0">
                        <BookMarked className="h-6 w-6 text-white" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground text-sm line-clamp-2 group-hover:text-primary transition-colors">
                        {save.name}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {save.total_books} {save.total_books === 1 ? "book" : "books"}
                      </p>
                    </div>
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
            <DialogTitle>{"Create New Collection"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name" variant="required">
                {"Name"}
              </Label>
              <Input
                id="name"
                placeholder={"e.g., My Favorites, To Read, etc."}
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">{"Description"}</Label>
              <Textarea
                id="description"
                placeholder={"Optional description..."}
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
              {"Cancel"}
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
