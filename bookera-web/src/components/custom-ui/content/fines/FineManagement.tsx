"use client";

import { useEffect, useState } from "react";
import { Fine, FineType } from "@/types/fine";
import { fineService, fineTypeService } from "@/services/fine.service";
import FineTable from "./FineTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import DeleteConfirmDialog from "@/components/custom-ui/DeleteConfirmDialog";
import { FineTableSkeleton } from "./FineTableSkeleton";
import { Search } from "lucide-react";

export default function FineManagement() {
  const t = useTranslations('common');
  const tAdmin = useTranslations('admin');
  const [fines, setFines] = useState<Fine[]>([]);
  const [fineTypes, setFineTypes] = useState<FineType[]>([]);
  const [loading, setLoading] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const confirmDelete = async () => {
    if (!deleteId) return;

    try {
      await fineService.delete(deleteId);
      toast.success(t('fineDeleted'));
      setDeleteId(null);
      fetchFines();
    } catch (err: any) {
      toast.error(err.response?.data?.message || t('failedLoadFines'));
    }
  };

  const fetchFines = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (statusFilter !== "all") {
        params.status = statusFilter;
      }
      if (searchQuery) {
        params.search = searchQuery;
      }

      const res = await fineService.getAll(params);
      setFines(res.data.data);
    } catch (err) {
      toast.error(t('failedLoadFines'));
    } finally {
      setLoading(false);
    }
  };

  const fetchFineTypes = async () => {
    try {
      const res = await fineTypeService.getAll();
      setFineTypes(res.data.data);
    } catch (err) {
      console.error("Failed to fetch fine types");
    }
  };

  useEffect(() => {
    fetchFines();
    fetchFineTypes();
  }, []);

  useEffect(() => {
    fetchFines();
  }, [statusFilter, searchQuery]);

  const handleMarkAsPaid = async (id: number) => {
    try {
      await fineService.markAsPaid(id);
      toast.success(t('fineMarkedPaid'));
      fetchFines();
    } catch (err: any) {
      toast.error(err.response?.data?.message || t('failedToProcessPayment'));
    }
  };

  const handleWaive = async (id: number) => {
    try {
      await fineService.waive(id);
      toast.success(t('fineCancelled'));
      fetchFines();
    } catch (err: any) {
      toast.error(err.response?.data?.message || t('failedToWaiveFine'));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
        <div>
          <h2 className="text-2xl font-bold">{tAdmin('fines.finesTab')}</h2>
          <p className="text-muted-foreground">
            {tAdmin('fines.finesTabDescription')}
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('searchFines')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{tAdmin('fines.allStatus')}</SelectItem>
            <SelectItem value="unpaid">{tAdmin('fines.unpaid')}</SelectItem>
            <SelectItem value="paid">{tAdmin('fines.paid')}</SelectItem>
            <SelectItem value="waived">{tAdmin('fines.waived')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <FineTableSkeleton />
      ) : (
        <FineTable
          data={fines}
          onDelete={(id) => setDeleteId(id)}
          onMarkAsPaid={handleMarkAsPaid}
        />
      )}

      <DeleteConfirmDialog
        open={deleteId !== null}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title={t('deleteFine')}
        description={tAdmin('common.deleteFineWarning')}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
