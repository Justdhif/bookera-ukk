"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuthStore } from "@/store/auth.store";
import { saveService } from "@/services/save.service";
import { SaveListItem } from "@/types/save";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { BookMarked, Plus, LogIn, Library, Lock } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";
import SidebarLoadingSkeletons from "./saves-list/SidebarLoadingSkeletons";
import EmptyState from "@/components/custom-ui/EmptyState";
import SidebarSaveItem from "./saves-list/SidebarSaveItem";
import CollapsedSaveItem from "./saves-list/CollapsedSaveItem";
import CreateCollectionDialog from "./saves-list/CreateCollectionDialog";
import SidebarEmptyState from "./saves-list/SidebarEmptyState";

interface SavesListProps {
  mode?: "sidebar" | "horizontal";
  isCollapsed?: boolean;
}

export default function SavesList({
  mode = "sidebar",
  isCollapsed = false,
}: SavesListProps) {
  const t = useTranslations("public");
  const { isAuthenticated, initialLoading } = useAuthStore();
  const [saves, setSaves] = useState<SaveListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [isCreating, setIsCreating] = useState(false);

  const fetchSaves = async () => {
    if (!isAuthenticated) return;
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
    // Only fetch when initial loading is complete
    if (!initialLoading) {
      fetchSaves();
    }
    const handleRefreshSaves = () => fetchSaves();
    window.addEventListener("refreshSavesList", handleRefreshSaves);
    return () =>
      window.removeEventListener("refreshSavesList", handleRefreshSaves);
  }, [isAuthenticated, initialLoading]);

  const handleCreateSave = async () => {
    if (!formData.name.trim()) {
      toast.error(t("nameRequired"));
      return;
    }
    setIsCreating(true);
    try {
      await saveService.create(formData);
      toast.success(t("createSuccess"));
      setShowCreateDialog(false);
      setFormData({ name: "", description: "" });
      fetchSaves();
    } catch (error: any) {
      toast.error(error.response?.data?.message || t("createFailed"));
    } finally {
      setIsCreating(false);
    }
  };

  const dialogProps = {
    open: showCreateDialog,
    onOpenChange: setShowCreateDialog,
    formData,
    setFormData,
    isCreating,
    onSubmit: handleCreateSave,
  };

  // Show loading skeleton during initial authentication check
  if (initialLoading) {
    if (mode === "horizontal") return null;

    if (isCollapsed) {
      return (
        <div className="flex flex-col items-center py-6 gap-2">
          <Skeleton className="h-14 w-14 rounded-lg" />
        </div>
      );
    }

    return <SidebarLoadingSkeletons />;
  }

  if (!isAuthenticated) {
    if (mode === "horizontal") return null;

    if (isCollapsed) {
      return (
        <TooltipProvider>
          <div className="flex flex-col items-center py-6 gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Link href="/login">
                  <Button
                    size="icon"
                    variant="brand"
                    className="h-14 w-14 rounded-lg hover:bg-muted/60 dark:hover:bg-white/10"
                  >
                    <LogIn className="h-6 w-6 text-muted-foreground dark:text-white/60" />
                  </Button>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>{t("loginRequired")}</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      );
    }

    return (
      <EmptyState
        variant="compact"
        icon={<Lock />}
        title={t("loginRequired")}
        description={t("loginRequiredDesc")}
        linkLabel={t("loginToContinue")}
        linkHref="/login"
        className="h-full px-5 py-10"
      />
    );
  }

  if (mode === "horizontal") {
    return (
      <>
        <div className="space-y-3 scrollbar-hide">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookMarked className="h-4 w-4 md:h-5 md:w-5 text-brand-primary" />
              <h3 className="font-semibold text-sm md:text-base">
                {t("title")}
              </h3>
            </div>
            <Button
              size="sm"
              variant="submit"
              onClick={() => setShowCreateDialog(true)}
              className="gap-1.5 h-8 text-xs md:text-sm hover:text-brand-primary hover:bg-brand-primary/10"
            >
              <Plus className="h-3 w-3 md:h-4 md:w-4" />
              <span className="hidden xs:inline">{t("new")}</span>
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
            <EmptyState
              variant="compact"
              icon={<BookMarked />}
              title={t("noCollections")}
              actionLabel={t("createFirst")}
              onAction={() => setShowCreateDialog(true)}
            />
          ) : (
            <ScrollArea className="w-full">
              <div className="flex gap-2 md:gap-3 pb-2 -mx-4 px-4 md:mx-0 md:px-0">
                {saves.map((save) => (
                  <Link
                    key={save.id}
                    href={`/saves/${save.slug}`}
                    className="shrink-0 w-40 md:w-48"
                  >
                    <Card className="p-2.5 md:p-3 hover:border-primary transition-colors">
                      <div className="space-y-1.5 md:space-y-2">
                        <p className="font-medium text-xs md:text-sm line-clamp-1">
                          {save.name}
                        </p>
                        <p className="text-[10px] md:text-xs text-muted-foreground">
                          {save.total_books}{" "}
                          {save.total_books === 1 ? t("book") : t("books")}
                        </p>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>

        <CreateCollectionDialog {...dialogProps} />
      </>
    );
  }

  if (isCollapsed) {
    return (
      <TooltipProvider>
        <div className="flex flex-col items-center pt-4 pb-2">
          <div className="flex flex-col items-center gap-2 py-1 w-full">
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
                    variant="outline"
                    onClick={() => setShowCreateDialog(true)}
                    className="h-8 w-8 rounded-lg"
                  >
                    <Plus className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>{t("createNew")}</p>
                </TooltipContent>
              </Tooltip>
            ) : (
              saves.map((save) => (
                <CollapsedSaveItem key={save.id} save={save} />
              ))
            )}
          </div>
        </div>

        <CreateCollectionDialog {...dialogProps} />
      </TooltipProvider>
    );
  }

  return (
    <>
      <div className="flex flex-col">
        <div className="flex items-center justify-between px-4 pt-3 pb-2">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-brand-primary/10 dark:bg-brand-primary/20">
              <Library className="h-3.5 w-3.5 text-brand-primary dark:text-brand-primary-light" />
            </div>
            <h3 className="text-xs font-semibold text-foreground dark:text-white">
              {t("yourCollections")}
            </h3>
          </div>

          <Button
            size="sm"
            variant="outline"
            className="h-7 w-7 p-0 text-muted-foreground dark:text-white/70 hover:text-brand-primary dark:hover:text-brand-primary-light hover:bg-brand-primary/10 dark:hover:bg-brand-primary/20 rounded-lg transition-colors"
            onClick={() => setShowCreateDialog(true)}
          >
            <Plus className="h-3.5 w-3.5" />
          </Button>
        </div>

        <div className="px-3 pb-3">
          <div className="space-y-1.5 pt-1">
            {loading ? (
              <SidebarLoadingSkeletons />
            ) : saves.length === 0 ? (
              <SidebarEmptyState
                onCreateClick={() => setShowCreateDialog(true)}
              />
            ) : (
              saves.map((save) => <SidebarSaveItem key={save.id} save={save} />)
            )}
          </div>
        </div>
      </div>

      <CreateCollectionDialog {...dialogProps} />
    </>
  );
}
