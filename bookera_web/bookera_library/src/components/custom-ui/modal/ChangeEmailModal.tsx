"use client";
import { useState, useEffect, useRef } from "react";
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
import { Mail, ShieldCheck, RefreshCw, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/axios";
import { cn } from "@/lib/utils";
interface ChangeEmailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentEmail?: string;
  onSuccess?: (newEmail: string) => void;
}
type Step = "change" | "otp";
const RESEND_COOLDOWN = 60;
export default function ChangeEmailModal({
  open,
  onOpenChange,
  currentEmail,
  onSuccess,
}: ChangeEmailModalProps) {
  const [step, setStep] = useState<Step>("change");
  const [newEmail, setNewEmail] = useState("");
  const [emailHint, setEmailHint] = useState("");
  const [otp, setOtp] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const otpRef = useRef<HTMLInputElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (open) {
      setStep("change");
      setNewEmail("");
      setEmailHint("");
      setOtp("");
      setResendCooldown(0);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
  }, [open]);
  useEffect(() => {
    if (step === "otp") {
      setTimeout(() => otpRef.current?.focus(), 100);
    }
  }, [step]);
  const startResendCooldown = () => {
    setResendCooldown(RESEND_COOLDOWN);
    intervalRef.current = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };
  const handleSendOtp = async () => {
    if (!newEmail || !/\S+@\S+\.\S+/.test(newEmail)) {
      toast.error("Masukkan alamat email yang valid");
      return;
    }
    try {
      setSubmitting(true);
      const res = await api.post("/email/request-change", {
        new_email: newEmail,
      });
      const hint = res.data?.data?.email_hint ?? newEmail;
      setEmailHint(hint);
      setStep("otp");
      startResendCooldown();
      toast.success("OTP berhasil dikirim ke alamat email baru Anda");
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Gagal mengirim OTP. Coba lagi.",
      );
    } finally {
      setSubmitting(false);
    }
  };
  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    await handleSendOtp();
  };
  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      toast.error("Masukkan 6 digit kode OTP");
      return;
    }
    try {
      setSubmitting(true);
      await api.post("/email/verify-otp", { otp });
      toast.success("Alamat email berhasil diperbarui");
      onSuccess?.(newEmail);
      onOpenChange(false);
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Kode OTP tidak valid atau kadaluarsa",
      );
    } finally {
      setSubmitting(false);
    }
  };
  const handleOtpInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 6);
    setOtp(val);
  };
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      if (step === "change") handleSendOtp();
      else handleVerifyOtp();
    }
  };
  const isEmailValid = newEmail && /\S+@\S+\.\S+/.test(newEmail);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {step === "change" ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-brand-primary/10">
                  <Mail className="h-4 w-4 text-brand-primary" />
                </div>
                Ganti Email
              </DialogTitle>
              <DialogDescription>
                Masukkan alamat email baru. Kami akan mengirim kode verifikasi
                ke email tersebut.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-5 py-1">
              {currentEmail && (
                <div className="rounded-lg border bg-muted/40 px-4 py-3 space-y-0.5">
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                    Email saat ini
                  </p>
                  <p className="text-sm font-semibold">{currentEmail}</p>
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="new-email" variant="required">
                  Email Baru
                </Label>
                <Input
                  id="new-email"
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="email@example.com"
                  disabled={submitting}
                  onKeyDown={handleKeyDown}
                />
                <p className="text-xs text-muted-foreground">
                  Pastikan alamat email ini aktif dan belum digunakan
                </p>
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
                onClick={handleSendOtp}
                disabled={submitting || !isEmailValid}
                loading={submitting}
              >
                {submitting ? "Mengirim..." : "Kirim OTP"}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-brand-primary/10">
                  <ShieldCheck className="h-4 w-4 text-brand-primary" />
                </div>
                Verifikasi OTP
              </DialogTitle>
              <DialogDescription>
                Masukkan 6 digit kode yang dikirim ke{" "}
                <span className="font-semibold text-foreground">
                  {emailHint}
                </span>
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-5 py-1">
              <div className="space-y-2">
                <Label htmlFor="otp-input" variant="required">
                  Kode OTP
                </Label>
                <Input
                  id="otp-input"
                  ref={otpRef}
                  type="text"
                  inputMode="numeric"
                  value={otp}
                  onChange={handleOtpInput}
                  onKeyDown={handleKeyDown}
                  placeholder="123456"
                  maxLength={6}
                  disabled={submitting}
                  className="text-center text-xl tracking-[0.5em] font-semibold"
                />
              </div>
              <div className="flex items-center justify-between">
                <Button
                  type="button"
                  onClick={() => setStep("change")}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowLeft className="h-3 w-3" />
                  Ganti email
                </Button>
                <Button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resendCooldown > 0 || submitting}
                  className={cn(
                    "flex items-center gap-1 text-xs transition-colors",
                    resendCooldown > 0
                      ? "text-muted-foreground cursor-not-allowed"
                      : "text-brand-primary hover:text-brand-primary/80 cursor-pointer",
                  )}
                >
                  <RefreshCw
                    className={cn("h-3 w-3", submitting && "animate-spin")}
                  />
                  {resendCooldown > 0
                    ? `Kirim ulang (${resendCooldown}s)`
                    : "Kirim ulang OTP"}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground text-center">
                Kode berlaku selama 5 menit
              </p>
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
                onClick={handleVerifyOtp}
                disabled={submitting || otp.length !== 6}
                loading={submitting}
              >
                {submitting ? "Memverifikasi..." : "Verifikasi"}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
