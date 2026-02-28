"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, ArrowRight, Eye, EyeOff, ShieldCheck } from "lucide-react";
import PasswordRequirements, { isPasswordValid } from "@/components/custom-ui/content/auth/PasswordRequirements";

const iconPopTransition = {
  type: "spring" as const,
  stiffness: 400,
  damping: 15,
  delay: 0.2,
};

interface ForgotStepResetProps {
  loading: boolean;
  onReset: (newPassword: string, confirmPassword: string) => void;
}

export default function ForgotStepReset({ loading, onReset }: ForgotStepResetProps) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const passwordValid = isPasswordValid(newPassword);
  const confirmMismatch = confirmPassword.length > 0 && confirmPassword !== newPassword;
  const confirmMatch = confirmPassword.length > 0 && confirmPassword === newPassword;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordValid || confirmMismatch || !confirmPassword) return;
    onReset(newPassword, confirmPassword);
  };

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
            <Lock className="w-7 h-7 text-white" />
          </div>
        </motion.div>
        <div>
          <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white transition-colors">
            Create New Password
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-300 transition-colors mt-2">
            Enter a new secure password for your account
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="pb-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1">
            <Label htmlFor="new-password" variant="required">
              <Lock className="w-4 h-4" />
              New Password
            </Label>
            <div className="relative">
              <Input
                id="new-password"
                placeholder="Create a strong password"
                type={showNew ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className={`h-12 px-4 pr-12 transition-all duration-200 border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white hover:border-brand-primary/50 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 ${
                  newPassword && passwordValid
                    ? "border-green-400 dark:border-green-600 focus:border-green-500 focus:ring-green-200"
                    : ""
                }`}
                disabled={loading}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-1 top-1/2 -translate-y-1/2 h-9 w-9 text-gray-400 dark:text-gray-300 hover:text-brand-primary hover:bg-transparent"
                disabled={loading}
              >
                {showNew ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </Button>
            </div>
            <PasswordRequirements password={newPassword} visible={newPassword.length > 0} />
          </div>

          <div className="space-y-1">
            <Label htmlFor="confirm-password" variant="required">
              <ShieldCheck className="w-4 h-4" />
              Confirm New Password
            </Label>
            <div className="relative">
              <Input
                id="confirm-password"
                placeholder="Re-enter your password"
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className={`h-12 px-4 pr-12 transition-all duration-200 border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white hover:border-brand-primary/50 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 ${
                  confirmMismatch
                    ? "border-red-400 dark:border-red-500 focus:border-red-500 focus:ring-red-200"
                    : confirmMatch
                    ? "border-green-400 dark:border-green-600 focus:border-green-500 focus:ring-green-200"
                    : ""
                }`}
                disabled={loading}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-1 top-1/2 -translate-y-1/2 h-9 w-9 text-gray-400 dark:text-gray-300 hover:text-brand-primary hover:bg-transparent"
                disabled={loading}
              >
                {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </Button>
            </div>
            {confirmMismatch && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs text-red-500"
              >
                Passwords do not match
              </motion.p>
            )}
          </div>

          <Button
            type="submit"
            variant="submit"
            loading={loading}
            disabled={!newPassword || !confirmPassword || !passwordValid || confirmMismatch || loading}
            className="w-full h-12 text-base font-semibold rounded-lg bg-linear-to-r from-brand-primary to-brand-primary-dark hover:from-brand-primary-dark hover:to-brand-primary-darker transition-all duration-300 shadow-lg shadow-brand-primary/25 hover:shadow-xl hover:shadow-brand-primary/30"
            spinnerClassName="text-white"
          >
            {loading ? "Saving..." : (<>Reset Password<ArrowRight className="w-5 h-5 ml-2" /></>)}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
