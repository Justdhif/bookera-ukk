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
import { motion } from "framer-motion";

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, setUser } = useAuthStore();
  const t = useTranslations("payment");
  const td = useTranslations("payment.dialog");
  const tp = useTranslations("pricing");
  const tc = useTranslations("common");
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

  if (showPending) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 space-y-6">
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shadow-xl">
            <Clock className="w-12 h-12 text-amber-500 animate-spin-slow" />
          </div>
        </div>
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-black">{t("pendingTitle")}</h1>
          <p className="text-muted-foreground">{t("pendingDescription")}</p>
        </div>
      </div>
    );
  }

  if (!isSuccess && !checking) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 space-y-6">
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
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 md:px-6 flex flex-col items-center">
      {/* Invoice Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl w-full"
      >
        <div
          id="print-area"
          ref={invoiceRef}
          className="bg-card border rounded-[2.5rem] overflow-hidden shadow-2xl relative print:border-0 print:shadow-none print:rounded-none print:m-0"
        >
          <WallpaperPattern className="opacity-[0.05] pointer-events-none" />

          {/* Invoice Header */}
          <div className="bg-linear-to-br from-brand-primary to-brand-primary-dark p-8 md:p-12 text-white relative">
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
                  #{transactionData?.order_id || orderIdParam}
                </p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <div className="px-4 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-sm font-bold border border-white/30 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" />
                  {t("paidStatus", { defaultValue: "LUNAS" })}
                </div>
                <p className="text-sm text-white/70">
                  {transactionData?.paid_at
                    ? new Date(transactionData.paid_at).toLocaleDateString(
                        "id-ID",
                        { day: "numeric", month: "long", year: "numeric" },
                      )
                    : new Date().toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                </p>
              </div>
            </div>
          </div>

          <div className="p-8 md:p-12 space-y-10 bg-card/50 backdrop-blur-xl">
            {/* Billing Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                  {t("billingFrom", { defaultValue: "DARI" })}
                </h3>
                <div className="space-y-1">
                  <p className="font-bold text-lg text-brand-primary">
                    Bookera Library
                  </p>
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5" /> support@bookera.id
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Malang, Jawa Timur, Indonesia
                  </p>
                </div>
              </div>
              <div className="space-y-4 md:text-right">
                <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                  {t("billingTo", { defaultValue: "KEPADA" })}
                </h3>
                <div className="space-y-1">
                  <p className="font-bold text-lg flex items-center md:justify-end gap-2 text-foreground">
                    <User className="w-4 h-4" />{" "}
                    {user?.profile?.full_name || user?.email}
                  </p>
                  <p className="text-sm text-muted-foreground flex items-center md:justify-end gap-2">
                    <Mail className="w-3.5 h-3.5" /> {user?.email}
                  </p>
                  {type === "membership" && (
                    <div className="flex items-center md:justify-end gap-2 mt-2">
                      <span className="text-xs bg-brand-primary/10 text-brand-primary px-2 py-0.5 rounded-full font-bold">
                        PRO MEMBER
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="h-px bg-linear-to-r from-transparent via-border to-transparent" />

            {/* Transaction Details */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1">
                  <Calendar className="w-3 h-3" />{" "}
                  {t("paymentDate", { defaultValue: "TANGGAL" })}
                </p>
                <p className="font-bold text-sm">
                  {transactionData?.paid_at
                    ? new Date(transactionData.paid_at).toLocaleDateString(
                        "id-ID",
                      )
                    : "-"}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1">
                  <Hash className="w-3 h-3" />{" "}
                  {t("orderId", { defaultValue: "ORDER ID" })}
                </p>
                <p className="font-bold text-sm truncate">
                  {transactionData?.order_id || orderIdParam}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1">
                  <Receipt className="w-3 h-3" />{" "}
                  {t("method", { defaultValue: "METODE" })}
                </p>
                <p className="font-bold text-sm uppercase">
                  {transactionData?.payment_type || "Midtrans"}
                </p>
              </div>
              <div className="space-y-1 text-right">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  {t("status", { defaultValue: "STATUS" })}
                </p>
                <p className="font-bold text-sm text-green-500 uppercase">
                  {t("success", { defaultValue: "BERHASIL" })}
                </p>
              </div>
            </div>

            {/* Items Table */}
            <div className="rounded-2xl border bg-muted/30 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/50 text-muted-foreground font-black text-[10px] uppercase tracking-widest border-b">
                    <th className="px-6 py-4 text-left">
                      {t("description", { defaultValue: "DESKRIPSI" })}
                    </th>
                    <th className="px-6 py-4 text-right">
                      {t("amount", { defaultValue: "JUMLAH" })}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  <tr>
                    <td className="px-6 py-5">
                      <div className="font-bold text-foreground">
                        {type === "membership"
                          ? `${t("membershipUpgrade", { defaultValue: "Upgrade Membership" })} - ${transactionData?.plan || "Premium"}`
                          : `${t("finePayment", { defaultValue: "Pembayaran Denda" })} - #${id}`}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {type === "membership"
                          ? t("membershipDesc", {
                              defaultValue:
                                "Akses penuh ke semua fitur Bookera",
                            })
                          : t("fineDesc", {
                              defaultValue:
                                "Pelunasan keterlambatan pengembalian buku",
                            })}
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right font-bold text-foreground">
                      {formatCurrency(transactionData?.amount || 0)}
                    </td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr className="bg-brand-primary/5">
                    <td className="px-6 py-4 font-black text-brand-primary text-right uppercase tracking-widest">
                      {t("total", { defaultValue: "TOTAL" })}
                    </td>
                    <td className="px-6 py-4 text-right font-black text-xl text-brand-primary">
                      {formatCurrency(transactionData?.amount || 0)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Footer Note */}
            <div className="text-center space-y-2 pt-4">
              <p className="text-sm font-bold text-foreground">
                {t("thankYou", {
                  defaultValue: "Terima kasih atas pembayaran Anda!",
                })}
              </p>
              <p className="text-xs text-muted-foreground max-w-md mx-auto">
                {t("invoiceAutoGenerated", {
                  defaultValue:
                    "Invoice ini dibuat secara otomatis dan merupakan bukti pembayaran yang sah.",
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons - Hidden in Print */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 print:hidden">
          <Button
            variant="brand"
            size="lg"
            className="w-full sm:w-auto h-14 px-8 rounded-2xl font-black text-lg shadow-xl shadow-brand-primary/20 hover:scale-[1.02] transition-all"
            onClick={handlePrint}
          >
            <Printer className="w-5 h-5 mr-2" />
            {t("printInvoice", { defaultValue: "Cetak / Download PDF" })}
          </Button>

          <Link
            href={isAdmin ? "/admin" : "/home"}
            className="w-full sm:w-auto"
          >
            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto h-14 px-8 rounded-2xl font-black text-lg hover:bg-muted/50 transition-all group"
            >
              {isAdmin ? "Dashboard" : t("backToLibrary")}
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>

          {!isAdmin && (
            <Link href="/my-profile" className="w-full sm:w-auto">
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto h-14 px-8 rounded-2xl font-black text-lg hover:bg-muted/50 transition-all"
              >
                <User className="w-5 h-5 mr-2 text-brand-primary" />
                {t("backToProfile", { defaultValue: "My Profile" })}
              </Button>
            </Link>
          )}
        </div>
      </motion.div>

      {/* CSS for Print */}
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
          }
          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>
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
