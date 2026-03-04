"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShieldCheck, ArrowRight, ArrowLeft, RefreshCw } from "lucide-react";

const iconPopTransition = {
  type: "spring" as const,
  stiffness: 400,
  damping: 15,
  delay: 0.2,
};

interface ForgotStepOtpProps {
  email: string;
  otp: string[];
  otpRefs: React.MutableRefObject<(HTMLInputElement | null)[]>;
  cooldown: number;
  loading: boolean;
  onOtpChange: (index: number, value: string) => void;
  onOtpKeyDown: (index: number, e: React.KeyboardEvent<HTMLInputElement>) => void;
  onOtpPaste: (e: React.ClipboardEvent<HTMLInputElement>) => void;
  onVerify: () => void;
  onResend: () => void;
  onBack: () => void;
}

export default function ForgotStepOtp({
  email,
  otp,
  otpRefs,
  cooldown,
  loading,
  onOtpChange,
  onOtpKeyDown,
  onOtpPaste,
  onVerify,
  onResend,
  onBack,
}: ForgotStepOtpProps) {
  return (
    <Card className="w-full border-0 dark:border dark:border-gray-700 shadow-2xl backdrop-blur-sm bg-white/95 dark:bg-gray-900/95 transition-colors overflow-hidden">
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-24 h-1.5 bg-linear-to-r from-brand-primary to-brand-primary-light rounded-full" />
      <CardHeader className="space-y-4 text-center pb-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={iconPopTransition}
          className="flex items-center justify-center"
        >
          <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-brand-primary to-brand-primary-dark flex items-center justify-center shadow-lg shadow-brand-primary/30">
            <ShieldCheck className="w-7 h-7 text-white" />
          </div>
        </motion.div>
        <div>
          <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white transition-colors">
            OTP Verification
          </CardTitle>
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
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.05 }}
            >
              <Input
                ref={(el) => { otpRefs.current[index] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => onOtpChange(index, e.target.value)}
                onKeyDown={(e) => onOtpKeyDown(index, e)}
                onPaste={index === 0 ? onOtpPaste : undefined}
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
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
            Didn&apos;t receive the code?
          </p>
          {cooldown > 0 ? (
            <p className="text-sm text-gray-400 dark:text-gray-500 inline-flex items-center gap-1.5">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              Resend in{" "}
              <span className="font-bold text-brand-primary tabular-nums">
                {cooldown}
              </span>{" "}
              seconds
            </p>
          ) : (
            <Button
              type="button"
              variant="link"
              onClick={onResend}
              disabled={loading}
              className="text-sm font-semibold text-brand-primary hover:text-brand-primary-dark p-0 h-auto inline-flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Resend Code
            </Button>
          )}
        </div>
        <Button
          type="button"
          variant="submit"
          loading={loading}
          onClick={onVerify}
          disabled={otp.join("").length !== 6 || loading}
          className="w-full h-12 text-base font-semibold rounded-lg bg-linear-to-r from-brand-primary to-brand-primary-dark hover:from-brand-primary-dark hover:to-brand-primary-darker transition-all duration-300 shadow-lg shadow-brand-primary/25 hover:shadow-xl hover:shadow-brand-primary/30"
          spinnerClassName="text-white"
        >
          {loading ? "Verifying..." : (<>Verify Code<ArrowRight className="w-5 h-5 ml-2" /></>)}
        </Button>
        <div className="text-center">
          <Button
            type="button"
            variant="link"
            onClick={onBack}
            className="text-sm text-gray-600 dark:text-gray-400 hover:text-brand-primary p-0 h-auto inline-flex items-center gap-1"
            disabled={loading}
          >
            <ArrowLeft className="w-4 h-4" />
            Change delivery method
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
