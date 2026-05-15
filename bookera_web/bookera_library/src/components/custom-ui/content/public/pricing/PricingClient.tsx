"use client";

import { useState, useEffect, useCallback } from "react";
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
import ContentHeader from "@/components/custom-ui/content/ContentHeader";
import PricingHeader from "./PricingHeader";
import { PricingCommonFeatures } from "./PricingFeatures";
import PricingProfilePreview from "./PricingProfilePreview";
import PricingCard from "./PricingCard";

export default function PricingClient() {
  const router = useRouter();
  const { user, initialLoading } = useAuthStore();
  const tp = useTranslations("pricing");

  const [fullUser, setFullUser] = useState<User | null>(null);
  const [isUserLoading, setIsUserLoading] = useState(true);
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [payingPlan, setPayingPlan] = useState<string | null>(null);

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
    membershipService
      .getPlans()
      .then((res) => setPlans(res.data.data.plans))
      .catch(() => toast.error(tp("loadPlansError")))
      .finally(() => setLoading(false));
  }, [tp]);

  const handleStartPayment = (planId: string) => {
    if (!user) {
      toast.error(tp("loginFirst"));
      return;
    }

    if (user.role === "member") {
      toast.info(tp("alreadyMemberInfo"));
      return;
    }

    router.push(`/payment?type=membership&id=${planId}`);
  };

  return (
    <div className="space-y-6">
      <ContentHeader
        title={tp("title")}
        description={tp("description")}
        showBackButton
      />

      <PricingHeader />

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Crown className="w-5 h-5 text-brand-primary" />
          <h3 className="text-base font-bold text-foreground">
            {tp("sectionTitle")}
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-stretch">
          <PricingCommonFeatures />

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
            isLoggedIn={Boolean(user)}
            isAuthLoading={initialLoading}
            isLoading={payingPlan === String(plan.id)}
            onPay={handleStartPayment}
          />
        ))
      )}
    </div>
  );
}
