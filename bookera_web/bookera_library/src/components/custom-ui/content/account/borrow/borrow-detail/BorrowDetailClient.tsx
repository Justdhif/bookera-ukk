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
          <Card className="border-emerald-500/20 bg-emerald-500/5 dark:bg-emerald-500/10 shadow-sm border-2 overflow-hidden relative">
            <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
              <CheckCircle2 className="h-32 w-32 text-emerald-500" />
            </div>
            <CardContent className="p-10 flex flex-col items-center justify-center text-center space-y-6 relative">
              <div className="p-5 bg-background dark:bg-slate-900 rounded-full shadow-2xl text-emerald-500 border border-emerald-500/20 animate-in zoom-in-50 duration-700">
                <CheckCircle2 className="h-16 w-16" />
              </div>
              <div className="space-y-2">
                <h3 className="text-4xl font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-tighter">
                  {tBorrow("borrowFinishedTitle")}
                </h3>
                <p className="text-muted-foreground font-medium text-xl italic max-w-2xl">
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
