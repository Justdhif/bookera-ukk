"use client";
import { useRouter } from "next/navigation";

import { useState, useRef, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { authService } from "@/services/auth.service";
import { AnimatePresence, motion } from "framer-motion";
import { Mail, KeyRound, Lock } from "lucide-react";
import ForgotStepMethod from "./ForgotStepMethod";
import ForgotStepOtp from "./ForgotStepOtp";
import ForgotStepReset from "./ForgotStepReset";
import ForgotStepSuccess from "./ForgotStepSuccess";


export type ForgotStep = "method" | "otp" | "reset" | "success";

export const FORGOT_STEPS = [
  { key: "method" as ForgotStep, label: "Method", icon: Mail },
  { key: "otp" as ForgotStep, label: "Verify", icon: KeyRound },
  { key: "reset" as ForgotStep, label: "New Password", icon: Lock },
];

export const cardVariants = {
  enter: { x: 60, opacity: 0, scale: 0.96 },
  center: { x: 0, opacity: 1, scale: 1 },
  exit: { x: -60, opacity: 0, scale: 0.96 },
};

export const cardTransition = {
  x: { type: "spring" as const, stiffness: 350, damping: 30 },
  opacity: { duration: 0.25 },
  scale: { duration: 0.25 },
};

export default function ForgotPasswordClient() {
  const router = useRouter();

  const [step, setStep] = useState<ForgotStep>("method");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [cooldown, setCooldown] = useState(0);
  const cooldownRef = useRef<NodeJS.Timeout | null>(null);

  const currentStepIndex = FORGOT_STEPS.findIndex((s) => s.key === step);

  const startCooldown = useCallback(() => {
    setCooldown(60);
    if (cooldownRef.current) clearInterval(cooldownRef.current);
    cooldownRef.current = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          if (cooldownRef.current) clearInterval(cooldownRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  useEffect(() => {
    return () => {
      if (cooldownRef.current) clearInterval(cooldownRef.current);
    };
  }, []);

  const handleSendOtp = async () => {
    if (!email.trim()) {
      toast.error("Please enter your email address");
      return;
    }
    setSubmitting(true);
    try {
      const res = await authService.forgotPassword(email);
      toast.success(res.data.message || "Verification code sent to your email");
      setStep("otp");
      startCooldown();
      setTimeout(() => otpRefs.current[0]?.focus(), 400);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to send verification code");
    } finally {
      setSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    if (cooldown > 0) return;
    setSubmitting(true);
    try {
      const res = await authService.forgotPassword(email);
      toast.success(res.data.message || "Verification code resent");
      setOtp(["", "", "", "", "", ""]);
      startCooldown();
      otpRefs.current[0]?.focus();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to resend verification code");
    } finally {
      setSubmitting(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value && !/^\d$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
    if (value && index === 5 && newOtp.join("").length === 6) {
      handleVerifyOtp(newOtp.join(""));
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "");
    if (pastedData.length === 6) {
      setOtp(pastedData.split(""));
      otpRefs.current[5]?.focus();
      handleVerifyOtp(pastedData);
    }
  };

  const handleVerifyOtp = (otpCode: string) => {
    if (otpCode.length !== 6) {
      toast.error("Please enter all 6 digits");
      return;
    }
    setStep("reset");
  };

  const handleResetPassword = async (newPassword: string, confirmPassword: string) => {
    setSubmitting(true);
    try {
      const otpCode = otp.join("");
      const res = await authService.resetPassword(
        email,
        otpCode,
        newPassword,
        confirmPassword
      );
      toast.success(res.data.message || "Password reset successfully!");
      setStep("success");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to reset password");
      if (err.response?.status === 410 || err.response?.status === 422) {
        setOtp(["", "", "", "", "", ""]);
        setStep("otp");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-linear-to-br from-brand-primary/10 via-white to-brand-primary-light/5 dark:from-brand-primary/5 dark:via-gray-950 dark:to-brand-primary-dark/10 transition-colors duration-300">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-brand-primary/5 dark:bg-brand-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-brand-primary-dark/5 dark:bg-brand-primary-dark/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-lg">
        {step !== "success" && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex items-center justify-center gap-2 mb-6"
          >
            {FORGOT_STEPS.map((s, i) => (
              <div key={s.key} className="flex items-center gap-2">
                <div
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 ${
                    i <= currentStepIndex
                      ? "bg-brand-primary text-white shadow-md shadow-brand-primary/25"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500"
                  }`}
                >
                  <s.icon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{s.label}</span>
                  <span className="sm:hidden">{i + 1}</span>
                </div>
                {i < FORGOT_STEPS.length - 1 && (
                  <div
                    className={`w-6 h-0.5 rounded-full transition-all duration-300 ${
                      i < currentStepIndex
                        ? "bg-brand-primary"
                        : "bg-gray-200 dark:bg-gray-700"
                    }`}
                  />
                )}
              </div>
            ))}
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {step === "method" && (
            <motion.div
              key="method"
              variants={cardVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={cardTransition}
            >
              <ForgotStepMethod
                email={email}
                setEmail={setEmail}
                loading={submitting}
                onSend={handleSendOtp}
                onBack={() => router.push("/login")}
              />
            </motion.div>
          )}

          {step === "otp" && (
            <motion.div
              key="otp"
              variants={cardVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={cardTransition}
            >
              <ForgotStepOtp
                email={email}
                otp={otp}
                otpRefs={otpRefs}
                cooldown={cooldown}
                loading={submitting}
                onOtpChange={handleOtpChange}
                onOtpKeyDown={handleOtpKeyDown}
                onOtpPaste={handleOtpPaste}
                onVerify={() => handleVerifyOtp(otp.join(""))}
                onResend={handleResendOtp}
                onBack={() => {
                  setStep("method");
                  setOtp(["", "", "", "", "", ""]);
                }}
              />
            </motion.div>
          )}

          {step === "reset" && (
            <motion.div
              key="reset"
              variants={cardVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={cardTransition}
            >
              <ForgotStepReset
                loading={submitting}
                onReset={handleResetPassword}
              />
            </motion.div>
          )}

          {step === "success" && (
            <motion.div
              key="success"
              variants={cardVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={cardTransition}
            >
              <ForgotStepSuccess onBackToLogin={() => router.push("/login")} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
