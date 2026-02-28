"use client";

import { motion } from "framer-motion";
import { SetupStep } from "./SetupProfileClient";

interface Step {
  key: SetupStep;
  label: string;
  icon: React.ElementType;
}

interface SetupStepIndicatorProps {
  steps: Step[];
  currentStepIndex: number;
}

export default function SetupStepIndicator({
  steps,
  currentStepIndex,
}: SetupStepIndicatorProps) {
  return (
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
                i < currentStepIndex
                  ? "bg-brand-primary"
                  : "bg-gray-200 dark:bg-gray-700"
              }`}
            />
          )}
        </div>
      ))}
    </motion.div>
  );
}
