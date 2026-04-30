"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  membershipService,
  MembershipPlan,
} from "@/services/membership.service";
import { useAuthStore } from "@/store/auth.store";
import { toast } from "sonner";
import { authService } from "@/services/auth.service";
import { User } from "@/types/user";
import { Crown } from "lucide-react";
import PricingHeader from "./PricingHeader";
import { PricingCommonFeatures, PricingAICard } from "./PricingFeatures";
import PricingProfilePreview from "./PricingProfilePreview";
import PricingCard from "./PricingCard";

declare global {
  interface Window {
    snap: any;
  }
}

export default function PricingClient() {
  const router = useRouter();
  const { user } = useAuthStore();
  const tp = useTranslations("pricing");
  
  const [fullUser, setFullUser] = useState<User | null>(null);
  const [isUserLoading, setIsUserLoading] = useState(true);
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState<string | null>(null);
  const [snapLoaded, setSnapLoaded] = useState(false);

  useEffect(() => {
    const fetchFullUser = async () => {
      try {
        setIsUserLoading(true);
        const res = await authService.me();
        setFullUser(res.data.data.user);
      } catch (err) {
        console.error("Failed to fetch full user info", err);
      } finally {
        setIsUserLoading(false);
      }
    };
    if (user) fetchFullUser();
    else setIsUserLoading(false);
  }, [user]);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://app.sandbox.midtrans.com/snap/snap.js";
    script.setAttribute(
      "data-client-key",
      process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || "",
    );
    script.onload = () => setSnapLoaded(true);
    document.head.appendChild(script);
    return () => {
      document.head.removeChild(script);
    };
  }, []);

  useEffect(() => {
    membershipService
      .getPlans()
      .then((res) => setPlans(res.data.data.plans))
      .catch(() => toast.error(tp("loadPlansError")))
      .finally(() => setLoading(false));
  }, []);

  const handlePay = async (planId: string) => {
    if (!user) {
      toast.error(tp("loginFirst"));
      return;
    }

    if (user.role === "member") {
      toast.info(tp("alreadyMemberInfo"));
      return;
    }

    setPaying(planId);
    try {
      const res = await membershipService.createTransaction(planId);
      const { snap_token, order_id } = res.data.data;

      window.snap.pay(snap_token, {
        onSuccess: () => {
          router.push(`/payment/success?order_id=${order_id}`);
        },
        onPending: () => {
          router.push(`/payment/success?order_id=${order_id}&status=pending`);
        },
        onError: () => {
          router.push(`/payment/error?order_id=${order_id}`);
        },
        onClose: () => {
          toast.info(tp("paymentCancelled"));
          setPaying(null);
        },
      });
    } catch (err: any) {
      toast.error(err?.response?.data?.message || tp("paymentStartError"));
    } finally {
      setPaying(null);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <PricingHeader />

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Crown className="w-5 h-5 text-brand-primary" />
          <h3 className="text-base font-bold text-foreground">
            {tp("sectionTitle")}
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 items-stretch">
          <PricingCommonFeatures />
          <PricingAICard />
          <PricingProfilePreview 
            fullUser={fullUser} 
            isUserLoading={isUserLoading} 
          />
        </div>
      </div>

      {loading ? (
        <div className="rounded-3xl border border-border bg-card p-8 animate-pulse h-64" />
      ) : (
        plans.map((plan) => (
          <PricingCard
            key={plan.id}
            plan={plan}
            isCurrentPlan={user?.role === "member"}
            isLoading={paying === String(plan.id)}
            snapLoaded={snapLoaded}
            onPay={handlePay}
          />
        ))
      )}
    </div>
  );
}
