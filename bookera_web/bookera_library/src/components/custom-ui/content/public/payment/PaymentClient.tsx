"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { membershipService } from "@/services/membership.service";
import { fineService } from "@/services/fine.service";
import ContentHeader from "@/components/custom-ui/content/ContentHeader";
import {
  Accordion,
  AccordionItem,
} from "@/components/ui/accordion";
import { WallpaperPattern } from "@/components/custom-ui/WallpaperPattern";

import bcaLogo from "@/assets/logo/bank_method/bca.png";
import bniLogo from "@/assets/logo/bank_method/bni.png";
import briLogo from "@/assets/logo/bank_method/bri.png";
import cimbLogo from "@/assets/logo/bank_method/cimb.png";

import { StaticImageData } from "next/image";

export interface BankOption {
  id: string;
  name: string;
  shortName: string;
  color: string;
  textColor: string;
  logo: StaticImageData;
}

export interface PaymentData {
  va_number: string;
  bank: string;
  amount: number;
  order_id: string;
  expiry_time?: string;
}

import PaymentBankSelection from "./PaymentBankSelection";
import PaymentInstructions from "./PaymentInstructions";
import PaymentSummary from "./PaymentSummary";
import PaymentSecuritySidebar from "./PaymentSecuritySidebar";
import PaymentSuccessDialog from "./PaymentSuccessDialog";
import PaymentErrorDialog from "./PaymentErrorDialog";

const BANKS: BankOption[] = [
  {
    id: "bca",
    name: "BCA Virtual Account",
    shortName: "BCA",
    color: "from-blue-600 to-blue-700",
    textColor: "text-blue-600",
    logo: bcaLogo,
  },
  {
    id: "bni",
    name: "BNI Virtual Account",
    shortName: "BNI",
    color: "from-orange-500 to-orange-600",
    textColor: "text-orange-500",
    logo: bniLogo,
  },
  {
    id: "bri",
    name: "BRI Virtual Account",
    shortName: "BRI",
    color: "from-sky-600 to-sky-700",
    textColor: "text-sky-600",
    logo: briLogo,
  },
  {
    id: "cimb",
    name: "CIMB Virtual Account",
    shortName: "CIMB",
    color: "from-red-600 to-red-700",
    textColor: "text-red-600",
    logo: cimbLogo,
  },
];

function PaymentContent() {
  const t = useTranslations("payment.dialog");
  const searchParams = useSearchParams();
  const router = useRouter();

  const type = searchParams.get("type");
  const id = searchParams.get("id");

  const [selectedBank, setSelectedBank] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);
  const [itemDetails, setItemDetails] = useState<any>(null);

  useEffect(() => {
    if (!type || !id) {
      toast.error(t("invalidParams", { defaultValue: "Invalid payment parameters" }));
      router.push("/pricing");
      return;
    }

    const fetchDetails = async () => {
      try {
        if (type === "membership") {
          const res = await membershipService.getPlans();
          const plans = res.data.data.plans;
          const selectedPlan = plans.find((p: any) => String(p.plan_id) === String(id) || String(p.id) === String(id));
          setItemDetails(selectedPlan);
        } else if (type === "fine") {
          const res = await fineService.checkStatus(Number(id));
          setItemDetails(res.data.data.fine);
        }
      } catch (err) {
        console.error("Failed to fetch item details", err);
      }
    };

    fetchDetails();
  }, [type, id, router, t]);

  const handleBankSelect = async (bankId: string) => {
    if (!id) return;
    setSelectedBank(bankId);
    setLoading(true);
    try {
      let data: PaymentData | undefined;
      if (type === "membership") {
        const res = await membershipService.createTransaction(id, bankId);
        data = res.data.data;
      } else if (type === "fine") {
        const res = await fineService.payMidtrans(Number(id), bankId);
        data = res.data.data;
      }

      if (data) setPaymentData(data);
    } catch (err: any) {
      console.error("Payment error:", err);
      setIsError(true);
      setSelectedBank(null);
    } finally {
      setLoading(false);
    }
  };

  const handleManualCheck = async () => {
    setChecking(true);
    try {
      let status = "pending";
      if (type === "membership") {
        const res = await membershipService.checkStatus();
        if (res.data.data.is_member) status = "paid";
      } else if (type === "fine") {
        const res = await fineService.checkStatus(Number(id));
        if (res.data.data.is_paid) status = "paid";
      }

      if (status === "paid") {
        setIsSuccess(true);
      } else {
        toast.info(t("stillPending"));
      }
    } catch {
      setIsError(true);
    } finally {
      setChecking(false);
    }
  };

  const handleSuccessDone = () => {
    setIsSuccess(false);
    const isAdmin = window.location.pathname.startsWith("/admin");
    const baseUrl = isAdmin ? "/admin/payment/success" : "/payment/success";
    router.push(`${baseUrl}?type=${type}&id=${id}`);
  };

  return (
    <div className="space-y-6">
      <ContentHeader
        title={paymentData ? t("instructionTitle") : t("selectMethodTitle")}
        description={t("selectMethodDesc")}
        showBackButton
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8 space-y-6">
          <Accordion
            type="single"
            collapsible
            value={paymentData ? "payment-instructions" : ""}
            className="w-full border-0"
          >
            <AccordionItem
              value="payment-instructions"
              className="bg-card border rounded-[2rem] overflow-hidden shadow-sm transition-all duration-500 border-b-0 relative"
            >
              <WallpaperPattern className="opacity-[0.7] pointer-events-none" bgColor="transparent" />
              <div className="p-6 md:p-8 flex flex-col relative z-10">
                <PaymentBankSelection
                  banks={BANKS}
                  selectedBank={selectedBank}
                  paymentData={paymentData}
                  loading={loading}
                  onBankSelect={handleBankSelect}
                />

                <AccordionItem value="payment-instructions" className="border-0">
                  <div className="overflow-hidden">
                    <PaymentInstructions
                      paymentData={paymentData}
                      itemDetails={itemDetails}
                      type={type}
                    />
                  </div>
                </AccordionItem>

                <div className="pt-8 mt-8 border-t border-dashed">
                  <PaymentSummary
                    paymentData={paymentData}
                    itemDetails={itemDetails}
                    checking={checking}
                    onManualCheck={handleManualCheck}
                  />
                </div>
              </div>
            </AccordionItem>
          </Accordion>
        </div>

        <PaymentSecuritySidebar />
      </div>

      <PaymentSuccessDialog
        isOpen={isSuccess}
        onOpenChange={setIsSuccess}
        onConfirm={handleSuccessDone}
      />

      <PaymentErrorDialog
        isOpen={isError}
        onOpenChange={setIsError}
        onRetry={() => setIsError(false)}
      />
    </div>
  );
}

export default function PaymentClient() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[80vh] flex items-center justify-center">
          <Loader2 className="w-12 h-12 animate-spin text-brand-primary" />
        </div>
      }
    >
      <PaymentContent />
    </Suspense>
  );
}
