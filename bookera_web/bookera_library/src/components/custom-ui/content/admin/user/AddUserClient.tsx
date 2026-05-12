"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import ContentHeader from "@/components/custom-ui/content/ContentHeader";
import { useState, useEffect } from "react";
import { userService } from "@/services/user.service";
import { membershipService, MembershipPlan } from "@/services/membership.service";
import { CreateUserData } from "@/types/user";
import { toast } from "sonner";
import { isPasswordValid } from "@/components/custom-ui/content/admin/auth/PasswordRequirements";
import UserSideCard from "./UserSideCard";
import UserProfileForm from "./UserProfileForm";
import { StaggerContainer, FadeUp } from "@/components/custom-ui/motion";
import { PaymentMethodDialog } from "@/components/custom-ui/content/admin/borrow/PaymentMethodDialog";

export default function AddUserClient() {
  const t = useTranslations("user");
  const router = useRouter();
  const [formData, setFormData] = useState<CreateUserData & { payment_method?: string; plan_id?: string }>({
    email: "",
    password: "",
    username: "",
    full_name: "",
    identification_number: "",
    phone_number: "",
    gender: undefined,
    birth_date: "",
    occupation: undefined,
    institution: "",
    address: "",
    bio: "",
    role: "member",
    is_active: true,
  });
  const [avatarPreview, setAvatarPreview] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [isFullNameValid, setIsFullNameValid] = useState(true);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<MembershipPlan | null>(null);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await membershipService.getPlans();
        const availablePlans = res.data.data.plans;
        setPlans(availablePlans);
        if (availablePlans.length > 0) {
          setSelectedPlan(availablePlans[0]);
        }
      } catch (err) {
        console.error("Failed to fetch membership plans", err);
      }
    };
    fetchPlans();
  }, []);

  const isFormValid = (): boolean => {
    return (
      !!formData.email.trim() &&
      isPasswordValid(formData.password) &&
      !!formData.username?.trim() &&
      !!formData.full_name.trim() &&
      !!formData.identification_number?.trim() &&
      isFullNameValid
    );
  };

  const isSubmitDisabled = (): boolean => submitting || !isFormValid();

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (formData.role === "member") {
      setShowPaymentDialog(true);
      return;
    }
    
    await processCreateUser();
  };

  const processCreateUser = async (paymentMethod?: "cash" | "non_cash") => {
    try {
      setSubmitting(true);
      const dataToSubmit = { 
        ...formData, 
        payment_method: paymentMethod,
        plan_id: selectedPlan?.plan_id || selectedPlan?.id?.toString()
      };
      
      const res = await userService.create(dataToSubmit);
      
      if (paymentMethod === "non_cash" && res.data.data.pending_transaction) {
        const transaction = res.data.data.pending_transaction;
        toast.success(t("addSuccessRedirecting"));
        router.push(`/payment?type=membership&id=${transaction.plan}`);
      } else {
        toast.success(t("addSuccess"));
        router.push("/admin/users");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || t("addError"));
    } finally {
      setSubmitting(false);
      setShowPaymentDialog(false);
    }
  };

  return (
    <StaggerContainer className="space-y-6">
      <FadeUp>
        <ContentHeader
          title={t("addUser")}
          description={t("addUserDesc")}
          showBackButton
          isAdmin
        />
      </FadeUp>
      <div>
        <div className="grid gap-6 lg:grid-cols-3">
          <FadeUp delay={0.1} className="lg:col-span-1 lg:self-start lg:sticky lg:top-4">
            <UserSideCard
              mode="add"
              avatarPreview={avatarPreview}
              isEditMode={true}
              formData={formData}
              setFormData={setFormData}
              setAvatarPreview={setAvatarPreview}
            />
          </FadeUp>
          <FadeUp delay={0.2} className="lg:col-span-2">
            <UserProfileForm
              isEditMode={true}
              formData={formData}
              setFormData={setFormData}
              onFullNameValidChange={setIsFullNameValid}
              onSubmit={handleSubmit}
              submitting={submitting}
              isSubmitDisabled={isSubmitDisabled()}
            />
          </FadeUp>
        </div>
      </div>

      <PaymentMethodDialog
        isOpen={showPaymentDialog}
        onOpenChange={setShowPaymentDialog}
        onPayCash={() => processCreateUser("cash")}
        onPayMidtrans={() => processCreateUser("non_cash")}
        totalAmount={selectedPlan?.price || 0}
        loading={submitting}
      />
    </StaggerContainer>
  );
}
