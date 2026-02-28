"use client";
import { useRouter } from "next/navigation";

import { useState } from "react";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth.store";
import { getCookie } from "cookies-next";
import { AnimatePresence, motion } from "framer-motion";
import BookeraLogo from "@/assets/logo/bookera-logo-hd.png";
import Image from "next/image";
import { BookOpen, GraduationCap, Users, Globe } from "lucide-react";
import { TermsOfServiceModal } from "@/components/custom-ui/modal/TermsOfServiceModal";
import { PrivacyPolicyModal } from "@/components/custom-ui/modal/PrivacyPolicyModal";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";


export type AuthMode = "login" | "register";

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

const FEATURES = [
  { icon: BookOpen, label: "Thousands of Digital Books" },
  { icon: GraduationCap, label: "Learning Materials" },
  { icon: Users, label: "Student Collaboration" },
  { icon: Globe, label: "24/7 Access" },
];

export default function LoginClient() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const register = useAuthStore((s) => s.register);
  const loading = useAuthStore((s) => s.loading);

  const [mode, setMode] = useState<AuthMode>("login");
  const [tosModalOpen, setTosModalOpen] = useState(false);
  const [privacyModalOpen, setPrivacyModalOpen] = useState(false);

  const direction = mode === "register" ? 1 : -1;

  const handleLogin = async (
    email: string,
    password: string,
  ) => {
    try {
      const message = await login(email, password);
      toast.success(message || "Login successful!");
      const role = getCookie("role");
      const isAdmin =
        role === "admin" ||
        (typeof role === "string" && role.startsWith("officer:"));
      router.push(isAdmin ? "/admin" : "/");
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? "Login failed. Please check your credentials.");
    }
  };

  const handleRegister = async (
    email: string,
    password: string,
    passwordConfirm: string
  ) => {
    try {
      const message = await register(email, password, passwordConfirm);
      toast.success(message || "Registration successful!");
      router.push("/setup-profile");
    } catch (err: any) {
      const errorData = err.response?.data;
      if (errorData?.data && typeof errorData.data === "object") {
        const errors = Object.values(errorData.data).flat();
        errors.forEach((error: any) => toast.error(error));
      } else {
        toast.error(errorData?.message ?? "Registration failed");
      }
    }
  };

  const switchMode = (newMode: AuthMode) => {
    if (!loading) setMode(newMode);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-linear-to-br from-brand-primary/10 via-white to-brand-primary-light/5 dark:from-brand-primary/5 dark:via-gray-950 dark:to-brand-primary-dark/10 transition-colors duration-300">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-brand-primary/5 dark:bg-brand-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-brand-primary-dark/5 dark:bg-brand-primary-dark/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-6xl flex flex-col lg:flex-row items-center justify-center gap-12">
        <div className="w-full lg:w-1/2 text-center lg:text-left space-y-8">
          <div className="flex flex-col items-center lg:items-start space-y-4">
            <Image
              src={BookeraLogo}
              alt="Bookera Logo"
              className="w-48 lg:w-56 brightness-0 dark:invert"
              priority
            />
            <div className="space-y-3">
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white leading-tight transition-colors">
                Digital School
                <span className="block text-brand-primary">Library</span>
              </h1>
              <p className="text-gray-600 dark:text-gray-300 text-lg max-w-md transition-colors">
                Access thousands of digital books, learning materials, and
                educational resources from anywhere. Integrated platform for
                students, teachers, and school staff.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto lg:mx-0">
            {FEATURES.map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-3 p-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg border border-gray-100 dark:border-gray-700 transition-colors"
              >
                <div className="shrink-0 w-8 h-8 rounded-full bg-brand-primary/10 dark:bg-brand-primary/20 flex items-center justify-center">
                  <Icon className="w-4 h-4 text-brand-primary" />
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200 transition-colors">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="w-full max-w-md relative" style={{ minHeight: 480 }}>
          <AnimatePresence mode="wait" custom={direction}>
            {mode === "login" ? (
              <motion.div
                key="login"
                custom={direction}
                variants={cardVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={cardTransition}
                className="w-full"
              >
                <LoginForm
                  loading={loading}
                  onLogin={handleLogin}
                  onSwitchToRegister={() => switchMode("register")}
                  onOpenTos={() => setTosModalOpen(true)}
                  onOpenPrivacy={() => setPrivacyModalOpen(true)}
                />
              </motion.div>
            ) : (
              <motion.div
                key="register"
                custom={direction}
                variants={cardVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={cardTransition}
                className="w-full"
              >
                <RegisterForm
                  loading={loading}
                  onRegister={handleRegister}
                  onSwitchToLogin={() => switchMode("login")}
                  onOpenTos={() => setTosModalOpen(true)}
                  onOpenPrivacy={() => setPrivacyModalOpen(true)}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <TermsOfServiceModal open={tosModalOpen} onOpenChange={setTosModalOpen} />
      <PrivacyPolicyModal open={privacyModalOpen} onOpenChange={setPrivacyModalOpen} />
    </div>
  );
}
