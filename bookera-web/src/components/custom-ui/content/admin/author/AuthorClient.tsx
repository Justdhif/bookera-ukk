"use client";

import { useEffect, useState } from "react";
import { Author } from "@/types/author";
import { authorService } from "@/services/author.service";
import AuthorTable from "./AuthorTable";
import AuthorFormDialog from "./author-add/AuthorFormDialog";
import AuthorDetailDialog from "./author-detail/AuthorDetailDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import DeleteConfirmDialog from "@/components/custom-ui/DeleteConfirmDialog";
import { AuthorTableSkeleton } from "./AuthorTableSkeleton";
import { Plus, Search, UserSquare } from "lucide-react";

export default function AuthorClient() {
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<any>(null);

  const [addOpen, setAddOpen] = useState(false);
  const [selectedAuthor, setSelectedAuthor] = useState<Author | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const fetchAuthors = async (params?: { search?: string; page?: number }) => {
    setLoading(true);
    try {
      const res = await authorService.getAdminList({
        search: params?.search ?? search,
        per_page: 10,
        ...(params?.page ? { page: params.page } : { page }),
      } as any);
      setAuthors(res.data.data.data ?? res.data.data);
      setMeta(res.data.data.meta ?? res.data.data);
    } catch {
      toast.error("Failed to load authors");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuthors();
  }, []);

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
    fetchAuthors({ search: value, page: 1 });
  };

  const handleView = (author: Author) => {
    setSelectedAuthor(author);
    setDetailOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await authorService.delete(deleteId);
      toast.success("Author deleted successfully");
      setDeleteId(null);
      fetchAuthors();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete author");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-brand-primary rounded-lg">
            <UserSquare className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Authors</h1>
            <p className="text-muted-foreground">Manage book authors</p>
          </div>
        </div>
        <Button
          onClick={() => setAddOpen(true)}
          variant="brand"
          className="h-8 gap-1"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Author
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search authors..."
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Table */}
      {loading ? (
        <AuthorTableSkeleton />
      ) : (
        <AuthorTable
          data={authors}
          onView={handleView}
          onDelete={(id) => setDeleteId(id)}
        />
      )}

      {/* Dialogs */}
      <AuthorFormDialog
        open={addOpen}
        setOpen={setAddOpen}
        onSuccess={fetchAuthors}
      />

      <AuthorDetailDialog
        open={detailOpen}
        setOpen={setDetailOpen}
        author={selectedAuthor}
        onSuccess={() => {
          fetchAuthors();
        }}
      />

      <DeleteConfirmDialog
        open={deleteId !== null}
        onOpenChange={() => setDeleteId(null)}
        title="Delete Author"
        description="Are you sure you want to delete this author? This action cannot be undone."
        onConfirm={confirmDelete}
      />
    </div>
  );
}
