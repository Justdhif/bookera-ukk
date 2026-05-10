"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { CheckCircle2, Package } from "lucide-react";
import { toast } from "sonner";
import ContentHeader from "@/components/custom-ui/content/ContentHeader";
import { StaggerContainer, FadeUp, FadeIn } from "@/components/custom-ui/motion";
import DataLoading from "@/components/custom-ui/DataLoading";
import { Card, CardContent } from "@/components/ui/card";
import { borrowService } from "@/services/borrow.service";
import { useAuthStore } from "@/store/auth.store";
import { Borrow } from "@/types/borrow";
import { BorrowBooksCard } from "./BorrowBooksCard";
import { BorrowFinesCard } from "./BorrowFinesCard";
import { BorrowInfoCard } from "./BorrowInfoCard";
import { BorrowQrCard } from "./BorrowQrCard";

export default function BorrowDetailClient() {
  const t = useTranslations("borrow");
  const tPublic = useTranslations("public");
  const router = useRouter();
  const params = useParams();
  const borrowCode = params.borrowCode as string;
  const userSlug = useAuthStore((state) => state.user?.slug);

  const [borrow, setBorrow] = useState<Borrow | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchBorrow = async () => {
    try {
      setLoading(true);
      const res = await borrowService.getByCode(borrowCode);
      setBorrow(res.data.data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || t("loadError"));
      router.push("/my-borrow");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchBorrow();
  }, [borrowCode]);

  const closedDescription = borrow
    ? t("borrowFinishedDesc", {
        date: new Date(borrow.updated_at).toLocaleString(),
      })
    : "";

  return (
    <StaggerContainer className="space-y-6">
      <ContentHeader
        title={t("detailTitle")}
        description={t("detailDescription")}
        showBackButton={true}
        onBack={() => router.push("/my-borrow")}
      />

      {loading ? (
        <DataLoading size="lg" />
      ) : !borrow ? (
        <FadeIn className="flex flex-col items-center justify-center min-h-[400px] text-muted-foreground italic bg-muted/30 rounded-3xl border-2 border-dashed">
          <Package className="h-10 w-10 mb-4 opacity-20" />
          {t("detailNotFound")}
        </FadeIn>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Sticky Sidebar */}
          <div className="lg:col-span-1 space-y-6 lg:sticky lg:top-6">
            <FadeUp delay={0.1}>
              <BorrowQrCard borrow={borrow} />
            </FadeUp>
            <FadeUp delay={0.15}>
              <BorrowInfoCard borrow={borrow} />
            </FadeUp>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <FadeUp delay={0.2}>
              <BorrowBooksCard borrow={borrow} onUpdate={fetchBorrow} />
            </FadeUp>

            {borrow.fines && borrow.fines.length > 0 && (
              <FadeUp delay={0.3}>
                <BorrowFinesCard fines={borrow.fines} />
              </FadeUp>
            )}

            {borrow.status === "close" && (
              <FadeUp delay={0.4}>
                <Card className="border-emerald-500/20 bg-emerald-500/5 dark:bg-emerald-500/10 shadow-sm border-2 overflow-hidden relative">
                  <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                    <CheckCircle2 className="h-32 w-32 text-emerald-500" />
                  </div>
                  <CardContent className="p-10 flex flex-col items-center justify-center text-center space-y-6 relative">
                    <div className="p-5 bg-background dark:bg-slate-900 rounded-3xl shadow-2xl text-emerald-500 border border-emerald-500/20">
                      <CheckCircle2 className="h-16 w-16" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-4xl font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-tighter">
                        {t("borrowFinishedTitle")}
                      </h3>
                      <p className="text-muted-foreground font-medium text-xl italic max-w-2xl">
                        {closedDescription}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </FadeUp>
            )}
          </div>
        </div>
      )}
    </StaggerContainer>
  );
}
