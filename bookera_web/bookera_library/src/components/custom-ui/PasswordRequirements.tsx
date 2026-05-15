"use client";

import { Check, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";

interface Requirement {
  label: string;
  met: boolean;
}

interface PasswordRequirementsProps {
  password: string;
  visible: boolean;
}

function checkPasswordMet(password: string): boolean[] {
  return [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^a-zA-Z0-9]/.test(password),
  ];
}

export function isPasswordValid(password: string): boolean {
  return checkPasswordMet(password).every(Boolean);
}

export default function PasswordRequirements({
  password,
  visible,
}: PasswordRequirementsProps) {
  const t = useTranslations("auth");
  const metResults = checkPasswordMet(password);
  const requirements: Requirement[] = [
    { label: t("atLeast8Chars"), met: metResults[0] },
    { label: t("oneUppercase"), met: metResults[1] },
    { label: t("oneNumber"), met: metResults[2] },
    { label: t("specialChar"), met: metResults[3] },
  ];
  const allMet = requirements.every((r) => r.met);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}
          className="overflow-hidden"
        >
          <div
            className={`mt-2 p-3 rounded-lg border transition-colors duration-300 ${
              allMet
                ? "border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/30"
                : "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50"
            }`}
          >
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
              {requirements.map((req) => (
                <motion.div
                  key={req.label}
                  className="flex items-center gap-2"
                  animate={{ opacity: 1 }}
                >
                  <span
                    className={`shrink-0 w-4 h-4 rounded-full flex items-center justify-center transition-colors duration-200 ${
                      req.met
                        ? "bg-green-500 text-white"
                        : "bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500"
                    }`}
                  >
                    {req.met ? (
                      <Check className="w-2.5 h-2.5" />
                    ) : (
                      <X className="w-2.5 h-2.5" />
                    )}
                  </span>
                  <span
                    className={`text-xs transition-colors duration-200 ${
                      req.met
                        ? "text-green-700 dark:text-green-400 font-medium"
                        : "text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    {req.label}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
