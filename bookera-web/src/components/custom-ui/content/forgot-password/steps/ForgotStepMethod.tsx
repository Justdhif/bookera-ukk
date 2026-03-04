"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, KeyRound, ArrowLeft, Send } from "lucide-react";

const iconPopTransition = {
  type: "spring" as const,
  stiffness: 400,
  damping: 15,
  delay: 0.2,
};

interface ForgotStepMethodProps {
  email: string;
  setEmail: (v: string) => void;
  loading: boolean;
  onSend: () => void;
  onBack: () => void;
}

export default function ForgotStepMethod({
  email,
  setEmail,
  loading,
  onSend,
  onBack,
}: ForgotStepMethodProps) {
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
            <KeyRound className="w-7 h-7 text-white" />
          </div>
        </motion.div>
        <div>
          <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white transition-colors">
            Forgot Password?
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-300 transition-colors mt-2">
            Enter your email to receive a verification code
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pb-8">
        <div className="space-y-2">
          <Label htmlFor="forgot-email">
            <Mail className="w-4 h-4" />
            Email Address
          </Label>
          <Input
            id="forgot-email"
            placeholder="email@school.edu"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="h-12 px-4 transition-all duration-200 border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white hover:border-brand-primary/50 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
            disabled={loading}
            onKeyDown={(e) => e.key === "Enter" && onSend()}
          />
        </div>
        <button
          type="button"
          onClick={onSend}
          disabled={loading || !email.trim()}
          className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-brand-primary/20 dark:border-brand-primary/30 bg-brand-primary/5 dark:bg-brand-primary/10 hover:border-brand-primary/50 hover:bg-brand-primary/10 dark:hover:bg-brand-primary/20 transition-all duration-200 group disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="w-12 h-12 rounded-xl bg-linear-to-br from-brand-primary to-brand-primary-dark flex items-center justify-center shadow-md shadow-brand-primary/20 group-hover:shadow-lg group-hover:shadow-brand-primary/30 transition-all">
            <Mail className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 text-left">
            <p className="font-semibold text-gray-900 dark:text-white transition-colors">
              Send via Email
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors">
              {email
                ? `Verification code will be sent to ${email}`
                : "Enter your email first"}
            </p>
          </div>
          <Send className="w-5 h-5 text-brand-primary group-hover:translate-x-1 transition-transform" />
        </button>
        <div className="text-center pt-2">
          <Button
            type="button"
            variant="link"
            onClick={onBack}
            className="text-sm text-gray-600 dark:text-gray-400 hover:text-brand-primary p-0 h-auto inline-flex items-center gap-1"
            disabled={loading}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to login
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
