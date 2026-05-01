"use client";

import { ITEMS_PER_PAGE_OPTIONS } from "@/constants/pagination";
import { useEffect, useState } from "react";
import ContentHeader from "@/components/custom-ui/content/ContentHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import DeleteConfirmDialog from "@/components/custom-ui/modal/DeleteConfirmDialog";
import PaginatedContent from "@/components/custom-ui/PaginatedContent";
import DataLoading from "@/components/custom-ui/DataLoading";
import { toast } from "sonner";
import { Plus, Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { Genre, GenreFilterParams } from "@/types/genre";
import { genreService } from "@/services/genre.service";
import GenreTable from "./GenreTable";
import GenreFormDialog from "./GenreFormDialog";
import { StaggerContainer, FadeUp } from "@/components/custom-ui/motion";

export default function GenreClient() {
  const t = useTranslations("genre");
  const [genres, setGenres] = useState<Genre[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Genre | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [filters, setFilters] = useState<GenreFilterParams>({
    per_page: ITEMS_PER_PAGE_OPTIONS[1],
  });
  const [searchInput, setSearchInput] = useState("");
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    total: 0,
    from: 0,
    to: 0,
  });

  useEffect(() => {
    const timeout = setTimeout(() => {
      setFilters((prev) => ({
        ...prev,
        search: searchInput || undefined,
        page: 1,
      }));
    }, 500);
    return () => clearTimeout(timeout);
  }, [searchInput]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setSearchInput(e.target.value);

  const confirmDelete = async () => {
    if (!deleteId) {
      toast.error(t("errorOccurred"));
      return;
    }
    await genreService.delete(deleteId);
    toast.success(t("deleteSuccess"));
    setDeleteId(null);
    fetchGenres(filters);
  };

  const fetchGenres = async (activeFilters: GenreFilterParams) => {
    setLoading(true);
    try {
      const res = await genreService.getAll(activeFilters);
      const paginatedData = res.data.data;
      setGenres(paginatedData.data ?? paginatedData);
      setPagination({
        current_page: paginatedData.current_page ?? 1,
        last_page: paginatedData.last_page ?? 1,
        total: paginatedData.total ?? 0,
        from: paginatedData.from ?? 0,
        to: paginatedData.to ?? 0,
      });
    } catch {
      toast.error(t("loadError"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGenres(filters);
  }, [filters]);

  return (
    <StaggerContainer className="space-y-6">
      <FadeUp>
        <ContentHeader
          title={t("title")}
          description={t("managementDesc")}
          isAdmin
          rightActions={
            <Button
              onClick={() => {
                setEditing(null);
                setOpen(true);
              }}
              variant="submit"
              className="h-8 gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              {t("addGenre")}
            </Button>
          }
        />
      </FadeUp>
      <FadeUp delay={0.1}>
        <div className="flex flex-col sm:flex-row items-center gap-3 mb-6">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("searchGenresPlaceholder")}
              value={searchInput}
              onChange={handleSearchChange}
              className="pl-9 h-11! w-full shadow-sm transition-all duration-300"
            />
          </div>
        </div>
      </FadeUp>
      <FadeUp delay={0.2}>
        <PaginatedContent
          currentPage={pagination.current_page}
          lastPage={pagination.last_page}
          total={pagination.total}
          from={pagination.from}
          to={pagination.to}
          onPageChange={(page) => setFilters((prev) => ({ ...prev, page }))}
        >
          {loading ? (
            <DataLoading size="lg" />
          ) : (
            <GenreTable
              data={genres}
              onEdit={(genre) => {
                setEditing(genre);
                setOpen(true);
              }}
              onDelete={(id) => setDeleteId(id)}
            />
          )}
        </PaginatedContent>
      </FadeUp>
      <DeleteConfirmDialog
        open={deleteId !== null}
        onOpenChange={() => setDeleteId(null)}
        title={t("deleteGenre")}
        description={t("deleteDesc")}
        onConfirm={confirmDelete}
      />
      <GenreFormDialog
        open={open}
        setOpen={setOpen}
        genre={editing}
        onSuccess={() => fetchGenres(filters)}
      />
    </StaggerContainer>
  );
}