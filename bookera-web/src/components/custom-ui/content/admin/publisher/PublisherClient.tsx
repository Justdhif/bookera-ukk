"use client";

import { useEffect, useState } from "react";
import { Publisher } from "@/types/publisher";
import { publisherService } from "@/services/publisher.service";
import PublisherTable from "./PublisherTable";
import PublisherFormDialog from "./publisher-add/PublisherFormDialog";
import PublisherDetailDialog from "./publisher-detail/PublisherDetailDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import DeleteConfirmDialog from "@/components/custom-ui/DeleteConfirmDialog";
import { PublisherTableSkeleton } from "./PublisherTableSkeleton";
import { Building2, Plus, Search } from "lucide-react";

export default function PublisherClient() {
  const [publishers, setPublishers] = useState<Publisher[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<any>(null);

  const [addOpen, setAddOpen] = useState(false);
  const [selectedPublisher, setSelectedPublisher] = useState<Publisher | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const fetchPublishers = async (params?: { search?: string; page?: number }) => {
    setLoading(true);
    try {
      const res = await publisherService.getAdminList({
        search: params?.search ?? search,
        per_page: 10,
        ...(params?.page ? { page: params.page } : { page }),
      } as any);
      setPublishers(res.data.data.data ?? res.data.data);
      setMeta(res.data.data.meta ?? res.data.data);
    } catch {
      toast.error("Failed to load publishers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPublishers();
  }, []);

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
    fetchPublishers({ search: value, page: 1 });
  };

  const handleView = (publisher: Publisher) => {
    setSelectedPublisher(publisher);
    setDetailOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await publisherService.delete(deleteId);
      toast.success("Publisher deleted successfully");
      setDeleteId(null);
      fetchPublishers();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete publisher");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-brand-primary rounded-lg">
            <Building2 className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Publishers</h1>
            <p className="text-muted-foreground">Manage book publishers</p>
          </div>
        </div>
        <Button
          onClick={() => setAddOpen(true)}
          variant="brand"
          className="h-8 gap-1"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Publisher
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search publishers..."
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Table */}
      {loading ? (
        <PublisherTableSkeleton />
      ) : (
        <PublisherTable
          data={publishers}
          onView={handleView}
          onDelete={(id) => setDeleteId(id)}
        />
      )}

      {/* Dialogs */}
      <PublisherFormDialog
        open={addOpen}
        setOpen={setAddOpen}
        onSuccess={fetchPublishers}
      />

      <PublisherDetailDialog
        open={detailOpen}
        setOpen={setDetailOpen}
        publisher={selectedPublisher}
        onSuccess={() => {
          fetchPublishers();
        }}
      />

      <DeleteConfirmDialog
        open={deleteId !== null}
        onOpenChange={() => setDeleteId(null)}
        title="Delete Publisher"
        description="Are you sure you want to delete this publisher? This action cannot be undone."
        onConfirm={confirmDelete}
      />
    </div>
  );
}
