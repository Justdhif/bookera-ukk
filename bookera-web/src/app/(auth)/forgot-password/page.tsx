"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { authService } from "@/services/auth.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Mail,
  Lock,
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  KeyRound,
  ShieldCheck,
  CheckCircle2,
  Send,
  RefreshCw,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Step = "method" | "otp" | "reset" | "success";

const cardVariants = {
  enter: { x: 60, opacity: 0, scale: 0.96 },
  center: { x: 0, opacity: 1, scale: 1 },
  exit: { x: -60, opacity: 0, scale: 0.96 },
};

const cardTransition = {
  x: { type: "spring" as const, stiffness: 350, damping: 30 },
  opacity: { duration: 0.25 },
  scale: { duration: 0.25 },
};

const iconPopTransition = {
  type: "spring" as const,
  stiffness: 400,
  damping: 15,
  delay: 0.2,
};

const steps = [
  { key: "method", label: "Method", icon: Mail },
  { key: "otp", label: "Verify", icon: KeyRound },
  { key: "reset", label: "New Password", icon: Lock },
];

const strengthLabels = ["", "Very Weak", "Weak", "Fair", "Strong", "Very Strong"];
const strengthColors = [
  "bg-gray-200 dark:bg-gray-700",
  "bg-red-500",
  "bg-orange-500",
  "bg-yellow-500",
  "bg-blue-500",
  "bg-green-500",
];

function getPasswordStrength(password: string) {
  let strength = 0;
  if (password.length >= 8) strength++;
  if (/[a-z]/.test(password)) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[^a-zA-Z0-9]/.test(password)) strength++;
  return strength;
}

