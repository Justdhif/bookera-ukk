"use client";

import { useEffect, useState } from "react";
import { Author, AuthorFilterParams } from "@/types/author";
import ContentHeader from "@/components/custom-ui/content/ContentHeader";
import { authorService } from "@/services/author.service";
import AuthorTable from "./AuthorTable";
import AuthorFormDialog from "./author-add/AuthorFormDialog";
import AuthorDetailDialog from "./author-detail/AuthorDetailDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import DeleteConfirmDialog from "@/components/custom-ui/modal/DeleteConfirmDialog";
import { Plus, Search, UserSquare } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import PaginatedContent from "@/components/custom-ui/PaginatedContent";
import { useTranslations } from "next-intl";
import DataLoading from "@/components/custom-ui/DataLoading";

export default function AuthorClient() {
  const t = useTranslations("author");
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<AuthorFilterParams>({ per_page: 10 });
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

  const statusValue =
    filters.is_active === undefined
      ? "all"
      : filters.is_active
        ? "active"
        : "inactive";

  const handleStatusChange = (value: string) =>
    setFilters((prev) => ({
      ...prev,
      is_active: value === "all" ? undefined : value === "active",
      page: 1,
    }));

  const [addOpen, setAddOpen] = useState(false);
  const [selectedAuthor, setSelectedAuthor] = useState<Author | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const fetchAuthors = async (activeFilters: AuthorFilterParams) => {
    setLoading(true);
    try {
      const res = await authorService.getAll(activeFilters, true);
      const paginatedData = res.data.data;
      setAuthors(paginatedData.data ?? paginatedData);
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
    fetchAuthors(filters);
  }, [filters]);

  const handleView = (author: Author) => {
    setSelectedAuthor(author);
    setDetailOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await authorService.delete(deleteId);
      toast.success(t("deleteSuccess"));
      setDeleteId(null);
      fetchAuthors(filters);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete author");
    }
  };

  return (
    <div className="space-y-6">
      <ContentHeader
        title={t("title")}
        description={t("description")}
        isAdmin
        rightActions={
          <Button
            onClick={() => setAddOpen(true)}
            variant="submit"
            className="h-8 gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            {t("addAuthor")}
          </Button>
        }
      />
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("searchAuthors")}
            value={searchInput}
            onChange={handleSearchChange}
            className="pl-9"
          />
        </div>
        <Select value={statusValue} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder={t("allStatus")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("allStatus")}</SelectItem>
            <SelectItem value="active">{t("active")}</SelectItem>
            <SelectItem value="inactive">{t("inactive")}</SelectItem>
          </SelectContent>
        </Select>
      </div>
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
          <AuthorTable
            data={authors}
            onView={handleView}
            onDelete={(id) => setDeleteId(id)}
          />
        )}
      </PaginatedContent>
      <AuthorFormDialog
        open={addOpen}
        setOpen={setAddOpen}
        onSuccess={() => fetchAuthors(filters)}
      />
      <AuthorDetailDialog
        open={detailOpen}
        setOpen={setDetailOpen}
        author={selectedAuthor}
        onSuccess={() => fetchAuthors(filters)}
      />
      <DeleteConfirmDialog
        open={deleteId !== null}
        onOpenChange={() => setDeleteId(null)}
        title={t("deleteAuthor")}
        description={t("deleteAuthorConfirm")}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
