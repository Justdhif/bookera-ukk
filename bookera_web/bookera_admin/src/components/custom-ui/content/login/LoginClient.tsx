"use client";
import { useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth.store";
import { LANDING_VISITED_KEY } from "@/constants/landing";

import { motion } from "framer-motion";
import BookeraLogo from "@/assets/logo/bookera-logo-hd.png";
import Image from "next/image";
import { BookOpen, GraduationCap, Users, Globe } from "lucide-react";
import { TermsOfServiceModal } from "@/components/custom-ui/modal/TermsOfServiceModal";
import { PrivacyPolicyModal } from "@/components/custom-ui/modal/PrivacyPolicyModal";
import { FadeUp, StaggerContainer } from "@/components/custom-ui/motion";
import LoginForm from "./LoginForm";


export const cardVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 60 : -60,
    opacity: 0,
    scale: 0.96,
  }),
  center: { x: 0, opacity: 1, scale: 1 },
  exit: (direction: number) => ({
    x: direction > 0 ? -60 : 60,
    opacity: 0,
    scale: 0.96,
  }),
};
export const cardTransition = {
  x: { type: "spring" as const, stiffness: 350, damping: 30 },
  opacity: { duration: 0.25 },
  scale: { duration: 0.25 },
};

type AuthError = {
  response?: {
    data?: {
      message?: string;
      data?: unknown;
    };
  };
};

export default function LoginClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const login = useAuthStore((s) => s.login);
  const loading = useAuthStore((s) => s.loading);
  const t = useTranslations("login");
  const redirectTarget = searchParams.get("redirect");
  const safeRedirectTarget =
    redirectTarget?.startsWith("/") ? redirectTarget : null;
  const FEATURES = [
    { icon: BookOpen, label: t("thousandsBooks") },
    { icon: GraduationCap, label: t("learningMaterials") },
    { icon: Users, label: t("studentCollaboration") },
    { icon: Globe, label: t("access247") },
  ];
  const [tosModalOpen, setTosModalOpen] = useState(false);
  const [privacyModalOpen, setPrivacyModalOpen] = useState(false);

  const handleLogin = async (email: string, password: string) => {
    try {
      const message = await login(email, password);
      const user = useAuthStore.getState().user;

      toast.success(message || "Login successful!");
      // Tandai bahwa user sudah melewati landing page
      localStorage.setItem(LANDING_VISITED_KEY, "true");

      if (safeRedirectTarget) {
        router.push(safeRedirectTarget);
      } else {
        router.push("/");
      }
    } catch (err: unknown) {
      const authError = err as AuthError;
      toast.error(authError.response?.data?.message ?? t("loginFailed"));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-linear-to-br from-brand-primary/10 via-white to-brand-primary-light/5 dark:from-brand-primary/5 dark:via-gray-950 dark:to-brand-primary-dark/10 transition-colors duration-300">
      {" "}
      <div className="absolute inset-0 overflow-hidden">
        {" "}
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-brand-primary/5 dark:bg-brand-primary/10 rounded-full blur-3xl" />{" "}
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-brand-primary-dark/5 dark:bg-brand-primary-dark/10 rounded-full blur-3xl" />{" "}
      </div>{" "}
      <div className="relative w-full max-w-6xl flex flex-col lg:flex-row items-center justify-center gap-12">
        {" "}
        <StaggerContainer className="w-full lg:w-1/2 text-center lg:text-left space-y-8">
          <FadeUp className="flex flex-col items-center lg:items-start space-y-4">
            <Image
              src={BookeraLogo}
              alt="Bookera Logo"
              className="w-48 lg:w-56 brightness-0 dark:invert"
              priority
            />
            <div className="space-y-3">
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white leading-tight transition-colors">
                Digital School{" "}
                <span className="block text-brand-primary">
                  {t("library")}
                </span>
              </h1>
              <p className="text-gray-600 dark:text-gray-300 text-lg max-w-md transition-colors">
                {t("heroDesc")}
              </p>
            </div>
          </FadeUp>
          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto lg:mx-0">
            {FEATURES.map(({ icon: Icon, label }) => (
              <FadeUp
                key={label}
                className="flex items-center gap-3 p-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg border border-gray-100 dark:border-gray-700 transition-colors"
              >
                <div className="shrink-0 w-8 h-8 rounded-full bg-brand-primary/10 dark:bg-brand-primary/20 flex items-center justify-center">
                  <Icon className="w-4 h-4 text-brand-primary" />
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200 transition-colors">
                  {label}
                </span>
              </FadeUp>
            ))}
          </StaggerContainer>
        </StaggerContainer>{" "}
        <div className="w-full max-w-md relative" style={{ minHeight: 480 }}>
          <motion.div
            key="login"
            initial="enter"
            animate="center"
            variants={cardVariants}
            transition={cardTransition}
            className="w-full"
          >
            <LoginForm
              loading={loading}
              onLogin={handleLogin}

              onOpenTos={() => setTosModalOpen(true)}
              onOpenPrivacy={() => setPrivacyModalOpen(true)}
            />
          </motion.div>
        </div>
      </div>
      <TermsOfServiceModal open={tosModalOpen} onOpenChange={setTosModalOpen} />
      <PrivacyPolicyModal
        open={privacyModalOpen}
        onOpenChange={setPrivacyModalOpen}
      />
    </div>
  );
}