export default function ForgotPasswordPage() {
  const router = useRouter();

  const [step, setStep] = useState<Step>("method");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [cooldown, setCooldown] = useState(0);
  const cooldownRef = useRef<NodeJS.Timeout | null>(null);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const passwordStrength = getPasswordStrength(newPassword);
  const currentStepIndex = steps.findIndex((s) => s.key === step);

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
    setLoading(true);
    try {
      const res = await authService.forgotPassword(email);
      toast.success(res.data.message || "Verification code sent to your email");
      setStep("otp");
      startCooldown();
      setTimeout(() => otpRefs.current[0]?.focus(), 400);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to send verification code");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (cooldown > 0) return;
    setLoading(true);
    try {
      const res = await authService.forgotPassword(email);
      toast.success(res.data.message || "Verification code resent");
      setOtp(["", "", "", "", "", ""]);
      startCooldown();
      otpRefs.current[0]?.focus();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to resend verification code");
    } finally {
      setLoading(false);
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

  const handleVerifyOtp = async (otpCode: string) => {
    if (otpCode.length !== 6) {
      toast.error("Please enter all 6 digits");
      return;
    }
    setStep("reset");
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      const otpCode = otp.join("");
      const res = await authService.resetPassword(email, otpCode, newPassword, confirmPassword);
      toast.success(res.data.message || "Password reset successfully!");
      setStep("success");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to reset password");
      if (err.response?.status === 410 || err.response?.status === 422) {
        setOtp(["", "", "", "", "", ""]);
        setStep("otp");
      }
    } finally {
      setLoading(false);
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
            {steps.map((s, i) => (
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
                {i < steps.length - 1 && (
                  <div
                    className={`w-6 h-0.5 rounded-full transition-all duration-300 ${
                      i < currentStepIndex ? "bg-brand-primary" : "bg-gray-200 dark:bg-gray-700"
                    }`}
                  />
                )}
              </div>
            ))}
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {step === "method" && (
            <motion.div key="method" variants={cardVariants} initial="enter" animate="center" exit="exit" transition={cardTransition}>
              <Card className="w-full border-0 dark:border dark:border-gray-700 shadow-2xl backdrop-blur-sm bg-white/95 dark:bg-gray-900/95 transition-colors overflow-hidden">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-24 h-1.5 bg-linear-to-r from-brand-primary to-brand-primary-light rounded-full" />
                <CardHeader className="space-y-4 text-center pb-4">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={iconPopTransition} className="flex items-center justify-center">
                    <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-brand-primary to-brand-primary-dark flex items-center justify-center shadow-lg shadow-brand-primary/30">
                      <KeyRound className="w-7 h-7 text-white" />
                    </div>
                  </motion.div>
                  <div>
                    <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white transition-colors">Forgot Password?</CardTitle>
                    <CardDescription className="text-gray-600 dark:text-gray-300 transition-colors mt-2">Choose a method to receive your verification code</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 pb-8">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-200 flex items-center gap-2 transition-colors">
                      <Mail className="w-4 h-4" />
                      Email Address
                    </label>
                    <Input
                      id="forgot-email"
                      placeholder="email@school.edu"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="h-12 px-4 transition-all duration-200 border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white hover:border-brand-primary/50 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
                      disabled={loading}
                      onKeyDown={(e) => e.key === "Enter" && handleSendOtp()}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={loading || !email.trim()}
                    className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-brand-primary/20 dark:border-brand-primary/30 bg-brand-primary/5 dark:bg-brand-primary/10 hover:border-brand-primary/50 hover:bg-brand-primary/10 dark:hover:bg-brand-primary/20 transition-all duration-200 group disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="w-12 h-12 rounded-xl bg-linear-to-br from-brand-primary to-brand-primary-dark flex items-center justify-center shadow-md shadow-brand-primary/20 group-hover:shadow-lg group-hover:shadow-brand-primary/30 transition-all">
                      <Mail className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-semibold text-gray-900 dark:text-white transition-colors">Send via Email</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors">
                        {email ? `Verification code will be sent to ${email}` : "Enter your email first"}
                      </p>
                    </div>
                    <Send className="w-5 h-5 text-brand-primary group-hover:translate-x-1 transition-transform" />
                  </button>
                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => router.push("/login")}
                      className="text-sm text-gray-600 dark:text-gray-400 hover:text-brand-primary transition-colors inline-flex items-center gap-1"
                      disabled={loading}
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Back to login
                    </button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {step === "otp" && (
            <motion.div key="otp" variants={cardVariants} initial="enter" animate="center" exit="exit" transition={cardTransition}>
              <Card className="w-full border-0 dark:border dark:border-gray-700 shadow-2xl backdrop-blur-sm bg-white/95 dark:bg-gray-900/95 transition-colors overflow-hidden">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-24 h-1.5 bg-linear-to-r from-brand-primary to-brand-primary-light rounded-full" />
                <CardHeader className="space-y-4 text-center pb-4">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={iconPopTransition} className="flex items-center justify-center">
                    <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-brand-primary to-brand-primary-dark flex items-center justify-center shadow-lg shadow-brand-primary/30">
                      <ShieldCheck className="w-7 h-7 text-white" />
                    </div>
                  </motion.div>
                  <div>
                    <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white transition-colors">OTP Verification</CardTitle>
                    <CardDescription className="text-gray-600 dark:text-gray-300 transition-colors mt-2">
                      Enter the 6-digit code sent to
                      <br />
                      <span className="font-medium text-brand-primary">{email}</span>
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6 pb-8">
                  <div className="flex justify-center gap-3">
                    {otp.map((digit, index) => (
                      <motion.div key={index} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + index * 0.05 }}>
                        <input
                          ref={(el) => { otpRefs.current[index] = el; }}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOtpChange(index, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(index, e)}
                          onPaste={index === 0 ? handleOtpPaste : undefined}
                          disabled={loading}
                          className={`w-12 h-14 sm:w-14 sm:h-16 text-center text-xl sm:text-2xl font-bold rounded-xl border-2 transition-all duration-200 outline-none
                            ${digit
                              ? "border-brand-primary bg-brand-primary/5 dark:bg-brand-primary/10 text-brand-primary"
                              : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            }
                            hover:border-brand-primary/50 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 focus:shadow-lg focus:shadow-brand-primary/10
                            disabled:opacity-50 disabled:cursor-not-allowed`}
                        />
                      </motion.div>
                    ))}
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Didn&apos;t receive the code?</p>
                    {cooldown > 0 ? (
                      <p className="text-sm text-gray-400 dark:text-gray-500 inline-flex items-center gap-1.5">
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        Resend in <span className="font-bold text-brand-primary tabular-nums">{cooldown}</span> seconds
                      </p>
                    ) : (
                      <button
                        type="button"
                        onClick={handleResendOtp}
                        disabled={loading}
                        className="text-sm font-semibold text-brand-primary hover:text-brand-primary-dark transition-colors hover:underline underline-offset-4 inline-flex items-center gap-1.5 disabled:opacity-50"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        Resend Code
                      </button>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="submit"
                    loading={loading}
                    onClick={() => handleVerifyOtp(otp.join(""))}
                    disabled={otp.join("").length !== 6 || loading}
                    className="w-full h-12 text-base font-semibold rounded-lg bg-linear-to-r from-brand-primary to-brand-primary-dark hover:from-brand-primary-dark hover:to-brand-primary-darker transition-all duration-300 shadow-lg shadow-brand-primary/25 hover:shadow-xl hover:shadow-brand-primary/30"
                    spinnerClassName="text-white"
                  >
                    {loading ? "Verifying..." : (<>Verify Code<ArrowRight className="w-5 h-5 ml-2" /></>)}
                  </Button>
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => { setStep("method"); setOtp(["", "", "", "", "", ""]); }}
                      className="text-sm text-gray-600 dark:text-gray-400 hover:text-brand-primary transition-colors inline-flex items-center gap-1"
                      disabled={loading}
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Change delivery method
                    </button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {step === "reset" && (
            <motion.div key="reset" variants={cardVariants} initial="enter" animate="center" exit="exit" transition={cardTransition}>
              <Card className="w-full border-0 dark:border dark:border-gray-700 shadow-2xl backdrop-blur-sm bg-white/95 dark:bg-gray-900/95 transition-colors overflow-hidden">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-24 h-1.5 bg-linear-to-r from-brand-primary to-brand-primary-light rounded-full" />
                <CardHeader className="space-y-4 text-center pb-4">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={iconPopTransition} className="flex items-center justify-center">
                    <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-brand-primary to-brand-primary-dark flex items-center justify-center shadow-lg shadow-brand-primary/30">
                      <Lock className="w-7 h-7 text-white" />
                    </div>
                  </motion.div>
                  <div>
                    <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white transition-colors">Create New Password</CardTitle>
                    <CardDescription className="text-gray-600 dark:text-gray-300 transition-colors mt-2">Enter a new password for your account</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="pb-8">
                  <form onSubmit={handleResetPassword} className="space-y-5">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-200 flex items-center gap-2 transition-colors">
                        <Lock className="w-4 h-4" />
                        New Password
                      </label>
                      <div className="relative">
                        <Input
                          id="new-password"
                          placeholder="Min. 8 characters"
                          type={showNewPassword ? "text" : "password"}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          required
                          className="h-12 px-4 pr-12 transition-all duration-200 border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white hover:border-brand-primary/50 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
                          disabled={loading}
                        />
                        <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-300 hover:text-brand-primary transition-colors" disabled={loading}>
                          {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      {newPassword && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="space-y-1.5">
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((level) => (
                              <div
                                key={level}
                                className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                                  level <= passwordStrength ? strengthColors[passwordStrength] : "bg-gray-200 dark:bg-gray-700"
                                }`}
                              />
                            ))}
                          </div>
                          <p className={`text-xs font-medium transition-colors ${
                            passwordStrength <= 1 ? "text-red-500" : passwordStrength === 2 ? "text-orange-500" : passwordStrength === 3 ? "text-yellow-500" : passwordStrength === 4 ? "text-blue-500" : "text-green-500"
                          }`}>
                            {strengthLabels[passwordStrength]}
                          </p>
                        </motion.div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-200 flex items-center gap-2 transition-colors">
                        <ShieldCheck className="w-4 h-4" />
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <Input
                          id="confirm-password"
                          placeholder="Re-enter new password"
                          type={showConfirmPassword ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                          className={`h-12 px-4 pr-12 transition-all duration-200 border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white hover:border-brand-primary/50 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 ${
                            confirmPassword && confirmPassword !== newPassword
                              ? "border-red-400 dark:border-red-500 focus:border-red-500 focus:ring-red-200"
                              : confirmPassword && confirmPassword === newPassword
                              ? "border-green-400 dark:border-green-500 focus:border-green-500 focus:ring-green-200"
                              : ""
                          }`}
                          disabled={loading}
                        />
                        <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-300 hover:text-brand-primary transition-colors" disabled={loading}>
                          {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      {confirmPassword && confirmPassword !== newPassword && (
                        <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-xs text-red-500 flex items-center gap-1">
                          Passwords do not match
                        </motion.p>
                      )}
                    </div>
                    <Button
                      type="submit"
                      variant="submit"
                      loading={loading}
                      disabled={!newPassword || !confirmPassword || newPassword !== confirmPassword || loading}
                      className="w-full h-12 text-base font-semibold rounded-lg bg-linear-to-r from-brand-primary to-brand-primary-dark hover:from-brand-primary-dark hover:to-brand-primary-darker transition-all duration-300 shadow-lg shadow-brand-primary/25 hover:shadow-xl hover:shadow-brand-primary/30"
                      spinnerClassName="text-white"
                    >
                      {loading ? "Saving..." : (<>Reset Password<ArrowRight className="w-5 h-5 ml-2" /></>)}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {step === "success" && (
            <motion.div key="success" variants={cardVariants} initial="enter" animate="center" exit="exit" transition={cardTransition}>
              <Card className="w-full border-0 dark:border dark:border-gray-700 shadow-2xl backdrop-blur-sm bg-white/95 dark:bg-gray-900/95 transition-colors overflow-hidden">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-24 h-1.5 bg-linear-to-r from-green-400 to-green-600 rounded-full" />
                <CardContent className="py-12 px-8 text-center space-y-6">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 300, damping: 15, delay: 0.2 }} className="flex justify-center">
                    <div className="w-20 h-20 rounded-full bg-linear-to-br from-green-400 to-green-600 flex items-center justify-center shadow-xl shadow-green-500/30">
                      <CheckCircle2 className="w-10 h-10 text-white" />
                    </div>
                  </motion.div>
                  <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="space-y-2">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors">Password Reset Successful!</h2>
                    <p className="text-gray-600 dark:text-gray-300 transition-colors">Your password has been updated successfully. Please log in with your new password.</p>
                  </motion.div>
                  <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
                    <Button
                      type="button"
                      onClick={() => router.push("/login")}
                      className="h-12 px-8 text-base font-semibold rounded-lg bg-linear-to-r from-brand-primary to-brand-primary-dark hover:from-brand-primary-dark hover:to-brand-primary-darker transition-all duration-300 shadow-lg shadow-brand-primary/25 hover:shadow-xl hover:shadow-brand-primary/30"
                    >
                      Back to Login
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
