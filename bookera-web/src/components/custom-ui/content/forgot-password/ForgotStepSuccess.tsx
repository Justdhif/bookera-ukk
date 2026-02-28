"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ArrowRight } from "lucide-react";

interface ForgotStepSuccessProps {
  onBackToLogin: () => void;
}

export default function ForgotStepSuccess({ onBackToLogin }: ForgotStepSuccessProps) {
  return (
    <Card className="w-full border-0 dark:border dark:border-gray-700 shadow-2xl backdrop-blur-sm bg-white/95 dark:bg-gray-900/95 transition-colors overflow-hidden">
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-24 h-1.5 bg-linear-to-r from-green-400 to-green-600 rounded-full" />
      <CardContent className="py-12 px-8 text-center space-y-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 15, delay: 0.2 }}
          className="flex justify-center"
        >
          <div className="w-20 h-20 rounded-full bg-linear-to-br from-green-400 to-green-600 flex items-center justify-center shadow-xl shadow-green-500/30">
            <CheckCircle2 className="w-10 h-10 text-white" />
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-2"
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors">
            Password Reset Successful!
          </h2>
          <p className="text-gray-600 dark:text-gray-300 transition-colors">
            Your password has been updated. Please sign in with your new password.
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Button
            type="button"
            onClick={onBackToLogin}
            className="h-12 px-8 text-base font-semibold rounded-lg bg-linear-to-r from-brand-primary to-brand-primary-dark hover:from-brand-primary-dark hover:to-brand-primary-darker transition-all duration-300 shadow-lg shadow-brand-primary/25 hover:shadow-xl hover:shadow-brand-primary/30"
          >
            Back to Login
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </motion.div>
      </CardContent>
    </Card>
  );
}
