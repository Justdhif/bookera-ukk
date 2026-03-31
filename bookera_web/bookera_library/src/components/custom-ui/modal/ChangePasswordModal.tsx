"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
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
      toast.error("Password saat ini wajib diisi");
      return;
    }
    if (!password) {
      toast.error("Password baru wajib diisi");
      return;
    }
    if (!isPasswordValid(password)) {
      toast.error("Password baru tidak memenuhi syarat");
      return;
    }
    if (password !== passwordConfirmation) {
      toast.error("Konfirmasi password tidak cocok");
      return;
    }
    try {
      setSubmitting(true);
      await authService.changePassword({
        current_password: currentPassword,
        password,
        password_confirmation: passwordConfirmation,
      });
      toast.success("Password berhasil diubah");
      onSuccess?.();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Gagal mengubah password");
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
            Ganti Password
          </DialogTitle>
          <DialogDescription>
            Masukkan password saat ini dan password baru Anda.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-1">
          <div className="space-y-2 relative">
            <div className="flex items-center justify-between">
              <Label htmlFor="current-password" variant="required">
                Password Saat Ini
              </Label>
              <Link
                href="/forgot-password"
                className="text-xs text-brand-primary hover:text-brand-primary/80 font-medium transition-colors"
                onClick={() => onOpenChange(false)}
              >
                Lupa password?
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
                placeholder="Masukkan password saat ini"
                className="pr-10"
              />
              <Button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
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
              Password Baru
            </Label>
            <div className="relative">
              <Input
                id="new-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={submitting}
                onKeyDown={handleKeyDown}
                placeholder="Masukkan password baru"
                className="pr-10"
              />
              <Button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
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
              Konfirmasi Password
            </Label>
            <div className="relative">
              <Input
                id="password-confirmation"
                type={showPasswordConfirmation ? "text" : "password"}
                value={passwordConfirmation}
                onChange={(e) => setPasswordConfirmation(e.target.value)}
                disabled={submitting}
                onKeyDown={handleKeyDown}
                placeholder="Ketik ulang password baru"
                className="pr-10"
              />
              <Button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
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
            Batal
          </Button>
          <Button
            type="button"
            variant="submit"
            onClick={handleSubmit}
            disabled={submitting || !isFormValid}
            loading={submitting}
          >
            {submitting ? "Menyimpan..." : "Simpan Password"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
