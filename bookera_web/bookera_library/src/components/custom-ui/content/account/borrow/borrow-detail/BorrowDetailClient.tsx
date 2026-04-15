"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import ContentHeader from "@/components/custom-ui/content/ContentHeader";
import { useRouter, useParams } from "next/navigation";
import { borrowService } from "@/services/borrow.service";
import { Borrow } from "@/types/borrow";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth.store";
import DataLoading from "@/components/custom-ui/DataLoading";
import { BorrowQrCard } from "./BorrowQrCard";
import { BorrowInfoCard } from "./BorrowInfoCard";
import { BorrowBooksCard } from "./BorrowBooksCard";
import { BorrowFinesCard } from "./BorrowFinesCard";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";

export default function PublicBorrowDetailClient() {
  const t = useTranslations("public");
  const tBorrow = useTranslations("borrow");
  const router = useRouter();
  const params = useParams();
  const borrowCode = params.borrowCode as string;
  const userSlug = useAuthStore((state) => state.user?.slug);
   const [borrow, setBorrow] = useState<Borrow | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBorrow();
  }, [borrowCode]);

  const fetchBorrow = async () => {
    try {
      setLoading(true);
      const res = await borrowService.getByCode(borrowCode);
      setBorrow(res.data.data);
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to load borrow details"
      );
      router.push(userSlug ? `/${userSlug}/my-borrows` : "/my-borrows");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <DataLoading size="lg" />;
  if (!borrow) return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-muted-foreground italic">
      No borrow record found.
    </div>
  );

   return (
    <div className="space-y-6">
      <ContentHeader
        title={tBorrow("detailTitle")}
        description={tBorrow("detailDescription")}
        showBackButton
      />

      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="grid gap-6 lg:grid-cols-3">
          <BorrowQrCard borrow={borrow} />
          <BorrowInfoCard borrow={borrow} />
        </div>

        <BorrowBooksCard
          borrow={borrow}
          onUpdate={fetchBorrow}
        />

        {borrow.fines && borrow.fines.length > 0 && (
          <div className="animate-in fade-in slide-in-from-top-4 duration-500">
            <BorrowFinesCard fines={borrow.fines} />
          </div>
        )}

         {borrow.status === "close" && (
          <Card className="border-green-200 bg-green-50 shadow-sm border-2">
            <CardContent className="p-8 flex flex-col items-center justify-center text-center space-y-4">
              <div className="p-4 bg-white rounded-full shadow-md text-green-600 border border-green-100 animate-bounce">
                <CheckCircle2 className="h-12 w-12" />
              </div>
              <div className="space-y-1">
                <h3 className="text-3xl font-black text-green-900 uppercase tracking-tighter">
                  {tBorrow("borrowFinishedTitle")}
                </h3>
                <p className="text-green-800/80 font-medium text-lg italic">
                  {tBorrow("borrowFinishedDesc", { date: new Date(borrow.updated_at).toLocaleString() })}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
