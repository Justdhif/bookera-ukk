"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

import { borrowService } from "@/services/borrow.service";
import { Borrow } from "@/types/borrow";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { BorrowDetailSkeleton } from "./BorrowDetailSkeleton";
import { BorrowQrCard } from "./BorrowQrCard";
import { BorrowInfoCard } from "./BorrowInfoCard";
import { BorrowBooksCard } from "./BorrowBooksCard";
import { BorrowAssignCopiesCard } from "./BorrowAssignCopiesCard";

export default function BorrowDetailClient() {
  const router = useRouter();
  const params = useParams();
  const borrowCode = params.borrowCode as string;

  const [borrow, setBorrow] = useState<Borrow | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBorrow();
  }, [borrowCode]);

  const fetchBorrow = async () => {
    try {
      setLoading(true);
      const res = await borrowService.showAdminByCode(borrowCode);
      setBorrow(res.data.data);
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to load borrow details",
      );
      router.push("/admin/borrows");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <BorrowDetailSkeleton />;
  if (!borrow) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="brand"
          size="icon"
          className="h-8 w-8"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Borrow Detail</h1>
          <p className="text-muted-foreground">
            Complete information about this borrow
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <BorrowQrCard borrow={borrow} />
        <BorrowInfoCard borrow={borrow} />
      </div>

      <BorrowBooksCard borrow={borrow} />

      {borrow.borrow_request_id &&
        (!borrow.borrow_details || borrow.borrow_details.length === 0) && (
          <BorrowAssignCopiesCard borrow={borrow} onAssigned={fetchBorrow} />
        )}
    </div>
  );
}
