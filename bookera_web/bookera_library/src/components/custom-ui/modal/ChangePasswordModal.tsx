"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { authService } from "@/services/auth.service";
import PasswordRequirements, {
  isPasswordValid,
} from "@/components/custom-ui/content/admin/auth/PasswordRequirements";

interface ChangePasswordModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export default function ChangePasswordModal({
  open,
  onOpenChange,
  onSuccess,
}: ChangePasswordModalProps) {
  const t = useTranslations("profile");
  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] =
    useState(false);

  useEffect(() => {
    if (open) {
      setCurrentPassword("");
      setPassword("");
      setPasswordConfirmation("");
      setShowCurrentPassword(false);
      setShowPassword(false);
      setShowPasswordConfirmation(false);
    }
  }, [open]);

  const handleSubmit = async () => {
    if (!currentPassword) {
      toast.error(t("currentPasswordRequired"));
      return;
    }
    if (!password) {
      toast.error(t("newPasswordRequired"));
      return;
    }
    if (!isPasswordValid(password)) {
      toast.error(t("passwordRequirementsError"));
      return;
    }
    if (password !== passwordConfirmation) {
      toast.error(t("passwordMismatchError"));
      return;
    }

    try {
      setSubmitting(true);
      await authService.changePassword({
        current_password: currentPassword,
        password,
        password_confirmation: passwordConfirmation,
      });
      toast.success(t("updatePasswordSuccess"));
      onSuccess?.();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || t("failedUpdate"));
    } finally {
      setSubmitting(false);
    }
  };

  const isFormValid =
    currentPassword &&
    isPasswordValid(password) &&
    passwordConfirmation === password;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && isFormValid) {
      handleSubmit();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-brand-primary/10">
              <Lock className="h-4 w-4 text-brand-primary" />
            </div>
            {t("changePasswordTitle")}
          </DialogTitle>
          <DialogDescription>
            {t("changePasswordDescription")}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-1">
          <div className="space-y-2 relative">
            <div className="flex items-center justify-between">
              <Label htmlFor="current-password" variant="required">
                {t("currentPasswordLabel")}
              </Label>
              <Link
                href="/forgot-password"
                className="text-xs text-brand-primary hover:text-brand-primary/80 font-medium transition-colors"
                onClick={() => onOpenChange(false)}
              >
                {t("forgotPasswordLink")}
              </Link>
            </div>
            <div className="relative">
              <Input
                id="current-password"
                type={showCurrentPassword ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                disabled={submitting}
                onKeyDown={handleKeyDown}
                placeholder={t("currentPasswordPlaceholder")}
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-transparent"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              >
                {showCurrentPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
          <div className="space-y-2 relative">
            <Label htmlFor="new-password" variant="required">
              {t("newPasswordLabel")}
            </Label>
            <div className="relative">
              <Input
                id="new-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={submitting}
                onKeyDown={handleKeyDown}
                placeholder={t("newPasswordPlaceholder")}
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            <PasswordRequirements
              password={password}
              visible={password.length > 0}
            />
          </div>
          <div className="space-y-2 relative">
            <Label htmlFor="password-confirmation" variant="required">
              {t("confirmPasswordLabel")}
            </Label>
            <div className="relative">
              <Input
                id="password-confirmation"
                type={showPasswordConfirmation ? "text" : "password"}
                value={passwordConfirmation}
                onChange={(e) => setPasswordConfirmation(e.target.value)}
                disabled={submitting}
                onKeyDown={handleKeyDown}
                placeholder={t("confirmPasswordPlaceholder")}
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-transparent"
                onClick={() =>
                  setShowPasswordConfirmation(!showPasswordConfirmation)
                }
              >
                {showPasswordConfirmation ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="brand"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            {t("batal")}
          </Button>
          <Button
            type="button"
            variant="submit"
            onClick={handleSubmit}
            disabled={submitting || !isFormValid}
            loading={submitting}
          >
            {submitting ? t("saving") : t("savePasswordBtn")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

