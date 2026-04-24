"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CheckCircle2, XCircle, Loader2, ArrowRight, LogIn } from "lucide-react";
import { authService } from "@/services/auth.service";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import BookeraLogo from "@/assets/logo/bookera-logo-hd.png";

function ActivateContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const t = useTranslations("login");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  const email = searchParams.get("email");
  const token = searchParams.get("token");

  useEffect(() => {
    if (!email || !token) {
      setStatus("error");
      setMessage("Invalid activation link.");
      return;
    }

    const activate = async () => {
      try {
        const res = await authService.activate(email, token);
        setStatus("success");
        setMessage(res.data.message || "Account activated successfully!");
        toast.success("Account activated successfully!");
      } catch (err: any) {
        setStatus("error");
        setMessage(err.response?.data?.message || "Failed to activate account.");
      }
    };

    activate();
  }, [email, token]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-linear-to-br from-brand-primary/10 via-white to-brand-primary-light/5 dark:from-brand-primary/5 dark:via-gray-950 dark:to-brand-primary-dark/10 transition-colors duration-300">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-brand-primary/5 dark:bg-brand-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-brand-primary-dark/5 dark:bg-brand-primary-dark/10 rounded-full blur-3xl" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md"
      >
        <div className="flex justify-center mb-8">
           <Image
              src={BookeraLogo}
              alt="Bookera Logo"
              className="w-48 lg:w-56 brightness-0 dark:invert"
              priority
            />
        </div>

        <Card className="border-0 dark:border dark:border-gray-700 shadow-2xl backdrop-blur-sm bg-white/95 dark:bg-gray-900/95 transition-colors overflow-hidden">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-24 h-1.5 bg-linear-to-r from-brand-primary-light to-brand-primary rounded-full" />
          
          <CardHeader className="space-y-4 text-center pb-6">
            <AnimatePresence mode="wait">
              {status === "loading" && (
                <motion.div
                  key="loading"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  className="flex flex-col items-center gap-4"
                >
                  <div className="w-16 h-16 rounded-full bg-brand-primary/10 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-brand-primary animate-spin" />
                  </div>
                  <CardTitle className="text-2xl font-bold">{t("activating") || "Activating Account..."}</CardTitle>
                  <CardDescription>{t("pleaseWait") || "Please wait while we verify your email."}</CardDescription>
                </motion.div>
              )}

              {status === "success" && (
                <motion.div
                  key="success"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex flex-col items-center gap-4"
                >
                  <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8 text-green-600" />
                  </div>
                  <CardTitle className="text-2xl font-bold text-green-600">{t("activationSuccess") || "Activation Successful!"}</CardTitle>
                  <CardDescription className="px-4">{message}</CardDescription>
                </motion.div>
              )}

              {status === "error" && (
                <motion.div
                  key="error"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex flex-col items-center gap-4"
                >
                  <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                    <XCircle className="w-8 h-8 text-red-600" />
                  </div>
                  <CardTitle className="text-2xl font-bold text-red-600">{t("activationFailed") || "Activation Failed"}</CardTitle>
                  <CardDescription className="px-4">{message}</CardDescription>
                </motion.div>
              )}
            </AnimatePresence>
          </CardHeader>

          <CardContent className="pb-8">
            <div className="space-y-4">
              {status !== "loading" && (
                <Button 
                  onClick={() => router.push("/login")}
                  className="w-full h-12 rounded-xl bg-linear-to-r from-brand-primary to-brand-primary-dark hover:from-brand-primary-dark hover:to-brand-primary text-white font-semibold transition-all duration-300 shadow-lg shadow-brand-primary/25 hover:shadow-xl hover:shadow-brand-primary/30"
                >
                  <div className="flex items-center justify-center gap-2">
                    <LogIn className="w-4 h-4" />
                    {t("backToLogin") || "Go to Login"}
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

export default function ActivatePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-brand-primary" /></div>}>
      <ActivateContent />
    </Suspense>
  );
}
