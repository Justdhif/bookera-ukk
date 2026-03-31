"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
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
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  ArrowRight,
  UserPlus,
  ShieldCheck,
} from "lucide-react";
import PasswordRequirements, {
  isPasswordValid,
} from "@/components/custom-ui/content/admin/auth/PasswordRequirements";

interface RegisterFormProps {
  loading: boolean;
  onRegister: (
    email: string,
    password: string,
    passwordConfirm: string,
  ) => void;
  onSwitchToLogin: () => void;
  onOpenTos: () => void;
  onOpenPrivacy: () => void;
}

const inputClassName =
  "h-12 px-4 transition-all duration-200 border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white hover:border-brand-primary/50 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20";

export default function RegisterForm({
  loading,
  onRegister,
  onSwitchToLogin,
  onOpenTos,
  onOpenPrivacy,
}: RegisterFormProps) {
  const t = useTranslations("login");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    passwordConfirm: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const passwordValid = isPasswordValid(formData.password);
  const confirmMismatch =
    formData.passwordConfirm.length > 0 &&
    formData.passwordConfirm !== formData.password;
  const confirmMatch =
    formData.passwordConfirm.length > 0 &&
    formData.passwordConfirm === formData.password;

  const handleSubmit = (e?: React.FormEvent | React.MouseEvent) => {
    e?.preventDefault();
    if (!passwordValid || confirmMismatch || !formData.passwordConfirm) return;
    onRegister(formData.email, formData.password, formData.passwordConfirm);
  };

  return (
    <Card className="w-full border-0 dark:border dark:border-gray-700 shadow-2xl backdrop-blur-sm bg-white/95 dark:bg-gray-900/95 transition-colors overflow-hidden">
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-24 h-1.5 bg-linear-to-r from-brand-primary-light to-brand-primary rounded-full" />
      <CardHeader className="space-y-4 text-center pb-6">
        <div className="flex items-center justify-center gap-2">
          <UserPlus className="w-6 h-6 text-brand-primary" />
          <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white transition-colors">
            {t("createAccount")}
          </CardTitle>
        </div>
        <CardDescription className="text-gray-600 dark:text-gray-300 transition-colors">
          {t("createAccountDesc")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="register-email">
              <Mail className="w-4 h-4" />
              {t("email")}
            </Label>
            <Input
              id="register-email"
              name="email"
              placeholder={t("registerEmailPlaceholder")}
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className={inputClassName}
              disabled={loading}
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="register-password">
              <Lock className="w-4 h-4" />
              {t("password")}
            </Label>
            <div className="relative">
              <Input
                id="register-password"
                name="password"
                placeholder={t("createPasswordPlaceholder")}
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleInputChange}
                required
                className={`${inputClassName} pr-12 ${
                  formData.password && passwordValid
                    ? "border-green-400 dark:border-green-600 focus:border-green-500 focus:ring-green-200"
                    : ""
                }`}
                disabled={loading}
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
            <PasswordRequirements
              password={formData.password}
              visible={formData.password.length > 0}
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="register-password-confirm">
              <ShieldCheck className="w-4 h-4" />
              {t("confirmPassword")}
            </Label>
            <div className="relative">
              <Input
                id="register-password-confirm"
                name="passwordConfirm"
                placeholder={t("reEnterPassword")}
                type={showPasswordConfirm ? "text" : "password"}
                value={formData.passwordConfirm}
                onChange={handleInputChange}
                required
                className={`${inputClassName} pr-12 ${
                  confirmMismatch
                    ? "border-red-400 dark:border-red-500 focus:border-red-500 focus:ring-red-200"
                    : confirmMatch
                      ? "border-green-400 dark:border-green-600 focus:border-green-500 focus:ring-green-200"
                      : ""
                }`}
                disabled={loading}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                className="absolute right-1 top-1/2 -translate-y-1/2 h-9 w-9 text-gray-400 dark:text-gray-300 hover:text-brand-primary hover:bg-transparent"
                disabled={loading}
              >
                {showPasswordConfirm ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </Button>
            </div>
            {confirmMismatch && (
              <p className="text-xs text-red-500 mt-1">
                {t("passwordMismatch")}
              </p>
            )}
          </div>

          <Button
            type="button"
            onClick={handleSubmit}
            className="w-full h-12 rounded-xl bg-linear-to-r from-brand-primary to-brand-primary-dark hover:from-brand-primary-dark hover:to-brand-primary text-white font-semibold transition-all duration-300 shadow-lg shadow-brand-primary/25 hover:shadow-xl hover:shadow-brand-primary/30 disabled:opacity-70"
            disabled={
              loading ||
              !formData.email ||
              !formData.password ||
              !formData.passwordConfirm ||
              !passwordValid ||
              confirmMismatch
            }
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                {t("registering")}
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                {t("registerBtn")}
                <ArrowRight className="w-4 h-4" />
              </div>
            )}
          </Button>

          <div className="text-center pt-2">
            <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors">
              {t("hasAccount")}{" "}
              <Button
                type="button"
                variant="link"
                onClick={onSwitchToLogin}
                className="font-semibold text-brand-primary hover:text-brand-primary-dark p-0 h-auto underline-offset-4"
                disabled={loading}
              >
                {t("signInHere")}
              </Button>
            </p>
          </div>

          <div className="text-center text-xs text-gray-500 dark:text-gray-400 space-y-1 transition-colors">
            <p>{t("agreeRegister")}</p>
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
