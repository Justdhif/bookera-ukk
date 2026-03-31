"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Eye, EyeOff, Mail, Lock, ArrowRight, LogIn } from "lucide-react";
import ReCAPTCHA from "react-google-recaptcha";

interface LoginFormProps {
  loading: boolean;
  onLogin: (email: string, password: string) => void;
  onSwitchToRegister: () => void;
  onOpenTos: () => void;
  onOpenPrivacy: () => void;
  recaptchaRef: React.RefObject<ReCAPTCHA | null>;
  siteKey: string;
  onRecaptchaChange: (token: string | null) => void;
  resetRecaptcha?: () => void;
  recaptchaReady?: boolean;
}

const inputClassName =
  "h-12 px-4 transition-all duration-200 border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white hover:border-brand-primary/50 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20";

export default function LoginForm({
  loading,
  onLogin,
  onSwitchToRegister,
  onOpenTos,
  onOpenPrivacy,
  recaptchaRef,
  siteKey,
  onRecaptchaChange,
  recaptchaReady = true,
}: LoginFormProps) {
  const t = useTranslations("login");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e?: React.FormEvent | React.MouseEvent) => {
    e?.preventDefault();
    onLogin(formData.email, formData.password);
  };

  return (
    <Card className="w-full border-0 dark:border dark:border-gray-700 shadow-2xl backdrop-blur-sm bg-white/95 dark:bg-gray-900/95 transition-colors overflow-hidden">
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-24 h-1.5 bg-linear-to-r from-brand-primary to-brand-primary-light rounded-full" />
      <CardHeader className="space-y-4 text-center pb-6">
        <div className="flex items-center justify-center gap-2">
          <LogIn className="w-6 h-6 text-brand-primary" />
          <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white transition-colors">
            {t("signIn")}
          </CardTitle>
        </div>
        <CardDescription className="text-gray-600 dark:text-gray-300 transition-colors">
          {t("signInDesc")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="login-email">
              <Mail className="w-4 h-4" />
              {t("email")}
            </Label>
            <div className="relative">
              <Input
                id="login-email"
                name="email"
                placeholder={t("emailPlaceholder")}
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className={inputClassName}
                disabled={loading}
              />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="login-password">
                <Lock className="w-4 h-4" />
                {t("password")}
              </Label>
              <Link
                href="/forgot-password"
                className="text-xs font-semibold text-brand-primary hover:text-brand-primary-dark transition-colors"
                tabIndex={-1}
              >
                {t("forgotPassword")}
              </Link>
            </div>
            <div className="relative">
              <Input
                id="login-password"
                name="password"
                placeholder="••••••••"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleInputChange}
                required
                className={`${inputClassName} pr-12`}
                disabled={loading}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-1 top-1/2 -translate-y-1/2 h-9 w-9 text-gray-400 dark:text-gray-300 hover:text-brand-primary hover:bg-transparent"
                disabled={loading}
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </Button>
            </div>
          </div>
          <div className="flex justify-center py-2">
            <ReCAPTCHA
              ref={recaptchaRef}
              sitekey={siteKey}
              onChange={onRecaptchaChange}
              theme="light" // or use a theme from context/props
            />
          </div>
          {/* Old forgot password link removed from here */}
          <Button
            type="button"
            variant="submit"
            loading={loading}
            onClick={handleSubmit}
            disabled={loading || !recaptchaReady}
            className="w-full h-12 text-base font-semibold rounded-lg bg-linear-to-r from-brand-primary to-brand-primary-dark hover:from-brand-primary-dark hover:to-brand-primary-darker transition-all duration-300 shadow-lg shadow-brand-primary/25 hover:shadow-xl hover:shadow-brand-primary/30"
            spinnerClassName="text-white"
          >
            {loading ? (
              t("signingIn")
            ) : (
              <div className="flex items-center justify-center">
                {t("signInButton")}
                <ArrowRight className="w-5 h-5 ml-2" />
              </div>
            )}
          </Button>
          <div className="text-center pt-2">
            <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors">
               {t("noAccount")}{" "}
              <Button
                type="button"
                variant="link"
                onClick={onSwitchToRegister}
                className="font-semibold text-brand-primary hover:text-brand-primary-dark p-0 h-auto underline-offset-4"
                disabled={loading}
              >
                {t("registerNow")}
              </Button>
            </p>
          </div>
          <div className="text-center text-xs text-gray-500 dark:text-gray-400 space-y-1 transition-colors">
            <p>{t("agreeText")}</p>
            <div className="flex items-center justify-center gap-1 flex-wrap">
              <Button
                type="button"
                variant="link"
                onClick={onOpenTos}
                className="text-brand-primary hover:text-brand-primary-dark font-medium p-0 h-auto text-xs"
                disabled={loading}
              >
                {t("termsOfService")}
              </Button>
              <span>{t("and")}</span>
              <Button
                type="button"
                variant="link"
                onClick={onOpenPrivacy}
                className="text-brand-primary hover:text-brand-primary-dark font-medium p-0 h-auto text-xs"
                disabled={loading}
              >
                {t("privacyPolicy")}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
