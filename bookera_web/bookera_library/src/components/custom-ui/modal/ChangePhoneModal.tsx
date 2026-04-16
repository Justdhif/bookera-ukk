"use client";
import { useState, useEffect, useRef } from "react";
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
import {
  PhoneInput,
  formatPhoneDisplay,
} from "@/components/custom-ui/PhoneInput";
import { Smartphone, ShieldCheck, RefreshCw, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/axios";
import { cn } from "@/lib/utils";

interface ChangePhoneModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentPhone?: string;
  onSuccess: (newPhone: string) => void;
}

type Step = "change" | "otp";
const RESEND_COOLDOWN = 60;

export default function ChangePhoneModal({
  open,
  onOpenChange,
  currentPhone,
  onSuccess,
}: ChangePhoneModalProps) {
  const t = useTranslations("profile");
  const [step, setStep] = useState<Step>("change");
  const [newPhone, setNewPhone] = useState("");
  const [phoneHint, setPhoneHint] = useState("");
  const [otp, setOtp] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const otpRef = useRef<HTMLInputElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (open) {
      setStep("change");
      setNewPhone("");
      setPhoneHint("");
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
    if (!newPhone || newPhone.length < 8) {
      toast.error(t("enterValidPhoneError"));
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.post("/phone/request-change", {
        new_phone: newPhone,
      });
      const hint = res.data?.data?.phone_hint ?? "";
      setPhoneHint(hint);
      setStep("otp");
      startResendCooldown();
      toast.success(t("otpSentPhoneSuccess"));
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || t("failedUpdate"),
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
      toast.error(t("enterOtpError"));
      return;
    }

    try {
      setSubmitting(true);
      await api.post("/phone/verify-otp", { otp });
      toast.success(t("updatePhoneSuccess"));
      onSuccess(newPhone);
      onOpenChange(false);
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || t("invalidOtp"),
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {step === "change" ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-brand-primary/10">
                  <Smartphone className="h-4 w-4 text-brand-primary" />
                </div>
                {t("changePhoneTitle")}
              </DialogTitle>
              <DialogDescription>
                {t("changePhoneDescription")}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-5 py-1">
              {currentPhone && (
                <div className="rounded-lg border bg-muted/40 px-4 py-3 space-y-0.5">
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                    {t("currentPhoneLabel")}
                  </p>
                  <p className="text-sm font-semibold tabular-nums">
                    {formatPhoneDisplay(currentPhone)}
                  </p>
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="new-phone" variant="required">
                  {t("newPhoneLabel")}
                </Label>
                <PhoneInput
                  id="new-phone"
                  value={newPhone}
                  onChange={setNewPhone}
                  placeholder={t("newPhonePlaceholder")}
                  disabled={submitting}
                />
                <p className="text-xs text-muted-foreground">
                  {t("phoneValidationHint")}
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
                {t("batal")}
              </Button>
              <Button
                type="button"
                variant="submit"
                onClick={handleSendOtp}
                disabled={submitting || !newPhone || newPhone.length < 8}
                loading={submitting}
              >
                {submitting ? t("sending") : t("submit")}
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
                {t("verifyOtpTitle")}
              </DialogTitle>
              <DialogDescription>
                {t("verifyOtpDescription")}{" "}
                <span className="font-semibold text-foreground">
                  {phoneHint || "WhatsApp"}
                </span>
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-5 py-1">
              <div className="space-y-2">
                <Label htmlFor="otp-input" variant="required">
                  {t("otpLabel")}
                </Label>
                <Input
                  id="otp-input"
                  ref={otpRef}
                  type="text"
                  inputMode="numeric"
                  value={otp}
                  onChange={handleOtpInput}
                  onKeyDown={handleKeyDown}
                  placeholder={t("otpPlaceholder")}
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
                  {t("changePhone").toLowerCase()}
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
                    ? t("resendOtpIn", { seconds: resendCooldown })
                    : t("resendOtp")}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground text-center">
                {t("otpValidityHint")}
              </p>
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
                onClick={handleVerifyOtp}
                disabled={submitting || otp.length !== 6}
                loading={submitting}
              >
                {submitting ? t("verifying") : t("verifikasi")}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

