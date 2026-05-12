"use client";

import { useEffect, useState, Suspense, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { membershipService } from "@/services/membership.service";
import { fineService } from "@/services/fine.service";
import { useAuthStore } from "@/store/auth.store";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  Clock,
  ArrowRight,
  Printer,
  Download,
  Receipt,
  ShieldCheck,
  Mail,
  User,
  Calendar,
  Hash,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { MemberBadgeIcon } from "@/components/custom-ui/badge/MemberBadge";
import { setCookie } from "cookies-next";
import { formatCurrency } from "@/lib/utils";
import { WallpaperPattern } from "@/components/custom-ui/WallpaperPattern";
import { motion, AnimatePresence } from "framer-motion";
import ContentHeader from "@/components/custom-ui/content/ContentHeader";
import {
  FadeIn,
  SlideIn,
  BlurIn,
  StaggerContainer,
} from "@/components/custom-ui/motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import DataLoading from "@/components/custom-ui/DataLoading";

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, setUser } = useAuthStore();
  const t = useTranslations("payment");
  const invoiceRef = useRef<HTMLDivElement>(null);

  const orderIdParam = searchParams.get("order_id");
  const type = searchParams.get("type") || "membership";
  const id = searchParams.get("id");
  const isPending = searchParams.get("status") === "pending";

  const [checking, setChecking] = useState(true);
  const [dbStatus, setDbStatus] = useState<string | null>(null);
  const [transactionData, setTransactionData] = useState<any>(null);

  useEffect(() => {
    let attempts = 0;
    const maxAttempts = 15;

    const check = async () => {
      try {
        let currentStatus = null;
        let data = null;

        if (type === "membership") {
          const res = await membershipService.checkStatus();
          data = res.data.data;
          currentStatus = data.transaction?.status || null;

          if (data.is_member && user && user.role !== "member") {
            setUser({ ...user, role: "member" });
            setCookie("role", "member", { maxAge: 60 * 60 * 24, path: "/" });
          }
          setTransactionData(data.transaction);
        } else if (type === "fine" && id) {
          const res = await fineService.checkStatus(Number(id));
          data = res.data.data;
          currentStatus = data.fine.status;
          setTransactionData(data.fine);
        }

        setDbStatus(currentStatus);

        if (currentStatus === "paid" || currentStatus === "failed") {
          setChecking(false);
          return true;
        }
      } catch (error) {
        console.error("Polling error:", error);
      }

      attempts++;
      if (attempts >= maxAttempts) {
        setChecking(false);
        return true;
      }
      return false;
    };

    check();

    const interval = setInterval(async () => {
      const shouldStop = await check();
      if (shouldStop) {
        clearInterval(interval);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [user, setUser, type, id]);

  const handlePrint = () => {
    window.print();
  };

  const showPending = isPending || dbStatus === "pending" || checking;
  const isSuccess = dbStatus === "paid";
  const isAdmin =
    typeof window !== "undefined" &&
    window.location.pathname.startsWith("/admin");

  const displayOrderId =
    transactionData?.order_id ||
    orderIdParam ||
    (id ? (type === "fine" ? `FINE-${id}` : `MBR-${id}`) : "---");

  return (
    <div className="space-y-8">
      <ContentHeader
        title={isSuccess ? t("successTitle") : t("invoiceTitle")}
        description={t("invoiceDesc")}
        showBackButton
        rightActions={
          <div className="flex items-center gap-2">
            <Button variant="brand" onClick={handlePrint} className="h-8 gap-1">
              <Printer className="w-3.5 h-3.5" />
              {t("print")}
            </Button>
            <Button variant="brand" onClick={handlePrint} className="h-8 gap-1">
              <Download className="w-3.5 h-3.5" />
              {t("download")}
            </Button>
          </div>
        }
      />

      {showPending ? (
        <DataLoading
          size="lg"
          className="min-h-[60vh] border-0 bg-transparent"
        />
      ) : !isSuccess && !checking ? (
        <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 space-y-6">
          <div className="w-24 h-24 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center shadow-xl">
            <CheckCircle2 className="w-12 h-12 text-red-500" />
          </div>
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-black">{t("errorTitle")}</h1>
            <p className="text-muted-foreground">{t("errorDescription")}</p>
            <Link href={isAdmin ? "/admin" : "/home"}>
              <Button variant="outline" className="mt-4">
                Kembali
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-5 lg:sticky lg:top-4">
              <StaggerContainer>
                <FadeIn>
                  <Card className="p-8 rounded-[2rem] border-2 border-brand-primary/10 shadow-xl shadow-brand-primary/5 relative overflow-hidden bg-card/50 backdrop-blur-sm">
                    <WallpaperPattern className="opacity-[0.7] pointer-events-none" />
                    <div className="relative z-10 space-y-10">
                      <div className="space-y-6">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 rounded-2xl bg-green-500/10 flex items-center justify-center">
                            <CheckCircle2 className="w-10 h-10 text-green-500" />
                          </div>
                          <div>
                            <h2 className="text-2xl font-black text-foreground">
                              {isSuccess
                                ? t("paymentSuccess")
                                : t("paymentVerified")}
                            </h2>
                            <p className="text-muted-foreground font-medium">
                              #{displayOrderId}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-4 pt-2">
                          <div className="flex justify-between items-center py-3 border-b border-dashed">
                            <span className="text-muted-foreground font-medium">
                              {t("status")}
                            </span>
                            <Badge className="bg-green-500 hover:bg-green-600 text-white font-bold rounded-full">
                              {t("paid")}
                            </Badge>
                          </div>
                          <div className="flex justify-between items-center py-3 border-b border-dashed">
                            <span className="text-muted-foreground font-medium">
                              {t("date")}
                            </span>
                            <span className="font-bold text-foreground">
                              {transactionData?.paid_at
                                ? new Date(
                                    transactionData.paid_at,
                                  ).toLocaleDateString("id-ID", {
                                    day: "numeric",
                                    month: "long",
                                    year: "numeric",
                                  })
                                : new Date().toLocaleDateString("id-ID", {
                                    day: "numeric",
                                    month: "long",
                                    year: "numeric",
                                  })}
                            </span>
                          </div>
                          <div className="flex justify-between items-center py-3 border-b border-dashed">
                            <span className="text-muted-foreground font-medium">
                              {t("method")}
                            </span>
                            <span className="font-bold text-foreground uppercase">
                              {transactionData?.payment_type || "Midtrans"}
                            </span>
                          </div>
                          <div className="flex justify-between items-center pt-3">
                            <span className="text-muted-foreground font-medium">
                              {t("total")}
                            </span>
                            <span className="text-2xl font-black text-brand-primary">
                              {formatCurrency(transactionData?.amount || 0)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <Separator className="bg-brand-primary/10" />

                      <div className="space-y-6">
                        <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground">
                          {t("customerInfo")}
                        </h3>
                        <div className="flex items-center gap-4">
                          <Avatar className="w-14 h-14 border-2 border-brand-primary/20">
                            <AvatarImage
                              src={user?.profile?.avatar}
                              alt={user?.profile?.full_name || "User"}
                            />
                            <AvatarFallback className="bg-brand-primary/10 text-brand-primary font-black text-xl">
                              {user?.profile?.full_name?.charAt(0) ||
                                user?.email?.charAt(0) ||
                                "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-black text-lg">
                              {user?.profile?.full_name || user?.email}
                            </p>
                            <p className="text-muted-foreground text-sm flex items-center gap-1">
                              <Mail className="w-3.5 h-3.5" /> {user?.email}
                            </p>
                          </div>
                        </div>
                        {type === "membership" && (
                          <div className="p-4 rounded-2xl bg-brand-primary/10 border border-brand-primary/20 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-brand-primary flex items-center justify-center">
                              <MemberBadgeIcon
                                size={20}
                                className="text-white"
                              />
                            </div>
                            <div>
                              <p className="font-bold text-brand-primary">
                                Pro Membership
                              </p>
                              <p className="text-xs text-brand-primary/70">
                                {t("enjoyBenefits")}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                </FadeIn>
              </StaggerContainer>
            </div>

            <div className="lg:col-span-7 lg:sticky lg:top-24">
              <BlurIn>
                <div className="space-y-4">
                  <div className="flex items-center justify-between px-2">
                    <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground">
                      {t("invoicePreview")}
                    </h3>
                    <span className="text-[10px] bg-muted px-2 py-0.5 rounded-full font-bold text-muted-foreground flex items-center gap-1">
                      <Printer className="w-3 h-3" /> PRINT-READY
                    </span>
                  </div>

                  <div
                    id="print-area"
                    ref={invoiceRef}
                    className="bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 border dark:border-slate-800 rounded-[2rem] overflow-hidden shadow-2xl relative print:border-0 print:shadow-none print:rounded-none print:m-0 w-full"
                  >
                    <WallpaperPattern className="opacity-[0.05] dark:opacity-[0.02] pointer-events-none" />

                    <div className="bg-slate-900 p-8 md:p-10 text-white relative">
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Receipt className="w-8 h-8" />
                            <span className="text-2xl font-black tracking-tighter">
                              BOOKERA
                            </span>
                          </div>
                          <h1 className="text-3xl font-black uppercase tracking-tight">
                            Invoice
                          </h1>
                          <p className="text-white/80 font-medium">
                            #{displayOrderId}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <div className="px-4 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-sm font-bold border border-white/30 flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4" />
                            {t("paidStatus")}
                          </div>
                          <p className="text-sm text-white/70">
                            {transactionData?.paid_at
                              ? new Date(
                                  transactionData.paid_at,
                                ).toLocaleDateString("id-ID", {
                                  day: "numeric",
                                  month: "long",
                                  year: "numeric",
                                })
                              : new Date().toLocaleDateString("id-ID", {
                                  day: "numeric",
                                  month: "long",
                                  year: "numeric",
                                })}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-8 md:p-10 space-y-8 bg-white dark:bg-slate-950">
                      <div className="grid grid-cols-2 gap-8">
                        <div className="space-y-4">
                          <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                            {t("billingFrom")}
                          </h3>
                          <div className="space-y-1">
                            <p className="font-bold text-lg text-slate-900 dark:text-slate-100">
                              Bookera Library
                            </p>
                            <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2">
                              <Mail className="w-3.5 h-3.5" />{" "}
                              support@bookera.id
                            </p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                              Malang, Jawa Timur, Indonesia
                            </p>
                          </div>
                        </div>
                        <div className="space-y-4 text-right">
                          <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                            {t("billingTo")}
                          </h3>
                          <div className="space-y-1">
                            <p className="font-bold text-lg flex items-center justify-end gap-2 text-slate-900 dark:text-slate-100">
                              <User className="w-4 h-4" />{" "}
                              {user?.profile?.full_name || user?.email}
                            </p>
                            <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center justify-end gap-2">
                              <Mail className="w-3.5 h-3.5" /> {user?.email}
                            </p>
                            {type === "membership" && (
                              <div className="flex items-center justify-end gap-2 mt-2">
                                <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-200 px-2 py-0.5 rounded-full font-bold">
                                  PRO MEMBER
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="h-px bg-slate-100 dark:bg-slate-800" />
 
                      <div className="grid grid-cols-4 gap-4">
                        <div className="space-y-1">
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />{" "}
                            {t("paymentDate")}
                          </p>
                          <p className="font-bold text-sm text-slate-900 dark:text-slate-100">
                            {transactionData?.paid_at
                              ? new Date(
                                  transactionData.paid_at,
                                ).toLocaleDateString("id-ID")
                              : "-"}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 flex items-center gap-1">
                            <Hash className="w-3 h-3" />{" "}
                            {t("orderId")}
                          </p>
                          <p className="font-bold text-sm text-slate-900 dark:text-slate-100">
                            #{displayOrderId}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 flex items-center gap-1">
                            <Receipt className="w-3 h-3" />{" "}
                            {t("method")}
                          </p>
                          <p className="font-bold text-sm uppercase text-slate-900 dark:text-slate-100">
                            {transactionData?.payment_type || "Midtrans"}
                          </p>
                        </div>
                        <div className="space-y-1 text-right">
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                            {t("status")}
                          </p>
                          <p className="font-bold text-sm text-green-600 dark:text-green-400 uppercase">
                            {t("success")}
                          </p>
                        </div>
                      </div>

                      <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 overflow-hidden">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-slate-100/50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-black text-[10px] uppercase tracking-widest border-b border-slate-100 dark:border-slate-800">
                              <th className="px-6 py-4 text-left">
                                {t("description")}
                              </th>
                              <th className="px-6 py-4 text-right">
                                {t("amount")}
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            <tr>
                              <td className="px-6 py-5">
                                <div className="font-bold text-slate-900 dark:text-slate-100">
                                  {type === "membership"
                                    ? `${t("membershipUpgrade")} - ${transactionData?.plan || "Premium"}`
                                    : `${t("finePayment")} - #${id}`}
                                </div>
                                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                  {type === "membership"
                                    ? t("membershipDesc")
                                    : t("fineDesc")}
                                </div>
                              </td>
                              <td className="px-6 py-5 text-right font-bold text-slate-900 dark:text-slate-100">
                                {formatCurrency(transactionData?.amount || 0)}
                              </td>
                            </tr>
                          </tbody>
                          <tfoot>
                            <tr className="bg-slate-900/5 dark:bg-white/5">
                              <td className="px-6 py-4 font-black text-slate-900 dark:text-slate-100 text-right uppercase tracking-widest">
                                {t("total")}
                              </td>
                              <td className="px-6 py-4 text-right font-black text-xl text-slate-900 dark:text-slate-100">
                                {formatCurrency(transactionData?.amount || 0)}
                              </td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>

                      <div className="text-center space-y-2 pt-4">
                        <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                          {t("thankYou")}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                          {t("invoiceAutoGenerated")}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </BlurIn>
            </div>
          </div>

          <style jsx global>{`
            @media print {
              body {
                background: white !important;
                padding: 0 !important;
                margin: 0 !important;
              }
              body * {
                visibility: hidden;
              }
              #print-area,
              #print-area * {
                visibility: visible;
              }
              #print-area {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
                margin: 0 !important;
                padding: 0 !important;
                border: none !important;
                box-shadow: none !important;
                color: black !important;
              }
              .print\\:hidden {
                display: none !important;
              }
            }
          `}</style>
        </>
      )}
    </div>
  );
}

export default function PaymentSuccessClient() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[80vh] flex items-center justify-center">
          <Loader2 className="w-10 h-10 animate-spin text-brand-primary" />
        </div>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  );
}
